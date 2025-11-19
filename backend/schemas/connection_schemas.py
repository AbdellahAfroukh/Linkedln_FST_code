from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.connection import ConnectionStatus

class ConnectionCreate(BaseModel):
    receiverId: int

class ConnectionResponse(BaseModel):
    id: int
    status: ConnectionStatus
    timestamp: datetime
    acceptedAt: Optional[datetime]
    senderId: int
    receiverId: int

    class Config:
        from_attributes = True
