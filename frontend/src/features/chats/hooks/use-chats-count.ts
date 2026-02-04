import { useQuery } from "@tanstack/react-query";
import { chatsApi } from "@/api/chats";
import { useEffect, useState } from "react";
import { useChatContext } from "../context/chat-context";
import { useAuthStore } from "@/store/auth";

/**
 * Hook to get the count of unread messages across all chats
 * with auto-refresh polling. Excludes the currently active chat.
 * Only counts unread messages from OTHER users, not messages sent by the current user.
 */
export function useChatsCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { activeChatId } = useChatContext();
  const { user: currentUser } = useAuthStore();

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: chatsApi.list,
    refetchInterval: 1000, // Poll every 1 second for real-time updates
    staleTime: 0, // Always consider data stale, force fresh requests
    gcTime: 0, // Don't cache the data
  });

  // Count chats with unread messages whenever data changes
  useEffect(() => {
    if (chatsQuery.data && currentUser) {
      let count = 0;
      // Count chats that have at least one unread message FROM OTHER USERS
      // BUT exclude the currently active chat
      (chatsQuery.data as any).forEach((chat: any) => {
        // Skip the active chat - don't show badge while viewing it
        if (chat.id === activeChatId) return;
        
        // Check if there are any unread messages from OTHER USERS (not sent by current user)
        const hasUnread = chat.messages?.some(
          (msg: any) => msg.is_read === 0 && msg.senderId !== currentUser.id
        );
        if (hasUnread) count++;
      });
      setUnreadCount(count);
    }
  }, [chatsQuery.data, activeChatId, currentUser]);

  return {
    count: unreadCount,
    isLoading: chatsQuery.isLoading,
    data: chatsQuery.data,
  };
}
