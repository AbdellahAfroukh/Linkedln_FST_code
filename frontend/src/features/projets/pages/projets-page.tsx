import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projetsApi } from "@/api/projets";
import { connectionsApi } from "@/api/connections";
import { usersApi } from "@/api/users";
import { chatsApi } from "@/api/chats";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { Mail, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import type { Projet, ProjetCreate, UserDetailResponse } from "@/types";

type ProjectCardProps = {
  projet: Projet;
  canEdit?: boolean;
  onEdit?: (projet: Projet) => void;
  onDelete?: (id: number) => void;
  onViewProfile?: (userId: number) => void;
};

function ProjectCard({
  projet,
  canEdit,
  onEdit,
  onDelete,
  onViewProfile,
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "terminé":
        return "bg-green-100 text-green-800 border-green-300";
      case "en cours":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "planifié":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{projet.titre}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                projet.statut,
              )}`}
            >
              {projet.statut.charAt(0).toUpperCase() + projet.statut.slice(1)}
            </span>
          </div>
          {projet.user && (
            <p className="text-sm text-gray-600 mt-1">
              By{" "}
              <button
                type="button"
                onClick={() => onViewProfile?.(projet.user.id)}
                className="font-medium text-primary hover:underline"
              >
                {projet.user.fullName}
              </button>
            </p>
          )}
        </div>

        {canEdit && onEdit && onDelete && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(projet)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to delete this project?")) {
                  onDelete(projet.id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700">{projet.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Budget:</span>
          <p className="font-semibold">{projet.budget.toLocaleString()} MAD</p>
        </div>
        <div>
          <span className="text-gray-600">Duration:</span>
          <p className="font-semibold">{projet.dureeEnMois} months</p>
        </div>
        <div>
          <span className="text-gray-600">Start Date:</span>
          <p className="font-semibold">
            {new Date(projet.dateDebut).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-gray-600">End Date:</span>
          <p className="font-semibold">
            {new Date(
              new Date(projet.dateDebut).getTime() +
                projet.dureeEnMois * 30 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProjetsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(
    null,
  );
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const [formData, setFormData] = useState<ProjetCreate>({
    titre: "",
    description: "",
    budget: 0,
    dateDebut: new Date().toISOString().split("T")[0],
    dureeEnMois: 12,
    statut: "planifié",
  });

  const acceptedConnectionsQuery = useQuery({
    queryKey: ["connections", "accepted"],
    queryFn: connectionsApi.listAccepted,
  });

  const outgoingConnectionsQuery = useQuery({
    queryKey: ["connections", "outgoing"],
    queryFn: connectionsApi.listPendingOutgoing,
  });

  const sendConnectionMutation = useMutation({
    mutationFn: connectionsApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection request sent");
    },
    onError: () => toast.error("Failed to send request"),
  });

  const cancelConnectionMutation = useMutation({
    mutationFn: connectionsApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Request cancelled");
    },
    onError: () => toast.error("Failed to cancel request"),
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
    return acceptedConnectionsQuery.data?.some(
      (conn) => conn.senderId === userId || conn.receiverId === userId,
    );
  };

  const hasPendingRequest = (userId: number) => {
    return outgoingConnectionsQuery.data?.some(
      (conn) => conn.receiverId === userId,
    );
  };

  const getPendingConnectionId = (userId: number): number | undefined => {
    return outgoingConnectionsQuery.data?.find(
      (conn) => conn.receiverId === userId,
    )?.id;
  };

  const myProjetsQuery = useQuery({
    queryKey: ["projets", "my-projets"],
    queryFn: () => projetsApi.getMyProjets({ limit: 100 }),
    enabled: user?.user_type === "enseignant",
  });

  const allProjetsQuery = useQuery({
    queryKey: ["projets", "list"],
    queryFn: () => projetsApi.list({ limit: 100 }),
  });

  const searchQueryHook = useQuery({
    queryKey: ["projets", "search", searchQuery],
    queryFn: () => projetsApi.search(searchQuery, { limit: 100 }),
    enabled: searchQuery.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: projetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] });
      setFormData({
        titre: "",
        description: "",
        budget: 0,
        dateDebut: new Date().toISOString().split("T")[0],
        dureeEnMois: 12,
        statut: "planifié",
      });
      setIsCreating(false);
      toast.success("Project created successfully");
    },
    onError: () => toast.error("Failed to create project"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjetCreate }) =>
      projetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] });
      setEditingId(null);
      setFormData({
        titre: "",
        description: "",
        budget: 0,
        dateDebut: new Date().toISOString().split("T")[0],
        dureeEnMois: 12,
        statut: "planifié",
      });
      toast.success("Project updated successfully");
    },
    onError: () => toast.error("Failed to update project"),
  });

  const deleteMutation = useMutation({
    mutationFn: projetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] });
      toast.success("Project deleted successfully");
    },
    onError: () => toast.error("Failed to delete project"),
  });

  const handleSubmit = () => {
    if (!formData.titre || !formData.description || formData.budget <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (projet: Projet) => {
    setEditingId(projet.id);
    setFormData({
      titre: projet.titre,
      description: projet.description,
      budget: projet.budget,
      dateDebut: projet.dateDebut,
      dureeEnMois: projet.dureeEnMois,
      statut: projet.statut,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      titre: "",
      description: "",
      budget: 0,
      dateDebut: new Date().toISOString().split("T")[0],
      dureeEnMois: 12,
      statut: "planifié",
    });
  };

  const searchProjets =
    searchQuery.length > 0 ? searchQueryHook.data?.projets || [] : [];
  const myProjets =
    user?.user_type === "enseignant" ? myProjetsQuery.data?.projets || [] : [];
  const allProjets = allProjetsQuery.data?.projets || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Research Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">Search Projects</Label>
            <Input
              id="search"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {user?.user_type === "enseignant" && (
            <>
              {!isCreating ? (
                <Button onClick={() => setIsCreating(true)}>
                  Create New Project
                </Button>
              ) : (
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <h3 className="font-semibold">
                    {editingId ? "Edit Project" : "Create New Project"}
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="titre">Project Title</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) =>
                        setFormData({ ...formData, titre: e.target.value })
                      }
                      placeholder="Enter project title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter project description"
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budget: parseFloat(e.target.value),
                          })
                        }
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (months)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.dureeEnMois}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dureeEnMois: parseInt(e.target.value),
                          })
                        }
                        placeholder="12"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateDebut">Start Date</Label>
                      <Input
                        id="dateDebut"
                        type="date"
                        value={formData.dateDebut}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateDebut: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="statut">Status</Label>
                      <Select
                        value={formData.statut}
                        onValueChange={(value) =>
                          setFormData({ ...formData, statut: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planifié">Planned</SelectItem>
                          <SelectItem value="en cours">In Progress</SelectItem>
                          <SelectItem value="terminé">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {editingId ? "Update" : "Create"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {searchQuery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchQueryHook.isLoading && (
              <p className="text-sm text-muted-foreground">
                Loading projects...
              </p>
            )}

            {!searchQueryHook.isLoading && searchProjets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No projects found.
              </p>
            )}

            {searchProjets.map((projet) => (
              <ProjectCard
                key={projet.id}
                projet={projet}
                canEdit={
                  user?.user_type === "enseignant" && user?.id === projet.userId
                }
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onViewProfile={handleViewProfile}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {user?.user_type === "enseignant" && searchQuery.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myProjetsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">
                Loading projects...
              </p>
            )}

            {!myProjetsQuery.isLoading && myProjets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No projects found.
              </p>
            )}

            {myProjets.map((projet) => (
              <ProjectCard
                key={projet.id}
                projet={projet}
                canEdit={true}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onViewProfile={handleViewProfile}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allProjetsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          )}

          {!allProjetsQuery.isLoading && allProjets.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects found.</p>
          )}

          {allProjets.map((projet) => (
            <ProjectCard
              key={projet.id}
              projet={projet}
              canEdit={
                user?.user_type === "enseignant" && user?.id === projet.userId
              }
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
              onViewProfile={handleViewProfile}
            />
          ))}
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
              <ScrollArea className="flex-1 px-6 overflow-y-auto">
                <div className="space-y-6 pb-4">
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
                        <Label className="text-muted-foreground">
                          Full Name
                        </Label>
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
                          Numero de Somme
                        </Label>
                        <p className="font-medium">
                          {selectedUser.numeroDeSomme}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold">
                      Organizations
                    </Label>
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
                      {selectedUser.specialite &&
                        selectedUser.specialite.length > 0 && (
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium mb-2">
                              Specialites
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedUser.specialite.map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {spec.nom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      {selectedUser.thematiqueDeRecherche &&
                        selectedUser.thematiqueDeRecherche.length > 0 && (
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium mb-2">
                              Thematiques de Recherche
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedUser.thematiqueDeRecherche.map(
                                (them, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                                  >
                                    {them.nom}
                                  </span>
                                ),
                              )}
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
                </div>
              </ScrollArea>

              <div className="flex gap-2 pt-4 border-t px-6 pb-6">
                {selectedUser.id === user?.id ? (
                  <Button variant="outline" className="flex-1" disabled>
                    This is you
                  </Button>
                ) : isConnected(selectedUser.id) ? (
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
                        cancelConnectionMutation.mutate(connectionId);
                        setIsProfileDialogOpen(false);
                      }
                    }}
                    disabled={cancelConnectionMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cancel Request
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      sendConnectionMutation.mutate({
                        receiverId: selectedUser.id,
                      });
                      setIsProfileDialogOpen(false);
                    }}
                    disabled={sendConnectionMutation.isPending}
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
