import { useWebSocket } from '@/hooks/use-websocket';
import { useCallback } from 'react';

export interface ChatMessage {
  id: number;
  senderId: number;
  content?: string;
  attachment?: string;
  timestamp?: string;
}

export function useWebSocketChat(
  chatId: number,
  onNewMessage: (message: ChatMessage) => void,
  onTyping?: (userId: number, isTyping: boolean) => void
) {
  // Only connect if chatId is valid
  const channel = chatId > 0 ? `messages/${chatId}` : '';
  
  const handleMessage = useCallback((message: any) => {
    if (message.type === 'new_message') {
      onNewMessage({
        id: message.message_id,
        senderId: message.sender_id,
        content: message.content,
        attachment: message.attachment,
        timestamp: message.timestamp,
      });
    } else if (message.type === 'typing' && onTyping) {
      onTyping(message.user_id, message.is_typing);
    }
  }, [onNewMessage, onTyping]);
  
  const { send, isConnected } = useWebSocket(
    channel,
    handleMessage
  );

  const sendMessage = useCallback((content: string, attachment?: string) => {
    send({
      type: 'message',
      content,
      attachment,
    });
  }, [send]);

  const setTyping = useCallback((isTyping: boolean) => {
    send({
      type: 'typing',
      is_typing: isTyping,
    });
  }, [send]);

  return {
    sendMessage,
    setTyping,
    isConnected,
  };
}

export function useWebSocketConnections(
  onMessage?: (data: any) => void,
  onConnectionAccepted?: (userId: number) => void
) {
  const handleMessage = useCallback((message: any) => {
    // Pass all messages to the callback
    if (onMessage) {
      onMessage(message);
    }
    // Keep legacy callback for backward compatibility
    if (message.type === 'connection_accepted' && onConnectionAccepted) {
      onConnectionAccepted(message.user_id);
    }
  }, [onMessage, onConnectionAccepted]);

  const { send, isConnected } = useWebSocket(
    'connections',
    handleMessage
  );

  return { isConnected, send };
}

export function useWebSocketNotifications(
  onNotification?: (data: any) => void
) {
  const handleNotification = useCallback((message: any) => {
    onNotification?.(message);
  }, [onNotification]);

  const { send, isConnected } = useWebSocket(
    'notifications',
    handleNotification
  );

  return { isConnected, send };
}

export function useWebSocketFeed(
  onNewPost?: (post: any) => void,
  onNewComment?: (comment: any) => void
) {
  const handleFeedMessage = useCallback((message: any) => {
    if (message.type === 'new_post' && onNewPost) {
      onNewPost(message.post);
    } else if (message.type === 'new_comment' && onNewComment) {
      onNewComment(message.comment);
    }
  }, [onNewPost, onNewComment]);

  const { send, isConnected } = useWebSocket(
    'feed',
    handleFeedMessage
  );

  return { isConnected, send };
}

export function useWebSocketOnline(
  onUserOnline?: (userId: number, fullName: string) => void,
  onUserOffline?: (userId: number) => void
) {
  const handleOnlineMessage = useCallback((message: any) => {
    if (message.type === 'user_online' && onUserOnline) {
      onUserOnline(message.user_id, message.full_name);
    } else if (message.type === 'user_offline' && onUserOffline) {
      onUserOffline(message.user_id);
    }
  }, [onUserOnline, onUserOffline]);

  const { send, isConnected } = useWebSocket(
    'online',
    handleOnlineMessage
  );

  return { isConnected, send };
}
