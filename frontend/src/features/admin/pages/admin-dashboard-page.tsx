import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  universitiesApi,
  etablissementsApi,
  departementsApi,
  laboratoiresApi,
  equipesApi,
  specialitesApi,
  thematiquesApi,
  adminStatsApi,
  adminUsersApi,
} from "@/api/admin";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Users,
  Building2,
  X,
} from "lucide-react";

type ActiveTab =
  | "universities"
  | "etablissements"
  | "departements"
  | "laboratoires"
  | "equipes"
  | "specialites"
  | "thematiques"
  | "users"
  | "stats";

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("universities");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const queryClient = useQueryClient();

  // Fetch data based on active tab
  const { data: universities, isLoading: loadingUniversities } = useQuery({
    queryKey: ["admin-universities"],
    queryFn: universitiesApi.list,
    enabled:
      activeTab === "universities" ||
      activeTab === "etablissements" ||
      activeTab === "laboratoires" ||
      activeTab === "equipes",
  });

  const { data: etablissements, isLoading: loadingEtablissements } = useQuery({
    queryKey: ["admin-etablissements"],
    queryFn: etablissementsApi.list,
    enabled: activeTab === "etablissements" || activeTab === "departements",
  });

  const { data: departements, isLoading: loadingDepartements } = useQuery({
    queryKey: ["admin-departements"],
    queryFn: departementsApi.list,
    enabled: activeTab === "departements",
  });

  const { data: laboratoires, isLoading: loadingLaboratoires } = useQuery({
    queryKey: ["admin-laboratoires"],
    queryFn: laboratoiresApi.list,
    enabled: activeTab === "laboratoires",
  });

  const { data: equipes, isLoading: loadingEquipes } = useQuery({
    queryKey: ["admin-equipes"],
    queryFn: equipesApi.list,
    enabled: activeTab === "equipes",
  });

  const { data: specialites, isLoading: loadingSpecialites } = useQuery({
    queryKey: ["admin-specialites"],
    queryFn: specialitesApi.list,
    enabled: activeTab === "specialites",
  });

  const { data: thematiques, isLoading: loadingThematiques } = useQuery({
    queryKey: ["admin-thematiques"],
    queryFn: thematiquesApi.list,
    enabled: activeTab === "thematiques",
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminUsersApi.list({ skip: 0, limit: 100 }),
    enabled: activeTab === "users",
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminStatsApi.get,
    enabled: activeTab === "stats",
  });

  const tabs = [
    { id: "universities" as ActiveTab, label: "Universities", icon: Building2 },
    {
      id: "etablissements" as ActiveTab,
      label: "Etablissements",
      icon: Building2,
    },
    { id: "departements" as ActiveTab, label: "Departements", icon: Building2 },
    { id: "laboratoires" as ActiveTab, label: "Laboratoires", icon: Building2 },
    { id: "equipes" as ActiveTab, label: "Equipes", icon: Building2 },
    { id: "specialites" as ActiveTab, label: "Specialites", icon: Building2 },
    { id: "thematiques" as ActiveTab, label: "Thematiques", icon: Building2 },
    { id: "users" as ActiveTab, label: "Users", icon: Users },
    { id: "stats" as ActiveTab, label: "Statistics", icon: Users },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case "universities":
        return universities;
      case "etablissements":
        return etablissements;
      case "departements":
        return departements;
      case "laboratoires":
        return laboratoires;
      case "equipes":
        return equipes;
      case "specialites":
        return specialites;
      case "thematiques":
        return thematiques;
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case "universities":
        return loadingUniversities;
      case "etablissements":
        return loadingEtablissements;
      case "departements":
        return loadingDepartements;
      case "laboratoires":
        return loadingLaboratoires;
      case "equipes":
        return loadingEquipes;
      case "specialites":
        return loadingSpecialites;
      case "thematiques":
        return loadingThematiques;
      default:
        return false;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      let deletePromise;
      switch (activeTab) {
        case "universities":
          deletePromise = universitiesApi.delete(id);
          break;
        case "etablissements":
          deletePromise = etablissementsApi.delete(id);
          break;
        case "departements":
          deletePromise = departementsApi.delete(id);
          break;
        case "laboratoires":
          deletePromise = laboratoiresApi.delete(id);
          break;
        case "equipes":
          deletePromise = equipesApi.delete(id);
          break;
        case "specialites":
          deletePromise = specialitesApi.delete(id);
          break;
        case "thematiques":
          deletePromise = thematiquesApi.delete(id);
          break;
        default:
          return;
      }

      await deletePromise;
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: [`admin-${activeTab}`] });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete item");
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ nom: "", ville: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      let savePromise;
      if (editingItem) {
        // Update
        switch (activeTab) {
          case "universities":
            savePromise = universitiesApi.update(editingItem.id, formData);
            break;
          case "etablissements":
            savePromise = etablissementsApi.update(editingItem.id, formData);
            break;
          case "departements":
            savePromise = departementsApi.update(editingItem.id, formData);
            break;
          case "laboratoires":
            savePromise = laboratoiresApi.update(editingItem.id, formData);
            break;
          case "equipes":
            savePromise = equipesApi.update(editingItem.id, formData);
            break;
          case "specialites":
            savePromise = specialitesApi.update(editingItem.id, formData);
            break;
          case "thematiques":
            savePromise = thematiquesApi.update(editingItem.id, formData);
            break;
          default:
            return;
        }
      } else {
        // Create
        switch (activeTab) {
          case "universities":
            savePromise = universitiesApi.create(formData);
            break;
          case "etablissements":
            savePromise = etablissementsApi.create(formData);
            break;
          case "departements":
            savePromise = departementsApi.create(formData);
            break;
          case "laboratoires":
            savePromise = laboratoiresApi.create(formData);
            break;
          case "equipes":
            savePromise = equipesApi.create(formData);
            break;
          case "specialites":
            savePromise = specialitesApi.create(formData);
            break;
          case "thematiques":
            savePromise = thematiquesApi.create(formData);
            break;
          default:
            return;
        }
      }

      await savePromise;
      toast.success(
        editingItem ? "Updated successfully" : "Created successfully",
      );
      queryClient.invalidateQueries({ queryKey: [`admin-${activeTab}`] });
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {activeTab !== "stats" && activeTab !== "users" && (
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "stats" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {(stats as any)?.users?.total ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enseignants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {(stats as any)?.users?.enseignants ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Doctorants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {(stats as any)?.users?.doctorants ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === "users" ? (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Profile</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.users?.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{user.id}</td>
                        <td className="p-2">{user.fullName}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {user.user_type}
                          </span>
                        </td>
                        <td className="p-2">
                          {user.profile_completed ? "✓" : "✗"}
                        </td>
                        <td className="p-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              adminUsersApi.delete(user.id).then(() => {
                                toast.success("User deleted");
                                queryClient.invalidateQueries({
                                  queryKey: ["admin-users"],
                                });
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{activeTab}</CardTitle>
          </CardHeader>
          <CardContent>
            {getCurrentLoading() ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-2">
                {getCurrentData()?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No items found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          {(activeTab === "universities" ||
                            activeTab === "etablissements") && (
                            <th className="text-left p-2">Logo</th>
                          )}
                          <th className="text-left p-2">Name</th>
                          {(activeTab === "universities" ||
                            activeTab === "etablissements") && (
                            <th className="text-left p-2">Ville</th>
                          )}
                          {activeTab === "etablissements" && (
                            <th className="text-left p-2">University</th>
                          )}
                          {activeTab === "departements" && (
                            <th className="text-left p-2">Etablissement</th>
                          )}
                          {activeTab === "laboratoires" && (
                            <th className="text-left p-2">University</th>
                          )}
                          {activeTab === "equipes" && (
                            <th className="text-left p-2">University</th>
                          )}
                          {(activeTab === "departements" ||
                            activeTab === "laboratoires" ||
                            activeTab === "equipes" ||
                            activeTab === "specialites" ||
                            activeTab === "thematiques") && (
                            <th className="text-left p-2">Description</th>
                          )}
                          <th className="text-right p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentData()?.map((item: any) => (
                          <tr
                            key={item.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2">{item.id}</td>
                            {(activeTab === "universities" ||
                              activeTab === "etablissements") && (
                              <td className="p-2">
                                {item.Logo ? (
                                  <img
                                    src={item.Logo}
                                    alt={item.nom}
                                    className="h-10 w-10 object-contain rounded"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                    No logo
                                  </div>
                                )}
                              </td>
                            )}
                            <td className="p-2">{item.nom}</td>
                            {(activeTab === "universities" ||
                              activeTab === "etablissements") && (
                              <td className="p-2">{item.ville || "-"}</td>
                            )}
                            {activeTab === "etablissements" && (
                              <td className="p-2">
                                {universities?.find(
                                  (u: any) => u.id === item.universityId,
                                )?.nom || "-"}
                              </td>
                            )}
                            {activeTab === "departements" && (
                              <td className="p-2">
                                {etablissements?.find(
                                  (e: any) => e.id === item.etablissementId,
                                )?.nom || "-"}
                              </td>
                            )}
                            {activeTab === "laboratoires" && (
                              <td className="p-2">
                                {universities?.find(
                                  (u: any) => u.id === item.univesityId,
                                )?.nom || "-"}
                              </td>
                            )}
                            {activeTab === "equipes" && (
                              <td className="p-2">
                                {universities?.find(
                                  (u: any) => u.id === item.universityId,
                                )?.nom || "-"}
                              </td>
                            )}
                            {(activeTab === "departements" ||
                              activeTab === "laboratoires" ||
                              activeTab === "equipes" ||
                              activeTab === "specialites" ||
                              activeTab === "thematiques") && (
                              <td className="p-2">{item.description || "-"}</td>
                            )}
                            <td className="p-2 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEdit(item)}
                                className="mr-2"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingItem ? "Edit" : "Create"} {activeTab}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nom">Name *</Label>
                <Input
                  id="nom"
                  value={formData.nom || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>

              {/* University & Etablissement fields */}
              {(activeTab === "universities" ||
                activeTab === "etablissements") && (
                <>
                  <div>
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, adresse: e.target.value })
                      }
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      value={formData.ville || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, ville: e.target.value })
                      }
                      placeholder="Enter ville"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pays">Pays</Label>
                    <Input
                      id="pays"
                      value={formData.pays || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, pays: e.target.value })
                      }
                      placeholder="Enter country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="Logo">Logo URL</Label>
                    <Input
                      id="Logo"
                      value={formData.Logo || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, Logo: e.target.value })
                      }
                      placeholder="Enter logo URL"
                    />
                  </div>
                </>
              )}

              {/* Etablissement universityId */}
              {activeTab === "etablissements" && (
                <div>
                  <Label htmlFor="universityId">University</Label>
                  <Select
                    value={formData.universityId?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        universityId: value ? parseInt(value) : null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities?.map((uni: any) => (
                        <SelectItem key={uni.id} value={uni.id.toString()}>
                          {uni.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Departement fields */}
              {activeTab === "departements" && (
                <>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="etablissementId">Etablissement</Label>
                    <Select
                      value={formData.etablissementId?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          etablissementId: value ? parseInt(value) : null,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select etablissement" />
                      </SelectTrigger>
                      <SelectContent>
                        {etablissements?.map((etab: any) => (
                          <SelectItem key={etab.id} value={etab.id.toString()}>
                            {etab.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Laboratoire fields */}
              {activeTab === "laboratoires" && (
                <>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="univesityId">University</Label>
                    <Select
                      value={formData.univesityId?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          univesityId: value ? parseInt(value) : null,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities?.map((uni: any) => (
                          <SelectItem key={uni.id} value={uni.id.toString()}>
                            {uni.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Equipe fields */}
              {activeTab === "equipes" && (
                <>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="universityId">University</Label>
                    <Select
                      value={formData.universityId?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          universityId: value ? parseInt(value) : null,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities?.map((uni: any) => (
                          <SelectItem key={uni.id} value={uni.id.toString()}>
                            {uni.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Specialite & Thematique fields */}
              {(activeTab === "specialites" || activeTab === "thematiques") && (
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter description"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
