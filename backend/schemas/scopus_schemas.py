from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class ScopusLink(BaseModel):
    """Schema for linking Scopus account"""
    scopusAuthorId: str = Field(..., description="Scopus author ID from the profile URL")


class ScopusIntegrationResponse(BaseModel):
    """Response schema for Scopus integration"""
    id: int
    scopusAuthorId: str
    profileUrl: str
    lastSynced: Optional[date] = None
    userId: int

    class Config:
        from_attributes = True


class ScopusPublicationResponse(BaseModel):
    """Response schema for a single Scopus publication"""
    id: int
    title: str
    abstract: Optional[str] = None
    summary: Optional[str] = None
    publicationDate: Optional[date] = None
    citationCount: int
    scopusUrl: Optional[str] = None
    isPosted: bool
    scopusIntegrationId: int

    class Config:
        from_attributes = True


class ScopusPublicationListResponse(BaseModel):
    """Response schema for list of Scopus publications"""
    total: int
    publications: List[ScopusPublicationResponse]


class SyncScopusPublicationsResponse(BaseModel):
    """Response schema for Scopus sync operation"""
    success: bool
    message: str
    newPublications: int
    updatedPublications: int
    totalPublications: int
