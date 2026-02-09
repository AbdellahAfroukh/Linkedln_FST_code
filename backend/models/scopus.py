from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class ScopusIntegration(Base):
    """Model for user's Scopus integration"""
    __tablename__ = "scopus_integrations"

    id = Column(Integer, primary_key=True, index=True)
    scopusAuthorId = Column(String, unique=True, nullable=False, index=True)
    profileUrl = Column(String, nullable=True)
    lastSynced = Column(Date, nullable=True)
    
    # Foreign key to user
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="scopus_integration")
    publications = relationship("ScopusPublication", back_populates="scopus_integration", cascade="all, delete-orphan")


class ScopusPublication(Base):
    """Model for a publication from Scopus"""
    __tablename__ = "scopus_publications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=True)
    summary = Column(String(1000), nullable=True)
    publicationDate = Column(Date, nullable=True)
    citationCount = Column(Integer, default=0)
    scopusUrl = Column(String, nullable=True)
    isPosted = Column(Boolean, default=False)
    
    # Foreign key to Scopus integration
    scopusIntegrationId = Column(Integer, ForeignKey("scopus_integrations.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    scopus_integration = relationship("ScopusIntegration", back_populates="publications")
    post = relationship("Post", back_populates="scopusPublication", uselist=False)
