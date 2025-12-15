from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from models import Base
import datetime

class ScopusPublication(Base):
    __tablename__ = "scopus_publications"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Scopus specific fields
    scopus_id = Column(String(255), unique=True, index=True)
    eid = Column(String(255))
    title = Column(String(500))
    authors = Column(Text)
    publication_name = Column(String(500))
    volume = Column(String(50))
    issue = Column(String(50))
    pages = Column(String(50))
    cover_date = Column(Date)
    doi = Column(String(255))
    citation_count = Column(Integer, default=0)
    abstract = Column(Text)
    keywords = Column(Text)
    document_type = Column(String(100))
    open_access = Column(String(50))
    affiliation = Column(Text)
    
    dateCreation = Column(Date, default=datetime.date.today)
    dateModification = Column(Date, default=datetime.date.today)
    
    # Relationship
    user = relationship("User", back_populates="scopus_publications")

class ScopusProfile(Base):
    __tablename__ = "scopus_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    author_id = Column(String(255), unique=True, index=True)
    h_index = Column(Integer, default=0)
    citation_count = Column(Integer, default=0)
    document_count = Column(Integer, default=0)
    affiliation = Column(String(500))
    subject_areas = Column(Text)
    
    last_sync = Column(Date)
    dateCreation = Column(Date, default=datetime.date.today)
    dateModification = Column(Date, default=datetime.date.today)
    
    # Relationship
    user = relationship("User", back_populates="scopus_profile", uselist=False)