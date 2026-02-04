from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from models.connection import Connection, ConnectionStatus
from models.user import User
from datetime import datetime, timezone

class ConnectionService:
    @staticmethod
    def send_request(db: Session, sender: User, receiver_id: int):
        # Prevent sending to self
        if sender.id == receiver_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot send connection request to yourself")
        # Check existing request or existing accepted connection
        existing = db.query(Connection).filter(
            ((Connection.senderId == sender.id) & (Connection.receiverId == receiver_id)) |
            ((Connection.senderId == receiver_id) & (Connection.receiverId == sender.id))
        ).first()
        if existing:
            # If there is already an accepted connection
            if existing.status == ConnectionStatus.ACCEPTED:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already connected")
            # If pending, inform
            if existing.status == ConnectionStatus.PENDING:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Connection request already pending")
        # Create new pending connection
        conn = Connection(
            status=ConnectionStatus.PENDING,
            timestamp=datetime.now(timezone.utc),
            senderId=sender.id,
            receiverId=receiver_id
        )
        db.add(conn)
        db.commit()
        db.refresh(conn)
        # Load relationships
        db.refresh(conn, ["sender", "receiver"])
        return conn

    @staticmethod
    def accept_request(db: Session, connection_id: int, current_user: User):
        conn = db.query(Connection).filter(Connection.id == connection_id).first()
        if not conn:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection request not found")
        if conn.receiverId != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the receiver can accept the request")
        if conn.status != ConnectionStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Connection is not pending")
        conn.status = ConnectionStatus.ACCEPTED
        conn.acceptedAt = datetime.now(timezone.utc)
        db.commit()
        db.refresh(conn)
        return conn

    @staticmethod
    def reject_request(db: Session, connection_id: int, current_user: User):
        conn = db.query(Connection).filter(Connection.id == connection_id).first()
        if not conn:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection request not found")
        # either receiver or sender can reject/cancel
        if conn.receiverId != current_user.id and conn.senderId != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to reject this request")
        if conn.status != ConnectionStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Connection is not pending")
        conn.status = ConnectionStatus.REJECTED
        db.commit()
        db.refresh(conn)
        return conn

    @staticmethod
    def list_accepted(db: Session, user: User):
        return db.query(Connection).options(
            joinedload(Connection.sender),
            joinedload(Connection.receiver)
        ).filter(
            ((Connection.senderId == user.id) | (Connection.receiverId == user.id)) & (Connection.status == ConnectionStatus.ACCEPTED)
        ).all()

    @staticmethod
    def list_pending_incoming(db: Session, user: User):
        return db.query(Connection).options(
            joinedload(Connection.sender),
            joinedload(Connection.receiver)
        ).filter(
            (Connection.receiverId == user.id) & (Connection.status == ConnectionStatus.PENDING)
        ).all()

    @staticmethod
    def list_pending_outgoing(db: Session, user: User):
        return db.query(Connection).options(
            joinedload(Connection.sender),
            joinedload(Connection.receiver)
        ).filter(
            (Connection.senderId == user.id) & (Connection.status == ConnectionStatus.PENDING)
        ).all()

    @staticmethod
    def delete_connection(db: Session, connection_id: int, current_user: User):
        conn = db.query(Connection).filter(Connection.id == connection_id).first()
        if not conn:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found")
        # Only accept or reject accepted connections (both parties can delete)
        if conn.status != ConnectionStatus.ACCEPTED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete non-accepted connections")
        # Check if current user is one of the parties
        if conn.senderId != current_user.id and conn.receiverId != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this connection")
        db.delete(conn)
        db.commit()
        return {"message": "Connection deleted successfully"}

    @staticmethod
    def get_mutual_connections(db: Session, user: User, other_user_id: int):
        # Get all accepted connections for current user
        user_connections = db.query(Connection).options(
            joinedload(Connection.sender),
            joinedload(Connection.receiver)
        ).filter(
            ((Connection.senderId == user.id) | (Connection.receiverId == user.id)) &
            (Connection.status == ConnectionStatus.ACCEPTED)
        ).all()
        
        # Get all accepted connections for other user
        other_user_connections = db.query(Connection).options(
            joinedload(Connection.sender),
            joinedload(Connection.receiver)
        ).filter(
            ((Connection.senderId == other_user_id) | (Connection.receiverId == other_user_id)) &
            (Connection.status == ConnectionStatus.ACCEPTED)
        ).all()
        
        # Extract user IDs from connections
        # For current user's connections: get all connected users except the profile owner
        user_connection_ids = set()
        for conn in user_connections:
            other_id = conn.receiverId if conn.senderId == user.id else conn.senderId
            # Don't include the profile owner (we want to find mutual connections excluding them)
            if other_id != other_user_id:
                user_connection_ids.add(other_id)
        
        # For profile owner's connections: get all connected users except the current user
        other_user_connection_ids = set()
        for conn in other_user_connections:
            other_id = conn.receiverId if conn.senderId == other_user_id else conn.senderId
            # Don't include the current user (we want to find mutual connections excluding them)
            if other_id != user.id:
                other_user_connection_ids.add(other_id)
        
        # Find mutual connection IDs (people connected to both)
        mutual_ids = user_connection_ids & other_user_connection_ids
        
        if not mutual_ids:
            return []
        
        # Return connections from current user's perspective to these mutual users
        # This ensures we return Connection objects with proper sender/receiver populated
        mutual_connections = db.query(Connection).options(
            joinedload(Connection.sender),
            joinedload(Connection.receiver)
        ).filter(
            (
                ((Connection.senderId == user.id) & (Connection.receiverId.in_(mutual_ids))) |
                ((Connection.receiverId == user.id) & (Connection.senderId.in_(mutual_ids)))
            ) &
            (Connection.status == ConnectionStatus.ACCEPTED)
        ).all()
        
        return mutual_connections
