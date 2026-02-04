import React, { useState, useEffect } from "react";
import { Search, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { chatsApi } from "@/api/chats";
import { Chat } from "@/types";
import { transformUrl } from "@/lib/url-utils";

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
  selectedChat: Chat | null;
}

export function ChatList({ onSelectChat, selectedChat }: ChatListProps) {
  const { user: currentUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const data = await chatsApi.list();
      setChats(data);
      setFilteredChats(data);
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chats.filter((chat) => {
      // For now, all chats are direct (no chat_type field from backend)
      const otherUser =
        chat.user1Id === currentUser?.id ? chat.user2 : chat.user1;
      return otherUser?.fullName.toLowerCase().includes(query);
    });
    setFilteredChats(filtered);
  }, [searchQuery, chats, currentUser?.id]);

  const getDisplayName = (chat: Chat): string => {
    // All chats are direct chats
    const otherUser =
      chat.user1Id === currentUser?.id ? chat.user2 : chat.user1;
    return otherUser?.fullName || "User";
  };

  const getDisplayAvatar = (chat: Chat) => {
    const otherUser =
      chat.user1Id === currentUser?.id ? chat.user2 : chat.user1;
    return transformUrl(otherUser?.photoDeProfil);
  };

  const getDisplayInitial = (chat: Chat): string => {
    const name = getDisplayName(chat);
    return name.charAt(0).toUpperCase();
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    try {
      await chatsApi.delete(chatId);
      setChats(chats.filter((c) => c.id !== chatId));
      toast({
        title: "Chat deleted",
        description: "The chat has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredChats.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {searchQuery ? "No conversations found" : "No conversations yet"}
        </p>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                  selectedChat?.id === chat.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <Avatar>
                  <AvatarImage
                    src={getDisplayAvatar(chat)}
                    alt={getDisplayName(chat)}
                  />
                  <AvatarFallback>{getDisplayInitial(chat)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{getDisplayName(chat)}</p>
                  {chat.messages && chat.messages.length > 0 && (
                    <p className="text-xs opacity-70 truncate">
                      {chat.messages[chat.messages.length - 1].content}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
