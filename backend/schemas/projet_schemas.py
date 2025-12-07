from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class ProjetCreate(BaseModel):
    """Schema for creating a new projet"""
    titre: str = Field(..., min_length=1, max_length=255, description="Project title")
    description: str = Field(..., min_length=1, description="Project description")
    budget: float = Field(..., gt=0, description="Project budget (must be positive)")
    dateDebut: date = Field(..., description="Project start date")
    dureeEnMois: int = Field(..., gt=0, description="Project duration in months (must be positive)")
    statut: str = Field(..., description="Project status (e.g., 'en cours', 'terminé', 'planifié')")


class ProjetUpdate(BaseModel):
    """Schema for updating a projet"""
    titre: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    budget: Optional[float] = Field(None, gt=0)
    dateDebut: Optional[date] = None
    dureeEnMois: Optional[int] = Field(None, gt=0)
    statut: Optional[str] = None


class UserBasicInfo(BaseModel):
    """Basic user information for responses"""
    id: int
    fullName: str
    email: str
    photoDeProfil: Optional[str] = None
    grade: Optional[str] = None
    
    class Config:
        from_attributes = True


class ProjetResponse(BaseModel):
    """Response schema for a projet"""
    id: int
    titre: str
    description: str
    budget: float
    dateDebut: date
    dureeEnMois: int
    statut: str
    userId: int
    user: UserBasicInfo
    
    class Config:
        from_attributes = True


class ProjetListResponse(BaseModel):
    """Response schema for paginated projets"""
    total: int
    projets: List[ProjetResponse]
