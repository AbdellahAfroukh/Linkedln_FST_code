from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class GoogleScholarLink(BaseModel):
    """Schema for linking Google Scholar account"""
    googleScholarId: str = Field(..., description="Google Scholar user ID from the profile URL")


class GoogleScholarIntegrationResponse(BaseModel):
    """Response schema for Google Scholar integration"""
    id: int
    googleScholarId: str
    profileUrl: str
    lastSynced: Optional[date] = None
    userId: int

    class Config:
        from_attributes = True


class PublicationResponse(BaseModel):
    """Response schema for a single publication"""
    id: int
    title: str
    abstract: Optional[str] = None
    summary: Optional[str] = None
    publicationDate: Optional[date] = None
    citationCount: int
    googleScholarUrl: Optional[str] = None
    isPosted: bool
    googleScholarIntegrationId: int

    class Config:
        from_attributes = True


class PublicationListResponse(BaseModel):
    """Response schema for list of publications"""
    total: int
    publications: List[PublicationResponse]


class SyncPublicationsResponse(BaseModel):
    """Response schema for sync operation"""
    success: bool
    message: str
    newPublications: int
    updatedPublications: int
    totalPublications: int
