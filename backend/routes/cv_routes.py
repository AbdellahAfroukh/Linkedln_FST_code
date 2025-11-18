from fastapi import Body
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.cv_service import CVService
from models.cv import Contact, Formation, Competence, Langue, Experience

from schemas.cv_schemas import ContactCreate, FormationCreate, CompetenceCreate, LangueCreate, ExperienceCreate, CVCreate, CVUpdate
from dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/cv", tags=["CV"])

@router.patch("/update", status_code=status.HTTP_200_OK)
def update_cv(data: CVUpdate = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Patch the authenticated user's CV. Provide a JSON body with any of the updatable fields.

    Example body (raw JSON):
    {
      "description": "Updated description"
    }
    """
    cv = CVService.get_user_cv(db, current_user)
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(cv, key):
            setattr(cv, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(cv)
    return cv

# PATCH endpoints for Contact, Formation, Competence, Langue, Experience
@router.patch("/contact/{contact_id}", status_code=status.HTTP_200_OK)
def update_contact(contact_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    contact = db.query(Contact).filter(Contact.id == contact_id, Contact.cvId == cv.id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    for key, value in data.items():
        if hasattr(contact, key):
            setattr(contact, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(contact)
    db.refresh(cv)
    return contact

@router.patch("/formation/{formation_id}", status_code=status.HTTP_200_OK)
def update_formation(formation_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    formation = db.query(Formation).filter(Formation.id == formation_id, Formation.cvId == cv.id).first()
    if not formation:
        raise HTTPException(status_code=404, detail="Formation not found")
    for key, value in data.items():
        if hasattr(formation, key):
            setattr(formation, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(formation)
    db.refresh(cv)
    return formation

@router.patch("/competence/{competence_id}", status_code=status.HTTP_200_OK)
def update_competence(competence_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    competence = db.query(Competence).filter(Competence.id == competence_id, Competence.cvId == cv.id).first()
    if not competence:
        raise HTTPException(status_code=404, detail="Competence not found")
    for key, value in data.items():
        if hasattr(competence, key):
            setattr(competence, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(competence)
    db.refresh(cv)
    return competence

@router.patch("/langue/{langue_id}", status_code=status.HTTP_200_OK)
def update_langue(langue_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    langue = db.query(Langue).filter(Langue.id == langue_id, Langue.cvId == cv.id).first()
    if not langue:
        raise HTTPException(status_code=404, detail="Langue not found")
    for key, value in data.items():
        if hasattr(langue, key):
            setattr(langue, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(langue)
    db.refresh(cv)
    return langue

@router.patch("/experience/{experience_id}", status_code=status.HTTP_200_OK)
def update_experience(experience_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    experience = db.query(Experience).filter(Experience.id == experience_id, Experience.cvId == cv.id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    for key, value in data.items():
        if hasattr(experience, key):
            setattr(experience, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(experience)
    db.refresh(cv)
    return experience

# Endpoint to make CV public or private
@router.post("/set-public", status_code=status.HTTP_200_OK)
def set_cv_public(is_public: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    cv.isPublic = is_public
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(cv)
    return {"isPublic": cv.isPublic}
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.cv_service import CVService
from models.cv import Contact, Formation, Competence, Langue, Experience

from schemas.cv_schemas import ContactCreate, FormationCreate, CompetenceCreate, LangueCreate, ExperienceCreate, CVCreate
from dependencies import get_current_user
from models.user import User


router = APIRouter(prefix="/cv", tags=["CV"])
@router.patch("/update", status_code=status.HTTP_200_OK)
def update_cv(data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    for key, value in data.items():
        if hasattr(cv, key):
            setattr(cv, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(cv)
    return cv

# PATCH endpoints for Contact, Formation, Competence, Langue, Experience
@router.patch("/contact/{contact_id}", status_code=status.HTTP_200_OK)
def update_contact(contact_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    contact = db.query(Contact).filter(Contact.id == contact_id, Contact.cvId == cv.id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    for key, value in data.items():
        if hasattr(contact, key):
            setattr(contact, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(contact)
    db.refresh(cv)
    return contact

@router.patch("/formation/{formation_id}", status_code=status.HTTP_200_OK)
def update_formation(formation_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    formation = db.query(Formation).filter(Formation.id == formation_id, Formation.cvId == cv.id).first()
    if not formation:
        raise HTTPException(status_code=404, detail="Formation not found")
    for key, value in data.items():
        if hasattr(formation, key):
            setattr(formation, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(formation)
    db.refresh(cv)
    return formation

@router.patch("/competence/{competence_id}", status_code=status.HTTP_200_OK)
def update_competence(competence_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    competence = db.query(Competence).filter(Competence.id == competence_id, Competence.cvId == cv.id).first()
    if not competence:
        raise HTTPException(status_code=404, detail="Competence not found")
    for key, value in data.items():
        if hasattr(competence, key):
            setattr(competence, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(competence)
    db.refresh(cv)
    return competence

@router.patch("/langue/{langue_id}", status_code=status.HTTP_200_OK)
def update_langue(langue_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    langue = db.query(Langue).filter(Langue.id == langue_id, Langue.cvId == cv.id).first()
    if not langue:
        raise HTTPException(status_code=404, detail="Langue not found")
    for key, value in data.items():
        if hasattr(langue, key):
            setattr(langue, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(langue)
    db.refresh(cv)
    return langue

@router.patch("/experience/{experience_id}", status_code=status.HTTP_200_OK)
def update_experience(experience_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    experience = db.query(Experience).filter(Experience.id == experience_id, Experience.cvId == cv.id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    for key, value in data.items():
        if hasattr(experience, key):
            setattr(experience, key, value)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(experience)
    db.refresh(cv)
    return experience

# Endpoint to make CV public or private
@router.post("/set-public", status_code=status.HTTP_200_OK)
def set_cv_public(is_public: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = CVService.get_user_cv(db, current_user)
    cv.isPublic = is_public
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    db.refresh(cv)
    return {"isPublic": cv.isPublic}

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_cv(data: CVCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.create_cv(db, data, current_user)

@router.post("/contact", status_code=status.HTTP_201_CREATED)
def add_contact(data: ContactCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.add_contact(db, data, current_user)

@router.post("/formation", status_code=status.HTTP_201_CREATED)
def add_formation(data: FormationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.add_formation(db, data, current_user)

@router.post("/competence", status_code=status.HTTP_201_CREATED)
def add_competence(data: CompetenceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.add_competence(db, data, current_user)

@router.post("/langue", status_code=status.HTTP_201_CREATED)
def add_langue(data: LangueCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.add_langue(db, data, current_user)

@router.post("/experience", status_code=status.HTTP_201_CREATED)
def add_experience(data: ExperienceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.add_experience(db, data, current_user)

@router.post("/enable", status_code=status.HTTP_200_OK)
def enable_cv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.set_cv_enabled(db, current_user, True)

@router.post("/disable", status_code=status.HTTP_200_OK)
def disable_cv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CVService.set_cv_enabled(db, current_user, False)


@router.get("/", status_code=status.HTTP_200_OK)
def get_cv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return the authenticated user's CV"""
    return CVService.get_cv(db, current_user)


@router.get("/contact", status_code=status.HTTP_200_OK)
def list_contacts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return contact(s) for the authenticated user's CV"""
    return CVService.list_contacts(db, current_user)


@router.get("/formations", status_code=status.HTTP_200_OK)
def list_formations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return formations for the authenticated user's CV"""
    return CVService.list_formations(db, current_user)


@router.get("/competences", status_code=status.HTTP_200_OK)
def list_competences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return competences for the authenticated user's CV"""
    return CVService.list_competences(db, current_user)


@router.get("/langues", status_code=status.HTTP_200_OK)
def list_langues(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return langues for the authenticated user's CV"""
    return CVService.list_langues(db, current_user)


@router.get("/experiences", status_code=status.HTTP_200_OK)
def list_experiences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return experiences for the authenticated user's CV"""
    return CVService.list_experiences(db, current_user)
