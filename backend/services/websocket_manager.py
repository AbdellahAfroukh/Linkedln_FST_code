"""
WebSocket connection manager for handling real-time updates.
Manages active connections and broadcasts messages to relevant clients.
"""
from typing import Dict, List, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for different channels"""

    def __init__(self):
        # Store connections by channel
        # Format: {channel_name: {user_id: websocket}}
        self.active_connections: Dict[str, Dict[int, WebSocket]] = {
            "messages": {},      # Chat messages
            "connections": {},   # Connection requests
            "notifications": {}, # General notifications
            "feed": {},          # Posts/comments updates
            "online": {},        # User online status
        }

    async def connect(self, websocket: WebSocket, channel: str, user_id: int):
        """Register a new WebSocket connection"""
        # Note: websocket should already be accepted by authenticate_websocket
        if channel not in self.active_connections:
            self.active_connections[channel] = {}
        self.active_connections[channel][user_id] = websocket
        logger.info(f"User {user_id} connected to {channel} channel")

    def disconnect(self, channel: str, user_id: int):
        """Remove a WebSocket connection"""
        if channel in self.active_connections:
            self.active_connections[channel].pop(user_id, None)
            logger.info(f"User {user_id} disconnected from {channel} channel")

    async def broadcast_to_channel(self, channel: str, data: dict):
        """Broadcast message to all users in a channel"""
        if channel not in self.active_connections:
            return

        disconnected = []
        for user_id, connection in self.active_connections[channel].items():
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                disconnected.append(user_id)

        # Clean up disconnected clients
        for user_id in disconnected:
            self.disconnect(channel, user_id)

    async def broadcast_to_user(self, channel: str, user_id: int, data: dict):
        """Send message to specific user in a channel"""
        if channel not in self.active_connections:
            return

        connection = self.active_connections[channel].get(user_id)
        if connection:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                self.disconnect(channel, user_id)

    async def broadcast_to_users(self, channel: str, user_ids: List[int], data: dict):
        """Send message to specific users in a channel"""
        if channel not in self.active_connections:
            return

        disconnected = []
        for user_id in user_ids:
            connection = self.active_connections[channel].get(user_id)
            if connection:
                try:
                    await connection.send_json(data)
                except Exception as e:
                    logger.error(f"Error sending to user {user_id}: {e}")
                    disconnected.append(user_id)

        # Clean up disconnected clients
        for user_id in disconnected:
            self.disconnect(channel, user_id)

    def get_connected_users(self, channel: str) -> Set[int]:
        """Get all connected users in a channel"""
        if channel not in self.active_connections:
            return set()
        return set(self.active_connections[channel].keys())


# Global connection manager instance
manager = ConnectionManager()
