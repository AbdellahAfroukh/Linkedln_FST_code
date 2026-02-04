from sqlalchemy import Boolean, Column, Integer,ForeignKey, String, Text,DateTime,Enum
import enum
from sqlalchemy.orm import relationship
from models import Base
from datetime import datetime, timezone



class ReactionType(str, enum.Enum):
    LIKE = "like"
    LOVE = "love"
    FUNNY = "funny"
    ANGRY = "angry"
    SAD = "sad"
    DISLIKE = "dislike"


class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)

    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
    attachement = Column(String, nullable=True) 
    isPublic = Column(Boolean, default=True)
    publicationId = Column(Integer, ForeignKey("publications.id"), nullable=True)

    # Relationships
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")
    publication = relationship("Publication", foreign_keys=[publicationId])


class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))

    # Relationships
    postId = Column(Integer, ForeignKey("posts.id"), nullable=False)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)

    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    reactions = relationship("Reaction", back_populates="comment", cascade="all, delete-orphan")
        

class Reaction(Base):
    __tablename__ = "reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ReactionType), nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))

    # Relationships
    postId = Column(Integer, ForeignKey("posts.id"),nullable=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)
    commentId = Column(Integer, ForeignKey("comments.id"), nullable=True)

    post = relationship("Post", back_populates="reactions")
    user = relationship("User", back_populates="reactions")
    comment = relationship("Comment", back_populates="reactions")
