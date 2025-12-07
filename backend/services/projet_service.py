from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from models.user import Projet, User, UserType
from fastapi import HTTPException, status


class ProjetService:
    
    @staticmethod
    def check_enseignant_permission(user: User):
        """Verify that user is an enseignant"""
        if user.user_type != UserType.ENSEIGNANT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only enseignants can manage projets"
            )
    
    @staticmethod
    def create_projet(db: Session, user: User, data) -> Projet:
        """Create a new projet (enseignant only)"""
        ProjetService.check_enseignant_permission(user)
        
        projet = Projet(
            titre=data.titre,
            description=data.description,
            budget=data.budget,
            dateDebut=data.dateDebut,
            dureeEnMois=data.dureeEnMois,
            statut=data.statut,
            userId=user.id
        )
        
        db.add(projet)
        db.commit()
        db.refresh(projet)
        
        return projet
    
    @staticmethod
    def get_projet_by_id(db: Session, projet_id: int) -> Projet:
        """Get a projet by ID"""
        projet = db.query(Projet).options(
            joinedload(Projet.user)
        ).filter(Projet.id == projet_id).first()
        
        if not projet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projet not found"
            )
        
        return projet
    
    @staticmethod
    def update_projet(db: Session, projet_id: int, user: User, data) -> Projet:
        """Update a projet (only by owner)"""
        ProjetService.check_enseignant_permission(user)
        
        projet = ProjetService.get_projet_by_id(db, projet_id)
        
        if projet.userId != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own projets"
            )
        
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(projet, key, value)
        
        db.commit()
        db.refresh(projet)
        
        return projet
    
    @staticmethod
    def delete_projet(db: Session, projet_id: int, user: User):
        """Delete a projet (only by owner)"""
        ProjetService.check_enseignant_permission(user)
        
        projet = ProjetService.get_projet_by_id(db, projet_id)
        
        if projet.userId != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own projets"
            )
        
        db.delete(projet)
        db.commit()
        
        return {"message": "Projet deleted successfully"}
    
    @staticmethod
    def get_user_projets(db: Session, user_id: int, skip: int = 0, limit: int = 50):
        """Get all projets for a specific user"""
        total = db.query(Projet).filter(Projet.userId == user_id).count()
        
        projets = db.query(Projet).options(
            joinedload(Projet.user)
        ).filter(Projet.userId == user_id).order_by(
            desc(Projet.dateDebut)
        ).offset(skip).limit(limit).all()
        
        return {"total": total, "projets": projets}
    
    @staticmethod
    def get_my_projets(db: Session, user: User, skip: int = 0, limit: int = 50):
        """Get all projets for the current user (enseignant only)"""
        ProjetService.check_enseignant_permission(user)
        return ProjetService.get_user_projets(db, user.id, skip, limit)
    
    @staticmethod
    def get_all_projets(db: Session, skip: int = 0, limit: int = 50, statut: str = None):
        """Get all projets (with optional status filter)"""
        query = db.query(Projet).options(joinedload(Projet.user))
        
        if statut:
            query = query.filter(Projet.statut == statut)
        
        total = query.count()
        projets = query.order_by(desc(Projet.dateDebut)).offset(skip).limit(limit).all()
        
        return {"total": total, "projets": projets}
    
    @staticmethod
    def search_projets(db: Session, search_term: str, skip: int = 0, limit: int = 50):
        """Search projets by title or description"""
        search_pattern = f"%{search_term}%"
        
        query = db.query(Projet).options(
            joinedload(Projet.user)
        ).filter(
            (Projet.titre.ilike(search_pattern)) | 
            (Projet.description.ilike(search_pattern))
        )
        
        total = query.count()
        projets = query.order_by(desc(Projet.dateDebut)).offset(skip).limit(limit).all()
        
        return {"total": total, "projets": projets}
