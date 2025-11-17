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

from config import settings

pwd_context = CryptContext(schemes=["argon2", "bcrypt_sha256", "bcrypt"], deprecated="auto")


class AuthService:
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash"""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Password validation error: password may be too long for the "
                    "bcrypt algorithm (72 bytes). Please use a shorter password, "
                    "or reset the user's password. Consider using `argon2` or "
                    "`bcrypt_sha256` for long passphrases.`"
                ),
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
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid token type. Expected {token_type}, got {payload.get('type')}"
                )
            return payload
        except JWTError as e:
            error_msg = str(e)
            if "Signature has expired" in error_msg:
                detail = "Token has expired. Please login again to get a fresh token."
            elif "Invalid token" in error_msg or "Malformed" in error_msg:
                detail = "Invalid or malformed token."
            else:
                detail = f"Could not validate credentials: {error_msg}"
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=detail,
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
        """Verify OTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1) 
    
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
        
        hashed_password = AuthService.get_password_hash(password)
        new_user = User(
            email=email,
            password=hashed_password,
            fullName=fullName,
            user_type=user_type,
            profile_completed=False,
            otp_configured=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
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
        user.otp_secret = secret
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
        
        if not AuthService.verify_otp(user.otp_secret, token):
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