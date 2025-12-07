from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from services.post_service import PostService
from schemas.post_schemas import (
    PostCreate,
    PostUpdate,
    PostResponse,
    PostListResponse,
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    ReactionCreate,
    ReactionResponse
)
from dependencies import get_current_user
from models.user import User
from typing import Optional

router = APIRouter(prefix="/posts", tags=["Posts"])


# ==================== POST ENDPOINTS ====================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=PostResponse)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new post.
    
    - **content**: Post content (required)
    - **attachement**: Optional attachment URL/path
    - **isPublic**: Whether post is public (default: true)
    """
    return PostService.create_post(db, current_user, data)


@router.get("/feed", status_code=status.HTTP_200_OK, response_model=PostListResponse)
def get_feed(
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of posts to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized feed for current user.
    
    Includes:
    - Own posts
    - Connected users' posts (all visibility)
    - Public posts from all users
    
    Ordered by most recent first.
    """
    return PostService.get_feed(db, current_user, skip, limit)


@router.get("/user/{user_id}", status_code=status.HTTP_200_OK, response_model=PostListResponse)
def get_user_posts(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of posts to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get posts by a specific user.
    
    Access control:
    - Own posts: See all posts
    - Connected users: See all their posts
    - Non-connected: Only see public posts
    """
    return PostService.get_user_posts(db, user_id, current_user, skip, limit)


@router.get("/{post_id}", status_code=status.HTTP_200_OK, response_model=PostResponse)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific post by ID.
    
    Access control applies - can only view if:
    - Post is public, OR
    - You are the post owner, OR
    - You are connected to the post owner
    """
    return PostService.get_post_by_id(db, post_id, current_user)


@router.patch("/{post_id}", status_code=status.HTTP_200_OK, response_model=PostResponse)
def update_post(
    post_id: int,
    data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a post (only by owner).
    
    Can update:
    - content
    - attachement
    - isPublic
    """
    return PostService.update_post(db, post_id, current_user, data)


@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a post (only by owner).
    
    This will also delete all associated comments and reactions.
    """
    return PostService.delete_post(db, post_id, current_user)


# ==================== COMMENT ENDPOINTS ====================

@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED, response_model=CommentResponse)
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a comment to a post.
    
    You must have access to view the post to comment on it.
    """
    return PostService.add_comment(db, post_id, current_user, data)


@router.patch("/comments/{comment_id}", status_code=status.HTTP_200_OK, response_model=CommentResponse)
def update_comment(
    comment_id: int,
    data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a comment (only by comment owner).
    """
    return PostService.update_comment(db, comment_id, current_user, data)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a comment.
    
    Can be deleted by:
    - Comment owner, OR
    - Post owner
    """
    return PostService.delete_comment(db, comment_id, current_user)


# ==================== REACTION ENDPOINTS ====================

@router.post("/{post_id}/reactions", status_code=status.HTTP_200_OK, response_model=ReactionResponse)
def react_to_post(
    post_id: int,
    data: ReactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add or update a reaction to a post.
    
    Reaction types: like, love, funny, angry, sad, dislike
    
    If you already reacted, this will update your reaction type.
    """
    return PostService.add_or_update_reaction(
        db, current_user, data.type, post_id=post_id
    )


@router.delete("/{post_id}/reactions", status_code=status.HTTP_200_OK)
def remove_reaction_from_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove your reaction from a post.
    """
    return PostService.remove_reaction(db, current_user, post_id=post_id)


@router.post("/comments/{comment_id}/reactions", status_code=status.HTTP_200_OK, response_model=ReactionResponse)
def react_to_comment(
    comment_id: int,
    data: ReactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add or update a reaction to a comment.
    
    Reaction types: like, love, funny, angry, sad, dislike
    
    If you already reacted, this will update your reaction type.
    """
    return PostService.add_or_update_reaction(
        db, current_user, data.type, comment_id=comment_id
    )


@router.delete("/comments/{comment_id}/reactions", status_code=status.HTTP_200_OK)
def remove_reaction_from_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove your reaction from a comment.
    """
    return PostService.remove_reaction(db, current_user, comment_id=comment_id)


@router.get("/{post_id}/reactions", status_code=status.HTTP_200_OK)
def get_post_reactions(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all reactions for a specific post.
    
    Returns list of reactions with user information.
    """
    return PostService.get_post_reactions(db, post_id, current_user)
