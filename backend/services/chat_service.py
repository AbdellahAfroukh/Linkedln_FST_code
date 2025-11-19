from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.chat import Chat, Message
from models.user import User
from datetime import datetime, timezone

class ChatService:
    @staticmethod
    def get_or_create_chat(db: Session, user1: User, user2_id: int):
        """Get existing chat or create a new one between two users"""
        if user1.id == user2_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot chat with yourself")
        
        # Check if receiver exists
        receiver = db.query(User).filter(User.id == user2_id).first()
        if not receiver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver not found")
        
        # Look for existing chat between these two users
        chat = db.query(Chat).filter(
            ((Chat.user1Id == user1.id) & (Chat.user2Id == user2_id)) |
            ((Chat.user1Id == user2_id) & (Chat.user2Id == user1.id))
        ).first()
        
        # If no chat exists, create one
        if not chat:
            # Ensure consistent ordering: smaller id as user1, larger as user2
            user1_id = min(user1.id, user2_id)
            user2_id_normalized = max(user1.id, user2_id)
            
            chat = Chat(
                user1Id=user1_id,
                user2Id=user2_id_normalized
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)
        
        return chat

    @staticmethod
    def send_message(db: Session, sender: User, receiver_id: int, content: str):
        """Send a message to another user, creating chat if needed"""
        if not content or not content.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content cannot be empty")
        
        # Get or create chat
        chat = ChatService.get_or_create_chat(db, sender, receiver_id)
        
        # Create message
        message = Message(
            content=content.strip(),
            timestamp=datetime.now(timezone.utc),
            chatId=chat.id,
            senderId=sender.id
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_chat(db: Session, chat_id: int, current_user: User):
        """Get chat details by ID"""
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
        
        # Check if current user is part of this chat
        if chat.user1Id != current_user.id and chat.user2Id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this chat")
        
        return chat

    @staticmethod
    def list_user_chats(db: Session, current_user: User):
        """List all chats for the current user"""
        chats = db.query(Chat).filter(
            (Chat.user1Id == current_user.id) | (Chat.user2Id == current_user.id)
        ).all()
        return chats

    @staticmethod
    def get_chat_messages(db: Session, chat_id: int, current_user: User):
        """Get all messages in a chat"""
        chat = ChatService.get_chat(db, chat_id, current_user)
        return chat.messages

    @staticmethod
    def get_or_create_chat_with_user(db: Session, current_user: User, other_user_id: int):
        """Get or create chat with specific user (returns chat object)"""
        return ChatService.get_or_create_chat(db, current_user, other_user_id)

    @staticmethod
    def delete_chat(db: Session, chat_id: int, current_user: User):
        """Delete a chat (both users' messages will be deleted due to cascade)"""
        chat = ChatService.get_chat(db, chat_id, current_user)
        db.delete(chat)
        db.commit()
        return {"message": "Chat deleted successfully"}
