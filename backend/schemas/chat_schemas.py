from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MessageCreate(BaseModel):
    content: str
    receiverId: int

class MessageResponse(BaseModel):
    id: int
    content: str
    timestamp: datetime
    senderId: int
    chatId: int

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    id: int
    user1Id: int
    user2Id: int
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ChatDetailResponse(BaseModel):
    id: int
    user1Id: int
    user2Id: int
    messages: List[MessageResponse]

    class Config:
        from_attributes = True
