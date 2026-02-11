from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import pyotp
import qrcode
from io import BytesIO
import base64
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user import User, UserType
from cryptography.fernet import Fernet
import secrets
import logging

from config import settings

pwd_context = CryptContext(schemes=["argon2", "bcrypt_sha256", "bcrypt"], deprecated="auto")

# Derive encryption key from SECRET_KEY for OTP secrets
# In production, use a separate encryption key from environment
_encryption_key = base64.urlsafe_b64encode(settings.SECRET_KEY.encode()[:32].ljust(32, b'\0'))
_cipher_suite = Fernet(_encryption_key)


class AuthService:
    
    @staticmethod
    def _encrypt_otp_secret(secret: str) -> str:
        """Encrypt OTP secret before storage"""
        return _cipher_suite.encrypt(secret.encode()).decode()
    
    @staticmethod
    def _decrypt_otp_secret(encrypted_secret: str) -> str:
        """Decrypt OTP secret for use"""
        return _cipher_suite.decrypt(encrypted_secret.encode()).decode()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash"""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except ValueError as e:
            # Log detailed error for debugging - this is a hash algorithm error
            import logging
            logging.error(f"Password hashing algorithm error: {e}")
            # If hash algorithm fails, assume password is wrong (safer than exception)
            return False

    
    @staticmethod
    def validate_password_strength(password: str) -> None:
        """Validate password meets minimum security requirements"""
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        if not any(c.isupper() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter"
            )
        if not any(c.islower() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter"
            )
        if not any(c.isdigit() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one number"
            )
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if "sub" in to_encode and isinstance(to_encode["sub"], int):
            to_encode["sub"] = str(to_encode["sub"])
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        if "sub" in to_encode and isinstance(to_encode["sub"], int):
            to_encode["sub"] = str(to_encode["sub"])
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            if payload.get("type") != token_type:
                # Log detailed error server-side for debugging
                import logging
                logging.error(f"Invalid token type. Expected {token_type}, got {payload.get('type')}")
                # Return generic message to user
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token. Please login again."
                )
            return payload
        except HTTPException:
            # Re-raise HTTPException as-is
            raise
        except JWTError as e:
            # Log detailed error server-side for debugging
            import logging
            logging.error(f"Token verification failed: {type(e).__name__}: {e}")
            # Return generic message to user (don't expose JWT library details)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token. Please login again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def get_user_id_from_token(payload: dict) -> int:
        """Extract user ID from JWT payload and convert from string to int"""
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        try:
            return int(user_id_str)
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def generate_otp_secret() -> str:
        """Generate a new OTP secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def get_totp_uri(email: str, secret: str, issuer: str = None) -> str:
        """Generate TOTP URI for QR code"""
        if issuer is None:
            issuer = settings.OTP_ISSUER
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=email, issuer_name=issuer)
    
    @staticmethod
    def generate_qr_code(uri: str) -> str:
        """Generate QR code image as base64 string"""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    @staticmethod
    def verify_otp(secret: str, token: str) -> bool:
        """Verify OTP token with increased tolerance for time drift"""
        totp = pyotp.TOTP(secret)
        # Increase valid_window to 2 (allows ±60 seconds)
        # This helps with time synchronization issues between server and authenticator app
        result = totp.verify(token, valid_window=2)
        
        return result 
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not AuthService.verify_password(password, user.password):
            return None
        return user
    
    @staticmethod
    def register_user(
        db: Session,
        email: str,
        password: str,
        fullName: str,
        user_type: UserType
    ) -> User:
        """Register a new user"""
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate password strength
        AuthService.validate_password_strength(password)
        
        hashed_password = AuthService.get_password_hash(password)
        
        # Admin users don't need profile completion
        profile_completed = (user_type == UserType.ADMIN)
        
        # Generate email verification token
        verification_token = secrets.token_urlsafe(32)
        token_expiry = (datetime.now(timezone.utc) + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRY_HOURS)).isoformat()
        
        new_user = User(
            email=email,
            password=hashed_password,
            fullName=fullName,
            user_type=user_type,
            profile_completed=profile_completed,
            otp_configured=False,
            email_verified=False,
            email_verification_token=verification_token,
            email_verification_token_expiry=token_expiry
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Send verification email
        try:
            from services.email_service import EmailService
            EmailService.send_verification_email(email, verification_token, fullName)
        except Exception as e:
            logging.error(f"Failed to send verification email to {email}: {str(e)}")
            # Don't fail registration if email fails, but log it
        
        return new_user
    
    @staticmethod
    def setup_2fa(db: Session, user: User) -> dict:
        """Setup 2FA for user and return QR code"""
        if user.otp_configured:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA already configured"
            )
        
        secret = AuthService.generate_otp_secret()
        # Encrypt OTP secret before storing
        user.otp_secret = AuthService._encrypt_otp_secret(secret)
        db.commit()
        
        uri = AuthService.get_totp_uri(user.email, secret)
        qr_code = AuthService.generate_qr_code(uri)
        
        return {
            "secret": secret,
            "qr_code": qr_code,
            "uri": uri
        }
    
    @staticmethod
    def verify_and_enable_2fa(db: Session, user: User, token: str) -> bool:
        """Verify OTP token and enable 2FA"""
        if not user.otp_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA not set up. Call setup endpoint first"
            )
        
        # Decrypt OTP secret before verification
        secret = AuthService._decrypt_otp_secret(user.otp_secret)
        if not AuthService.verify_otp(secret, token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP token"
            )
        
        user.otp_configured = True
        db.commit()
        return True
    
    @staticmethod
    def disable_2fa(db: Session, user: User, password: str) -> bool:
        """Disable 2FA for user"""
        if not AuthService.verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )
        
        user.otp_configured = False
        user.otp_secret = None
        db.commit()
        return True