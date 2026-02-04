import { useQuery } from "@tanstack/react-query";
import { chatsApi } from "@/api/chats";
import { useEffect, useState } from "react";
import { useChatContext } from "../context/chat-context";

/**
 * Hook to get the count of unread messages across all chats
 * with auto-refresh polling. Excludes the currently active chat.
 */
export function useChatsCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { activeChatId } = useChatContext();

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: chatsApi.list,
    refetchInterval: 1000, // Poll every 1 second for real-time updates
    refetchIntervalPause: false, // Don't pause when window is hidden
    staleTime: 0, // Always consider data stale, force fresh requests
    gcTime: 0, // Don't cache the data
  });

  // Count chats with unread messages whenever data changes
  useEffect(() => {
    if (chatsQuery.data) {
      let count = 0;
      // Count chats that have at least one unread message
      // BUT exclude the currently active chat
      chatsQuery.data.forEach((chat) => {
        // Skip the active chat - don't show badge while viewing it
        if (chat.id === activeChatId) return;
        
        // Check if there are any unread messages in this chat
        const hasUnread = chat.messages?.some((msg) => msg.is_read === 0);
        if (hasUnread) count++;
      });
      setUnreadCount(count);
    }
  }, [chatsQuery.data, activeChatId]);

  return {
    count: unreadCount,
    isLoading: chatsQuery.isLoading,
    data: chatsQuery.data,
  };
}
