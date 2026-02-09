from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from models.post import ReactionType


class PostCreate(BaseModel):
    """Schema for creating a new post"""
    content: str = Field(..., min_length=1, max_length=5000, description="Post content (max 5000 characters)")
    attachement: Optional[str] = Field(None, max_length=500, description="URL or path to attachment")
    isPublic: bool = Field(True, description="Whether the post is public")


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    content: Optional[str] = Field(None, min_length=1, max_length=5000, description="Post content (max 5000 characters)")
    attachement: Optional[str] = Field(None, max_length=500)
    isPublic: Optional[bool] = None


class CommentCreate(BaseModel):
    """Schema for creating a comment"""
    content: str = Field(..., min_length=1, max_length=2000, description="Comment content (max 2000 characters)")


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    content: str = Field(..., min_length=1, max_length=2000, description="Updated comment content (max 2000 characters)")


class ReactionCreate(BaseModel):
    """Schema for creating/updating a reaction"""
    type: ReactionType = Field(..., description="Type of reaction")


class UserBasicInfo(BaseModel):
    """Basic user information for responses"""
    id: int
    fullName: str
    photoDeProfil: Optional[str] = None
    
    class Config:
        from_attributes = True


class ReactionResponse(BaseModel):
    """Response schema for a reaction"""
    id: int
    type: ReactionType
    timestamp: datetime
    userId: int
    user: UserBasicInfo
    
    class Config:
        from_attributes = True


class PublicationInfo(BaseModel):
    """Publication information for posts"""
    id: int
    title: str
    publicationDate: Optional[date] = None
    citationCount: int
    googleScholarUrl: Optional[str] = None
    
    class Config:
        from_attributes = True


class ScopusPublicationInfo(BaseModel):
    """Scopus publication information for posts"""
    id: int
    title: str
    publicationDate: Optional[date] = None
    citationCount: int
    scopusUrl: Optional[str] = None

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    """Response schema for a comment"""
    id: int
    content: str
    timestamp: datetime
    postId: int
    userId: int
    user: UserBasicInfo
    reactions: List[ReactionResponse] = []
    
    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    """Response schema for a post"""
    id: int
    content: str
    timestamp: datetime
    attachement: Optional[str] = None
    isPublic: bool
    userId: int
    publicationId: Optional[int] = None
    scopusPublicationId: Optional[int] = None
    user: UserBasicInfo
    publication: Optional[PublicationInfo] = None
    scopusPublication: Optional[ScopusPublicationInfo] = None
    comments: List[CommentResponse] = []
    reactions: List[ReactionResponse] = []
    
    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """Response schema for paginated posts"""
    total: int
    posts: List[PostResponse]


class ReactionSummary(BaseModel):
    """Summary of reactions by type"""
    like: int = 0
    love: int = 0
    funny: int = 0
    angry: int = 0
    sad: int = 0
    dislike: int = 0
    total: int = 0


class PostWithStats(BaseModel):
    """Post with engagement statistics"""
    id: int
    content: str
    timestamp: datetime
    attachement: Optional[str] = None
    isPublic: bool
    userId: int
    user: UserBasicInfo
    commentCount: int
    reactionSummary: ReactionSummary
    userReaction: Optional[ReactionType] = None  # Current user's reaction if any
    
    class Config:
        from_attributes = True
