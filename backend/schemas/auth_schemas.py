from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from models import UserType


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    fullName: str = Field(..., min_length=2)
    user_type: UserType

    class Config:
        use_enum_values = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class Token2FA(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    requires_2fa: bool = False
    user: Optional[dict] = None


class ProfileCompleteRequest(BaseModel):
    nom: str = Field(..., min_length=1)
    prenom: str = Field(..., min_length=1)
    universityId: Optional[int] = None
    etablissementId: Optional[int] = None
    departementId: Optional[int] = None
    laboratoireId: Optional[int] = None
    equipeId: Optional[int] = None
    specialiteId: Optional[int] = None
    thematiqueDeRechercheId: Optional[int] = None
    numeroDeSomme: Optional[str] = None


class OTPVerify(BaseModel):
    token: str = Field(..., min_length=6, max_length=6)
    email: EmailStr


class OTPSetup(BaseModel):
    secret: str
    qr_code: str
    uri: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class Disable2FARequest(BaseModel):
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    fullName: str
    user_type: str
    profile_completed: bool
    otp_configured: bool

    class Config:
        from_attributes = True