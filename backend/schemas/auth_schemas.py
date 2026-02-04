from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional
from datetime import date
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
    grade: Optional[str] = None
    dateDeNaissance: Optional[str] = None
    photoDeProfil: Optional[str] = None
    universityId: Optional[int] = None
    etablissementId: Optional[int] = None
    departementId: Optional[int] = None
    laboratoireId: Optional[int] = None
    equipeId: Optional[int] = None
    specialiteIds: Optional[list[int]] = None  # Changed to list
    thematiqueDeRechercheIds: Optional[list[int]] = None  # Changed to list
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


class OrganisationInfo(BaseModel):
    """Organization info for user profiles"""
    id: int
    nom: str
    Logo: Optional[str] = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: str
    fullName: str
    user_type: str
    profile_completed: bool
    otp_configured: bool
    nom: Optional[str] = None
    prenom: Optional[str] = None
    grade: Optional[str] = None
    dateDeNaissance: Optional[date] = None
    photoDeProfil: Optional[str] = None
    universityId: Optional[int] = None
    etablissementId: Optional[int] = None
    departementId: Optional[int] = None
    laboratoireId: Optional[int] = None
    equipeId: Optional[int] = None
    specialiteId: Optional[int] = None
    thematiqueDeRechercheId: Optional[int] = None
    numeroDeSomme: Optional[str] = None
    university: Optional[OrganisationInfo] = None
    etablissement: Optional[OrganisationInfo] = None
    departement: Optional[OrganisationInfo] = None
    laboratoire: Optional[OrganisationInfo] = None
    equipe: Optional[OrganisationInfo] = None
    specialite: Optional[list[OrganisationInfo]] = None  # Many-to-many relationship
    thematiqueDeRecherche: Optional[list[OrganisationInfo]] = None  # Many-to-many relationship

    @field_serializer('dateDeNaissance')
    def serialize_date(self, value: Optional[date]) -> Optional[str]:
        return value.isoformat() if value else None

    class Config:
        from_attributes = True


class UserSearchResult(BaseModel):
    """Public user information for search results"""
    id: int
    fullName: str
    email: str
    user_type: Optional[str] = None
    profile_completed: bool
    photoDeProfil: Optional[str] = None
    grade: Optional[str] = None
    university: Optional[OrganisationInfo] = None
    etablissement: Optional[OrganisationInfo] = None
    departement: Optional[OrganisationInfo] = None
    laboratoire: Optional[OrganisationInfo] = None
    equipe: Optional[OrganisationInfo] = None

    class Config:
        from_attributes = True


class UserSearchResponse(BaseModel):
    """Response for user search"""
    total: int
    users: list[UserSearchResult]