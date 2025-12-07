from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_admin
from services.admin_service import AdminService
from schemas.admin_schemas import (
    UniversityCreate, UniversityUpdate, UniversityResponse,
    EtablissementCreate, EtablissementUpdate, EtablissementResponse,
    DepartementCreate, DepartementUpdate, DepartementResponse,
    LaboratoireCreate, LaboratoireUpdate, LaboratoireResponse,
    EquipeCreate, EquipeUpdate, EquipeResponse,
    SpecialiteCreate, SpecialiteUpdate, SpecialiteResponse,
    ThematiqueDeRechercheCreate, ThematiqueDeRechercheUpdate, ThematiqueDeRechercheResponse,
    UserUpdateByAdmin, UserBasicResponse, UserListResponse, UserDetailResponse,
    PlatformStatistics
)
from models.user import User, UserType
from typing import Optional

router = APIRouter(prefix="/admin", tags=["Admin - Organisation Management"])


# ============ University Endpoints ============
@router.post("/universities", response_model=UniversityResponse, status_code=status.HTTP_201_CREATED)
def create_university(
    data: UniversityCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new university (Admin only)"""
    return AdminService.create_university(
        db=db,
        nom=data.nom,
        adresse=data.adresse,
        ville=data.ville,
        pays=data.pays,
        Logo=data.Logo
    )


@router.get("/universities", response_model=list[UniversityResponse])
def list_universities(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all universities (Admin only)"""
    return AdminService.list_universities(db=db)


@router.get("/universities/{university_id}", response_model=UniversityResponse)
def get_university(
    university_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a university by ID (Admin only)"""
    return AdminService.get_university(db=db, university_id=university_id)


@router.put("/universities/{university_id}", response_model=UniversityResponse)
def update_university(
    university_id: int,
    data: UniversityUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a university (Admin only)"""
    return AdminService.update_university(db=db, university_id=university_id, **data.dict(exclude_unset=True))


@router.delete("/universities/{university_id}", response_model=dict)
def delete_university(
    university_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a university (Admin only)"""
    return AdminService.delete_university(db=db, university_id=university_id)


# ============ Etablissement Endpoints ============
@router.post("/etablissements", response_model=EtablissementResponse, status_code=status.HTTP_201_CREATED)
def create_etablissement(
    data: EtablissementCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new etablissement (Admin only)"""
    return AdminService.create_etablissement(
        db=db,
        nom=data.nom,
        adresse=data.adresse,
        ville=data.ville,
        pays=data.pays,
        Logo=data.Logo,
        universityId=data.universityId
    )


@router.get("/etablissements", response_model=list[EtablissementResponse])
def list_etablissements(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all etablissements (Admin only)"""
    return AdminService.list_etablissements(db=db)


@router.get("/etablissements/{etablissement_id}", response_model=EtablissementResponse)
def get_etablissement(
    etablissement_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get an etablissement by ID (Admin only)"""
    return AdminService.get_etablissement(db=db, etablissement_id=etablissement_id)


@router.put("/etablissements/{etablissement_id}", response_model=EtablissementResponse)
def update_etablissement(
    etablissement_id: int,
    data: EtablissementUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update an etablissement (Admin only)"""
    return AdminService.update_etablissement(db=db, etablissement_id=etablissement_id, **data.dict(exclude_unset=True))


@router.delete("/etablissements/{etablissement_id}", response_model=dict)
def delete_etablissement(
    etablissement_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete an etablissement (Admin only)"""
    return AdminService.delete_etablissement(db=db, etablissement_id=etablissement_id)


# ============ Departement Endpoints ============
@router.post("/departements", response_model=DepartementResponse, status_code=status.HTTP_201_CREATED)
def create_departement(
    data: DepartementCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new departement (Admin only)"""
    return AdminService.create_departement(
        db=db,
        nom=data.nom,
        description=data.description,
        etablissementId=data.etablissementId
    )


@router.get("/departements", response_model=list[DepartementResponse])
def list_departements(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all departements (Admin only)"""
    return AdminService.list_departements(db=db)


@router.get("/departements/{departement_id}", response_model=DepartementResponse)
def get_departement(
    departement_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a departement by ID (Admin only)"""
    return AdminService.get_departement(db=db, departement_id=departement_id)


@router.put("/departements/{departement_id}", response_model=DepartementResponse)
def update_departement(
    departement_id: int,
    data: DepartementUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a departement (Admin only)"""
    return AdminService.update_departement(db=db, departement_id=departement_id, **data.dict(exclude_unset=True))


@router.delete("/departements/{departement_id}", response_model=dict)
def delete_departement(
    departement_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a departement (Admin only)"""
    return AdminService.delete_departement(db=db, departement_id=departement_id)


# ============ Laboratoire Endpoints ============
@router.post("/laboratoires", response_model=LaboratoireResponse, status_code=status.HTTP_201_CREATED)
def create_laboratoire(
    data: LaboratoireCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new laboratoire (Admin only)"""
    return AdminService.create_laboratoire(
        db=db,
        nom=data.nom,
        description=data.description,
        univesityId=data.univesityId
    )


@router.get("/laboratoires", response_model=list[LaboratoireResponse])
def list_laboratoires(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all laboratoires (Admin only)"""
    return AdminService.list_laboratoires(db=db)


@router.get("/laboratoires/{laboratoire_id}", response_model=LaboratoireResponse)
def get_laboratoire(
    laboratoire_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a laboratoire by ID (Admin only)"""
    return AdminService.get_laboratoire(db=db, laboratoire_id=laboratoire_id)


@router.put("/laboratoires/{laboratoire_id}", response_model=LaboratoireResponse)
def update_laboratoire(
    laboratoire_id: int,
    data: LaboratoireUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a laboratoire (Admin only)"""
    return AdminService.update_laboratoire(db=db, laboratoire_id=laboratoire_id, **data.dict(exclude_unset=True))


@router.delete("/laboratoires/{laboratoire_id}", response_model=dict)
def delete_laboratoire(
    laboratoire_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a laboratoire (Admin only)"""
    return AdminService.delete_laboratoire(db=db, laboratoire_id=laboratoire_id)


# ============ Equipe Endpoints ============
@router.post("/equipes", response_model=EquipeResponse, status_code=status.HTTP_201_CREATED)
def create_equipe(
    data: EquipeCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new equipe (Admin only)"""
    return AdminService.create_equipe(
        db=db,
        nom=data.nom,
        description=data.description,
        universityId=data.universityId
    )


@router.get("/equipes", response_model=list[EquipeResponse])
def list_equipes(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all equipes (Admin only)"""
    return AdminService.list_equipes(db=db)


@router.get("/equipes/{equipe_id}", response_model=EquipeResponse)
def get_equipe(
    equipe_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get an equipe by ID (Admin only)"""
    return AdminService.get_equipe(db=db, equipe_id=equipe_id)


@router.put("/equipes/{equipe_id}", response_model=EquipeResponse)
def update_equipe(
    equipe_id: int,
    data: EquipeUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update an equipe (Admin only)"""
    return AdminService.update_equipe(db=db, equipe_id=equipe_id, **data.dict(exclude_unset=True))


@router.delete("/equipes/{equipe_id}", response_model=dict)
def delete_equipe(
    equipe_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete an equipe (Admin only)"""
    return AdminService.delete_equipe(db=db, equipe_id=equipe_id)


# ============ Specialite Endpoints ============
@router.post("/specialites", response_model=SpecialiteResponse, status_code=status.HTTP_201_CREATED)
def create_specialite(
    data: SpecialiteCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new specialite (Admin only)"""
    return AdminService.create_specialite(db=db, nom=data.nom, description=data.description)


@router.get("/specialites", response_model=list[SpecialiteResponse])
def list_specialites(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all specialites (Admin only)"""
    return AdminService.list_specialites(db=db)


@router.get("/specialites/{specialite_id}", response_model=SpecialiteResponse)
def get_specialite(
    specialite_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a specialite by ID (Admin only)"""
    return AdminService.get_specialite(db=db, specialite_id=specialite_id)


@router.put("/specialites/{specialite_id}", response_model=SpecialiteResponse)
def update_specialite(
    specialite_id: int,
    data: SpecialiteUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a specialite (Admin only)"""
    return AdminService.update_specialite(db=db, specialite_id=specialite_id, **data.dict(exclude_unset=True))


@router.delete("/specialites/{specialite_id}", response_model=dict)
def delete_specialite(
    specialite_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a specialite (Admin only)"""
    return AdminService.delete_specialite(db=db, specialite_id=specialite_id)


# ============ ThematiqueDeRecherche Endpoints ============
@router.post("/thematiques", response_model=ThematiqueDeRechercheResponse, status_code=status.HTTP_201_CREATED)
def create_thematique(
    data: ThematiqueDeRechercheCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new thematique de recherche (Admin only)"""
    return AdminService.create_thematique(db=db, nom=data.nom, description=data.description)


@router.get("/thematiques", response_model=list[ThematiqueDeRechercheResponse])
def list_thematiques(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all thematiques (Admin only)"""
    return AdminService.list_thematiques(db=db)


@router.get("/thematiques/{thematique_id}", response_model=ThematiqueDeRechercheResponse)
def get_thematique(
    thematique_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get a thematique by ID (Admin only)"""
    return AdminService.get_thematique(db=db, thematique_id=thematique_id)


@router.put("/thematiques/{thematique_id}", response_model=ThematiqueDeRechercheResponse)
def update_thematique(
    thematique_id: int,
    data: ThematiqueDeRechercheUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a thematique (Admin only)"""
    return AdminService.update_thematique(db=db, thematique_id=thematique_id, **data.dict(exclude_unset=True))


@router.delete("/thematiques/{thematique_id}", response_model=dict)
def delete_thematique(
    thematique_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a thematique (Admin only)"""
    return AdminService.delete_thematique(db=db, thematique_id=thematique_id)


# ============ User Management Endpoints ============
@router.get("/users", response_model=UserListResponse)
def list_all_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of users to return"),
    user_type: Optional[UserType] = Query(None, description="Filter by user type"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all users with optional filtering (Admin only)"""
    return AdminService.list_all_users(db=db, skip=skip, limit=limit, user_type=user_type)


@router.get("/users/search", response_model=UserListResponse)
def search_users(
    q: str = Query(..., min_length=1, description="Search term"),
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of users to return"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Search users by name or email (Admin only)"""
    return AdminService.search_users(db=db, search_term=q, skip=skip, limit=limit)


@router.get("/users/{user_id}", response_model=UserDetailResponse)
def get_user_details(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific user (Admin only)"""
    return AdminService.get_user_by_id(db=db, user_id=user_id)


@router.patch("/users/{user_id}", response_model=UserDetailResponse)
def update_user(
    user_id: int,
    data: UserUpdateByAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update user information (Admin only)"""
    return AdminService.update_user(db=db, user_id=user_id, **data.dict(exclude_unset=True))


@router.delete("/users/{user_id}", response_model=dict)
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a user and all their related data (Admin only)"""
    return AdminService.delete_user(db=db, user_id=user_id)


@router.patch("/users/{user_id}/toggle-activation", response_model=UserDetailResponse)
def toggle_user_activation(
    user_id: int,
    active: bool = Query(..., description="Activate or deactivate user"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Activate or deactivate a user account (Admin only)"""
    return AdminService.toggle_user_activation(db=db, user_id=user_id, active=active)


# ============ Content Moderation Endpoints ============
@router.get("/posts")
def list_all_posts(
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of posts to return"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all posts across the platform (Admin only)"""
    return AdminService.list_all_posts(db=db, skip=skip, limit=limit)


@router.get("/posts/{post_id}")
def get_post_details(
    post_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific post (Admin only)"""
    return AdminService.get_post_by_id(db=db, post_id=post_id)


@router.delete("/posts/{post_id}", response_model=dict)
def delete_post(
    post_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a specific post (Admin moderation)"""
    return AdminService.delete_post(db=db, post_id=post_id)


@router.delete("/users/{user_id}/posts", response_model=dict)
def delete_user_posts(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete all posts from a specific user (Admin moderation)"""
    return AdminService.delete_user_posts(db=db, user_id=user_id)


@router.get("/comments")
def list_all_comments(
    skip: int = Query(0, ge=0, description="Number of comments to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of comments to return"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all comments across the platform (Admin only)"""
    return AdminService.list_all_comments(db=db, skip=skip, limit=limit)


@router.delete("/comments/{comment_id}", response_model=dict)
def delete_comment(
    comment_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a specific comment (Admin moderation)"""
    return AdminService.delete_comment(db=db, comment_id=comment_id)


@router.get("/projets")
def list_all_projets(
    skip: int = Query(0, ge=0, description="Number of projets to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of projets to return"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all projets across the platform (Admin only)"""
    return AdminService.list_all_projets(db=db, skip=skip, limit=limit)


@router.delete("/projets/{projet_id}", response_model=dict)
def delete_projet(
    projet_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a specific projet (Admin moderation)"""
    return AdminService.delete_projet(db=db, projet_id=projet_id)


# ============ Platform Statistics ============
@router.get("/statistics", response_model=PlatformStatistics)
def get_platform_statistics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get overall platform statistics (Admin only)"""
    return AdminService.get_platform_statistics(db=db)
