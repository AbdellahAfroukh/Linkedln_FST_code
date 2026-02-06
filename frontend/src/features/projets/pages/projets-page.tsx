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
import { useTranslation } from "react-i18next";
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
import { MessageCircle, UserCheck, UserPlus } from "lucide-react";
import type { Projet, ProjetCreate, UserDetailResponse } from "@/types";
import { ProfileTabsContent } from "@/features/connections/components/profile-tabs-content";

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
  const { t } = useTranslation();
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
              {t("projects.by")}{" "}
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
              {t("common.edit")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(t("projects.deleteConfirm"))) {
                  onDelete(projet.id);
                }
              }}
            >
              {t("common.delete")}
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700">{projet.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">{t("projects.budget")}:</span>
          <p className="font-semibold">
            {projet.budget.toLocaleString()} {t("projects.mad")}
          </p>
        </div>
        <div>
          <span className="text-gray-600">{t("projects.duration")}:</span>
          <p className="font-semibold">
            {projet.dureeEnMois} {t("projects.months")}
          </p>
        </div>
        <div>
          <span className="text-gray-600">{t("projects.startDate")}:</span>
          <p className="font-semibold">
            {new Date(projet.dateDebut).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-gray-600">{t("projects.endDate")}:</span>
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
  const { t } = useTranslation();
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
      toast.success(t("connections.requestSent"));
    },
    onError: () => toast.error(t("errors.somethingWentWrong")),
  });

  const cancelConnectionMutation = useMutation({
    mutationFn: connectionsApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success(t("connections.cancelRequest"));
    },
    onError: () => toast.error(t("errors.somethingWentWrong")),
  });

  const messageMutation = useMutation({
    mutationFn: (userId: number) => chatsApi.getOrCreateWithUser(userId),
    onSuccess: () => {
      setIsProfileDialogOpen(false);
      navigate("/chats");
    },
    onError: () => toast.error(t("errors.somethingWentWrong")),
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
      toast.error(t("errors.somethingWentWrong"));
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
      toast.success(t("projects.projectCreated"));
    },
    onError: () => toast.error(t("projects.failedToCreate")),
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
      toast.success(t("projects.projectUpdated"));
    },
    onError: () => toast.error(t("projects.failedToUpdate")),
  });

  const deleteMutation = useMutation({
    mutationFn: projetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projets"] });
      toast.success(t("projects.projectDeleted"));
    },
    onError: () => toast.error(t("projects.failedToDelete")),
  });

  const handleSubmit = () => {
    if (!formData.titre || !formData.description || formData.budget <= 0) {
      toast.error(t("errors.tryAgain"));
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
          <CardTitle>{t("projects.researchProjects")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">{t("projects.searchProjects")}</Label>
            <Input
              id="search"
              placeholder={t("projects.searchByTitleOrDescription")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {user?.user_type === "enseignant" && (
            <>
              {!isCreating ? (
                <Button onClick={() => setIsCreating(true)}>
                  {t("projects.createNewProject")}
                </Button>
              ) : (
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <h3 className="font-semibold">
                    {editingId
                      ? t("projects.editProject")
                      : t("projects.createNewProject")}
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="titre">{t("projects.projectTitle")}</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) =>
                        setFormData({ ...formData, titre: e.target.value })
                      }
                      placeholder={t("projects.projectTitlePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t("projects.description")}
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder={t("projects.descriptionPlaceholder")}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">{t("projects.budget")}</Label>
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
                      <Label htmlFor="duration">
                        {t("projects.durationMonths")}
                      </Label>
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
                      <Label htmlFor="dateDebut">
                        {t("projects.startDate")}
                      </Label>
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
                      <Label htmlFor="statut">{t("projects.status")}</Label>
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
                          <SelectItem value="planifié">
                            {t("projects.planned")}
                          </SelectItem>
                          <SelectItem value="en cours">
                            {t("projects.inProgress")}
                          </SelectItem>
                          <SelectItem value="terminé">
                            {t("projects.completed")}
                          </SelectItem>
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
                      {editingId ? t("common.update") : t("common.create")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {t("common.cancel")}
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
            <CardTitle>{t("projects.searchResults")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchQueryHook.isLoading && (
              <p className="text-sm text-muted-foreground">
                {t("projects.loadingProjects")}
              </p>
            )}

            {!searchQueryHook.isLoading && searchProjets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("projects.noProjectsFound")}
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
            <CardTitle>{t("projects.myProjects")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myProjetsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">
                {t("projects.loadingProjects")}
              </p>
            )}

            {!myProjetsQuery.isLoading && myProjets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("projects.noProjectsFound")}
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
          <CardTitle>{t("projects.allProjects")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allProjetsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">
              {t("projects.loadingProjects")}
            </p>
          )}

          {!allProjetsQuery.isLoading && allProjets.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("projects.noProjectsFound")}
            </p>
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
            <DialogTitle>{t("projects.profile")}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <>
              <ProfileTabsContent
                user={selectedUser}
                onProfileClick={handleViewProfile}
              />

              <div className="flex gap-2 pt-4 border-t px-6 pb-6">
                {selectedUser.id === user?.id ? (
                  <Button variant="outline" className="flex-1" disabled>
                    {t("projects.thisIsYou")}
                  </Button>
                ) : isConnected(selectedUser.id) ? (
                  <>
                    <Button variant="outline" disabled className="flex-1">
                      <UserCheck className="h-4 w-4 mr-2" />
                      {t("connections.alreadyConnected")}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        messageMutation.mutate(selectedUser.id);
                      }}
                      disabled={messageMutation.isPending}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t("connections.message")}
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
                    {t("connections.cancelRequest")}
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
                    {t("connections.connect")}
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
