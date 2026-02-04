from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from services.authentification import AuthService
from schemas.auth_schemas import (
    UserRegister, 
    UserLogin, 
    TokenResponse, 
    Token2FA,
    OTPVerify, 
    OTPSetup, 
    RefreshTokenRequest,
    Disable2FARequest,
    UserResponse,
    ProfileCompleteRequest,
    UserSearchResponse,
    UserSearchResult
)
from dependencies import get_current_user, get_current_active_user
from models.user import User, UserType
from models.organisation import Specialite, ThematiqueDeRecherche

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    - Validates email uniqueness
    - Hashes password
    - Creates user account based on role
    """
    user = AuthService.register_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        fullName=user_data.fullName,
        user_type=user_data.user_type
    )
    return user


@router.post("/login", response_model=Token2FA)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login user with email and password
    - If 2FA is enabled, returns requires_2fa=True
    - Otherwise returns access and refresh tokens
    """
    user = AuthService.authenticate_user(
        db=db,
        email=user_credentials.email,
        password=user_credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if 2FA is enabled
    if user.otp_configured:
        return Token2FA(
            access_token="",
            refresh_token="",
            requires_2fa=True
        )

    # Generate tokens for all users (profile completion does not block token issuance)
    access_token = AuthService.create_access_token(data={"sub": user.id})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.id})

    return Token2FA(
        access_token=access_token,
        refresh_token=refresh_token,
        requires_2fa=False,
        user={
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "user_type": user.user_type.value,
            "profile_completed": user.profile_completed,
            "otp_configured": user.otp_configured
        }
    )


