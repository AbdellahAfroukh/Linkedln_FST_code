from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date
from models.cv import NiveauCompetences, NiveauLangue

class ContactCreate(BaseModel):
    email: EmailStr
    telephone: Optional[str] = None
    adresse: Optional[str] = None

class FormationCreate(BaseModel):
    diplome: str
    etablissement: Optional[str] = None
    dateDebut: date
    dateFin: Optional[date] = None
    enCours: Optional[bool] = False

class CompetenceCreate(BaseModel):
    nom: str
    niveau: NiveauCompetences

class LangueCreate(BaseModel):
    nom: str
    niveau: NiveauLangue


class CVCreate(BaseModel):
    titre: str
    description: Optional[str] = None


class CVUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    isPublic: Optional[bool] = None
    cv_enabled: Optional[bool] = None

class ExperienceCreate(BaseModel):
    poste: str
    entreprise: Optional[str] = None
    description: Optional[str] = None
    dateDebut: date
    dateFin: Optional[date] = None
    enCours: Optional[bool] = False


# Update schemas for PATCH endpoints (all fields optional)
class ContactUpdate(BaseModel):
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None


class FormationUpdate(BaseModel):
    diplome: Optional[str] = None
    etablissement: Optional[str] = None
    dateDebut: Optional[date] = None
    dateFin: Optional[date] = None
    enCours: Optional[bool] = None


class CompetenceUpdate(BaseModel):
    nom: Optional[str] = None
    niveau: Optional[NiveauCompetences] = None


class LangueUpdate(BaseModel):
    nom: Optional[str] = None
    niveau: Optional[NiveauLangue] = None


class ExperienceUpdate(BaseModel):
    poste: Optional[str] = None
    entreprise: Optional[str] = None
    description: Optional[str] = None
    dateDebut: Optional[date] = None
    dateFin: Optional[date] = None
    enCours: Optional[bool] = None
