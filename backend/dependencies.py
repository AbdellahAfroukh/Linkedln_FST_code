from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.user import User, UserType
from services import AuthService

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    from sqlalchemy.orm import joinedload
    
    token = credentials.credentials
    payload = AuthService.verify_token(token, token_type="access")
    
    user_id: int = AuthService.get_user_id_from_token(payload)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = db.query(User).options(
        joinedload(User.university),
        joinedload(User.etablissement),
        joinedload(User.departement),
        joinedload(User.laboratoire),
        joinedload(User.equipe),
        joinedload(User.specialite),
        joinedload(User.thematiqueDeRecherche),
        joinedload(User.googleScholarIntegration)
    ).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user (can add additional checks here)"""
    return current_user


def require_role(*allowed_roles: UserType):
    """Dependency to check if user has required role"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.user_type not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join([r.value for r in allowed_roles])}"
            )
        return current_user
    return role_checker


# Specific role dependencies
def get_current_admin(current_user: User = Depends(require_role(UserType.ADMIN))) -> User:
    """Require admin role"""
    return current_user


def get_current_enseignant(
    current_user: User = Depends(require_role(UserType.ENSEIGNANT, UserType.ADMIN))
) -> User:
    """Require enseignant or admin role"""
    return current_user


def get_current_doctorant(
    current_user: User = Depends(require_role(UserType.DOCTORANT, UserType.ADMIN))
) -> User:
    """Require doctorant or admin role"""
    return current_user


def require_profile_completed(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require user to have completed profile"""
    if not current_user.profile_completed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile must be completed to access this resource"
        )
    return current_user


def require_2fa_configured(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require user to have 2FA configured"""
    if not current_user.otp_configured:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="2FA must be configured to access this resource"
        )
    return current_user


def get_current_user_websocket(token: str, db: Session) -> Optional[User]:
    """Get current user from JWT token (for WebSocket connections)"""
    from sqlalchemy.orm import joinedload
    
    try:
        payload = AuthService.verify_token(token, token_type="access")
        user_id: int = AuthService.get_user_id_from_token(payload)
        
        if user_id is None:
            return None
        
        user = db.query(User).options(
            joinedload(User.university),
            joinedload(User.etablissement),
            joinedload(User.departement),
            joinedload(User.laboratoire),
            joinedload(User.equipe),
            joinedload(User.specialite),
            joinedload(User.thematiqueDeRecherche),
            joinedload(User.googleScholarIntegration)
        ).filter(User.id == user_id).first()
        
        return user
    except Exception:
        return None