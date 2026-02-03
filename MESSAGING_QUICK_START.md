# Messaging Feature - Quick Start Guide

## 🚀 What Was Built

A complete **Direct & Group Messaging System** for the LinkedIn FSTT platform with:

- ✅ Direct 1-to-1 messaging between connected users
- ✅ Group chat creation and management
- ✅ Multi-member group conversations
- ✅ Real-time message display (polling every 3 seconds)
- ✅ Message history preservation
- ✅ Integration with user profiles ("Message" button)
- ✅ Beautiful UI with TailwindCSS + shadcn/ui

## 📂 File Structure

```
backend/
├── models/chat.py                          # Chat & Message models (direct + group)
├── schemas/chat_schemas.py                 # Request/response schemas
├── services/chat_service.py                # Business logic
└── routes/chat_routes.py                   # API endpoints

frontend/
├── src/
│   ├── api/chats.ts                        # API client functions
│   ├── types/index.ts                      # TypeScript types
│   ├── components/ui/
│   │   ├── scroll-area.tsx                 # NEW: Scrollable container
│   │   ├── checkbox.tsx                    # NEW: Checkbox input
│   │   └── use-toast.ts                    # NEW: Toast notifications
│   ├── features/auth/hooks/
│   │   └── use-auth.ts                     # NEW: Auth hook
│   └── features/chats/
│       ├── pages/
│       │   └── chats-page.tsx              # UPDATED: Main messaging page
│       └── components/
│           ├── chat-list.tsx               # NEW: Conversation list
│           ├── chat-thread.tsx             # NEW: Message thread
│           ├── create-group-dialog.tsx     # NEW: Group creation
│           └── add-members-dialog.tsx      # NEW: Add members to group
```

## 🎯 Key Features

### 1. Chat List View

- Search conversations by name
- Shows last message preview
- Group member count indicator
- Delete conversation button
- "New Group Chat" button
- Auto-refreshes every 5 seconds

### 2. Message Thread View

- Scrollable message history
- Sender info visible (especially in groups)
- Timestamps on messages
- Message input field
- Auto-scroll to latest message
- Auto-refreshes every 3 seconds

### 3. Group Chat Management

- Create groups with multiple users
- Add new members to existing groups
- View member count
- Each group has a name and optional avatar

### 4. Direct Messaging

- Access from user profiles
- Automatic chat creation
- Browse connections and start messaging
- Full message history

## 🔌 API Endpoints

All endpoints require JWT authentication.

```
GET    /chats                    - List all chats
GET    /chats/{id}              - Get chat with messages
POST   /chats/message           - Send direct message
POST   /chats/{id}/message      - Send group message
POST   /chats/with/{user_id}    - Get/create direct chat
POST   /chats/group/create      - Create group chat
POST   /chats/{id}/add-members  - Add members to group
DELETE /chats/{id}              - Delete chat
```

## 💻 Frontend Components

### ChatList Component

```tsx
<ChatList
  onSelectChat={(chat) => setSelectedChat(chat)}
  selectedChat={selectedChat}
/>
```

**Features**: Search, create groups, delete chats, shows message preview

### ChatThread Component

```tsx
<ChatThread
  chat={selectedChat}
  onChatUpdated={(chat) => setSelectedChat(chat)}
/>
```

**Features**: Display messages, send new messages, manage group members

### CreateGroupDialog Component

```tsx
<CreateGroupDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onGroupCreated={() => loadChats()}
/>
```

**Features**: Group name input, user selection, member checkboxes

## 🎨 UI Styling

All components styled with:

- **TailwindCSS** for responsive design
- **shadcn/ui** components for consistency
- **lucide-react** icons
- Light/Dark theme support
- Mobile-friendly layout

### Color Scheme

- Sent messages: Primary color (blue)
- Received messages: Muted/gray background
- Group indicators: Accent colors
- Hover states for interactivity

## 🔄 Data Flow

```
User Profile
    ↓
Click "Message" Button
    ↓
getOrCreateDirectChat(userId)
    ↓
Navigate to /chats
    ↓
ChatList Component Loads
    ↓
Chat selected → ChatThread Component Shows Messages
    ↓
User types message → sendMessage() / sendGroupMessage()
    ↓
Message appears in chat
```

