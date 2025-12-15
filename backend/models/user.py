from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text,Enum,Float
import enum
from sqlalchemy.orm import relationship
from models import Base,user_thematique_association, user_specialite_association
from pydantic import BaseModel
from typing import Optional


class UserType(str, enum.Enum):
    ENSEIGNANT = "enseignant"
    DOCTORANT = "doctorant"
    ADMIN = "admin"



class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)

    fullName = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)

    user_type = Column(Enum(UserType), nullable=True)
    profile_completed = Column(Boolean, default=False)
    otp_configured = Column(Boolean, default=False)
    otp_secret = Column(String, nullable=True)

    # Profile completion
    nom = Column(String, nullable=True)
    prenom = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    dateDeNaissance = Column(Date, nullable=True)
    photoDeProfil = Column(String, nullable=True)
    numeroDeSomme = Column(String, nullable=True)
    
    # Relationships
    universityId = Column(Integer, ForeignKey("universities.id"), nullable=True)
    etablissementId = Column(Integer, ForeignKey("etablissements.id"), nullable=True)
    departementId = Column(Integer, ForeignKey("departements.id"), nullable=True)
    laboratoireId = Column(Integer, ForeignKey("laboratoires.id"), nullable=True)
    equipeId = Column(Integer, ForeignKey("equipes.id"), nullable=True)
    specialiteId = Column(Integer, ForeignKey("specialites.id"), nullable=True)
    thematiqueDeRechercheId = Column(Integer, ForeignKey("thematiques_de_recherche.id"), nullable=True)

    university = relationship("University", back_populates="users")
    etablissement = relationship("Etablissement", back_populates="users")
    departement = relationship("Departement", back_populates="users")
    laboratoire = relationship("Laboratoire", back_populates="users")
    equipe = relationship("Equipe", back_populates="users")
    specialite = relationship("Specialite",secondary=user_specialite_association, back_populates="users")
    thematiqueDeRecherche = relationship("ThematiqueDeRecherche",secondary=user_thematique_association, back_populates="users")
    googleScholarIntegration = relationship("GoogleScholarIntegration", back_populates="user", uselist=False, cascade="all, delete-orphan")
    cv = relationship("CV", back_populates="user", uselist=False, cascade="all, delete-orphan")
    messagesSent = relationship("Message", back_populates="sender", cascade="all, delete-orphan")
    chatsAsUser1 = relationship("Chat", foreign_keys="Chat.user1Id", back_populates="user1", cascade="all, delete-orphan")
    chatsAsUser2 = relationship("Chat", foreign_keys="Chat.user2Id", back_populates="user2", cascade="all, delete-orphan")
    connectionsSent = relationship("Connection", foreign_keys="Connection.senderId", back_populates="sender", cascade="all, delete-orphan")
    connectionsReceived = relationship("Connection", foreign_keys="Connection.receiverId", back_populates="receiver", cascade="all, delete-orphan")
    projets = relationship("Projet", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")
    scopus_publications = relationship("ScopusPublication", back_populates="user", cascade="all, delete-orphan")
    scopus_profile = relationship("ScopusProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
class Projet(Base):
    __tablename__ = "projets"
    
    id = Column(Integer, primary_key=True, index=True)
    
    titre = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    budget = Column(Float, nullable=False)
    dateDebut = Column(Date, nullable=False)
    dureeEnMois = Column(Integer, nullable=False)
    statut = Column(String, nullable=False)

    # Relationships
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    user = relationship("User", back_populates="projets")


