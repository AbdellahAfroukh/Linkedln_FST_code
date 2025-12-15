from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
from models.user import User
from services.scopus_service import ScopusService
from schemas.scopus_schemas import (
    ScopusProfileResponse, 
    ScopusPublicationResponse, 
    ScopusStatsResponse,
)
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/scopus", tags=["Scopus"])


class ScopusSyncSimpleRequest(BaseModel):
    """Simple sync request using default API key"""
    author_id: str


class ScopusSyncFullRequest(BaseModel):
    """Full sync request with custom API key"""
    author_id: str
    api_key: str


@router.post("/sync", status_code=200)
async def sync_scopus_data(
    sync_data: ScopusSyncSimpleRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
 
    try:
        # Fetch profile from Scopus (using default API key)
        profile_data = await ScopusService.fetch_author_profile(
            sync_data.author_id
        )
        profile = ScopusService.save_profile(
            db, 
            current_user, 
            profile_data, 
            sync_data.author_id
        )
        
        # Fetch publications from Scopus
        documents_data = await ScopusService.fetch_author_documents(
            sync_data.author_id
        )
        publications = ScopusService.save_publications(
            db, 
            current_user, 
            documents_data
        )
        
        return {
            "message": "Scopus data synced successfully",
            "profile": {
                "author_id": profile.author_id,
                "h_index": profile.h_index,
                "citation_count": profile.citation_count,
                "document_count": profile.document_count,
                "affiliation": profile.affiliation
            },
            "publications_synced": len(publications),
            "last_sync": profile.last_sync
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error syncing Scopus data: {str(e)}"
        )


@router.post("/sync-with-custom-key", status_code=200)
async def sync_scopus_data_custom_key(
    sync_data: ScopusSyncFullRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
  
    try:
        # Fetch profile from Scopus (using custom API key)
        profile_data = await ScopusService.fetch_author_profile(
            sync_data.author_id,
            sync_data.api_key
        )
        profile = ScopusService.save_profile(
            db, 
            current_user, 
            profile_data, 
            sync_data.author_id
        )
        
        # Fetch publications from Scopus
        documents_data = await ScopusService.fetch_author_documents(
            sync_data.author_id,
            sync_data.api_key
        )
        publications = ScopusService.save_publications(
            db, 
            current_user, 
            documents_data
        )
        
        return {
            "message": "Scopus data synced successfully with custom API key",
            "profile": {
                "author_id": profile.author_id,
                "h_index": profile.h_index,
                "citation_count": profile.citation_count,
                "document_count": profile.document_count,
                "affiliation": profile.affiliation
            },
            "publications_synced": len(publications),
            "last_sync": profile.last_sync
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error syncing Scopus data: {str(e)}"
        )


@router.get("/profile", response_model=ScopusProfileResponse)
def get_my_scopus_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get authenticated user's Scopus profile"""
    profile = ScopusService.get_user_profile(db, current_user)
    if not profile:
        raise HTTPException(
            status_code=404, 
            detail="Scopus profile not found. Please sync your data first."
        )
    return profile


@router.get("/profile/{user_id}", response_model=ScopusProfileResponse)
def get_user_scopus_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get any user's Scopus profile by user ID"""
    from models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = ScopusService.get_user_profile(db, user)
    if not profile:
        raise HTTPException(
            status_code=404, 
            detail="Scopus profile not found for this user"
        )
    return profile


@router.get("/publications", response_model=List[ScopusPublicationResponse])
def get_my_publications(
    limit: Optional[int] = Query(None, description="Limit number of results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get authenticated user's Scopus publications"""
    publications = ScopusService.get_user_publications(db, current_user, limit)
    if not publications:
        raise HTTPException(
            status_code=404, 
            detail="No publications found. Please sync your data first."
        )
    return publications


@router.get("/publications/{user_id}", response_model=List[ScopusPublicationResponse])
def get_user_publications(
    user_id: int,
    limit: Optional[int] = Query(None, description="Limit number of results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get any user's Scopus publications by user ID"""
    from models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    publications = ScopusService.get_user_publications(db, user, limit)
    if not publications:
        raise HTTPException(
            status_code=404, 
            detail="No publications found for this user"
        )
    return publications


@router.get("/publication/{publication_id}", response_model=ScopusPublicationResponse)
def get_publication_detail(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific publication details by ID"""
    from models.scopus import ScopusPublication
    publication = db.query(ScopusPublication).filter(
        ScopusPublication.id == publication_id
    ).first()
    
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    return publication


@router.get("/stats", response_model=ScopusStatsResponse)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics for authenticated user's Scopus data"""
    profile = ScopusService.get_user_profile(db, current_user)
    if not profile:
        raise HTTPException(
            status_code=404, 
            detail="No Scopus data found. Please sync your data first."
        )
    
    stats = ScopusService.get_user_stats(db, current_user)
    return stats


@router.get("/stats/{user_id}", response_model=ScopusStatsResponse)
def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics for any user's Scopus data"""
    from models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = ScopusService.get_user_profile(db, user)
    if not profile:
        raise HTTPException(
            status_code=404, 
            detail="No Scopus data found for this user"
        )
    
    stats = ScopusService.get_user_stats(db, user)
    return stats


@router.delete("/delete-all", status_code=200)
def delete_my_scopus_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all Scopus data for authenticated user"""
    success = ScopusService.delete_user_scopus_data(db, current_user)
    if success:
        return {"message": "All Scopus data deleted successfully"}
    else:
        raise HTTPException(
            status_code=500, 
            detail="Error deleting Scopus data"
        )