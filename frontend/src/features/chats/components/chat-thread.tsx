import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { chatsApi } from "@/api/chats";
import { Chat, Message } from "@/types";
import { format } from "date-fns";

interface ChatThreadProps {
  chat: Chat | null;
  onChatUpdated: (chat: Chat) => void;
}

export function ChatThread({ chat, onChatUpdated }: ChatThreadProps) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Don't render if no current user
  if (!currentUser) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          Loading user information...
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    if (chat) {
      console.log("Chat selected:", chat);
      console.log("Current user:", currentUser);
      loadMessages();
      const interval = setInterval(loadMessages, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [chat?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadMessages = async () => {
    if (!chat) return;
    try {
      setIsLoading(true);
      const data = await chatsApi.getMessages(chat.id);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !chat || !currentUser) return;

    try {
      setIsSending(true);
      // All chats are direct
      const receiverId =
        chat.user1Id === currentUser.id ? chat.user2Id : chat.user1Id;
      const newMessage = await chatsApi.sendMessage(receiverId, messageInput);

      setMessages([...messages, newMessage]);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getOtherUserName = (): string => {
    if (!chat || !currentUser) return "";
    console.log("Getting other user name. Chat:", chat);
    const otherUser = chat.user1Id === currentUser.id ? chat.user2 : chat.user1;
    console.log("Other user:", otherUser);
    return otherUser?.fullName || "User";
  };

  const getOtherUserAvatar = (): string | undefined => {
    if (!chat || !currentUser) return undefined;
    const otherUser = chat.user1Id === currentUser.id ? chat.user2 : chat.user1;
    return otherUser?.photoDeProfil;
  };

  if (!chat) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          Select a conversation to start messaging
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={getOtherUserAvatar()}
                alt={getOtherUserName()}
              />
              <AvatarFallback>{getOtherUserName().charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{getOtherUserName()}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex gap-2 max-w-xs ${
                          message.senderId === currentUser?.id
                            ? "flex-row-reverse"
                            : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage
                            src={message.sender?.photoDeProfil}
                            alt={message.sender?.fullName}
                          />
                          <AvatarFallback>
                            {message.sender?.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.senderId === currentUser?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {chat.chat_type === "group" &&
                            message.senderId !== currentUser?.id && (
                              <p className="text-xs font-semibold mb-1 opacity-70">
                                {message.sender?.fullName}
                              </p>
                            )}
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(message.timestamp), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSending || !messageInput.trim()}
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
