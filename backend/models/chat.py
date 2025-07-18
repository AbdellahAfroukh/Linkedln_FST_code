from sqlalchemy import Column, Integer,ForeignKey, Text,DateTime
from sqlalchemy.orm import relationship
from models import Base
from datetime import datetime,timezone


class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    
    #Relationships
    user1Id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2Id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user1 = relationship("User", foreign_keys=[user1Id], back_populates="chatsAsUser1")
    user2 = relationship("User", foreign_keys=[user2Id], back_populates="chatsAsUser2")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime,default=datetime.now(timezone.utc))

    #Relationships
    chatId = Column(Integer, ForeignKey("chats.id"), nullable=False)
    senderId = Column(Integer, ForeignKey("users.id"), nullable=False)

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", back_populates="messagesSent")