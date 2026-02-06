import { useState, useEffect } from "react";
import { Chat } from "@/types";
import { ChatList } from "../components/chat-list";
import { ChatThread } from "../components/chat-thread";
import { useChatContext } from "../context/chat-context";
import { useTranslation } from "react-i18next";

export function ChatsPage() {
  const { t } = useTranslation();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { setActiveChatId } = useChatContext();

  // Update active chat ID when selection changes
  useEffect(() => {
    setActiveChatId(selectedChat?.id ?? null);
  }, [selectedChat?.id, setActiveChatId]);

  // Clear active chat ID when leaving the chats page
  useEffect(() => {
    return () => {
      setActiveChatId(null);
    };
  }, [setActiveChatId]);

  return (
    <div className="max-w-7xl mx-auto h-screen flex gap-6 p-6">
      {/* Chat List */}
      <div className="w-80 flex-shrink-0 border rounded-lg p-4 bg-card">
        <h2 className="text-2xl font-bold mb-4">{t("chats.title")}</h2>
        <ChatList onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>

      {/* Chat Thread */}
      <div className="flex-1 flex">
        <ChatThread chat={selectedChat} onChatUpdated={setSelectedChat} />
      </div>
    </div>
  );
}
