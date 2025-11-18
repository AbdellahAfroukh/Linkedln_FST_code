from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.organisation import (
    University, Etablissement, Departement, Laboratoire, 
    Equipe, Specialite, ThematiqueDeRecherche
)


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
