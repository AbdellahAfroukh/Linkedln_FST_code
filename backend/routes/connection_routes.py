from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from dependencies import get_db, get_current_user
from services.connection_service import ConnectionService
from schemas.connection_schemas import ConnectionCreate, ConnectionResponse
from models.user import User
from services.websocket_manager import manager

router = APIRouter(prefix="/connections", tags=["connections"])

@router.post("/send", response_model=ConnectionResponse)
async def send_connection(request: ConnectionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = ConnectionService.send_request(db, current_user, request.receiverId)
    
    # Broadcast to both users via WebSocket
    await manager.broadcast_to_users(
        "connections",
        [current_user.id, request.receiverId],
        {
            "type": "connection_request",
            "request_id": conn.id,
            "from_user_id": current_user.id,
            "from_user_name": current_user.fullName,
            "receiver_id": request.receiverId,
        }
    )
    
    return conn

@router.post("/{connection_id}/accept", response_model=ConnectionResponse)
async def accept_connection(connection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = ConnectionService.accept_request(db, connection_id, current_user)
    
    # Broadcast to both users via WebSocket
    await manager.broadcast_to_users(
        "connections",
        [conn.senderId, conn.receiverId],
        {
            "type": "connection_accepted",
            "connection_id": conn.id,
            "accepted_by_user_id": current_user.id,
            "accepted_by_user_name": current_user.fullName,
            "sender_id": conn.senderId,
            "receiver_id": conn.receiverId,
        }
    )
    
    return conn

@router.post("/{connection_id}/reject", response_model=ConnectionResponse)
async def reject_connection(connection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = ConnectionService.reject_request(db, connection_id, current_user)
    
    # Broadcast to both users via WebSocket
    await manager.broadcast_to_users(
        "connections",
        [conn.senderId, conn.receiverId],
        {
            "type": "connection_rejected",
            "connection_id": conn.id,
            "rejected_by_user_id": current_user.id,
            "sender_id": conn.senderId,
            "receiver_id": conn.receiverId,
        }
    )
    
    return conn

@router.get("/accepted", response_model=List[ConnectionResponse])
def list_accepted(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = ConnectionService.list_accepted(db, current_user)
    return conns

@router.get("/pending/incoming", response_model=List[ConnectionResponse])
def list_pending_incoming(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = ConnectionService.list_pending_incoming(db, current_user)
    return conns

@router.get("/pending/outgoing", response_model=List[ConnectionResponse])
def list_pending_outgoing(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = ConnectionService.list_pending_outgoing(db, current_user)
    return conns

@router.delete("/{connection_id}", response_model=dict)
async def delete_connection(connection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get connection before deleting to know who to notify
    from models.connection import Connection
    conn = db.query(Connection).filter(Connection.id == connection_id).first()
    
    if conn:
        result = ConnectionService.delete_connection(db, connection_id, current_user)
        
        # Broadcast to both users via WebSocket
        await manager.broadcast_to_users(
            "connections",
            [conn.senderId, conn.receiverId],
            {
                "type": "connection_removed",
                "connection_id": connection_id,
                "removed_by_user_id": current_user.id,
                "sender_id": conn.senderId,
                "receiver_id": conn.receiverId,
            }
        )
        
        return result
    
    return ConnectionService.delete_connection(db, connection_id, current_user)

@router.get("/{user_id}/mutual", response_model=List[ConnectionResponse])
def get_mutual_connections(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = ConnectionService.get_mutual_connections(db, current_user, user_id)
    return conns

