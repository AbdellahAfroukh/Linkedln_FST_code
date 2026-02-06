# WebSocket Implementation Guide

## Overview

The application now uses WebSockets for real-time updates instead of constant polling. This dramatically reduces server load and improves user experience.

## Architecture

### Backend WebSocket Endpoints

All WebSocket endpoints are available at `/ws/{channel}?token={access_token}`

**Channels:**

1. **`/ws/messages/{chat_id}`** - Real-time chat messages
2. **`/ws/connections`** - Connection request notifications
3. **`/ws/notifications`** - General notifications (comments, reactions)
4. **`/ws/feed`** - Live feed updates (new posts, comments)
5. **`/ws/online`** - User online/offline status

### Connection Manager

Backend manages connections with a `ConnectionManager` that:

- Tracks active WebSocket connections per channel
- Broadcasts messages to relevant users
- Auto-removes disconnected clients
- Supports targeted messaging to specific users

## Frontend Usage

### Hook: `useWebSocket`

Base hook for any WebSocket connection:

```typescript
import { useWebSocket } from '@/hooks/use-websocket';

function MyComponent() {
  const { send, isConnected } = useWebSocket(
    'notifications', // channel
    (message) => {
      console.log('Received:', message);
    },
    (error) => console.error('WebSocket error:', error),
    () => console.log('Connected'),
    () => console.log('Disconnected')
  );

  const handleSend = () => {
    send({ type: 'ping' });
  };

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
      <button onClick={handleSend}>Send Ping</button>
    </div>
  );
}
```

### Feature-Specific Hooks

#### Chat Messages

```typescript
import { useWebSocketChat } from '@/hooks/use-websocket-hooks';

function ChatComponent({ chatId }) {
  const { sendMessage, setTyping, isConnected } = useWebSocketChat(
    chatId,
    (message) => {
      // Add message to UI
      setMessages(prev => [...prev, message]);
    },
    (userId, isTyping) => {
      // Show "User is typing..." indicator
    }
  );

  return (
    <div>
      {/* Chat UI */}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
}
```

#### Connection Requests

```typescript
import { useWebSocketConnections } from '@/hooks/use-websocket-hooks';

function ConnectionPanel() {
  const { isConnected } = useWebSocketConnections(
    (data) => {
      // New connection request received
      console.log('New request from:', data.from_user_id);
    },
    (userId) => {
      // Connection accepted
      console.log('Connection accepted with:', userId);
    }
  );

  return <div>{isConnected ? 'Connected' : 'Connecting...'}</div>;
}
```

#### Notifications

```typescript
import { useWebSocketNotifications } from '@/hooks/use-websocket-hooks';

function NotificationCenter() {
  const { isConnected } = useWebSocketNotifications(
    (notification) => {
      // Show notification toast
      if (notification.type === 'comment_on_post') {
        toast.info(`${notification.user_name} commented on your post`);
      }
    }
  );

  return <div></div>;
}
```

#### Feed Updates

```typescript
import { useWebSocketFeed } from '@/hooks/use-websocket-hooks';

function FeedComponent() {
  const { isConnected } = useWebSocketFeed(
    (post) => {
      // New post received
      setPosts(prev => [post, ...prev]);
    },
    (comment) => {
      // New comment received
      updatePostWithComment(comment);
    }
  );

  return <div>{/* Feed UI */}</div>;
}
```

#### User Online Status

```typescript
import { useWebSocketOnline } from '@/hooks/use-websocket-hooks';

function UserStatusIndicator() {
  const { isConnected } = useWebSocketOnline(
    (userId, fullName) => {
      // User came online
      setOnlineUsers(prev => [...prev, userId]);
    },
    (userId) => {
      // User went offline
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    }
  );

  return <div></div>;
}
```

## Message Formats

### Chat Messages

**Send:**

```json
{
  "type": "message",
  "content": "Hello!",
  "attachment": "/upload/files/filename.jpg" // optional
}
```

**Or typing indicator:**

```json
{
  "type": "typing",
  "is_typing": true
}
```

**Receive:**

