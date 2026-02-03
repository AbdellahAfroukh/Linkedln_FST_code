# Messaging & Chat Feature Documentation

## Overview

A complete messaging system with support for both **direct (1-to-1) chats** and **group chats**. Users can send messages, create group conversations, add members to groups, and start conversations directly from user profiles.

## Features Implemented

### Backend Enhancements

#### Database Models

- **Chat Model** (`backend/models/chat.py`)
  - Supports both direct chats (`chat_type: "direct"`) and group chats (`chat_type: "group"`)
  - Direct chats: Use `user1Id` and `user2Id` for 1-to-1 conversations
  - Group chats: Use many-to-many `members` relationship with association table
  - Fields: `id`, `chat_type`, `name` (group), `avatar` (group), `user1Id`, `user2Id`, `members`
- **Message Model** (`backend/models/chat.py`)
  - Stores individual messages within chats
  - Fields: `id`, `content`, `timestamp`, `chatId`, `senderId`
  - Relationships: Links to Chat and User (sender)

#### API Endpoints

**Base URL**: `/chats`

| Method   | Endpoint                       | Purpose                             |
| -------- | ------------------------------ | ----------------------------------- |
| `GET`    | `/chats`                       | List all chats for current user     |
| `GET`    | `/chats/{chat_id}`             | Get chat detail with all messages   |
| `GET`    | `/chats/{chat_id}/messages`    | Get messages from specific chat     |
| `POST`   | `/chats/message`               | Send direct message to another user |
| `POST`   | `/chats/{chat_id}/message`     | Send message to group chat          |
| `POST`   | `/chats/with/{user_id}`        | Get or create direct chat with user |
| `POST`   | `/chats/group/create`          | Create a new group chat             |
| `POST`   | `/chats/{chat_id}/add-members` | Add members to group chat           |
| `DELETE` | `/chats/{chat_id}`             | Delete a chat                       |

#### Services

- **ChatService** (`backend/services/chat_service.py`)
  - `get_or_create_chat()`: Get existing or create new direct chat
  - `send_message()`: Send direct message
  - `send_group_message()`: Send group message
  - `create_group_chat()`: Create new group with members
  - `add_members_to_group()`: Add new members to existing group
  - `list_user_chats()`: List all chats with eager loading
  - `get_chat()`: Get single chat with authorization check
  - `delete_chat()`: Delete chat and cascade messages

#### Schemas

- **UserSimple**: Simplified user info for chat contexts (id, fullName, photoDeProfil)
- **MessageResponse**: Message with sender details
- **ChatResponse**: Chat overview for lists
- **ChatDetailResponse**: Full chat with all messages
- **CreateGroupChatRequest**: Request to create group
- **AddMembersRequest**: Request to add members to group

### Frontend Implementation

#### Types & API Client

- **Chat Types** (`frontend/src/types/index.ts`)
  - `ChatType`: "direct" | "group"
  - `Chat`: Full chat object
  - `ChatDetail`: Chat with messages
  - `Message`: Individual message
  - `UserSimple`: Simplified user info
  - `CreateGroupChatRequest`: Group creation request
  - `AddMembersRequest`: Add members request

- **API Client** (`frontend/src/api/chats.ts`)
  - `listChats()`: Fetch all chats
  - `getChatDetail()`: Get chat with messages
  - `getChatMessages()`: Get messages only
  - `sendMessage()`: Send direct message
  - `sendGroupMessage()`: Send group message
  - `getOrCreateDirectChat()`: Start chat with user
  - `createGroupChat()`: Create group
  - `addMembers()`: Add group members
  - `deleteChat()`: Delete chat

#### UI Components

1. **ChatList** (`frontend/src/features/chats/components/chat-list.tsx`)
   - Displays all user conversations
   - Search functionality (by name for direct chats, by group name)
   - Shows last message preview
   - Group indicator with member count
   - "New Group Chat" button
   - Delete chat functionality
   - Auto-refreshes every 5 seconds
   - **Styling**: Uses shadcn/ui Card, Avatar, Input, Button, ScrollArea

2. **ChatThread** (`frontend/src/features/chats/components/chat-thread.tsx`)
   - Main message display area
   - Scrollable message list with auto-scroll
   - Message bubbles (different styling for sent vs received)
   - Sender info in group chats
   - Timestamps
   - Message input field with send button
   - Shows member count for groups
   - "Add Members" button for group chats
   - Auto-refreshes messages every 3 seconds
   - **Styling**: Uses shadcn/ui Card, Avatar, Input, Button, ScrollArea

3. **CreateGroupDialog** (`frontend/src/features/chats/components/create-group-dialog.tsx`)
   - Modal dialog for creating group chats
   - Group name input
   - User search and selection (excludes current user)
   - Multiple member selection with checkboxes
   - Shows selected count
   - Creates group with all selected members
   - **Styling**: Uses shadcn/ui Dialog, Input, Button, ScrollArea, Checkbox, Avatar

4. **AddMembersDialog** (`frontend/src/features/chats/components/add-members-dialog.tsx`)
   - Modal for adding members to existing group
   - Similar to CreateGroupDialog
   - Shows current members
   - Filters out already-members
   - Adds new members to group
   - **Styling**: Uses shadcn/ui Dialog, Input, Button, ScrollArea, Checkbox, Avatar

