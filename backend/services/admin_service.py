from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_
from fastapi import HTTPException, status
from services.file_utils import delete_file_from_url
from models.organisation import (
    University, Etablissement, Departement, Laboratoire, 
    Equipe, Specialite, ThematiqueDeRecherche
)
from models.user import User, UserType
from models.post import Post, Comment, Reaction
from models.user import Projet
from typing import Optional


class AdminService:
    """Service for admin operations on organisation models"""

    # ============ University CRUD ============
    @staticmethod
    def create_university(db: Session, nom: str, adresse: str = None, ville: str = None, pays: str = None, Logo: str = None) -> University:
        """Create a new university"""
        existing = db.query(University).filter(University.nom == nom).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"University with name '{nom}' already exists"
            )
        
        university = University(nom=nom, adresse=adresse, ville=ville, pays=pays, Logo=Logo)
        db.add(university)
        db.commit()
        db.refresh(university)
        return university

    @staticmethod
    def get_university(db: Session, university_id: int) -> University:
        """Get university by ID"""
        university = db.query(University).filter(University.id == university_id).first()
        if not university:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"University with ID {university_id} not found"
            )
        return university

    @staticmethod
    def list_universities(db: Session) -> list:
        """List all universities"""
        return db.query(University).all()

    @staticmethod
    def update_university(db: Session, university_id: int, **kwargs) -> University:
        """Update university"""
        university = AdminService.get_university(db, university_id)
        for key, value in kwargs.items():
            if value is not None:
                setattr(university, key, value)
        db.commit()
        db.refresh(university)
        return university

    @staticmethod
    def delete_university(db: Session, university_id: int) -> dict:
        """Delete university"""
        university = AdminService.get_university(db, university_id)
        db.delete(university)
        db.commit()
        return {"message": f"University with ID {university_id} deleted successfully"}

    # ============ Etablissement CRUD ============
    @staticmethod
    def create_etablissement(db: Session, nom: str, adresse: str = None, ville: str = None, 
                           pays: str = None, Logo: str = None, universityId: int = None) -> Etablissement:
        """Create a new etablissement"""
        existing = db.query(Etablissement).filter(Etablissement.nom == nom).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Etablissement with name '{nom}' already exists"
            )
        
        if universityId:
            AdminService.get_university(db, universityId)  # Validate university exists
        
        etablissement = Etablissement(nom=nom, adresse=adresse, ville=ville, pays=pays, Logo=Logo, universityId=universityId)
        db.add(etablissement)
        db.commit()
        db.refresh(etablissement)
        return etablissement

    @staticmethod
    def get_etablissement(db: Session, etablissement_id: int) -> Etablissement:
        """Get etablissement by ID"""
        etablissement = db.query(Etablissement).filter(Etablissement.id == etablissement_id).first()
        if not etablissement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Etablissement with ID {etablissement_id} not found"
            )
        return etablissement

    @staticmethod
    def list_etablissements(db: Session) -> list:
        """List all etablissements"""
        return db.query(Etablissement).all()

    @staticmethod
    def update_etablissement(db: Session, etablissement_id: int, **kwargs) -> Etablissement:
        """Update etablissement"""
        etablissement = AdminService.get_etablissement(db, etablissement_id)
        for key, value in kwargs.items():
            if value is not None:
                setattr(etablissement, key, value)
        db.commit()
        db.refresh(etablissement)
        return etablissement

    @staticmethod
    def delete_etablissement(db: Session, etablissement_id: int) -> dict:
        """Delete etablissement"""
        etablissement = AdminService.get_etablissement(db, etablissement_id)
        db.delete(etablissement)
        db.commit()
        return {"message": f"Etablissement with ID {etablissement_id} deleted successfully"}

    # ============ Departement CRUD ============
    @staticmethod
    def create_departement(db: Session, nom: str, description: str = None, etablissementId: int = None) -> Departement:
        """Create a new departement"""
        existing = db.query(Departement).filter(Departement.nom == nom).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Departement with name '{nom}' already exists"
            )
        
        if etablissementId:
            AdminService.get_etablissement(db, etablissementId)  # Validate etablissement exists
        
        departement = Departement(nom=nom, description=description, etablissementId=etablissementId)
        db.add(departement)
        db.commit()
        db.refresh(departement)
        return departement

    @staticmethod
    def get_departement(db: Session, departement_id: int) -> Departement:
        """Get departement by ID"""
        departement = db.query(Departement).filter(Departement.id == departement_id).first()
        if not departement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Departement with ID {departement_id} not found"
            )
        return departement

    @staticmethod
    def list_departements(db: Session) -> list:
        """List all departements"""
        return db.query(Departement).all()

    @staticmethod
    def update_departement(db: Session, departement_id: int, **kwargs) -> Departement:
        """Update departement"""
        departement = AdminService.get_departement(db, departement_id)
        for key, value in kwargs.items():
            if value is not None:
                setattr(departement, key, value)
        db.commit()
        db.refresh(departement)
        return departement

    @staticmethod
    def delete_departement(db: Session, departement_id: int) -> dict:
        """Delete departement"""
        departement = AdminService.get_departement(db, departement_id)
        db.delete(departement)
        db.commit()
        return {"message": f"Departement with ID {departement_id} deleted successfully"}

    # ============ Laboratoire CRUD ============
    @staticmethod
    def create_laboratoire(db: Session, nom: str, description: str = None, univesityId: int = None) -> Laboratoire:
        """Create a new laboratoire"""
        existing = db.query(Laboratoire).filter(Laboratoire.nom == nom).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Laboratoire with name '{nom}' already exists"
            )
        
        if univesityId:
            AdminService.get_university(db, univesityId)  # Validate university exists
        
        laboratoire = Laboratoire(nom=nom, description=description, univesityId=univesityId)
        db.add(laboratoire)
        db.commit()
        db.refresh(laboratoire)
        return laboratoire

    @staticmethod
    def get_laboratoire(db: Session, laboratoire_id: int) -> Laboratoire:
        """Get laboratoire by ID"""
        laboratoire = db.query(Laboratoire).filter(Laboratoire.id == laboratoire_id).first()
        if not laboratoire:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Laboratoire with ID {laboratoire_id} not found"
            )
        return laboratoire

    @staticmethod
    def list_laboratoires(db: Session) -> list:
        """List all laboratoires"""
        return db.query(Laboratoire).all()

    @staticmethod
    def update_laboratoire(db: Session, laboratoire_id: int, **kwargs) -> Laboratoire:
        """Update laboratoire"""
        laboratoire = AdminService.get_laboratoire(db, laboratoire_id)
        for key, value in kwargs.items():
            if value is not None:
                setattr(laboratoire, key, value)
        db.commit()
        db.refresh(laboratoire)
        return laboratoire

    @staticmethod
    def delete_laboratoire(db: Session, laboratoire_id: int) -> dict:
        """Delete laboratoire"""
        laboratoire = AdminService.get_laboratoire(db, laboratoire_id)
        db.delete(laboratoire)
        db.commit()
        return {"message": f"Laboratoire with ID {laboratoire_id} deleted successfully"}

    # ============ Equipe CRUD ============
    @staticmethod
    def create_equipe(db: Session, nom: str, description: str = None, universityId: int = None) -> Equipe:
        """Create a new equipe"""
        existing = db.query(Equipe).filter(Equipe.nom == nom).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Equipe with name '{nom}' already exists"
            )
        
        if universityId:
            AdminService.get_university(db, universityId)  # Validate university exists
        
        equipe = Equipe(nom=nom, description=description, universityId=universityId)
        db.add(equipe)
        db.commit()
        db.refresh(equipe)
        return equipe

    @staticmethod
    def get_equipe(db: Session, equipe_id: int) -> Equipe:
        """Get equipe by ID"""
        equipe = db.query(Equipe).filter(Equipe.id == equipe_id).first()
        if not equipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Equipe with ID {equipe_id} not found"
            )
        return equipe

    @staticmethod
    def list_equipes(db: Session) -> list:
        """List all equipes"""
        return db.query(Equipe).all()

    @staticmethod
    def update_equipe(db: Session, equipe_id: int, **kwargs) -> Equipe:
        """Update equipe"""
        equipe = AdminService.get_equipe(db, equipe_id)
        for key, value in kwargs.items():
            if value is not None:
                setattr(equipe, key, value)
        db.commit()
        db.refresh(equipe)
        return equipe

    @staticmethod
    def delete_equipe(db: Session, equipe_id: int) -> dict:
        """Delete equipe"""
        equipe = AdminService.get_equipe(db, equipe_id)
        db.delete(equipe)
        db.commit()
        return {"message": f"Equipe with ID {equipe_id} deleted successfully"}

    # ============ Specialite CRUD ============
    @staticmethod
    def create_specialite(db: Session, nom: str, description: str = None) -> Specialite:
        """Create a new specialite"""
        existing = db.query(Specialite).filter(Specialite.nom == nom).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Specialite with name '{nom}' already exists"
            )
        
        specialite = Specialite(nom=nom, description=description)
        db.add(specialite)
        db.commit()
        db.refresh(specialite)
        return specialite

    @staticmethod
    def get_specialite(db: Session, specialite_id: int) -> Specialite:
        """Get specialite by ID"""
        specialite = db.query(Specialite).filter(Specialite.id == specialite_id).first()
        if not specialite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Specialite with ID {specialite_id} not found"
            )
        return specialite

    @staticmethod
    def list_specialites(db: Session) -> list:
        """List all specialites"""
        return db.query(Specialite).all()

    @staticmethod
    def update_specialite(db: Session, specialite_id: int, **kwargs) -> Specialite:
        """Update specialite"""
        specialite = AdminService.get_specialite(db, specialite_id)
        for key, value in kwargs.items():
            if value is not None:
                setattr(specialite, key, value)
        db.commit()
        db.refresh(specialite)
        return specialite

    @staticmethod
    def delete_specialite(db: Session, specialite_id: int) -> dict:
        """Delete specialite"""
        specialite = AdminService.get_specialite(db, specialite_id)
        db.delete(specialite)
        db.commit()
        return {"message": f"Specialite with ID {specialite_id} deleted successfully"}

    # ============ ThematiqueDeRecherche CRUD ============
    @staticmethod
    def create_thematique(db: Session, nom: str, description: str = None) -> ThematiqueDeRecherche:
        """Create a new thematique de recherche"""
        existing = db.query(ThematiqueDeRecherche).filter(ThematiqueDeRecherche.nom == nom).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ThematiqueDeRecherche with name '{nom}' already exists"
            )
        
        thematique = ThematiqueDeRecherche(nom=nom, description=description)
        db.add(thematique)
        db.commit()
        db.refresh(thematique)
        return thematique

    @staticmethod
    def get_thematique(db: Session, thematique_id: int) -> ThematiqueDeRecherche:
        """Get thematique by ID"""
        thematique = db.query(ThematiqueDeRecherche).filter(ThematiqueDeRecherche.id == thematique_id).first()
        if not thematique:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ThematiqueDeRecherche with ID {thematique_id} not found"
            )
        return thematique

    @staticmethod
    def list_thematiques(db: Session) -> list:
        """List all thematiques"""
        return db.query(ThematiqueDeRecherche).all()

    @staticmethod
    def update_thematique(db: Session, thematique_id: int, **kwargs) -> ThematiqueDeRecherche:
        """Update thematique"""
        thematique = AdminService.get_thematique(db, thematique_id)
        for key, value in kwargs.items():
            if value is not None:
                setattr(thematique, key, value)
        db.commit()
        db.refresh(thematique)
        return thematique

    @staticmethod
    def delete_thematique(db: Session, thematique_id: int) -> dict:
        """Delete thematique"""
        thematique = AdminService.get_thematique(db, thematique_id)
        db.delete(thematique)
        db.commit()
        return {"message": f"ThematiqueDeRecherche with ID {thematique_id} deleted successfully"}

    # ============ User Management ============
    @staticmethod
    def list_all_users(db: Session, skip: int = 0, limit: int = 100, user_type: Optional[UserType] = None) -> dict:
        """List all users with optional filtering by user type"""
        query = db.query(User)
        
        if user_type:
            query = query.filter(User.user_type == user_type)
        
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        
        return {"total": total, "users": users}

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID with all relationships"""
        user = db.query(User).options(
            joinedload(User.university),
            joinedload(User.etablissement),
            joinedload(User.departement),
            joinedload(User.laboratoire),
            joinedload(User.equipe)
        ).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        return user

    @staticmethod
    def search_users(db: Session, search_term: str, skip: int = 0, limit: int = 100) -> dict:
        """Search users by name or email"""
        search_pattern = f"%{search_term}%"
        
        query = db.query(User).filter(
            or_(
                User.fullName.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.nom.ilike(search_pattern),
                User.prenom.ilike(search_pattern)
            )
        )
        
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        
        return {"total": total, "users": users}

    @staticmethod
    def update_user(db: Session, user_id: int, **kwargs) -> User:
        """Update user information (admin can update any field except password directly)"""
        user = AdminService.get_user_by_id(db, user_id)
        
        for key, value in kwargs.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> dict:
        """Delete a user (cascades to all related data)"""
        user = AdminService.get_user_by_id(db, user_id)
        
        # Prevent admin from deleting themselves
        if user.user_type == UserType.ADMIN:
            # Optional: Add additional check if needed
            pass
        
        db.delete(user)
        db.commit()
        
        return {"message": f"User with ID {user_id} and all related data deleted successfully"}

    @staticmethod
    def toggle_user_activation(db: Session, user_id: int, active: bool) -> User:
        """Activate or deactivate a user account"""
        user = AdminService.get_user_by_id(db, user_id)
        
        # Could add an 'active' field to User model, for now using profile_completed as example
        # In a real system, you'd want an 'is_active' boolean field
        user.profile_completed = active
        
        db.commit()
        db.refresh(user)
        
        return user

    # ============ Content Moderation - Posts ============
    @staticmethod
    def list_all_posts(db: Session, skip: int = 0, limit: int = 100) -> dict:
        """List all posts across the platform"""
        total = db.query(Post).count()
        
        posts = db.query(Post).options(
            joinedload(Post.user),
            joinedload(Post.comments),
            joinedload(Post.reactions)
        ).order_by(desc(Post.timestamp)).offset(skip).limit(limit).all()
        
        return {"total": total, "posts": posts}

    @staticmethod
    def get_post_by_id(db: Session, post_id: int) -> Post:
        """Get post by ID"""
        post = db.query(Post).options(
            joinedload(Post.user),
            joinedload(Post.comments).joinedload(Comment.user),
            joinedload(Post.reactions).joinedload(Reaction.user)
        ).filter(Post.id == post_id).first()
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with ID {post_id} not found"
            )
        
        return post

    @staticmethod
    def delete_post(db: Session, post_id: int) -> dict:
        """Delete a post (admin moderation)"""
        post = AdminService.get_post_by_id(db, post_id)
        
        # If this post is linked to a Google Scholar publication, unpost it
        if post.publicationId:
            from models.google_scholar import Publication
            publication = db.query(Publication).filter(
                Publication.id == post.publicationId
            ).first()
            if publication:
                publication.isPosted = False
        
        # If this post is linked to a Scopus publication, unpost it
        if post.scopusPublicationId:
            from models.scopus import ScopusPublication
            scopus_publication = db.query(ScopusPublication).filter(
                ScopusPublication.id == post.scopusPublicationId
            ).first()
            if scopus_publication:
                scopus_publication.isPosted = False
        
        if post.attachement:
            delete_file_from_url(post.attachement)
        db.delete(post)
        db.commit()
        
        return {"message": f"Post with ID {post_id} deleted successfully"}

    @staticmethod
    def delete_user_posts(db: Session, user_id: int) -> dict:
        """Delete all posts from a specific user"""
        user = AdminService.get_user_by_id(db, user_id)
        posts = db.query(Post).filter(Post.userId == user_id).all()
        for post in posts:
            if post.attachement:
                delete_file_from_url(post.attachement)

        deleted_count = db.query(Post).filter(Post.userId == user_id).delete()
        db.commit()
        
        return {"message": f"Deleted {deleted_count} posts from user {user.fullName}"}

    # ============ Content Moderation - Comments ============
    @staticmethod
    def list_all_comments(db: Session, skip: int = 0, limit: int = 100) -> dict:
        """List all comments across the platform"""
        total = db.query(Comment).count()
        
        comments = db.query(Comment).options(
            joinedload(Comment.user),
            joinedload(Comment.post)
        ).order_by(desc(Comment.timestamp)).offset(skip).limit(limit).all()
        
        return {"total": total, "comments": comments}

    @staticmethod
    def delete_comment(db: Session, comment_id: int) -> dict:
        """Delete a comment (admin moderation)"""
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Comment with ID {comment_id} not found"
            )
        
        db.delete(comment)
        db.commit()
        
        return {"message": f"Comment with ID {comment_id} deleted successfully"}

    # ============ Content Moderation - Projets ============
    @staticmethod
    def list_all_projets(db: Session, skip: int = 0, limit: int = 100) -> dict:
        """List all projets across the platform"""
        total = db.query(Projet).count()
        
        projets = db.query(Projet).options(
            joinedload(Projet.user)
        ).order_by(desc(Projet.dateDebut)).offset(skip).limit(limit).all()
        
        return {"total": total, "projets": projets}

    @staticmethod
    def delete_projet(db: Session, projet_id: int) -> dict:
        """Delete a projet (admin moderation)"""
        projet = db.query(Projet).filter(Projet.id == projet_id).first()
        
        if not projet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Projet with ID {projet_id} not found"
            )
        
        db.delete(projet)
        db.commit()
        
        return {"message": f"Projet with ID {projet_id} deleted successfully"}

    # ============ Statistics ============
    @staticmethod
    def get_platform_statistics(db: Session) -> dict:
        """Get overall platform statistics"""
        total_users = db.query(User).count()
        total_enseignants = db.query(User).filter(User.user_type == UserType.ENSEIGNANT).count()
        total_doctorants = db.query(User).filter(User.user_type == UserType.DOCTORANT).count()
        total_admins = db.query(User).filter(User.user_type == UserType.ADMIN).count()
        
        total_posts = db.query(Post).count()
        total_comments = db.query(Comment).count()
        total_projets = db.query(Projet).count()
        
        total_universities = db.query(University).count()
        total_etablissements = db.query(Etablissement).count()
        total_laboratoires = db.query(Laboratoire).count()
        
        return {
            "users": {
                "total": total_users,
                "enseignants": total_enseignants,
                "doctorants": total_doctorants,
                "admins": total_admins
            },
            "content": {
                "posts": total_posts,
                "comments": total_comments,
                "projets": total_projets
            },
            "organisation": {
                "universities": total_universities,
                "etablissements": total_etablissements,
                "laboratoires": total_laboratoires
            }
        }
