from sqlalchemy import Column, Integer,ForeignKey, Text,DateTime,Enum
import enum
from sqlalchemy.orm import relationship
from models import Base
from datetime import datetime, timezone



class ConnectionStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    BLOCKED = "blocked"

class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(ConnectionStatus), nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
    acceptedAt = Column(DateTime, nullable=True)
    
    # Relationships
    senderId = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiverId = Column(Integer, ForeignKey("users.id"), nullable=False)

    sender = relationship("User", foreign_keys=[senderId], back_populates="connectionsSent")
    receiver = relationship("User", foreign_keys=[receiverId], back_populates="connectionsReceived")