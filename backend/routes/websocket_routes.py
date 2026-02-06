"""
WebSocket routes for real-time updates.
Handles messaging, connection requests, notifications, and feed updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from database import SessionLocal
from dependencies import get_current_user_websocket
from services.websocket_manager import manager
from services.chat_service import ChatService
from services.connection_service import ConnectionService
import logging
import asyncio
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws", tags=["WebSocket"])


async def authenticate_websocket(websocket: WebSocket, token: str):
    """Authenticate WebSocket connection and return user_id"""
    db = SessionLocal()
    try:
        current_user = get_current_user_websocket(token, db)
        if not current_user:
            await websocket.close(code=4001, reason="Unauthorized")
            return None
        return current_user.id
    finally:
        db.close()


async def websocket_receive_with_timeout(websocket: WebSocket, timeout: int = 35):
    """
    Receive data from WebSocket with timeout.
    Returns None if timeout occurs (client should be sending pings every 30 seconds).
    """
    try:
        data = await asyncio.wait_for(websocket.receive_text(), timeout=timeout)
        return data
    except asyncio.TimeoutError:
        # Timeout is normal - client sends pings every 30 seconds
        return None
    except Exception as e:
        logger.debug(f"WebSocket receive error: {e}")
        raise




@router.websocket("/messages/{chat_id}")
async def websocket_messages(
    websocket: WebSocket,
    chat_id: int,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time chat messages.
    
    Usage: ws://localhost:8000/ws/messages/{chat_id}?token={access_token}
    """
    user_id = await authenticate_websocket(websocket, token)
    if user_id is None:
        return

    await manager.connect(websocket, f"messages_{chat_id}", user_id)
    logger.info(f"User {user_id} connected to chat {chat_id}")

    try:
        while True:
            data = await websocket_receive_with_timeout(websocket)
            if data is None:
                # Timeout - connection is still alive, just no message received
                continue
            
            try:
                msg = json.loads(data)
            except json.JSONDecodeError:
                continue

            message_type = msg.get("type")

            if message_type == "message":
                db = SessionLocal()
                try:
                    message_content = msg.get("content")
                    attachment = msg.get("attachment")
                    message = ChatService.send_message(
                        db=db,
                        chat_id=chat_id,
                        sender_id=user_id,
                        content=message_content,
                        attachment=attachment,
                    )
                    chat = ChatService.get_chat(db, chat_id, user_id)
                    other_user_id = chat.user2Id if chat.user1Id == user_id else chat.user1Id

                    await manager.broadcast_to_users(
                        f"messages_{chat_id}",
                        [user_id, other_user_id],
                        {
                            "type": "new_message",
                            "message_id": message.id,
                            "sender_id": message.senderId,
                            "content": message.content,
                            "attachment": message.attachment,
                            "timestamp": message.timestamp.isoformat() if message.timestamp else None,
                        },
                    )
                finally:
                    db.close()

            elif message_type == "typing":
                db = SessionLocal()
                try:
                    chat = ChatService.get_chat(db, chat_id, user_id)
                    other_user_id = chat.user2Id if chat.user1Id == user_id else chat.user1Id
                    await manager.broadcast_to_user(
                        f"messages_{chat_id}",
                        other_user_id,
                        {
                            "type": "typing",
                            "user_id": user_id,
                            "is_typing": msg.get("is_typing", True),
                        },
                    )
                finally:
                    db.close()

            elif message_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from chat {chat_id}")
    except Exception as e:
        logger.error(f"Error in messages WebSocket: {e}")
    finally:
        manager.disconnect(f"messages_{chat_id}", user_id)




@router.websocket("/connections")
async def websocket_connections(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time connection request notifications.
    
    Usage: ws://localhost:8000/ws/connections?token={access_token}
    """
    user_id = None
    try:
        user_id = await authenticate_websocket(websocket, token)
        if user_id is None:
            return

        await manager.connect(websocket, "connections", user_id)
        logger.info(f"User {user_id} connected to connections channel")

        try:
            while True:
                data = await websocket_receive_with_timeout(websocket)
                
                if data is None:
                    # Timeout - no data received, but connection is still alive
                    continue
                
                try:
                    msg = json.loads(data)
                    if msg.get("type") == "ping":
                        await websocket.send_text(json.dumps({"type": "pong"}))
                except json.JSONDecodeError:
                    continue

        except WebSocketDisconnect:
            logger.info(f"User {user_id} disconnected from connections")
        except asyncio.CancelledError:
            logger.info(f"User {user_id} connection cancelled")
            raise
        except Exception as e:
            logger.error(f"Error in connections WebSocket for user {user_id}: {type(e).__name__}: {e}", exc_info=True)
    
    finally:
        if user_id is not None:
            manager.disconnect("connections", user_id)




@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket endpoint for general notifications.
    
    Usage: ws://localhost:8000/ws/notifications?token={access_token}
    """
    user_id = await authenticate_websocket(websocket, token)
    if user_id is None:
        return

    await manager.connect(websocket, "notifications", user_id)
    logger.info(f"User {user_id} connected to notifications")

    try:
        while True:
            data = await websocket_receive_with_timeout(websocket)
            if data is None:
                continue
            
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                continue

    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from notifications")
    except Exception as e:
        logger.error(f"Error in notifications WebSocket: {e}")
    finally:
        manager.disconnect("notifications", user_id)




@router.websocket("/feed")
async def websocket_feed(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time feed updates.
    
    Usage: ws://localhost:8000/ws/feed?token={access_token}
    """
    user_id = await authenticate_websocket(websocket, token)
    if user_id is None:
        return

    await manager.connect(websocket, "feed", user_id)
    logger.info(f"User {user_id} connected to feed")

    try:
        while True:
            data = await websocket_receive_with_timeout(websocket)
            if data is None:
                continue
            
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                continue

    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from feed")
    except Exception as e:
        logger.error(f"Error in feed WebSocket: {e}")
    finally:
        manager.disconnect("feed", user_id)




@router.websocket("/online")
async def websocket_online(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket endpoint for user online status.
    
    Usage: ws://localhost:8000/ws/online?token={access_token}
    """
    user_id = await authenticate_websocket(websocket, token)
    if user_id is None:
        return

    # Get user info for online broadcast
    db = SessionLocal()
    try:
        current_user = get_current_user_websocket(token, db)
        full_name = current_user.fullName if current_user else "Unknown"
    finally:
        db.close()

    await manager.connect(websocket, "online", user_id)
    logger.info(f"User {user_id} came online")

    # Notify others that user came online
    await manager.broadcast_to_channel(
        "online",
        {
            "type": "user_online",
            "user_id": user_id,
            "full_name": full_name,
        },
    )

    try:
        while True:
            data = await websocket_receive_with_timeout(websocket)
            if data is None:
                continue
            
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                continue

    except WebSocketDisconnect:
        logger.info(f"User {user_id} went offline")
    except Exception as e:
        logger.error(f"Error in online WebSocket: {e}")
    finally:
        manager.disconnect("online", user_id)
        # Notify others that user went offline
        await manager.broadcast_to_channel(
            "online", {"type": "user_offline", "user_id": user_id}
        )

