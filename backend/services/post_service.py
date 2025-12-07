from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from models.post import Post, Comment, Reaction, ReactionType
from models.user import User
from models.connection import Connection, ConnectionStatus
from fastapi import HTTPException, status
from typing import List, Dict, Optional
from datetime import datetime, timezone


class PostService:
    
    @staticmethod
    def create_post(db: Session, user: User, data) -> Post:
        """Create a new post"""
        post = Post(
            content=data.content,
            attachement=data.attachement,
            isPublic=data.isPublic,
            userId=user.id,
            timestamp=datetime.now(timezone.utc)
        )
        
        db.add(post)
        db.commit()
        db.refresh(post)
        
        return post
    
    @staticmethod
    def get_post_by_id(db: Session, post_id: int, current_user: User) -> Post:
        """Get a post by ID with access control"""
        post = db.query(Post).options(
            joinedload(Post.user),
            joinedload(Post.comments).joinedload(Comment.user),
            joinedload(Post.comments).joinedload(Comment.reactions).joinedload(Reaction.user),
            joinedload(Post.reactions).joinedload(Reaction.user)
        ).filter(Post.id == post_id).first()
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Check access permissions
        if not post.isPublic and post.userId != current_user.id:
            # Check if users are connected
            are_connected = PostService._are_users_connected(db, current_user.id, post.userId)
            if not are_connected:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to view this post"
                )
        
        return post
    
    @staticmethod
    def update_post(db: Session, post_id: int, user: User, data) -> Post:
        """Update a post (only by the owner)"""
        post = db.query(Post).filter(Post.id == post_id).first()
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        if post.userId != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own posts"
            )
        
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(post, key, value)
        
        db.commit()
        db.refresh(post)
        
        return post
    
    @staticmethod
    def delete_post(db: Session, post_id: int, user: User):
        """Delete a post (only by the owner)"""
        post = db.query(Post).filter(Post.id == post_id).first()
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        if post.userId != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own posts"
            )
        
        db.delete(post)
        db.commit()
        
        return {"message": "Post deleted successfully"}
    
    @staticmethod
    def get_user_posts(db: Session, user_id: int, current_user: User, skip: int = 0, limit: int = 50):
        """Get posts by a specific user"""
        # Check if current user can view the posts
        if user_id != current_user.id:
            # Check if they're connected or posts are public
            are_connected = PostService._are_users_connected(db, current_user.id, user_id)
            
            if are_connected:
                # Show all posts if connected
                query = db.query(Post).filter(Post.userId == user_id)
            else:
                # Only show public posts
                query = db.query(Post).filter(Post.userId == user_id, Post.isPublic == True)
        else:
            # User viewing their own posts
            query = db.query(Post).filter(Post.userId == user_id)
        
        total = query.count()
        posts = query.options(
            joinedload(Post.user),
            joinedload(Post.comments).joinedload(Comment.user),
            joinedload(Post.reactions).joinedload(Reaction.user)
        ).order_by(desc(Post.timestamp)).offset(skip).limit(limit).all()
        
        return {"total": total, "posts": posts}
    
    @staticmethod
    def get_feed(db: Session, user: User, skip: int = 0, limit: int = 50):
        """Get personalized feed for user (own posts + connected users' posts + public posts)"""
        # Get IDs of connected users
        connected_user_ids = PostService._get_connected_user_ids(db, user.id)
        
        # Include user's own posts and connected users' posts (all visibility)
        # Plus all public posts from anyone
        query = db.query(Post).filter(
            (Post.userId.in_(connected_user_ids + [user.id])) | 
            (Post.isPublic == True)
        )
        
        total = query.count()
        posts = query.options(
            joinedload(Post.user),
            joinedload(Post.comments).joinedload(Comment.user),
            joinedload(Post.reactions).joinedload(Reaction.user)
        ).order_by(desc(Post.timestamp)).offset(skip).limit(limit).all()
        
        return {"total": total, "posts": posts}
    
    @staticmethod
    def add_comment(db: Session, post_id: int, user: User, data) -> Comment:
        """Add a comment to a post"""
        # Check if post exists and user has access
        post = PostService.get_post_by_id(db, post_id, user)
        
        comment = Comment(
            content=data.content,
            postId=post_id,
            userId=user.id,
            timestamp=datetime.now(timezone.utc)
        )
        
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        return comment
    
    @staticmethod
    def update_comment(db: Session, comment_id: int, user: User, data) -> Comment:
        """Update a comment (only by owner)"""
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        if comment.userId != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own comments"
            )
        
        comment.content = data.content
        db.commit()
        db.refresh(comment)
        
        return comment
    
    @staticmethod
    def delete_comment(db: Session, comment_id: int, user: User):
        """Delete a comment (by owner or post owner)"""
        comment = db.query(Comment).options(joinedload(Comment.post)).filter(Comment.id == comment_id).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        # Can delete if: comment owner or post owner
        if comment.userId != user.id and comment.post.userId != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own comments or comments on your posts"
            )
        
        db.delete(comment)
        db.commit()
        
        return {"message": "Comment deleted successfully"}
    
    @staticmethod
    def add_or_update_reaction(db: Session, user: User, reaction_type: ReactionType, 
                               post_id: Optional[int] = None, comment_id: Optional[int] = None):
        """Add or update a reaction to a post or comment"""
        if not post_id and not comment_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either post_id or comment_id must be provided"
            )
        
        if post_id and comment_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot react to both post and comment simultaneously"
            )
        
        # Check if reaction already exists
        query = db.query(Reaction).filter(Reaction.userId == user.id)
        
        if post_id:
            # Verify post exists and user has access
            PostService.get_post_by_id(db, post_id, user)
            query = query.filter(Reaction.postId == post_id)
        else:
            # Verify comment exists
            comment = db.query(Comment).filter(Comment.id == comment_id).first()
            if not comment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Comment not found"
                )
            query = query.filter(Reaction.commentId == comment_id)
        
        existing_reaction = query.first()
        
        if existing_reaction:
            # Update existing reaction
            existing_reaction.type = reaction_type
            existing_reaction.timestamp = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing_reaction)
            return existing_reaction
        else:
            # Create new reaction
            reaction = Reaction(
                type=reaction_type,
                userId=user.id,
                postId=post_id,
                commentId=comment_id,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(reaction)
            db.commit()
            db.refresh(reaction)
            return reaction
    
    @staticmethod
    def remove_reaction(db: Session, user: User, post_id: Optional[int] = None, 
                       comment_id: Optional[int] = None):
        """Remove a reaction from a post or comment"""
        if not post_id and not comment_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either post_id or comment_id must be provided"
            )
        
        query = db.query(Reaction).filter(Reaction.userId == user.id)
        
        if post_id:
            query = query.filter(Reaction.postId == post_id)
        else:
            query = query.filter(Reaction.commentId == comment_id)
        
        reaction = query.first()
        
        if not reaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reaction not found"
            )
        
        db.delete(reaction)
        db.commit()
        
        return {"message": "Reaction removed successfully"}
    
    @staticmethod
    def get_post_reactions(db: Session, post_id: int, user: User):
        """Get all reactions for a post"""
        # Verify post exists and user has access
        PostService.get_post_by_id(db, post_id, user)
        
        reactions = db.query(Reaction).options(
            joinedload(Reaction.user)
        ).filter(Reaction.postId == post_id).all()
        
        return reactions
    
    @staticmethod
    def _are_users_connected(db: Session, user1_id: int, user2_id: int) -> bool:
        """Check if two users are connected"""
        connection = db.query(Connection).filter(
            Connection.status == ConnectionStatus.ACCEPTED,
            (
                (Connection.senderId == user1_id) & (Connection.receiverId == user2_id) |
                (Connection.senderId == user2_id) & (Connection.receiverId == user1_id)
            )
        ).first()
        
        return connection is not None
    
    @staticmethod
    def _get_connected_user_ids(db: Session, user_id: int) -> List[int]:
        """Get list of user IDs that are connected to the given user"""
        connections = db.query(Connection).filter(
            Connection.status == ConnectionStatus.ACCEPTED,
            (Connection.senderId == user_id) | (Connection.receiverId == user_id)
        ).all()
        
        connected_ids = []
        for conn in connections:
            if conn.senderId == user_id:
                connected_ids.append(conn.receiverId)
            else:
                connected_ids.append(conn.senderId)
        
        return connected_ids
