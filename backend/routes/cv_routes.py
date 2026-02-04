from fastapi import Body
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from services.cv_service import CVService
from models.cv import Contact, Formation, Competence, Langue, Experience

from schemas.cv_schemas import ContactCreate, FormationCreate, CompetenceCreate, LangueCreate, ExperienceCreate, CVCreate, CVUpdate
from dependencies import get_current_user
from models.user import User
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfgen import canvas
import os
import tempfile

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


@router.get("/user/{user_id}", status_code=status.HTTP_200_OK)
def get_user_cv(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a user's CV if it's public or if there's a connection"""
    from models.cv import CV
    from models.connection import Connection
    
    # Get the target user's CV
    cv = db.query(CV).filter(CV.userId == user_id, CV.cv_enabled == True).first()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    # Check if CV is public
    if cv.isPublic:
        return cv
    
    # Check if current user has a connection with the target user
    from models.connection import ConnectionStatus
    has_connection = db.query(Connection).filter(
        Connection.status == ConnectionStatus.ACCEPTED,
        (
            (Connection.senderId == current_user.id and Connection.receiverId == user_id) |
            (Connection.senderId == user_id and Connection.receiverId == current_user.id)
        )
    ).first()
    
    if has_connection:
        return cv
    
    # No access
    raise HTTPException(status_code=403, detail="You don't have access to this CV")


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


# DELETE ENDPOINTS
@router.delete("/", status_code=status.HTTP_200_OK)
def delete_cv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete the authenticated user's CV"""
    cv = CVService.get_user_cv(db, current_user)
    db.delete(cv)
    db.commit()
    return {"message": "CV deleted successfully"}


@router.delete("/contact/{contact_id}", status_code=status.HTTP_200_OK)
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a contact"""
    cv = CVService.get_user_cv(db, current_user)
    contact = db.query(Contact).filter(Contact.id == contact_id, Contact.cvId == cv.id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    return {"message": "Contact deleted successfully"}


@router.delete("/formation/{formation_id}", status_code=status.HTTP_200_OK)
def delete_formation(formation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a formation"""
    cv = CVService.get_user_cv(db, current_user)
    formation = db.query(Formation).filter(Formation.id == formation_id, Formation.cvId == cv.id).first()
    if not formation:
        raise HTTPException(status_code=404, detail="Formation not found")
    db.delete(formation)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    return {"message": "Formation deleted successfully"}


@router.delete("/competence/{competence_id}", status_code=status.HTTP_200_OK)
def delete_competence(competence_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a competence"""
    cv = CVService.get_user_cv(db, current_user)
    competence = db.query(Competence).filter(Competence.id == competence_id, Competence.cvId == cv.id).first()
    if not competence:
        raise HTTPException(status_code=404, detail="Competence not found")
    db.delete(competence)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    return {"message": "Competence deleted successfully"}


@router.delete("/langue/{langue_id}", status_code=status.HTTP_200_OK)
def delete_langue(langue_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a langue"""
    cv = CVService.get_user_cv(db, current_user)
    langue = db.query(Langue).filter(Langue.id == langue_id, Langue.cvId == cv.id).first()
    if not langue:
        raise HTTPException(status_code=404, detail="Langue not found")
    db.delete(langue)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    return {"message": "Langue deleted successfully"}


@router.delete("/experience/{experience_id}", status_code=status.HTTP_200_OK)
def delete_experience(experience_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete an experience"""
    cv = CVService.get_user_cv(db, current_user)
    experience = db.query(Experience).filter(Experience.id == experience_id, Experience.cvId == cv.id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(experience)
    import datetime
    cv.dateModification = datetime.date.today()
    db.commit()
    return {"message": "Experience deleted successfully"}


@router.get("/download/pdf", status_code=status.HTTP_200_OK)
def download_cv_as_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Generate and download CV as a professionally styled PDF"""
    cv = CVService.get_user_cv(db, current_user)
    
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = temp_file.name
    temp_file.close()
    
    try:
        # Create PDF document
        doc = SimpleDocTemplate(pdf_path, pagesize=A4, 
                               rightMargin=0.6*inch, leftMargin=0.6*inch,
                               topMargin=0.7*inch, bottomMargin=0.7*inch)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define custom styles
        styles = getSampleStyleSheet()
        
        # Title Style - IMPROVED
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=32
        )
        
        # Subtitle Style - IMPROVED
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica',
            leading=14
        )
        
        # Professional Name Style - NEW
        name_style = ParagraphStyle(
            'ProfessionalName',
            parent=styles['Normal'],
            fontSize=13,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=12,
            alignment=TA_CENTER,
            leading=15
        )
        
        # Section Header Style - IMPROVED
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#FFFFFF'),
            spaceAfter=10,
            spaceBefore=12,
            fontName='Helvetica-Bold',
            borderColor=colors.HexColor('#1e40af'),
            borderWidth=0,
            borderPadding=8,
            backColor=colors.HexColor('#1e40af'),
            textTransform='uppercase',
            letterSpacing=0.5
        )
        
        # Content Style - IMPROVED
        content_style = ParagraphStyle(
            'Content',
            parent=styles['Normal'],
            fontSize=9.5,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=6,
            fontName='Helvetica',
            leading=13
        )
        
        # Bold Content Style - IMPROVED
        bold_style = ParagraphStyle(
            'BoldContent',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4,
            fontName='Helvetica-Bold',
            leading=13
        )
        
        # Date Style - IMPROVED
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=6,
            fontName='Helvetica-Oblique',
            leading=11
        )
        
        # ===== CV TITLE =====
        elements.append(Paragraph(cv.titre, title_style))
        if cv.description:
            elements.append(Paragraph(cv.description, subtitle_style))
        elements.append(Spacer(1, 0.15*inch))
        
        # ===== USER INFO =====
        user_info = f"{current_user.nom.upper()} {current_user.prenom.upper()}"
        elements.append(Paragraph(user_info, name_style))
        elements.append(Spacer(1, 0.15*inch))
        
        # ===== CONTACT INFORMATION =====
        if cv.contact:
            contact_header = Table(
                [[Paragraph("CONTACT INFORMATION", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(contact_header)
            elements.append(Spacer(1, 0.1*inch))
            
            contact_data = []
            if cv.contact.email:
                contact_data.append(["Email:", cv.contact.email])
            if cv.contact.telephone:
                contact_data.append(["Phone:", cv.contact.telephone])
            if cv.contact.adresse:
                contact_data.append(["Address:", cv.contact.adresse])
            
            if contact_data:
                contact_table = Table(contact_data, colWidths=[1.2*inch, 6.3*inch])
                contact_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9.5),
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
                    ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (0, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                    ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ]))
                elements.append(contact_table)
                elements.append(Spacer(1, 0.2*inch))
        
        # ===== PROFESSIONAL EXPERIENCE =====
        if cv.experiences:
            exp_header = Table(
                [[Paragraph("PROFESSIONAL EXPERIENCE", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(exp_header)
            elements.append(Spacer(1, 0.1*inch))
            
            for idx, exp in enumerate(sorted(cv.experiences, key=lambda x: x.dateDebut, reverse=True)):
                exp_title = f"{exp.poste}"
                if exp.entreprise:
                    exp_title += f" at {exp.entreprise}"
                elements.append(Paragraph(exp_title, bold_style))
                
                date_str = f"{exp.dateDebut.strftime('%B %Y')} — "
                date_str += "Present" if exp.enCours else exp.dateFin.strftime('%B %Y') if exp.dateFin else "N/A"
                elements.append(Paragraph(date_str, date_style))
                
                if exp.description:
                    elements.append(Paragraph(exp.description, content_style))
                
                if idx < len(cv.experiences) - 1:
                    elements.append(Spacer(1, 0.12*inch))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # ===== EDUCATION =====
        if cv.formations:
            edu_header = Table(
                [[Paragraph("EDUCATION", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(edu_header)
            elements.append(Spacer(1, 0.1*inch))
            
            for idx, formation in enumerate(sorted(cv.formations, key=lambda x: x.dateDebut, reverse=True)):
                edu_title = f"{formation.diplome}"
                if formation.etablissement:
                    edu_title += f", {formation.etablissement}"
                elements.append(Paragraph(edu_title, bold_style))
                
                date_str = f"{formation.dateDebut.strftime('%B %Y')} — "
                date_str += "Present" if formation.enCours else formation.dateFin.strftime('%B %Y') if formation.dateFin else "N/A"
                elements.append(Paragraph(date_str, date_style))
                
                if idx < len(cv.formations) - 1:
                    elements.append(Spacer(1, 0.12*inch))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # ===== SKILLS =====
        if cv.competences:
            skills_header = Table(
                [[Paragraph("SKILLS", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(skills_header)
            elements.append(Spacer(1, 0.1*inch))
            
            skills_by_level = {}
            for comp in cv.competences:
                level = comp.niveau.value.capitalize()
                if level not in skills_by_level:
                    skills_by_level[level] = []
                skills_by_level[level].append(comp.nom)
            
            for level in ['Expert', 'Avance', 'Intermediaire', 'Debutant']:
                if level in skills_by_level:
                    skills_text = f"<b>{level}:</b> {', '.join(skills_by_level[level])}"
                    elements.append(Paragraph(skills_text, content_style))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # ===== LANGUAGES =====
        if cv.langues:
            lang_header = Table(
                [[Paragraph("LANGUAGES", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(lang_header)
            elements.append(Spacer(1, 0.1*inch))
            
            lang_data = [[lang.nom, lang.niveau.value] for lang in cv.langues]
            lang_table = Table(lang_data, colWidths=[3.5*inch, 4*inch])
            lang_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9.5),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ]))
            elements.append(lang_table)
        
        # Build PDF
        doc.build(elements)
        
        # Return the PDF file
        filename = f"CV_{current_user.nom}_{current_user.prenom}.pdf"
        return FileResponse(
            path=pdf_path,
            filename=filename,
            media_type='application/pdf',
            background=None
        )
    
    except Exception as e:
        # Clean up the temporary file in case of error
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")


@router.get("/download/user/{user_id}/pdf")
def download_user_cv_as_pdf(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Generate and download another user's CV as a professionally styled PDF (with access control)"""
    from models.cv import CV
    from models.connection import Connection
    
    # Get the target user's CV
    cv = db.query(CV).filter(CV.userId == user_id, CV.cv_enabled == True).first()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    # Check if CV is public
    if not cv.isPublic:
        # Check if current user has a connection with the target user
        from models.connection import ConnectionStatus
        has_connection = db.query(Connection).filter(
            Connection.status == ConnectionStatus.ACCEPTED,
            (
                (Connection.senderId == current_user.id and Connection.receiverId == user_id) |
                (Connection.senderId == user_id and Connection.receiverId == current_user.id)
            )
        ).first()
        
        if not has_connection:
            raise HTTPException(status_code=403, detail="You don't have access to this CV")
    
    target_user = cv.user
    
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = temp_file.name
    temp_file.close()
    
    try:
        # Create PDF document
        doc = SimpleDocTemplate(pdf_path, pagesize=A4, 
                               rightMargin=0.6*inch, leftMargin=0.6*inch,
                               topMargin=0.7*inch, bottomMargin=0.7*inch)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define custom styles
        styles = getSampleStyleSheet()
        
        # Title Style - IMPROVED
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=32
        )
        
        # Subtitle Style - IMPROVED
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica',
            leading=14
        )
        
        # Professional Name Style - NEW
        name_style = ParagraphStyle(
            'ProfessionalName',
            parent=styles['Normal'],
            fontSize=13,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=12,
            alignment=TA_CENTER,
            leading=15
        )
        
        # Section Header Style - IMPROVED
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#FFFFFF'),
            spaceAfter=10,
            spaceBefore=12,
            fontName='Helvetica-Bold',
            borderColor=colors.HexColor('#1e40af'),
            borderWidth=0,
            borderPadding=8,
            backColor=colors.HexColor('#1e40af'),
            textTransform='uppercase',
            letterSpacing=0.5
        )
        
        # Content Style - IMPROVED
        content_style = ParagraphStyle(
            'Content',
            parent=styles['Normal'],
            fontSize=9.5,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=6,
            fontName='Helvetica',
            leading=13
        )
        
        # Bold Content Style - IMPROVED
        bold_style = ParagraphStyle(
            'BoldContent',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4,
            fontName='Helvetica-Bold',
            leading=13
        )
        
        # Date Style - IMPROVED
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=6,
            fontName='Helvetica-Oblique',
            leading=11
        )
        
        # ===== CV TITLE =====
        elements.append(Paragraph(cv.titre, title_style))
        if cv.description:
            elements.append(Paragraph(cv.description, subtitle_style))
        elements.append(Spacer(1, 0.15*inch))
        
        # ===== USER INFO =====
        user_info = f"{target_user.nom.upper()} {target_user.prenom.upper()}"
        elements.append(Paragraph(user_info, name_style))
        elements.append(Spacer(1, 0.15*inch))
        
        # ===== CONTACT INFORMATION =====
        if cv.contact:
            contact_header = Table(
                [[Paragraph("CONTACT INFORMATION", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(contact_header)
            elements.append(Spacer(1, 0.1*inch))
            
            contact_data = []
            if cv.contact.email:
                contact_data.append(["Email:", cv.contact.email])
            if cv.contact.telephone:
                contact_data.append(["Phone:", cv.contact.telephone])
            if cv.contact.adresse:
                contact_data.append(["Address:", cv.contact.adresse])
            
            if contact_data:
                contact_table = Table(contact_data, colWidths=[1.2*inch, 6.3*inch])
                contact_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9.5),
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
                    ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (0, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                    ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ]))
                elements.append(contact_table)
                elements.append(Spacer(1, 0.2*inch))
        
        # ===== PROFESSIONAL EXPERIENCE =====
        if cv.experiences:
            exp_header = Table(
                [[Paragraph("PROFESSIONAL EXPERIENCE", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(exp_header)
            elements.append(Spacer(1, 0.1*inch))
            
            for idx, exp in enumerate(sorted(cv.experiences, key=lambda x: x.dateDebut, reverse=True)):
                exp_title = f"{exp.poste}"
                if exp.entreprise:
                    exp_title += f" at {exp.entreprise}"
                elements.append(Paragraph(exp_title, bold_style))
                
                date_str = f"{exp.dateDebut.strftime('%B %Y')} — "
                date_str += "Present" if exp.enCours else exp.dateFin.strftime('%B %Y') if exp.dateFin else "N/A"
                elements.append(Paragraph(date_str, date_style))
                
                if exp.description:
                    elements.append(Paragraph(exp.description, content_style))
                
                if idx < len(cv.experiences) - 1:
                    elements.append(Spacer(1, 0.12*inch))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # ===== EDUCATION =====
        if cv.formations:
            edu_header = Table(
                [[Paragraph("EDUCATION", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(edu_header)
            elements.append(Spacer(1, 0.1*inch))
            
            for idx, formation in enumerate(sorted(cv.formations, key=lambda x: x.dateDebut, reverse=True)):
                edu_title = f"{formation.diplome}"
                if formation.etablissement:
                    edu_title += f", {formation.etablissement}"
                elements.append(Paragraph(edu_title, bold_style))
                
                date_str = f"{formation.dateDebut.strftime('%B %Y')} — "
                date_str += "Present" if formation.enCours else formation.dateFin.strftime('%B %Y') if formation.dateFin else "N/A"
                elements.append(Paragraph(date_str, date_style))
                
                if idx < len(cv.formations) - 1:
                    elements.append(Spacer(1, 0.12*inch))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # ===== SKILLS =====
        if cv.competences:
            skills_header = Table(
                [[Paragraph("SKILLS", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(skills_header)
            elements.append(Spacer(1, 0.1*inch))
            
            skills_by_level = {}
            for comp in cv.competences:
                level = comp.niveau.value.capitalize()
                if level not in skills_by_level:
                    skills_by_level[level] = []
                skills_by_level[level].append(comp.nom)
            
            for level in ['Expert', 'Avance', 'Intermediaire', 'Debutant']:
                if level in skills_by_level:
                    skills_text = f"<b>{level}:</b> {', '.join(skills_by_level[level])}"
                    elements.append(Paragraph(skills_text, content_style))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # ===== LANGUAGES =====
        if cv.langues:
            lang_header = Table(
                [[Paragraph("LANGUAGES", section_style)]],
                colWidths=[7.5*inch],
                style=TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e40af')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMBORDER', (0, 0), (-1, -1), 2, colors.HexColor('#3b82f6')),
                ])
            )
            elements.append(lang_header)
            elements.append(Spacer(1, 0.1*inch))
            
            lang_data = [[lang.nom, lang.niveau.value] for lang in cv.langues]
            lang_table = Table(lang_data, colWidths=[3.5*inch, 4*inch])
            lang_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9.5),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ]))
            elements.append(lang_table)
        
        # Build PDF
        doc.build(elements)
        
        # Return the PDF file
        filename = f"CV_{target_user.nom}_{target_user.prenom}.pdf"
        return FileResponse(
            path=pdf_path,
            filename=filename,
            media_type='application/pdf',
            background=None
        )
    
    except Exception as e:
        # Clean up the temporary file in case of error
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")