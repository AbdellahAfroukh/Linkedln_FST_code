from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from dependencies import get_current_user
from schemas.scopus_schemas import (
    ScopusLink,
    ScopusIntegrationResponse,
    ScopusPublicationResponse,
    ScopusPublicationListResponse,
    SyncScopusPublicationsResponse
)
from services.scopus_service import ScopusService
from typing import Optional

router = APIRouter(prefix="/scopus", tags=["Scopus"])


@router.post("/link", response_model=ScopusIntegrationResponse)
def link_scopus_account(
    data: ScopusLink,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Link user's Scopus account"""
    return ScopusService.link_scopus(db, current_user, data.scopusAuthorId)


@router.put("/update", response_model=ScopusIntegrationResponse)
def update_scopus_account(
    data: ScopusLink,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's Scopus author ID"""
    return ScopusService.update_scopus_author_id(db, current_user, data.scopusAuthorId)


@router.get("/integration", response_model=ScopusIntegrationResponse)
def get_scopus_integration(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current Scopus integration details"""
    return ScopusService.get_scopus_integration(db, current_user)


@router.post("/sync", response_model=SyncScopusPublicationsResponse)
def sync_scopus_publications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Scrape and sync publications from Scopus profile"""
    return ScopusService.sync_publications(db, current_user)


@router.get("/publications", response_model=ScopusPublicationListResponse)
def get_scopus_publications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of user's Scopus publications"""
    return ScopusService.get_publications(db, current_user, skip, limit)


@router.get("/publications/{publication_id}", response_model=ScopusPublicationResponse)
def get_scopus_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific Scopus publication"""
    return ScopusService.get_publication_by_id(db, current_user, publication_id)


@router.patch("/publications/{publication_id}/toggle-post", response_model=ScopusPublicationResponse)
def toggle_scopus_publication_posted(
    publication_id: int,
    is_posted: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle whether a publication is posted to the platform"""
    return ScopusService.toggle_publication_posted(db, current_user, publication_id, is_posted)


@router.delete("/unlink")
def unlink_scopus_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unlink Scopus account and delete all associated publications"""
    return ScopusService.delete_scopus_integration(db, current_user)
