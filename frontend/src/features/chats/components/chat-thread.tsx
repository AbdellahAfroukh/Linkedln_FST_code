import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { chatsApi } from "@/api/chats";
import { Chat, Message } from "@/types";
import { format } from "date-fns";
import { FileUpload } from "@/components/file-upload";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { transformUrl } from "@/lib/url-utils";
import { useWebSocketChat } from "@/hooks/use-websocket-hooks";

interface ChatThreadProps {
  chat: Chat | null;
  onChatUpdated: (chat: Chat) => void;
}

export function ChatThread({ chat, onChatUpdated }: ChatThreadProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Memoize the new message handler to prevent WebSocket reconnections
  const handleNewMessage = useCallback(
    (message: any) => {
      // New message received via WebSocket
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        if (prev.some((m) => m.id === message.message_id)) {
          return prev;
        }
        const newMsg = {
          id: message.message_id,
          chatId: chat?.id || 0,
          senderId: message.sender_id,
          content: message.content,
          attachment: message.attachment,
          timestamp: message.timestamp,
          is_read: 1,
          sender:
            message.sender_id === currentUser?.id ? currentUser : undefined,
        } as Message;

        // Keep messages sorted by timestamp
        const updated = [...prev, newMsg];
        return updated.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      });
      setShouldAutoScroll(true);

      // Invalidate chats query to update the chat list with the latest message
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    [chat?.id, currentUser, queryClient],
  );

  // Memoize the typing handler
  const handleTyping = useCallback((userId: number, isTyping: boolean) => {
    // Typing indicator handler - can add UI later
  }, []);

  // WebSocket hook for real-time messages (only when chat is selected)
  const { sendMessage: wsChatsendMessage, isConnected: wsIsConnected } =
    useWebSocketChat(chat ? chat.id : 0, handleNewMessage, handleTyping);

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
    if (!chat) return;
    setShouldAutoScroll(true); // Auto-scroll when switching chats
    loadMessages(true);

    // Only reload on visibility change if the tab was hidden for a while
    let wasHidden = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHidden = true;
      } else if (wasHidden) {
        // Only reload if we were hidden and now visible again
        loadMessages(false);
        wasHidden = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chat?.id]);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    // Enable auto-scroll if user is near the bottom, disable if scrolled up
    setShouldAutoScroll(isNearBottom);
  };

  const loadMessages = async (showLoading = true) => {
    if (!chat) return;
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const data = await chatsApi.getMessages(chat.id);
      // Sort messages by timestamp to ensure chronological order
      const sortedData = data.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      setMessages(sortedData);

      // Check if there are any unread messages from the other user
      const hasUnread = data.some(
        (msg) => msg.is_read === 0 && msg.senderId !== currentUser?.id,
      );

      // If there are unread messages, mark them as read
      if (hasUnread) {
        await chatsApi.markChatAsRead(chat.id);
        // Update local state: mark messages from other user as read
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId !== currentUser?.id ? { ...msg, is_read: 1 } : msg,
          ),
        );
        // Invalidate the chats query to update the notification badge
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat || !currentUser) return;
    if (!messageInput.trim() && !attachmentUrl.trim()) return;

    try {
      setIsSending(true);
      // All chats are direct
      const receiverId =
        chat.user1Id === currentUser.id ? chat.user2Id : chat.user1Id;
      const newMessage = await chatsApi.sendMessage(
        receiverId,
        messageInput.trim(),
        attachmentUrl.trim() || undefined,
      );

      // Message will be received via WebSocket, but add it locally for immediate UI update
      setMessages([...messages, newMessage]);
      setMessageInput("");
      setAttachmentUrl("");
      setShouldAutoScroll(true); // Auto-scroll when sending a message

      // Invalidate chats query to update the chat list with the latest message
      queryClient.invalidateQueries({ queryKey: ["chats"] });
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

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await chatsApi.deleteMessage(messageId);
      setMessages(messages.filter((msg) => msg.id !== messageId));
      // Invalidate chats to update unread count in case this was the last message
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const getOtherUserName = (): string => {
    if (!chat || !currentUser) return "";
    const otherUser = chat.user1Id === currentUser.id ? chat.user2 : chat.user1;
    return otherUser?.fullName || "User";
  };

  const getOtherUserAvatar = (): string | undefined => {
    if (!chat || !currentUser) return undefined;
    const otherUser = chat.user1Id === currentUser.id ? chat.user2 : chat.user1;
    return otherUser?.photoDeProfil;
  };

  const isImageUrl = (url?: string) => {
    if (!url) return false;
    const hasImageExtension =
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url);
    const isDataUrl = url.startsWith("data:image/");
    return hasImageExtension || isDataUrl;
  };

  const getFileIcon = (url?: string) => {
    if (!url) return "📄";
    const ext = url.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📕";
      case "doc":
      case "docx":
        return "📘";
      case "xls":
      case "xlsx":
        return "📗";
      case "txt":
        return "📄";
      default:
        return "📎";
    }
  };

  const getFileName = (url?: string) => {
    if (!url) return "Document";
    return url.split("/").pop() || "Document";
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
    <>
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
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto"
              >
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
                              src={transformUrl(message.sender?.photoDeProfil)}
                              alt={message.sender?.fullName}
                            />
                            <AvatarFallback>
                              {message.sender?.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="relative group">
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
                              {message.content && (
                                <p className="text-sm break-words">
                                  {message.content}
                                </p>
                              )}
                              {message.attachment && (
                                <div className="mt-2">
                                  {isImageUrl(message.attachment) ? (
                                    <img
                                      src={transformUrl(message.attachment)}
                                      alt="Attachment"
                                      className="max-h-64 rounded border object-contain cursor-pointer"
                                      onClick={() =>
                                        setPreviewImage(
                                          transformUrl(message.attachment),
                                        )
                                      }
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <a
                                      href={transformUrl(message.attachment)}
                                      target="_blank"
                                      rel="noreferrer"
                                      download
                                      className="inline-flex items-center gap-3 p-3 bg-background/70 border rounded-lg hover:bg-background/90 transition"
                                    >
                                      <span className="text-2xl">
                                        {getFileIcon(message.attachment)}
                                      </span>
                                      <div className="flex-1">
                                        <p className="text-xs font-medium">
                                          {getFileName(message.attachment)}
                                        </p>
                                        <p className="text-[10px] opacity-70">
                                          Click to download
                                        </p>
                                      </div>
                                      <span className="opacity-60">↓</span>
                                    </a>
                                  )}
                                </div>
                              )}
                              <p className="text-xs opacity-70 mt-1">
                                {format(new Date(message.timestamp), "HH:mm")}
                              </p>
                            </div>
                            {message.senderId === currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -right-10 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={scrollRef} />
                </div>
              </div>

              <div className="border-t p-4 space-y-3">
                <FileUpload
                  label="Attachment (Image or Document)"
                  type="any"
                  currentUrl={attachmentUrl}
                  onUploadSuccess={(url) => setAttachmentUrl(url)}
                />
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
                    disabled={
                      isSending ||
                      (!messageInput.trim() && !attachmentUrl.trim())
                    }
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
      <ImagePreviewDialog
        open={!!previewImage}
        src={previewImage}
        alt="Chat attachment"
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      />
    </>
  );
}
