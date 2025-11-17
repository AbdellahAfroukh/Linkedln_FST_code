from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from services.authentification import AuthService
from schemas.auth_schemas import (
    UserRegister, 
    UserLogin, 
    TokenResponse, 
    Token2FA,
    OTPVerify, 
    OTPSetup, 
    RefreshTokenRequest,
    Disable2FARequest,
    UserResponse
)
from dependencies import get_current_user, get_current_active_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    - Validates email uniqueness
    - Hashes password
    - Creates user account based on role
    """
    user = AuthService.register_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        fullName=user_data.fullName,
        user_type=user_data.user_type
    )
    return user


@router.post("/login", response_model=Token2FA)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login user with email and password
    - If 2FA is enabled, returns requires_2fa=True
    - Otherwise returns access and refresh tokens
    """
    user = AuthService.authenticate_user(
        db=db,
        email=user_credentials.email,
        password=user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if 2FA is enabled
    if user.otp_configured:
        return Token2FA(
            access_token="",
            refresh_token="",
            requires_2fa=True
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(data={"sub": user.id})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.id})
    
    return Token2FA(
        access_token=access_token,
        refresh_token=refresh_token,
        requires_2fa=False,
        user={
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "user_type": user.user_type.value,
            "profile_completed": user.profile_completed,
            "otp_configured": user.otp_configured
        }
    )


@router.post("/verify-2fa", response_model=TokenResponse)
def verify_2fa(otp_data: OTPVerify, db: Session = Depends(get_db)):
    """
    Verify 2FA token and complete login
    - Validates OTP token
    - Returns access and refresh tokens
    """
    user = db.query(User).filter(User.email == otp_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.otp_configured or not user.otp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not configured for this user"
        )
    
    # Verify OTP
    if not AuthService.verify_otp(user.otp_secret, otp_data.token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP token"
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(data={"sub": user.id})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "user_type": user.user_type.value,
            "profile_completed": user.profile_completed,
            "otp_configured": user.otp_configured
        }
    )


@router.post("/setup-2fa", response_model=OTPSetup)
def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Setup 2FA for current user
    - Generates OTP secret
    - Returns QR code for authenticator app
    """
    result = AuthService.setup_2fa(db=db, user=current_user)
    return result


@router.post("/enable-2fa", response_model=dict)
def enable_2fa(
    otp_data: OTPVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify OTP and enable 2FA
    - Validates OTP token to ensure setup was successful
    - Enables 2FA for user account
    """
    AuthService.verify_and_enable_2fa(db=db, user=current_user, token=otp_data.token)
    return {"message": "2FA enabled successfully"}


@router.post("/disable-2fa", response_model=dict)
def disable_2fa(
    data: Disable2FARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disable 2FA for current user
    - Requires password confirmation
    - Removes OTP configuration
    """
    AuthService.disable_2fa(db=db, user=current_user, password=data.password)
    return {"message": "2FA disabled successfully"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    payload = AuthService.verify_token(token_data.refresh_token, token_type="refresh")
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new tokens
    access_token = AuthService.create_access_token(data={"sub": user.id})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "user_type": user.user_type.value,
            "profile_completed": user.profile_completed,
            "otp_configured": user.otp_configured
        }
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/logout", response_model=dict)
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user
    - In a production app, you might want to blacklist the token
    - For now, just return success (client should delete tokens)
    """
    return {"message": "Logged out successfully"}