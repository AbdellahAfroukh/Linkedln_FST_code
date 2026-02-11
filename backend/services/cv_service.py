from sqlalchemy.orm import Session
from models.cv import Contact, Formation, Competence, Langue, Experience, CV
from models.user import UserType, User
from fastapi import HTTPException, status

def check_user_type(user: User):
    if user.user_type not in (UserType.ENSEIGNANT, UserType.DOCTORANT):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only enseignant and doctorant can modify CV.")

import datetime

class CVService:
    @staticmethod
    def create_cv(db: Session, data, user: User):
        check_user_type(user)
        existing_cv = db.query(CV).filter(CV.userId == user.id).first()
        if existing_cv:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CV already exists for user.")
        now = datetime.date.today()
        cv = CV(
            userId=user.id,
            titre=data.titre,
            description=data.description,
            dateCreation=now,
            dateModification=now,
            isPublic=False,
            cv_enabled=True
        )
        db.add(cv)
        db.commit()
        db.refresh(cv)
        return cv
    @staticmethod
    def get_user_cv(db: Session, user: User):
        check_user_type(user)
        cv = db.query(CV).filter(CV.userId == user.id).first()
        if not cv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found for user.")
        return cv

    @staticmethod
    def add_contact(db: Session, data, user: User):
        cv = CVService.get_user_cv(db, user)
        contact = Contact(cvId=cv.id, **data.dict())
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def add_formation(db: Session, data, user: User):
        cv = CVService.get_user_cv(db, user)
        formation = Formation(cvId=cv.id, **data.dict())
        db.add(formation)
        db.commit()
        db.refresh(formation)
        return formation

    @staticmethod
    def add_competence(db: Session, data, user: User):
        cv = CVService.get_user_cv(db, user)
        competence = Competence(cvId=cv.id, **data.dict())
        db.add(competence)
        db.commit()
        db.refresh(competence)
        return competence

    @staticmethod
    def add_langue(db: Session, data, user: User):
        cv = CVService.get_user_cv(db, user)
        langue = Langue(cvId=cv.id, **data.dict())
        db.add(langue)
        db.commit()
        db.refresh(langue)
        return langue

    @staticmethod
    def add_experience(db: Session, data, user: User):
        cv = CVService.get_user_cv(db, user)
        experience = Experience(cvId=cv.id, **data.dict())
        db.add(experience)
        db.commit()
        db.refresh(experience)
        return experience

    @staticmethod
    def set_cv_enabled(db: Session, user: User, enabled: bool):
        cv = CVService.get_user_cv(db, user)
        cv.cv_enabled = enabled
        db.commit()
        db.refresh(cv)
        return cv

    @staticmethod
    def list_contacts(db: Session, user: User):
        cv = CVService.get_user_cv(db, user)
        return db.query(Contact).filter(Contact.cvId == cv.id).all()

    @staticmethod
    def list_formations(db: Session, user: User):
        cv = CVService.get_user_cv(db, user)
        return db.query(Formation).filter(Formation.cvId == cv.id).all()

    @staticmethod
    def list_competences(db: Session, user: User):
        cv = CVService.get_user_cv(db, user)
        return db.query(Competence).filter(Competence.cvId == cv.id).all()

    @staticmethod
    def list_langues(db: Session, user: User):
        cv = CVService.get_user_cv(db, user)
        return db.query(Langue).filter(Langue.cvId == cv.id).all()

    @staticmethod
    def list_experiences(db: Session, user: User):
        cv = CVService.get_user_cv(db, user)
        return db.query(Experience).filter(Experience.cvId == cv.id).all()

    @staticmethod
    def get_cv(db: Session, user: User):
        return CVService.get_user_cv(db, user)
