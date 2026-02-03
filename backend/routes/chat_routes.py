from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from dependencies import get_db, get_current_user
from services.chat_service import ChatService
from schemas.chat_schemas import MessageCreate, MessageResponse, ChatResponse, ChatDetailResponse
from models.user import User

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/message", response_model=MessageResponse)
def send_message(request: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Send a message to another user (creates chat if it doesn't exist)"""
    message = ChatService.send_message(db, current_user, request.receiverId, request.content)
    return message

@router.get("", response_model=List[ChatResponse])
def list_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all chats for the current user"""
    chats = ChatService.list_user_chats(db, current_user)
    return chats

@router.get("/{chat_id}", response_model=ChatDetailResponse)
def get_chat_detail(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all messages in a specific chat"""
    chat = ChatService.get_chat(db, chat_id, current_user)
    return chat

@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
def get_chat_messages(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get messages from a specific chat"""
    messages = ChatService.get_chat_messages(db, chat_id, current_user)
    return messages

@router.post("/with/{user_id}", response_model=ChatResponse)
def get_or_create_chat_with_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get or create a chat with a specific user"""
    chat = ChatService.get_or_create_chat_with_user(db, current_user, user_id)
    return chat

@router.delete("/{chat_id}", response_model=dict)
def delete_chat(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a chat and all its messages"""
    result = ChatService.delete_chat(db, chat_id, current_user)
    return result