```json
{
  "type": "new_message",
  "message_id": 123,
  "sender_id": 1,
  "content": "Hello!",
  "attachment": "/upload/files/filename.jpg",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Connection Requests

**Receive:**

```json
{
  "type": "connection_request",
  "request_id": 1,
  "from_user_id": 2,
  "from_user_name": "John Doe"
}
```

### Feed Updates

**Receive:**

```json
{
  "type": "new_post",
  "post": {
    "id": 1,
    "userId": 2,
    "content": "Check out my new research!",
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

### Online Status

**Receive:**

```json
{
  "type": "user_online",
  "user_id": 1,
  "full_name": "John Doe"
}
```

## Server-Side Broadcasting

### Emit Events from Routes

```python
from services.websocket_manager import manager
import asyncio

@router.post("/posts")
async def create_post(post_data: PostCreate, current_user: User = Depends(get_current_user)):
    # Create post
    post = PostService.create_post(db, current_user, post_data)

    # Broadcast to all connected users in feed channel
    asyncio.create_task(
        manager.broadcast_to_channel(
            "feed",
            {
                "type": "new_post",
                "post": {
                    "id": post.id,
                    "userId": post.userId,
                    "content": post.content,
                    "timestamp": post.timestamp.isoformat()
                }
            }
        )
    )

    return post
```

### Broadcast to Specific Users

```python
# Notify specific users
await manager.broadcast_to_users(
    "notifications",
    [user1_id, user2_id],
    {
        "type": "connection_request",
        "request_id": request.id,
        "from_user_id": current_user.id
    }
)
```

## Connection Management

### Auto-Reconnect

The frontend hook automatically reconnects with exponential backoff:

- 1st retry: 1 second
- 2nd retry: 2 seconds
- 3rd retry: 4 seconds
- 4th retry: 8 seconds
- 5th retry: 16 seconds
- Max 5 attempts, then stops

### Heartbeat

Send periodic ping to keep connection alive:

```typescript
// In useWebSocket hook, can add:
setInterval(() => {
  send({ type: "ping" });
}, 30000); // Every 30 seconds
```

## Performance Improvements

### Before WebSockets (Polling)

- Chat: 1 request per 3-5 seconds
- Connections: 1 request per 5-10 seconds
- Notifications: 1 request per 10-15 seconds
- **Total with 100 users: ~400 requests/second**

### After WebSockets

- Single persistent connection per user per channel
- Instant bidirectional communication
- **Total with 100 users: 0 polling requests, only event-driven messages**

## Best Practices

1. **Clean up on unmount:**

   ```typescript
   useEffect(() => {
     return () => {
       // useWebSocket hook handles cleanup automatically
     };
   }, []);
   ```

2. **Handle reconnection UI:**

   ```typescript
   {!isConnected && (
     <div className="bg-yellow-100 p-2">
       Reconnecting... Status: {isConnected ? 'Connected' : 'Offline'}
     </div>
   )}
   ```

3. **Don't spam messages:**

   ```typescript
   // Bad: Send every keystroke
   onChange={(e) => setTyping(true)} // Too many calls

   // Good: Debounce
   useEffect(() => {
     const timer = setTimeout(() => setTyping(false), 1000);
     return () => clearTimeout(timer);
   }, [content]);
   ```

4. **Validate on backend:**
   - Always verify user has access to chat/resource
   - Check permissions before broadcasting
   - Sanitize message content

## Debugging

### Check Browser WebSocket

1. Open DevTools → Network tab
2. Filter by "WS"
3. Click on WebSocket connection to see messages

### Backend Logs

```
INFO:     User 1 connected to messages_5 channel
INFO:     User 1 disconnected from messages_5 channel
```

### Common Issues

**Connection fails immediately:**

- Check token is valid
- Verify backend is running
- Check CORS settings

**Messages not arriving:**

- Ensure both users are connected
- Check message format is valid JSON
- Look for errors in backend logs

**High memory usage:**

- Check for connection leaks
- Ensure proper cleanup on unmount
- Monitor active connections in manager
