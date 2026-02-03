import { useState } from "react";
import { Chat } from "@/types";
import { ChatList } from "../components/chat-list";
import { ChatThread } from "../components/chat-thread";

export function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <div className="max-w-7xl mx-auto h-screen flex gap-6 p-6">
      {/* Chat List */}
      <div className="w-80 flex-shrink-0 border rounded-lg p-4 bg-card">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <ChatList onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>

      {/* Chat Thread */}
      <div className="flex-1 flex">
        <ChatThread chat={selectedChat} onChatUpdated={setSelectedChat} />
      </div>
    </div>
  );
}
