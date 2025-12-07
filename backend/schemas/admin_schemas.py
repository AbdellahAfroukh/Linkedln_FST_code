from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import date
from models.user import UserType


# ============ University Schemas ============
class UniversityCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    adresse: Optional[str] = Field(None, max_length=255)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field(None, max_length=100)
    Logo: Optional[str] = Field(None, max_length=500)

    class Config:
        from_attributes = True


class UniversityUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    adresse: Optional[str] = Field(None, max_length=255)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field(None, max_length=100)
    Logo: Optional[str] = Field(None, max_length=500)

    class Config:
        from_attributes = True


class UniversityResponse(BaseModel):
    id: int
    nom: str
    adresse: Optional[str]
    ville: Optional[str]
    pays: Optional[str]
    Logo: Optional[str]

    class Config:
        from_attributes = True


# ============ Etablissement Schemas ============
class EtablissementCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    adresse: Optional[str] = Field(None, max_length=255)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field(None, max_length=100)
    Logo: Optional[str] = Field(None, max_length=500)
    universityId: Optional[int] = None

    class Config:
        from_attributes = True


class EtablissementUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    adresse: Optional[str] = Field(None, max_length=255)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field(None, max_length=100)
    Logo: Optional[str] = Field(None, max_length=500)
    universityId: Optional[int] = None

    class Config:
        from_attributes = True


class EtablissementResponse(BaseModel):
    id: int
    nom: str
    adresse: Optional[str]
    ville: Optional[str]
    pays: Optional[str]
    Logo: Optional[str]
    universityId: Optional[int]

    class Config:
        from_attributes = True


# ============ Departement Schemas ============
class DepartementCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    etablissementId: Optional[int] = None

    class Config:
        from_attributes = True


class DepartementUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    etablissementId: Optional[int] = None

    class Config:
        from_attributes = True


class DepartementResponse(BaseModel):
    id: int
    nom: str
    description: Optional[str]
    etablissementId: Optional[int]

    class Config:
        from_attributes = True


# ============ Laboratoire Schemas ============
class LaboratoireCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    univesityId: Optional[int] = None

    class Config:
        from_attributes = True


class LaboratoireUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    univesityId: Optional[int] = None

    class Config:
        from_attributes = True


class LaboratoireResponse(BaseModel):
    id: int
    nom: str
    description: Optional[str]
    univesityId: Optional[int]

    class Config:
        from_attributes = True


# ============ Equipe Schemas ============
class EquipeCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    universityId: Optional[int] = None

    class Config:
        from_attributes = True


class EquipeUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    universityId: Optional[int] = None

    class Config:
        from_attributes = True


class EquipeResponse(BaseModel):
    id: int
    nom: str
    description: Optional[str]
    universityId: Optional[int]

    class Config:
        from_attributes = True


# ============ Specialite Schemas ============
class SpecialiteCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

    class Config:
        from_attributes = True


class SpecialiteUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

    class Config:
        from_attributes = True


class SpecialiteResponse(BaseModel):
    id: int
    nom: str
    description: Optional[str]

    class Config:
        from_attributes = True


# ============ ThematiqueDeRecherche Schemas ============
class ThematiqueDeRechercheCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ThematiqueDeRechercheUpdate(BaseModel):
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ThematiqueDeRechercheResponse(BaseModel):
    id: int
    nom: str
    description: Optional[str]

    class Config:
        from_attributes = True


# ============ User Management Schemas ============
class UserUpdateByAdmin(BaseModel):
    """Schema for admin to update user information"""
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None
    user_type: Optional[UserType] = None
    profile_completed: Optional[bool] = None
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

    class Config:
        from_attributes = True


class UserBasicResponse(BaseModel):
    """Basic user information for listings"""
    id: int
    fullName: str
    email: str
    user_type: Optional[UserType] = None
    profile_completed: bool
    photoDeProfil: Optional[str] = None
    grade: Optional[str] = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Response for paginated user list"""
    total: int
    users: List[UserBasicResponse]


class UserDetailResponse(BaseModel):
    """Detailed user information"""
    id: int
    fullName: str
    email: str
    user_type: Optional[UserType] = None
    profile_completed: bool
    otp_configured: bool
    nom: Optional[str] = None
    prenom: Optional[str] = None
    grade: Optional[str] = None
    dateDeNaissance: Optional[date] = None
    photoDeProfil: Optional[str] = None
    numeroDeSomme: Optional[str] = None
    universityId: Optional[int] = None
    etablissementId: Optional[int] = None
    departementId: Optional[int] = None
    laboratoireId: Optional[int] = None
    equipeId: Optional[int] = None

    class Config:
        from_attributes = True


# ============ Content Moderation Schemas ============
class PostBasicResponse(BaseModel):
    """Basic post information for admin moderation"""
    id: int
    content: str
    timestamp: str
    isPublic: bool
    userId: int

    class Config:
        from_attributes = True


class CommentBasicResponse(BaseModel):
    """Basic comment information for admin moderation"""
    id: int
    content: str
    timestamp: str
    postId: int
    userId: int

    class Config:
        from_attributes = True


class ProjetBasicResponse(BaseModel):
    """Basic projet information for admin moderation"""
    id: int
    titre: str
    description: str
    budget: float
    dateDebut: date
    statut: str
    userId: int

    class Config:
        from_attributes = True


# ============ Platform Statistics ============
class PlatformStatistics(BaseModel):
    """Overall platform statistics"""
    users: dict
    content: dict
    organisation: dict

    class Config:
        from_attributes = True
