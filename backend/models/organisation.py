from sqlalchemy import Column, Integer, String,ForeignKey, Text
from sqlalchemy.orm import relationship
from models import Base,user_specialite_association,user_thematique_association



class University(Base):
    __tablename__ = "universities"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    adresse = Column(String, nullable=True)
    ville = Column(String, nullable=True)
    pays = Column(String, nullable=True)
    Logo= Column(String, nullable=True) #URL or path

    #Relationships
    users = relationship("User", back_populates="university")
    etablissements = relationship("Etablissement", back_populates="university", cascade="all, delete-orphan")
    laboratoires = relationship("Laboratoire", back_populates="university", cascade="all, delete-orphan")
    equipes = relationship("Equipe", back_populates="university", cascade="all, delete-orphan")


class Etablissement(Base):
    __tablename__ = "etablissements"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    adresse = Column(String, nullable=True)
    ville = Column(String, nullable=True)
    pays = Column(String, nullable=True)
    Logo= Column(String, nullable=True) #URL or path

    #Relationships
    universityId = Column(Integer, ForeignKey("universities.id"), nullable=True)

    university = relationship("University", back_populates="etablissements")
    users = relationship("User", back_populates="etablissement")
    departements = relationship("Departement", back_populates="etablissement", cascade="all, delete-orphan")


class Departement(Base):
    __tablename__ = "departements"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    #Relationships
    etablissementId = Column(Integer, ForeignKey("etablissements.id"), nullable=True)

    etablissement = relationship("Etablissement", back_populates="departements")
    users = relationship("User", back_populates="departement")


class Laboratoire(Base):
    __tablename__ = "laboratoires"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    #Relationships
    universityId = Column(Integer, ForeignKey("universities.id"), nullable=True)

    university = relationship("University", back_populates="laboratoires")
    users = relationship("User", back_populates="laboratoire")


class Equipe(Base):
    __tablename__ = "equipes"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    #Relationships
    universityId = Column(Integer, ForeignKey("universities.id"), nullable=True)

    university = relationship("University", back_populates="equipes")
    users = relationship("User", back_populates="equipe")


class Specialite(Base):
    __tablename__ = "specialites"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    #Relationships
    users = relationship("User",secondary=user_specialite_association, back_populates="specialite")


class ThematiqueDeRecherche(Base):
    __tablename__ = "thematiques_de_recherche"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    #Relationships
    users = relationship("User",secondary=user_thematique_association, back_populates="thematiqueDeRecherche")