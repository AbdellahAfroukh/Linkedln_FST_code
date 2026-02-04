from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path

from dependencies import get_db, get_current_user
from services.chat_service import ChatService
from services.malware_detection import detect_malware, get_file_type_category
from services.file_utils import get_file_path_from_url
from schemas.chat_schemas import MessageCreate, MessageResponse, ChatResponse, ChatDetailResponse
from models.user import User

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/message", response_model=MessageResponse)
async def send_message(request: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Send a message to another user (creates chat if it doesn't exist) with malware detection for attachments"""
    
    # If attachment is provided, validate it
    if request.attachment:
        try:
            file_path = get_file_path_from_url(request.attachment)
            
            if not file_path:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid or missing attachment file"
                )
            
            # Run malware detection on the attachment
            file_ext = file_path.suffix.lower()
            file_type = get_file_type_category(file_ext)
            is_malware, reason = await detect_malware(file_path, file_type)
            
            if is_malware:
                raise HTTPException(
                    status_code=400,
                    detail=f"Attachment failed malware detection: {reason}"
                )
        except HTTPException:
            raise
        except Exception as e:
            # Log but don't block if validation fails
            print(f"Attachment malware check error: {e}")
    
    message = ChatService.send_message(
        db,
        current_user,
        request.receiverId,
        request.content,
        request.attachment,
    )
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

@router.post("/{chat_id}/mark-as-read", response_model=dict)
def mark_chat_as_read(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Mark all messages in a chat as read by the current user"""
    result = ChatService.mark_chat_as_read(db, chat_id, current_user)
    return result

@router.delete("/messages/{message_id}", response_model=dict)
def delete_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a specific message"""
    result = ChatService.delete_message(db, message_id, current_user)
    return result

@router.delete("/{chat_id}", response_model=dict)
def delete_chat(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a chat and all its messages"""
    result = ChatService.delete_chat(db, chat_id, current_user)
    return result