5. **ChatsPage** (`frontend/src/features/chats/pages/chats-page.tsx`)
   - Main messaging page
   - Two-column layout: ChatList (left) | ChatThread (right)
   - Responsive design
   - State management for selected chat

#### Integration with Connections

- **Message Button in Profile**: Added to user profile dialog
  - Button only shows for connected users
  - Opens/creates direct chat
  - Navigates to chats page
  - **Location**: `frontend/src/features/connections/pages/connections-page.tsx`

#### UI Component Library

New components added to support messaging:

- `ScrollArea` (`frontend/src/components/ui/scroll-area.tsx`)
- `Checkbox` (`frontend/src/components/ui/checkbox.tsx`)
- `useToast` hook (`frontend/src/components/ui/use-toast.ts`)
- `useAuth` hook (`frontend/src/features/auth/hooks/use-auth.ts`)

## User Workflow

### Direct Messaging

1. Search for a user in Connections
2. Click on their profile
3. Click "Message" button (only for connected users)
4. Chat page opens with direct chat thread
5. Type and send message

### Group Messaging

1. Go to Messages page
2. Click "New Group Chat" button
3. Enter group name
4. Search and select members (can select multiple)
5. Click "Create Group"
6. Group appears in chat list
7. Start typing messages

### Managing Groups

1. In group chat thread, click "Add Members"
2. Select new members from available users
3. Click "Add Members" to confirm
4. Selected users are added to group

## Technical Details

### Real-time Updates

- Chat list refreshes every 5 seconds
- Messages refresh every 3 seconds
- Can be upgraded to WebSocket for real-time updates

### Styling

- Uses TailwindCSS for all styling
- Consistent with existing UI theme
- Message bubbles: Primary color for sent, muted for received
- Responsive design suitable for desktop and tablet

### State Management

- React hooks (useState, useEffect)
- TanStack Query for data fetching (optional upgrade)
- Polling-based updates (can be upgraded to WebSocket)

### Error Handling

- Toast notifications for all errors
- Try-catch blocks in all API calls
- User-friendly error messages
- Graceful handling of network failures

## Files Modified

### Backend

1. `models/chat.py` - Enhanced with group chat support
2. `schemas/chat_schemas.py` - Added group chat schemas
3. `services/chat_service.py` - Implemented group operations
4. `routes/chat_routes.py` - Added group chat endpoints

### Frontend

1. `types/index.ts` - Added chat types
2. `api/chats.ts` - Updated with all chat operations
3. `features/chats/pages/chats-page.tsx` - New main page
4. `features/chats/components/chat-list.tsx` - New component
5. `features/chats/components/chat-thread.tsx` - New component
6. `features/chats/components/create-group-dialog.tsx` - New component
7. `features/chats/components/add-members-dialog.tsx` - New component
8. `features/connections/pages/connections-page.tsx` - Added message button
9. `components/ui/scroll-area.tsx` - New UI component
10. `components/ui/checkbox.tsx` - New UI component
11. `components/ui/use-toast.ts` - New hook
12. `features/auth/hooks/use-auth.ts` - New hook

## Future Enhancements

### Immediate (High Priority)

1. **WebSocket Integration**: Replace polling with real-time WebSocket for instant messages
2. **Message Notifications**: Toast notifications for new messages when page is open
3. **Typing Indicators**: Show when other users are typing
4. **Read Receipts**: Show when messages are read
5. **Edit/Delete Messages**: Allow users to edit or delete sent messages

### Medium Priority

1. **Message Search**: Search within conversations
2. **Pin Messages**: Important messages pinned to top
3. **Message Reactions**: Add emoji reactions to messages
4. **File Sharing**: Upload and share files/images
5. **Group Avatars**: Custom images for groups

### Low Priority

1. **Voice/Video Calls**: Direct calling between users
2. **Message Encryption**: End-to-end encryption
3. **Chat Archiving**: Archive old conversations
4. **Chat Drafts**: Save draft messages
5. **Chat Export**: Export conversation history

## Testing Guide

### Test Direct Messaging

1. Login as User A and User B
2. Connect users (send connection request, accept)
3. Go to Connections, find other user
4. Click profile, click "Message"
5. Send and receive messages between browsers

### Test Group Chat

1. Create group chat
2. Add User A and User B
3. Send messages from multiple users
4. Verify messages show correct sender names
5. Add new member to group
6. Verify new member can see history and send messages

### Test Edge Cases

1. Try messaging unconnected user (should not show Message button)
2. Delete chat while viewing it
3. Create group with same user twice (should prevent)
4. Add user who is already in group (should prevent)
5. Create group with 1 member (should require at least 2)

## Performance Considerations

- **Polling**: Currently uses 5s refresh for chats, 3s for messages
- **Eager Loading**: Backend uses joinedload for sender relationships
- **Pagination**: Can be added to message lists for large chats
- **Caching**: Can implement with React Query or Redux for offline support
- **Optimization**: Message lists could virtualize for very long conversations

## Accessibility

- Keyboard navigation support in dialogs
- Clear focus indicators on interactive elements
- Semantic HTML structure
- ARIA labels on buttons and interactive elements
- Color contrast meets WCAG standards