## 📱 Responsive Design

- **Desktop**: Two-column layout (Chat list + Thread)
- **Tablet**: Can be adjusted to single column with tabs
- **Mobile**: Stacked layout (ready for future enhancement)

## 🚀 How to Use

### Start Direct Chat

1. Go to Connections page
2. Search for a user
3. Click their profile
4. Click "Message" button
5. Auto-redirects to chat thread

### Create Group Chat

1. Go to Messages page
2. Click "New Group Chat"
3. Enter group name
4. Select members (use checkboxes)
5. Click "Create Group"
6. Start messaging!

### Send Message

1. Select a chat from the list
2. Type in the message input
3. Click send button or press Enter
4. Message appears in thread

## 🛠️ Technical Stack

**Backend**:

- FastAPI
- SQLAlchemy ORM
- Pydantic v2 schemas
- JWT authentication
- PostgreSQL

**Frontend**:

- React 18 + TypeScript
- Vite build tool
- TailwindCSS
- shadcn/ui components
- date-fns for formatting
- Axios for API calls

## 📊 Database Schema

### Chats Table

```sql
id (PRIMARY KEY)
chat_type ('direct' or 'group')
name (nullable, for group chats)
avatar (nullable, for group chats)
user1_id (nullable, for direct chats)
user2_id (nullable, for direct chats)
```

### Messages Table

```sql
id (PRIMARY KEY)
content (TEXT)
timestamp (DATETIME)
chat_id (FOREIGN KEY → chats)
sender_id (FOREIGN KEY → users)
```

### Group Chat Members (Association Table)

```sql
chat_id (FOREIGN KEY → chats)
user_id (FOREIGN KEY → users)
```

## ⚡ Performance

- **Polling**: Configurable intervals (default: 5s for chats, 3s for messages)
- **Eager Loading**: Backend eagerly loads sender info to prevent N+1 queries
- **Message Scrolling**: Efficient virtual scrolling ready for large histories
- **Search**: Client-side filtering for instant results

## 🔐 Security

- ✅ JWT authentication required for all endpoints
- ✅ Authorization checks (only participants can view/send messages)
- ✅ CORS configured on backend
- ✅ SQL injection prevention (SQLAlchemy parameterized queries)
- ✅ Input validation (Pydantic schemas)

## 🐛 Known Limitations & Future Work

### Current

- Polling-based updates (not real-time WebSocket)
- No message editing/deletion
- No file upload/sharing
- No video/voice calls
- No message encryption

### To Be Added

1. WebSocket for real-time messaging
2. Typing indicators
3. Message read receipts
4. Emoji reactions
5. Message search
6. Push notifications
7. File sharing

## 📝 Code Examples

### Sending a Direct Message

```typescript
// From ChatThread component
const message = await chatsApi.sendMessage(receiverId, "Hello!");
setMessages([...messages, message]);
```

### Creating a Group Chat

```typescript
const groupChat = await chatsApi.createGroupChat({
  name: "Project Team",
  member_ids: [userId1, userId2, userId3],
});
```

### Adding Members to Group

```typescript
const updatedChat = await chatsApi.addMembers(chatId, [userId4, userId5]);
```

## 🎓 Learning Resources

### Backend Flow

1. User sends message via POST /chats/message
2. ChatService.send_message() validates and creates Message
3. Message is committed to DB and returned
4. Frontend displays message

### Frontend Flow

1. Component mounts, loads chats via useEffect
2. ChatList renders with search filter
3. User clicks chat → onSelectChat() called
4. ChatThread displays messages
5. User types message → sendMessage()
6. Message appears immediately, backend confirmed

## 🆘 Troubleshooting

**Messages not appearing?**

- Check console for errors
- Verify JWT token is valid
- Ensure user is member of group chat

**Can't create group?**

- Need at least 2 members
- Select different users
- Check for duplicate selections

**Can't message user?**

- Need to be connected first
- Send connection request from Connections page

## 📞 Support

For issues or questions:

1. Check the console for error messages
2. Verify backend is running on http://localhost:8000
3. Check network tab in DevTools
4. Review error responses from API

---

**Created**: February 2, 2026
**Status**: ✅ Complete and Ready to Use
**Version**: 1.0