@router.post("/complete-profile", response_model=UserResponse)
def complete_profile(
    data: ProfileCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete user profile for enseignant or doctorant.
    Requires a valid JWT. Admin users are not allowed.
    Enseignant must provide `numeroDeSomme`.
    """
    # Disallow admins from using this endpoint
    if current_user.user_type == UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins are not allowed to complete a regular profile"
        )

    if current_user.user_type not in (UserType.ENSEIGNANT, UserType.DOCTORANT):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile completion allowed only for 'enseignant' or 'doctorant' users"
        )

    # For enseignant, numeroDeSomme is required only on initial profile completion
    if current_user.user_type == UserType.ENSEIGNANT and not current_user.profile_completed and not data.numeroDeSomme:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'numeroDeSomme' is required for enseignant users"
        )

    # Update fields on the authenticated user
    current_user.nom = data.nom
    current_user.prenom = data.prenom
    if data.grade is not None:
        current_user.grade = data.grade
    if data.dateDeNaissance is not None:
        current_user.dateDeNaissance = data.dateDeNaissance
    if data.photoDeProfil is not None:
        current_user.photoDeProfil = data.photoDeProfil
    if data.universityId is not None:
        current_user.universityId = data.universityId
    if data.etablissementId is not None:
        current_user.etablissementId = data.etablissementId
    if data.departementId is not None:
        current_user.departementId = data.departementId
    if data.laboratoireId is not None:
        current_user.laboratoireId = data.laboratoireId
    if data.equipeId is not None:
        current_user.equipeId = data.equipeId
    
    # Handle many-to-many relationships for specialite
    if data.specialiteIds is not None:
        # Clear existing specialites
        current_user.specialite.clear()
        # Add new specialites
        for spec_id in data.specialiteIds:
            specialite = db.query(Specialite).filter(Specialite.id == spec_id).first()
            if specialite:
                current_user.specialite.append(specialite)
    
    # Handle many-to-many relationships for thematiqueDeRecherche
    if data.thematiqueDeRechercheIds is not None:
        # Clear existing thematiques
        current_user.thematiqueDeRecherche.clear()
        # Add new thematiques
        for them_id in data.thematiqueDeRechercheIds:
            thematique = db.query(ThematiqueDeRecherche).filter(ThematiqueDeRecherche.id == them_id).first()
            if thematique:
                current_user.thematiqueDeRecherche.append(thematique)
    
    if data.numeroDeSomme is not None:
        current_user.numeroDeSomme = data.numeroDeSomme

    current_user.profile_completed = True
    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/verify-2fa", response_model=TokenResponse)
def verify_2fa(otp_data: OTPVerify, db: Session = Depends(get_db)):
    """
    Verify 2FA token and complete login
    - Validates OTP token
    - Returns access and refresh tokens
    """
    user = db.query(User).filter(User.email == otp_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.otp_configured or not user.otp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not configured for this user"
        )
    
    # Verify OTP
    if not AuthService.verify_otp(user.otp_secret, otp_data.token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP token"
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(data={"sub": user.id})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "user_type": user.user_type.value,
            "profile_completed": user.profile_completed,
            "otp_configured": user.otp_configured
        }
    )


@router.post("/setup-2fa", response_model=OTPSetup)
def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Setup 2FA for current user
    - Generates OTP secret
    - Returns QR code for authenticator app
    """
    result = AuthService.setup_2fa(db=db, user=current_user)
    return result


@router.post("/enable-2fa", response_model=dict)
def enable_2fa(
    otp_data: OTPVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify OTP and enable 2FA
    - Validates OTP token to ensure setup was successful
    - Enables 2FA for user account
    """
    AuthService.verify_and_enable_2fa(db=db, user=current_user, token=otp_data.token)
    return {"message": "2FA enabled successfully"}


@router.post("/disable-2fa", response_model=dict)
def disable_2fa(
    data: Disable2FARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disable 2FA for current user
    - Requires password confirmation
    - Removes OTP configuration
    """
    AuthService.disable_2fa(db=db, user=current_user, password=data.password)
    return {"message": "2FA disabled successfully"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    payload = AuthService.verify_token(token_data.refresh_token, token_type="refresh")
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new tokens
    access_token = AuthService.create_access_token(data={"sub": user.id})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "user_type": user.user_type.value,
            "profile_completed": user.profile_completed,
            "otp_configured": user.otp_configured
        }
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/logout", response_model=dict)
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user
    - In a production app, you might want to blacklist the token
    - For now, just return success (client should delete tokens)
    """
    return {"message": "Logged out successfully"}


# ============ Public Organization Endpoints for Profile Completion ============
from models.organisation import (
    University, Etablissement, Departement, Laboratoire, 
    Equipe, Specialite, ThematiqueDeRecherche
)

@router.get("/organizations/universities")
def get_universities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all universities for profile completion"""
    universities = db.query(University).all()
    return [{"id": u.id, "nom": u.nom, "ville": u.ville} for u in universities]


@router.get("/organizations/etablissements")
def get_etablissements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all etablissements for profile completion"""
    etablissements = db.query(Etablissement).all()
    return [{"id": e.id, "nom": e.nom, "ville": e.ville, "universityId": e.universityId} for e in etablissements]


@router.get("/organizations/departements")
def get_departements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all departements for profile completion"""
    departements = db.query(Departement).all()
    return [{"id": d.id, "nom": d.nom, "etablissementId": d.etablissementId} for d in departements]


@router.get("/organizations/laboratoires")
def get_laboratoires(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all laboratoires for profile completion"""
    laboratoires = db.query(Laboratoire).all()
    return [{"id": l.id, "nom": l.nom, "universityId": l.universityId, "description": l.description} for l in laboratoires]


@router.get("/organizations/equipes")
def get_equipes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all equipes for profile completion"""
    equipes = db.query(Equipe).all()
    return [{"id": e.id, "nom": e.nom, "universityId": e.universityId} for e in equipes]


@router.get("/organizations/specialites")
def get_specialites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all specialites for profile completion"""
    specialites = db.query(Specialite).all()
    return [{"id": s.id, "nom": s.nom} for s in specialites]


@router.get("/organizations/thematiques")
def get_thematiques(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all thematiques for profile completion"""
    thematiques = db.query(ThematiqueDeRecherche).all()
    return [{"id": t.id, "nom": t.nom} for t in thematiques]


@router.get("/users/search", response_model=UserSearchResponse)
def search_users(
    q: str,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search users by name or email (available to all authenticated users)"""
    from sqlalchemy import or_, func
    from sqlalchemy.orm import joinedload
    
    # Search by fullName, nom, prenom, or email (case-insensitive)
    search_term = f"%{q}%"
    query = db.query(User).options(
        joinedload(User.university),
        joinedload(User.etablissement),
        joinedload(User.departement),
        joinedload(User.laboratoire),
        joinedload(User.equipe)
    ).filter(
        or_(
            func.lower(User.fullName).like(func.lower(search_term)),
            func.lower(User.nom).like(func.lower(search_term)),
            func.lower(User.prenom).like(func.lower(search_term)),
            func.lower(User.email).like(func.lower(search_term))
        )
    )
    
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return UserSearchResponse(
        total=total,
        users=[UserSearchResult.model_validate(user) for user in users]
    )


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile by ID (available to all authenticated users)"""
    from sqlalchemy.orm import joinedload
    
    user = db.query(User).options(
        joinedload(User.university),
        joinedload(User.etablissement),
        joinedload(User.departement),
        joinedload(User.laboratoire),
        joinedload(User.equipe),
        joinedload(User.specialite),
        joinedload(User.thematiqueDeRecherche)
    ).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user