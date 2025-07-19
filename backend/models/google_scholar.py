from sqlalchemy import Column, Integer, String,ForeignKey, Text,Date,Boolean
from sqlalchemy.orm import relationship
from models import Base


class GoogleScholarIntegration(Base):
    __tablename__ = "google_scholar_integrations"
    
    id = Column(Integer, primary_key=True, index=True)

    googleScholarId = Column(String, unique=True, nullable=False)
    profileUrl = Column(String, nullable=True)
    lastSynced = Column(Date, nullable=True)

    # Relationships
    userId = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    user = relationship("User", back_populates="googleScholarIntegration")
    publications = relationship("Publication", back_populates="googleScholarIntegration", cascade="all, delete-orphan")


class Publication(Base):
    __tablename__ = "publications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    publicationDate = Column(Date, nullable=True)
    citationCount = Column(Integer, default=0)
    googleScholarUrl = Column(String, nullable=True)
    isPosted = Column(Boolean, default=False)

    #Relationships
    googleScholarIntegrationId = Column(Integer, ForeignKey("google_scholar_integrations.id"), nullable=False)

    googleScholarIntegration = relationship("GoogleScholarIntegration", back_populates="publications")