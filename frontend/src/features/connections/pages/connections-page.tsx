import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { transformUrl } from "@/lib/url-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { connectionsApi } from "@/api/connections";
import { usersApi } from "@/api/users";
import { chatsApi } from "@/api/chats";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import {
  UserCheck,
  UserPlus,
  UserX,
  Search,
  MessageCircle,
} from "lucide-react";
import type { UserDetailResponse } from "@/types";
import { ProfileTabsContent } from "../components/profile-tabs-content";
import { useWebSocketConnections } from "@/hooks/use-websocket-hooks";
import { useTranslation } from "react-i18next";

export function ConnectionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(
    null,
  );
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  // Define queries first so they're available in callbacks
  const acceptedQuery = useQuery({
    queryKey: ["connections", "accepted"],
    queryFn: connectionsApi.listAccepted,
  });

  const incomingQuery = useQuery({
    queryKey: ["connections", "incoming"],
    queryFn: connectionsApi.listPendingIncoming,
  });

  const outgoingQuery = useQuery({
    queryKey: ["connections", "outgoing"],
    queryFn: connectionsApi.listPendingOutgoing,
  });

  // Memoize the message handler callback - use queryClient instead of query objects to avoid recreating on every render
  const handleConnectionMessage = useCallback(
    (data: any) => {
      // Handle different connection events
      if (data.type === "connection_request") {
        // New connection request received
        queryClient.invalidateQueries({
          queryKey: ["connections", "incoming"],
        });
        toast.success(`New connection request from ${data.from_user_name}`);
      } else if (data.type === "connection_accepted") {
        // Your request was accepted
        queryClient.invalidateQueries({
          queryKey: ["connections", "accepted"],
        });
        queryClient.invalidateQueries({
          queryKey: ["connections", "outgoing"],
        });
        toast.success(
          `${data.accepted_by_user_name} accepted your connection request`,
        );
      } else if (data.type === "connection_rejected") {
        // Your request was rejected
        queryClient.invalidateQueries({
          queryKey: ["connections", "outgoing"],
        });
        toast.info("Connection request was declined");
      } else if (data.type === "connection_removed") {
        // Connection was removed
        queryClient.invalidateQueries({
          queryKey: ["connections", "accepted"],
        });
        toast.info("A connection was removed");
      }
    },
    [queryClient],
  );

  // Memoize the legacy callback
  const handleConnectionAccepted = useCallback(
    (userId: number) => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    [queryClient],
  );

  // WebSocket hook for connection notifications
  useWebSocketConnections(handleConnectionMessage, handleConnectionAccepted);

  const searchUsersQuery = useQuery({
    queryKey: ["users", "search", searchQuery],
    queryFn: () => usersApi.search(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const sendMutation = useMutation({
    mutationFn: connectionsApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success(t("connections.requestSent"));
    },
    onError: () => toast.error("Failed to send request"),
  });

  const acceptMutation = useMutation({
    mutationFn: connectionsApi.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success(t("connections.requestAccepted"));
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const rejectMutation = useMutation({
    mutationFn: connectionsApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success(t("connections.requestRejected"));
    },
    onError: () => toast.error("Failed to cancel request"),
  });

  const deleteMutation = useMutation({
    mutationFn: connectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success(t("connections.connectionRemoved"));
    },
    onError: () => toast.error("Failed to remove connection"),
  });

  const messageMutation = useMutation({
    mutationFn: (userId: number) => chatsApi.getOrCreateWithUser(userId),
    onSuccess: () => {
      setIsProfileDialogOpen(false);
      navigate("/chats");
    },
    onError: () => toast.error("Failed to open chat"),
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewProfile = async (userId: number) => {
    try {
      const profile = await usersApi.getProfile(userId);
      setSelectedUser(profile);
      setIsProfileDialogOpen(true);
    } catch {
      toast.error("Failed to load user profile");
    }
  };

  const isConnected = (userId: number) => {
    return acceptedQuery.data?.some(
      (conn) => conn.senderId === userId || conn.receiverId === userId,
    );
  };

  const hasPendingRequest = (userId: number) => {
    return outgoingQuery.data?.some((conn) => conn.receiverId === userId);
  };

  const getPendingConnectionId = (userId: number): number | undefined => {
    return outgoingQuery.data?.find((conn) => conn.receiverId === userId)?.id;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t("nav.people")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("connections.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchUsersQuery.isLoading && (
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          )}
          {searchUsersQuery.data && searchUsersQuery.data.users.length > 0 && (
            <div className="space-y-3">
              {searchUsersQuery.data.users
                .filter((user) => user.id !== currentUser?.id)
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={transformUrl(user.photoDeProfil)} />
                        <AvatarFallback>
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <button
                          onClick={() => handleViewProfile(user.id)}
                          className="font-semibold hover:underline text-left"
                        >
                          {user.fullName}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          {user.grade || user.email}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isConnected(user.id) ? (
                        <Button variant="outline" size="sm" disabled>
                          <UserCheck className="h-4 w-4 mr-2" />
                          {t("connections.accepted")}
                        </Button>
                      ) : hasPendingRequest(user.id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const connectionId = getPendingConnectionId(
                              user.id,
                            );
                            if (connectionId) {
                              rejectMutation.mutate(connectionId);
                            }
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t("connections.cancelRequest")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            sendMutation.mutate({ receiverId: user.id })
                          }
                          disabled={sendMutation.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t("connections.sendRequest")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
          {searchUsersQuery.data &&
            searchUsersQuery.data.users.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            )}
        </CardContent>
      </Card>

      {/* Pending Incoming Requests */}
      <Card>
        <CardHeader>
          <CardTitle>{t("connections.incoming")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incomingQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {incomingQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("connections.noPendingRequests")}
            </p>
          )}
          {incomingQuery.data?.map((conn) => {
            const sender = conn.sender;
            return (
              <div
                key={conn.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={transformUrl(sender?.photoDeProfil)} />
                    <AvatarFallback>
                      {sender ? getInitials(sender.fullName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {sender && (
                      <button
                        onClick={() => handleViewProfile(sender.id)}
                        className="font-semibold hover:underline text-left"
                      >
                        {sender.fullName}
                      </button>
                    )}
                    <p className="text-sm text-muted-foreground">
                      wants to connect
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptMutation.mutate(conn.id)}
                    disabled={acceptMutation.isPending}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    {t("connections.acceptRequest")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rejectMutation.mutate(conn.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    {t("connections.rejectRequest")}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Accepted Connections */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("connections.accepted")} ({acceptedQuery.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {acceptedQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {acceptedQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("connections.noConnections")}
            </p>
          )}
          {acceptedQuery.data?.map((conn) => {
            const otherUser =
              conn.senderId === currentUser?.id ? conn.receiver : conn.sender;
            return (
              <div
                key={conn.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={transformUrl(otherUser?.photoDeProfil)} />
                    <AvatarFallback>
                      {otherUser ? getInitials(otherUser.fullName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {otherUser && (
                      <>
                        <button
                          onClick={() => handleViewProfile(otherUser.id)}
                          className="font-semibold hover:underline text-left"
                        >
                          {otherUser.fullName}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          Connected
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(conn.id)}
                  disabled={deleteMutation.isPending}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <>
              <ProfileTabsContent
                user={selectedUser}
                onProfileClick={handleViewProfile}
              />

              <div className="flex gap-2 pt-4 border-t px-6 pb-6">
                {isConnected(selectedUser.id) ? (
                  <>
                    <Button variant="outline" disabled className="flex-1">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Already Connected
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        messageMutation.mutate(selectedUser.id);
                      }}
                      disabled={messageMutation.isPending}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </>
                ) : hasPendingRequest(selectedUser.id) ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const connectionId = getPendingConnectionId(
                        selectedUser.id,
                      );
                      if (connectionId) {
                        rejectMutation.mutate(connectionId);
                        setIsProfileDialogOpen(false);
                      }
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cancel Request
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      sendMutation.mutate({ receiverId: selectedUser.id });
                      setIsProfileDialogOpen(false);
                    }}
                    disabled={sendMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
