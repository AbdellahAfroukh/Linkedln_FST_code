from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserSimple(BaseModel):
    """Simplified user info for chat contexts"""
    id: int
    fullName: str
    photoDeProfil: Optional[str] = None

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: Optional[str] = None
    receiverId: int
    attachment: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    content: str
    attachment: Optional[str] = None
    is_read: int = 0
    timestamp: datetime
    senderId: int
    chatId: int

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    id: int
    user1Id: int
    user2Id: int
    user1: Optional[UserSimple] = None
    user2: Optional[UserSimple] = None
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ChatDetailResponse(BaseModel):
    id: int
    user1Id: int
    user2Id: int
    user1: Optional[UserSimple] = None
    user2: Optional[UserSimple] = None
    messages: List[MessageResponse]

    class Config:
        from_attributes = True


