import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
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
import { organizationsApi } from "@/api/auth";
import { toast } from "sonner";
import {
  UserCheck,
  UserPlus,
  Users,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import type { UserDetailResponse } from "@/types";
import { ProfileTabsContent } from "../components/profile-tabs-content";

export function PeoplePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(
    null,
  );
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    university_id: null as number | null,
    etablissement_id: null as number | null,
    departement_id: null as number | null,
    laboratoire_id: null as number | null,
    equipe_id: null as number | null,
    user_type: null as string | null,
  });

  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(null);
  const [selectedEtablissementId, setSelectedEtablissementId] = useState<
    number | null
  >(null);
  const [selectedDepartementId, setSelectedDepartementId] = useState<
    number | null
  >(null);
  const [selectedLaboratoireId, setSelectedLaboratoireId] = useState<
    number | null
  >(null);

  // Fetch organization data
  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: organizationsApi.getUniversities,
  });

  const { data: etablissements } = useQuery({
    queryKey: ["etablissements"],
    queryFn: organizationsApi.getEtablissements,
  });

  const { data: departements } = useQuery({
    queryKey: ["departements"],
    queryFn: organizationsApi.getDepartements,
  });

  const { data: laboratoires } = useQuery({
    queryKey: ["laboratoires"],
    queryFn: organizationsApi.getLaboratoires,
  });

  const { data: equipes } = useQuery({
    queryKey: ["equipes"],
    queryFn: organizationsApi.getEquipes,
  });

  // Filter users based on current filters
  const filteredUsersQuery = useQuery({
    queryKey: ["users", "filtered", filters],
    queryFn: () => usersApi.filterUsers(filters),
    enabled: Object.values(filters).some((v) => v !== null),
  });

  // Get accepted connections
  const acceptedQuery = useQuery({
    queryKey: ["connections", "accepted"],
    queryFn: connectionsApi.listAccepted,
  });

  // Get outgoing pending requests
  const outgoingQuery = useQuery({
    queryKey: ["connections", "outgoing"],
    queryFn: connectionsApi.listPendingOutgoing,
  });

  const sendMutation = useMutation({
    mutationFn: (userId: number) => connectionsApi.send({ receiverId: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connection request sent");
    },
    onError: () => toast.error("Failed to send request"),
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

  // Filter dropdowns based on selections
  const filteredEtablissements = etablissements?.filter(
    (etab: any) =>
      !selectedUniversityId || etab.universityId === selectedUniversityId,
  );

  const filteredDepartements = departements?.filter(
    (dept: any) =>
      !selectedEtablissementId ||
      dept.etablissementId === selectedEtablissementId,
  );

  const filteredLaboratoires = laboratoires?.filter(
    (lab: any) =>
      !selectedUniversityId || lab.universityId === selectedUniversityId,
  );

  const filteredEquipes = equipes?.filter(
    (eq: any) =>
      !selectedUniversityId || eq.universityId === selectedUniversityId,
  );

  const handleResetFilters = () => {
    setFilters({
      university_id: null,
      etablissement_id: null,
      departement_id: null,
      laboratoire_id: null,
      equipe_id: null,
      user_type: null,
    });
    setSelectedUniversityId(null);
    setSelectedEtablissementId(null);
    setSelectedDepartementId(null);
    setSelectedLaboratoireId(null);
  };

  const handleUniversityChange = (value: string) => {
    const id = value ? Number(value) : null;
    setSelectedUniversityId(id);
    setFilters((prev) => ({
      ...prev,
      university_id: id,
      etablissement_id: null,
      departement_id: null,
      laboratoire_id: null,
      equipe_id: null,
    }));
    setSelectedEtablissementId(null);
    setSelectedDepartementId(null);
    setSelectedLaboratoireId(null);
  };

  const handleEtablissementChange = (value: string) => {
    const id = value ? Number(value) : null;
    setSelectedEtablissementId(id);
    setFilters((prev) => ({
      ...prev,
      etablissement_id: id,
      departement_id: null,
      laboratoire_id: null,
      equipe_id: null,
    }));
    setSelectedDepartementId(null);
    setSelectedLaboratoireId(null);
  };

  const handleDepartementChange = (value: string) => {
    const id = value ? Number(value) : null;
    setSelectedDepartementId(id);
    setFilters((prev) => ({
      ...prev,
      departement_id: id,
      laboratoire_id: null,
      equipe_id: null,
    }));
    setSelectedLaboratoireId(null);
  };

  const handleLaboratoireChange = (value: string) => {
    const id = value ? Number(value) : null;
    setSelectedLaboratoireId(id);
    setFilters((prev) => ({
      ...prev,
      laboratoire_id: id,
      equipe_id: null,
    }));
  };

  const handleEquipeChange = (value: string) => {
    const id = value ? Number(value) : null;
    setFilters((prev) => ({
      ...prev,
      equipe_id: id,
    }));
  };

  const handleUserTypeChange = (value: string) => {
    const type = value || null;
    setFilters((prev) => ({
      ...prev,
      user_type: type,
    }));
  };

  const users = filteredUsersQuery.data?.users || [];
  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Find People
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* University Filter */}
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <select
                id="university"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={selectedUniversityId ?? ""}
                onChange={(e) => handleUniversityChange(e.target.value)}
              >
                <option value="">All Universities</option>
                {universities?.map((uni: any) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Etablissement Filter */}
            <div className="space-y-2">
              <Label htmlFor="etablissement">Etablissement</Label>
              <select
                id="etablissement"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={selectedEtablissementId ?? ""}
                onChange={(e) => handleEtablissementChange(e.target.value)}
                disabled={!selectedUniversityId}
              >
                <option value="">All Etablissements</option>
                {filteredEtablissements?.map((etab: any) => (
                  <option key={etab.id} value={etab.id}>
                    {etab.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Departement Filter */}
            <div className="space-y-2">
              <Label htmlFor="departement">Departement</Label>
              <select
                id="departement"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={selectedDepartementId ?? ""}
                onChange={(e) => handleDepartementChange(e.target.value)}
                disabled={!selectedEtablissementId}
              >
                <option value="">All Departements</option>
                {filteredDepartements?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Laboratoire Filter */}
            <div className="space-y-2">
              <Label htmlFor="laboratoire">Laboratoire</Label>
              <select
                id="laboratoire"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={selectedLaboratoireId ?? ""}
                onChange={(e) => handleLaboratoireChange(e.target.value)}
                disabled={!selectedUniversityId}
              >
                <option value="">All Laboratoires</option>
                {filteredLaboratoires?.map((lab: any) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipe Filter */}
            <div className="space-y-2">
              <Label htmlFor="equipe">Equipe</Label>
              <select
                id="equipe"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={filters.equipe_id ?? ""}
                onChange={(e) => handleEquipeChange(e.target.value)}
                disabled={!selectedUniversityId}
              >
                <option value="">All Equipes</option>
                {filteredEquipes?.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* User Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="userType">Role</Label>
              <select
                id="userType"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={filters.user_type ?? ""}
                onChange={(e) => handleUserTypeChange(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="enseignant">Enseignant</option>
                <option value="doctorant">Doctorant</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground pt-2 border-t">
              Found {filteredUsersQuery.data?.total || 0} result
              {(filteredUsersQuery.data?.total || 0) !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      {hasActiveFilters && (
        <Card>
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : users.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => handleViewProfile(user.id)}
                      >
                        <Avatar>
                          <AvatarImage src={transformUrl(user.photoDeProfil)} />
                          <AvatarFallback>
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                          {user.grade && (
                            <p className="text-xs text-gray-500">
                              {user.grade}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-2">
                        {isConnected(user.id) ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => messageMutation.mutate(user.id)}
                            >
                              <MessageCircle className="h-4 w-4" />
                              Message
                            </Button>
                          </>
                        ) : hasPendingRequest(user.id) ? (
                          <Button size="sm" variant="outline" disabled>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Pending
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => sendMutation.mutate(user.id)}
                            className="gap-2"
                          >
                            <UserPlus className="h-4 w-4" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                No people found with selected filters
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Dialog */}
      {selectedUser && (
        <Dialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedUser.fullName}'s Profile</DialogTitle>
            </DialogHeader>
            <ProfileTabsContent user={selectedUser} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
