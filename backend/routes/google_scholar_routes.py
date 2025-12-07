from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from services.google_scholar_service import GoogleScholarService
from schemas.google_scholar_schemas import (
    GoogleScholarLink,
    GoogleScholarIntegrationResponse,
    PublicationResponse,
    PublicationListResponse,
    SyncPublicationsResponse
)
from dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/google-scholar", tags=["Google Scholar"])


@router.post("/link", status_code=status.HTTP_201_CREATED, response_model=GoogleScholarIntegrationResponse)
def link_google_scholar(
    data: GoogleScholarLink,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Link Google Scholar account to user profile.
    
    Provide the Google Scholar user ID from your profile URL.
    Example: If your URL is https://scholar.google.com/citations?user=3RA5IZkAAAAJ
    Then your ID is: 3RA5IZkAAAAJ
    """
    return GoogleScholarService.link_google_scholar(db, current_user, data.googleScholarId)


@router.put("/update", status_code=status.HTTP_200_OK, response_model=GoogleScholarIntegrationResponse)
def update_google_scholar_id(
    data: GoogleScholarLink,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update Google Scholar ID for the linked account.
    """
    return GoogleScholarService.update_google_scholar_id(db, current_user, data.googleScholarId)


@router.get("/integration", status_code=status.HTTP_200_OK, response_model=GoogleScholarIntegrationResponse)
def get_google_scholar_integration(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current Google Scholar integration details.
    """
    return GoogleScholarService.get_google_scholar_integration(db, current_user)


@router.post("/sync", status_code=status.HTTP_200_OK, response_model=SyncPublicationsResponse)
def sync_publications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sync publications from Google Scholar profile.
    
    This will scrape your Google Scholar profile and import all publications.
    New publications will be added and existing ones will be updated with latest citation counts.
    """
    return GoogleScholarService.sync_publications(db, current_user)


@router.get("/publications", status_code=status.HTTP_200_OK, response_model=PublicationListResponse)
def get_publications(
    skip: int = Query(0, ge=0, description="Number of publications to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of publications to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of user's publications from Google Scholar.
    
    Returns paginated list of publications ordered by publication date (newest first).
    """
    return GoogleScholarService.get_publications(db, current_user, skip, limit)


@router.get("/publications/{publication_id}", status_code=status.HTTP_200_OK, response_model=PublicationResponse)
def get_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific publication.
    """
    return GoogleScholarService.get_publication_by_id(db, current_user, publication_id)


@router.patch("/publications/{publication_id}/toggle-post", status_code=status.HTTP_200_OK, response_model=PublicationResponse)
def toggle_publication_posted(
    publication_id: int,
    is_posted: bool = Query(..., description="Whether the publication should be marked as posted"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggle whether a publication is posted to the platform.
    
    Use this to mark publications as posted or unposted on your profile/feed.
    """
    return GoogleScholarService.toggle_publication_posted(db, current_user, publication_id, is_posted)


@router.delete("/unlink", status_code=status.HTTP_200_OK)
def unlink_google_scholar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unlink Google Scholar account.
    
    This will remove the integration and all associated publications.
    """
    return GoogleScholarService.delete_google_scholar_integration(db, current_user)
