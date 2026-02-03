import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Mail,
  MessageCircle,
} from "lucide-react";
import type { UserDetailResponse } from "@/types";

export function ConnectionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(
    null,
  );
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

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

  const searchUsersQuery = useQuery({
    queryKey: ["users", "search", searchQuery],
    queryFn: () => usersApi.search(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const sendMutation = useMutation({
    mutationFn: connectionsApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection request sent");
    },
    onError: () => toast.error("Failed to send request"),
  });

  const acceptMutation = useMutation({
    mutationFn: connectionsApi.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection accepted");
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const rejectMutation = useMutation({
    mutationFn: connectionsApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection rejected");
    },
    onError: () => toast.error("Failed to reject request"),
  });

  const deleteMutation = useMutation({
    mutationFn: connectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection removed");
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find People to Connect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchUsersQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Searching...</p>
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
                        <AvatarImage src={user.photoDeProfil} />
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
                          Connected
                        </Button>
                      ) : hasPendingRequest(user.id) ? (
                        <Button variant="outline" size="sm" disabled>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Pending
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
                          Connect
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
          <CardTitle>Connection Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incomingQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {incomingQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No pending requests
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
                    <AvatarImage src={sender?.photoDeProfil} />
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
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rejectMutation.mutate(conn.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Decline
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
            My Connections ({acceptedQuery.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {acceptedQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {acceptedQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No connections yet. Start connecting with people!
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
                    <AvatarImage src={otherUser?.photoDeProfil} />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.photoDeProfil} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(selectedUser.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {selectedUser.fullName}
                  </h2>
                  {selectedUser.grade && (
                    <p className="text-lg text-muted-foreground">
                      {selectedUser.grade}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedUser.nom && selectedUser.prenom && (
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">
                      {selectedUser.prenom} {selectedUser.nom}
                    </p>
                  </div>
                )}
                {selectedUser.dateDeNaissance && (
                  <div>
                    <Label className="text-muted-foreground">
                      Date of Birth
                    </Label>
                    <p className="font-medium">
                      {selectedUser.dateDeNaissance}
                    </p>
                  </div>
                )}
                {selectedUser.numeroDeSomme && (
                  <div>
                    <Label className="text-muted-foreground">
                      Employee Number
                    </Label>
                    <p className="font-medium">{selectedUser.numeroDeSomme}</p>
                  </div>
                )}
              </div>

              {/* Organizations */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">Organizations</Label>
                <div className="space-y-2">
                  {selectedUser.university && (
                    <div className="flex items-center gap-3 p-2 bg-muted rounded">
                      {selectedUser.university.Logo ? (
                        <img
                          src={selectedUser.university.Logo}
                          alt={selectedUser.university.nom}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-primary/20 rounded flex items-center justify-center text-xs font-bold">
                          U
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">University</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedUser.university.nom}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedUser.etablissement && (
                    <div className="flex items-center gap-3 p-2 bg-muted rounded">
                      {selectedUser.etablissement.Logo ? (
                        <img
                          src={selectedUser.etablissement.Logo}
                          alt={selectedUser.etablissement.nom}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-blue-500/20 rounded flex items-center justify-center text-xs font-bold">
                          E
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">Etablissement</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedUser.etablissement.nom}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedUser.departement && (
                    <div className="flex items-center gap-3 p-2 bg-muted rounded">
                      <div className="h-10 w-10 bg-green-500/20 rounded flex items-center justify-center text-xs font-bold">
                        D
                      </div>
                      <div>
                        <p className="text-sm font-medium">Departement</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedUser.departement.nom}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedUser.laboratoire && (
                    <div className="flex items-center gap-3 p-2 bg-muted rounded">
                      <div className="h-10 w-10 bg-purple-500/20 rounded flex items-center justify-center text-xs font-bold">
                        L
                      </div>
                      <div>
                        <p className="text-sm font-medium">Laboratory</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedUser.laboratoire.nom}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedUser.equipe && (
                    <div className="flex items-center gap-3 p-2 bg-muted rounded">
                      <div className="h-10 w-10 bg-orange-500/20 rounded flex items-center justify-center text-xs font-bold">
                        T
                      </div>
                      <div>
                        <p className="text-sm font-medium">Team</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedUser.equipe.nom}
                        </p>
                      </div>
                    </div>
                  )}
                  {!selectedUser.university &&
                    !selectedUser.etablissement &&
                    !selectedUser.departement &&
                    !selectedUser.laboratoire &&
                    !selectedUser.equipe && (
                      <p className="text-xs text-muted-foreground italic">
                        No organizations assigned
                      </p>
                    )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
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
                  <Button variant="outline" disabled className="flex-1">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Request Pending
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
