from pydantic import BaseModel
from typing import Optional
from datetime import date

class ScopusPublicationBase(BaseModel):
    title: str
    authors: Optional[str] = None
    publication_name: Optional[str] = None
    cover_date: Optional[date] = None
    doi: Optional[str] = None
    citation_count: Optional[int] = 0

class ScopusPublicationResponse(ScopusPublicationBase):
    id: int
    userId: int
    scopus_id: str
    eid: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    abstract: Optional[str] = None
    keywords: Optional[str] = None
    document_type: Optional[str] = None
    open_access: Optional[str] = None
    affiliation: Optional[str] = None
    dateCreation: date
    dateModification: date
    
    class Config:
        from_attributes = True

class ScopusProfileResponse(BaseModel):
    id: int
    userId: int
    author_id: str
    h_index: int
    citation_count: int
    document_count: int
    affiliation: Optional[str] = None
    subject_areas: Optional[str] = None
    last_sync: Optional[date] = None
    dateCreation: date
    dateModification: date
    
    class Config:
        from_attributes = True

class ScopusStatsResponse(BaseModel):
    """Statistics summary for user's Scopus data"""
    total_publications: int
    total_citations: int
    h_index: int
    recent_publications: int  # Publications in last 2 years
    avg_citations_per_paper: float