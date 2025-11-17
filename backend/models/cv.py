from sqlalchemy import Column, Integer, String,ForeignKey, Text,Date,Boolean,Enum
import enum
from sqlalchemy.orm import relationship
from models import Base



class NiveauCompetences(str, enum.Enum):
    DEBUTANT = "debutant"
    INTERMEDIAIRE = "intermediaire"
    AVANCE = "avance"
    EXPERT = "expert"


class NiveauLangue(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"



class CV(Base):
    __tablename__ = "cvs"
    
    id = Column(Integer, primary_key=True, index=True)

    titre= Column(String, nullable=False)
    description = Column(Text, nullable=True)
    dateCreation = Column(Date, nullable=False)
    dateModification = Column(Date, nullable=True)
    isPublic = Column(Boolean, default=False)

    # Relationships
    userId = Column(Integer, ForeignKey("users.id"), nullable=False,unique=True)
    
    user = relationship("User", back_populates="cv")
    contact= relationship("Contact", back_populates="cv",uselist=False, cascade="all, delete-orphan")
    formations = relationship("Formation", back_populates="cv", cascade="all, delete-orphan")
    competences = relationship("Competence", back_populates="cv", cascade="all, delete-orphan")
    langues = relationship("Langue", back_populates="cv", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="cv", cascade="all, delete-orphan")


class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    telephone = Column(String, nullable=True)
    adresse = Column(String, nullable=True)

    # Relationships
    cvId = Column(Integer, ForeignKey("cvs.id"), nullable=False, unique=True)

    cv = relationship("CV", back_populates="contact")


class Formation(Base):
    __tablename__ = "formations"
    
    id = Column(Integer, primary_key=True, index=True)
    diplome = Column(String, nullable=False)
    etablissement = Column(String, nullable=True)
    dateDebut = Column(Date, nullable=False)
    dateFin = Column(Date, nullable=True)
    enCours = Column(Boolean, default=False)

    # Relationships
    cvId = Column(Integer, ForeignKey("cvs.id"), nullable=False)

    cv = relationship("CV", back_populates="formations")


class Competence(Base):
    __tablename__ = "competences"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    niveau = Column(Enum(NiveauCompetences), nullable=False)

    # Relationships
    cvId = Column(Integer, ForeignKey("cvs.id"), nullable=False)

    cv = relationship("CV", back_populates="competences")


class Langue(Base):
    __tablename__ = "langues"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    niveau = Column(Enum(NiveauLangue), nullable=False)

    # Relationships
    cvId = Column(Integer, ForeignKey("cvs.id"), nullable=False)

    cv = relationship("CV", back_populates="langues")



class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    poste = Column(String, nullable=False)
    entreprise = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    dateDebut = Column(Date, nullable=False)
    dateFin = Column(Date, nullable=True)
    enCours = Column(Boolean, default=False)


    # Relationships
    cvId = Column(Integer, ForeignKey("cvs.id"), nullable=False)

    cv = relationship("CV", back_populates="experiences")