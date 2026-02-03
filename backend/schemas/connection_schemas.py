from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.connection import ConnectionStatus

class ConnectionCreate(BaseModel):
    receiverId: int


class UserBasicInfo(BaseModel):
    """Basic user info for connection responses"""
    id: int
    fullName: str
    photoDeProfil: Optional[str] = None

    class Config:
        from_attributes = True


class ConnectionResponse(BaseModel):
    id: int
    status: ConnectionStatus
    timestamp: datetime
    acceptedAt: Optional[datetime]
    senderId: int
    receiverId: int
    sender: Optional[UserBasicInfo] = None
    receiver: Optional[UserBasicInfo] = None
