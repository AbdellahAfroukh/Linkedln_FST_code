from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from dependencies import get_db, get_current_user
from services.connection_service import ConnectionService
from schemas.connection_schemas import ConnectionCreate, ConnectionResponse
from models.user import User

router = APIRouter(prefix="/connections", tags=["connections"])

@router.post("/send", response_model=ConnectionResponse)
def send_connection(request: ConnectionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = ConnectionService.send_request(db, current_user, request.receiverId)
    return conn

@router.post("/{connection_id}/accept", response_model=ConnectionResponse)
def accept_connection(connection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = ConnectionService.accept_request(db, connection_id, current_user)
    return conn

@router.post("/{connection_id}/reject", response_model=ConnectionResponse)
def reject_connection(connection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = ConnectionService.reject_request(db, connection_id, current_user)
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
def delete_connection(connection_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = ConnectionService.delete_connection(db, connection_id, current_user)
    return result

@router.get("/{user_id}/mutual", response_model=List[ConnectionResponse])
def get_mutual_connections(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conns = ConnectionService.get_mutual_connections(db, current_user, user_id)
    return conns

