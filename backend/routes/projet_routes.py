from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from database import get_db
from services.projet_service import ProjetService
from schemas.projet_schemas import (
    ProjetCreate,
    ProjetUpdate,
    ProjetResponse,
    ProjetListResponse
)
from dependencies import get_current_user
from models.user import User
from typing import Optional

router = APIRouter(prefix="/projets", tags=["Projets"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProjetResponse)
def create_projet(
    data: ProjetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new projet (enseignant only).
    
    Required fields:
    - **titre**: Project title
    - **description**: Detailed description
    - **budget**: Project budget (positive number)
    - **dateDebut**: Start date
    - **dureeEnMois**: Duration in months (positive integer)
    - **statut**: Status (e.g., 'en cours', 'terminé', 'planifié')
    """
    return ProjetService.create_projet(db, current_user, data)


@router.get("/my-projets", status_code=status.HTTP_200_OK, response_model=ProjetListResponse)
def get_my_projets(
    skip: int = Query(0, ge=0, description="Number of projets to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of projets to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all projets for the current user (enseignant only).
    
    Returns projets ordered by start date (newest first).
    """
    return ProjetService.get_my_projets(db, current_user, skip, limit)


@router.get("/", status_code=status.HTTP_200_OK, response_model=ProjetListResponse)
def get_all_projets(
    skip: int = Query(0, ge=0, description="Number of projets to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of projets to return"),
    statut: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all projets (accessible to all authenticated users).
    
    Optional filter by status.
    Returns projets ordered by start date (newest first).
    """
    return ProjetService.get_all_projets(db, skip, limit, statut)


@router.get("/search", status_code=status.HTTP_200_OK, response_model=ProjetListResponse)
def search_projets(
    q: str = Query(..., min_length=1, description="Search term"),
    skip: int = Query(0, ge=0, description="Number of projets to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of projets to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search projets by title or description.
    
    Performs case-insensitive search across projet titles and descriptions.
    """
    return ProjetService.search_projets(db, q, skip, limit)


@router.get("/user/{user_id}", status_code=status.HTTP_200_OK, response_model=ProjetListResponse)
def get_user_projets(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of projets to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of projets to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all projets for a specific user.
    
    Returns projets ordered by start date (newest first).
    """
    return ProjetService.get_user_projets(db, user_id, skip, limit)


@router.get("/{projet_id}", status_code=status.HTTP_200_OK, response_model=ProjetResponse)
def get_projet(
    projet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific projet by ID.
    """
    return ProjetService.get_projet_by_id(db, projet_id)


@router.patch("/{projet_id}", status_code=status.HTTP_200_OK, response_model=ProjetResponse)
def update_projet(
    projet_id: int,
    data: ProjetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a projet (only by owner, enseignant only).
    
    All fields are optional. Only provided fields will be updated.
    """
    return ProjetService.update_projet(db, projet_id, current_user, data)


@router.delete("/{projet_id}", status_code=status.HTTP_200_OK)
def delete_projet(
    projet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a projet (only by owner, enseignant only).
    """
    return ProjetService.delete_projet(db, projet_id, current_user)
