import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cvApi } from "@/api/cv";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Book,
  Briefcase,
  Award,
  Globe,
  Mail,
  Eye,
  EyeOff,
  GraduationCap,
  Download,
  Power,
  PowerOff,
} from "lucide-react";
import type {
  CVCreate,
  ContactCreate,
  FormationCreate,
  CompetenceCreate,
  LangueCreate,
  ExperienceCreate,
} from "@/types";

export function CVPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "contact" | "formations" | "competences" | "langues" | "experiences"
  >("contact");
  const [isCreatingCV, setIsCreatingCV] = useState(false);
  const [cvTitle, setCVTitle] = useState("");
  const [cvDescription, setCVDescription] = useState("");
  const [isEditingCV, setIsEditingCV] = useState(false);
  const [showDeleteCV, setShowDeleteCV] = useState(false);

  // CV Query
  const { data: cv, isLoading: cvLoading } = useQuery({
    queryKey: ["cv"],
    queryFn: cvApi.get,
    retry: false,
  });

  // Create CV Mutation
  const createCVMutation = useMutation({
    mutationFn: (data: CVCreate) => cvApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      setCVTitle("");
      setCVDescription("");
      setIsCreatingCV(false);
      toast.success("CV created successfully");
    },
    onError: () => toast.error("Failed to create CV"),
  });

  // Update CV Mutation
  const updateCVMutation = useMutation({
    mutationFn: (data: { titre?: string; description?: string }) =>
      cvApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      setIsEditingCV(false);
      toast.success("CV updated successfully");
    },
    onError: () => toast.error("Failed to update CV"),
  });

  // Delete CV Mutation
  const deleteCVMutation = useMutation({
    mutationFn: () => cvApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      setShowDeleteCV(false);
      toast.success("CV deleted successfully");
    },
    onError: () => toast.error("Failed to delete CV"),
  });

  // Toggle CV Public Status Mutation
  const togglePublicMutation = useMutation({
    mutationFn: (isPublic: boolean) => cvApi.setPublic(isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      toast.success("CV visibility updated");
    },
    onError: () => toast.error("Failed to update CV visibility"),
  });

  // Toggle CV Enabled Status Mutation
  const toggleEnabledMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      enabled ? cvApi.enable() : cvApi.disable(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      toast.success("CV status updated");
    },
    onError: () => toast.error("Failed to update CV status"),
  });

  const handleCreateCV = () => {
    if (!cvTitle.trim()) {
      toast.error("CV title is required");
      return;
    }
    createCVMutation.mutate({
      titre: cvTitle.trim(),
      description: cvDescription.trim() || undefined,
    });
  };

  const handleUpdateCV = () => {
    updateCVMutation.mutate({
      titre: cvTitle.trim() || cv?.titre,
      description: cvDescription.trim() || cv?.description,
    });
  };

  const handleTogglePublic = () => {
    if (cv) {
      togglePublicMutation.mutate(!cv.isPublic);
    }
  };

  const handleToggleEnabled = () => {
    if (cv) {
      toggleEnabledMutation.mutate(!cv.cv_enabled);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info("Generating PDF...");
      const blob = await cvApi.downloadPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${user?.nom}_${user?.prenom}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CV downloaded successfully");
    } catch (error) {
      toast.error("Failed to download CV");
    }
  };

  if (
    !user ||
    (user.user_type !== "enseignant" && user.user_type !== "doctorant")
  ) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">
              CV Feature Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">
              The CV builder is only available for enseignants and doctorants.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cvLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading CV...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              My CV
            </CardTitle>
            <CardDescription>Create your professional CV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4 py-12">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                You don't have a CV yet. Create one to get started.
              </p>
            </div>

            {isCreatingCV ? (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="cv-title">CV Title *</Label>
                  <Input
                    id="cv-title"
                    placeholder="e.g., Academic CV 2024"
                    value={cvTitle}
                    onChange={(e) => setCVTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="cv-description">Description (Optional)</Label>
                  <Input
                    id="cv-description"
                    placeholder="e.g., My professional CV for academic positions"
                    value={cvDescription}
                    onChange={(e) => setCVDescription(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateCV}
                    disabled={createCVMutation.isPending}
                  >
                    Create CV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingCV(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsCreatingCV(true)}
                size="lg"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create My First CV
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* CV Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-3xl">{cv.titre}</CardTitle>
              {cv.description && (
                <CardDescription className="text-base mt-2">
                  {cv.description}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePublic}
                disabled={togglePublicMutation.isPending}
              >
                {cv.isPublic ? (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Private
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleEnabled}
                disabled={toggleEnabledMutation.isPending}
                className={cv.cv_enabled ? "" : "border-red-300 text-red-700"}
              >
                {cv.cv_enabled ? (
                  <>
                    <Power className="h-4 w-4 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <PowerOff className="h-4 w-4 mr-1" />
                    Disabled
                  </>
                )}
              </Button>
              <Dialog open={isEditingCV} onOpenChange={setIsEditingCV}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit CV</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">CV Title</Label>
                      <Input
                        id="edit-title"
                        value={cvTitle || cv.titre}
                        onChange={(e) => setCVTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Input
                        id="edit-description"
                        value={cvDescription || cv.description || ""}
                        onChange={(e) => setCVDescription(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateCV}
                        disabled={updateCVMutation.isPending}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingCV(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <AlertDialog open={showDeleteCV} onOpenChange={setShowDeleteCV}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteCV(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete CV</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this CV? This action
                      cannot be undone and will remove all associated content.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2 justify-end">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteCVMutation.mutate()}
                      disabled={deleteCVMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete CV
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { id: "contact", label: "Contact", icon: Mail },
          { id: "formations", label: "Education", icon: Book },
          { id: "experiences", label: "Experience", icon: Briefcase },
          { id: "competences", label: "Skills", icon: Award },
          { id: "langues", label: "Languages", icon: Globe },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "outline"}
            onClick={() => setActiveTab(id as any)}
            className="flex items-center gap-1"
            size="sm"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === "contact" && <ContactSection cv={cv} />}
      {activeTab === "formations" && <FormationsSection cv={cv} />}
      {activeTab === "experiences" && <ExperiencesSection cv={cv} />}
      {activeTab === "competences" && <CompetencesSection cv={cv} />}
      {activeTab === "langues" && <LanguesSection cv={cv} />}
    </div>
  );
}

// ==================== CONTACT SECTION ====================
function ContactSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    telephone: "",
    adresse: "",
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["cv-contacts"],
    queryFn: async () => {
      const data = await cvApi.listContacts();
      return Array.isArray(data) ? data : [];
    },
  });

  const addContactMutation = useMutation({
    mutationFn: (data: ContactCreate) => cvApi.addContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-contacts"] });
      setFormData({ email: "", telephone: "", adresse: "" });
      setShowForm(false);
      toast.success("Contact added");
    },
    onError: () => toast.error("Failed to add contact"),
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContactCreate> }) =>
      cvApi.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-contacts"] });
      setFormData({ email: "", telephone: "", adresse: "" });
      setEditingId(null);
      setShowForm(false);
      toast.success("Contact updated");
    },
    onError: () => toast.error("Failed to update contact"),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-contacts"] });
      toast.success("Contact deleted");
    },
    onError: () => toast.error("Failed to delete contact"),
  });

  const handleAddContact = () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }
    if (editingId) {
      updateContactMutation.mutate({ id: editingId, data: formData });
    } else {
      addContactMutation.mutate(formData);
    }
  };

  const handleEdit = (contact: any) => {
    setFormData(contact);
    setEditingId(contact.id);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Information
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-blue-500 pl-4 space-y-3 bg-blue-50 p-4 rounded">
            <Input
              placeholder="Email *"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              value={formData.telephone}
              onChange={(e) =>
                setFormData({ ...formData, telephone: e.target.value })
              }
            />
            <Input
              placeholder="Address"
              value={formData.adresse}
              onChange={(e) =>
                setFormData({ ...formData, adresse: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddContact}
                disabled={
                  addContactMutation.isPending ||
                  updateContactMutation.isPending
                }
                size="sm"
              >
                {editingId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ email: "", telephone: "", adresse: "" });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact: any) => (
              <div
                key={contact.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-medium">{contact.email}</p>
                  {contact.telephone && (
                    <p className="text-sm text-muted-foreground">
                      {contact.telephone}
                    </p>
                  )}
                  {contact.adresse && (
                    <p className="text-sm text-muted-foreground">
                      {contact.adresse}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteContactMutation.mutate(contact.id)}
                    disabled={deleteContactMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No contact information yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== FORMATIONS SECTION ====================
function FormationsSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormationCreate>({
    diplome: "",
    etablissement: "",
    dateDebut: "",
    dateFin: "",
    enCours: false,
  });

  const { data: formations = [] } = useQuery({
    queryKey: ["cv-formations"],
    queryFn: async () => {
      const data = await cvApi.listFormations();
      return Array.isArray(data) ? data : [];
    },
  });

  const addFormationMutation = useMutation({
    mutationFn: (data: FormationCreate) => cvApi.addFormation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-formations"] });
      setFormData({
        diplome: "",
        etablissement: "",
        dateDebut: "",
        dateFin: "",
        enCours: false,
      });
      setShowForm(false);
      toast.success("Formation added");
    },
    onError: () => toast.error("Failed to add formation"),
  });

  const updateFormationMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<FormationCreate>;
    }) => cvApi.updateFormation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-formations"] });
      setFormData({
        diplome: "",
        etablissement: "",
        dateDebut: "",
        dateFin: "",
        enCours: false,
      });
      setEditingId(null);
      setShowForm(false);
      toast.success("Formation updated");
    },
    onError: () => toast.error("Failed to update formation"),
  });

  const deleteFormationMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteFormation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-formations"] });
      toast.success("Formation deleted");
    },
    onError: () => toast.error("Failed to delete formation"),
  });

  const handleAddFormation = () => {
    if (!formData.diplome || !formData.dateDebut) {
      toast.error("Diploma and start date are required");
      return;
    }
    const data = {
      ...formData,
      dateFin: formData.enCours ? undefined : formData.dateFin || undefined,
    };
    if (editingId) {
      updateFormationMutation.mutate({ id: editingId, data });
    } else {
      addFormationMutation.mutate(data);
    }
  };

  const handleEdit = (formation: any) => {
    setFormData(formation);
    setEditingId(formation.id);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Education
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-green-500 pl-4 space-y-3 bg-green-50 p-4 rounded">
            <Input
              placeholder="Degree *"
              value={formData.diplome}
              onChange={(e) =>
                setFormData({ ...formData, diplome: e.target.value })
              }
            />
            <Input
              placeholder="Institution"
              value={formData.etablissement}
              onChange={(e) =>
                setFormData({ ...formData, etablissement: e.target.value })
              }
            />
            <Input
              type="date"
              value={formData.dateDebut}
              onChange={(e) =>
                setFormData({ ...formData, dateDebut: e.target.value })
              }
            />
            <Input
              type="date"
              value={formData.dateFin}
              onChange={(e) =>
                setFormData({ ...formData, dateFin: e.target.value })
              }
              disabled={formData.enCours}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.enCours}
                onChange={(e) =>
                  setFormData({ ...formData, enCours: e.target.checked })
                }
              />
              <span>Currently studying</span>
            </label>
            <div className="flex gap-2">
              <Button
                onClick={handleAddFormation}
                disabled={
                  addFormationMutation.isPending ||
                  updateFormationMutation.isPending
                }
                size="sm"
              >
                {editingId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    diplome: "",
                    etablissement: "",
                    dateDebut: "",
                    dateFin: "",
                    enCours: false,
                  });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {formations.length > 0 ? (
          <div className="space-y-3">
            {formations.map((formation: any) => (
              <div
                key={formation.id}
                className="border-l-4 border-green-500 rounded-lg p-4 bg-green-50 flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-semibold text-lg">{formation.diplome}</p>
                  {formation.etablissement && (
                    <p className="text-sm text-muted-foreground">
                      {formation.etablissement}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(formation.dateDebut).toLocaleDateString()} -{" "}
                    {formation.dateFin
                      ? new Date(formation.dateFin).toLocaleDateString()
                      : "Present"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(formation)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFormationMutation.mutate(formation.id)}
                    disabled={deleteFormationMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No education added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== EXPERIENCES SECTION ====================
function ExperiencesSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExperienceCreate>({
    poste: "",
    entreprise: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    enCours: false,
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["cv-experiences"],
    queryFn: async () => {
      const data = await cvApi.listExperiences();
      return Array.isArray(data) ? data : [];
    },
  });

  const addExperienceMutation = useMutation({
    mutationFn: (data: ExperienceCreate) => cvApi.addExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-experiences"] });
      setFormData({
        poste: "",
        entreprise: "",
        description: "",
        dateDebut: "",
        dateFin: "",
        enCours: false,
      });
      setShowForm(false);
      toast.success("Experience added");
    },
    onError: () => toast.error("Failed to add experience"),
  });

  const updateExperienceMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ExperienceCreate>;
    }) => cvApi.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-experiences"] });
      setFormData({
        poste: "",
        entreprise: "",
        description: "",
        dateDebut: "",
        dateFin: "",
        enCours: false,
      });
      setEditingId(null);
      setShowForm(false);
      toast.success("Experience updated");
    },
    onError: () => toast.error("Failed to update experience"),
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-experiences"] });
      toast.success("Experience deleted");
    },
    onError: () => toast.error("Failed to delete experience"),
  });

  const handleAddExperience = () => {
    if (!formData.poste || !formData.dateDebut) {
      toast.error("Position and start date are required");
      return;
    }
    const data = {
      ...formData,
      dateFin: formData.enCours ? undefined : formData.dateFin || undefined,
    };
    if (editingId) {
      updateExperienceMutation.mutate({ id: editingId, data });
    } else {
      addExperienceMutation.mutate(data);
    }
  };

  const handleEdit = (experience: any) => {
    setFormData(experience);
    setEditingId(experience.id);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Experience
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-orange-500 pl-4 space-y-3 bg-orange-50 p-4 rounded">
            <Input
              placeholder="Position *"
              value={formData.poste}
              onChange={(e) =>
                setFormData({ ...formData, poste: e.target.value })
              }
            />
            <Input
              placeholder="Company"
              value={formData.entreprise}
              onChange={(e) =>
                setFormData({ ...formData, entreprise: e.target.value })
              }
            />
            <textarea
              className="w-full border rounded p-2 text-sm"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
            <Input
              type="date"
              value={formData.dateDebut}
              onChange={(e) =>
                setFormData({ ...formData, dateDebut: e.target.value })
              }
            />
            <Input
              type="date"
              value={formData.dateFin}
              onChange={(e) =>
                setFormData({ ...formData, dateFin: e.target.value })
              }
              disabled={formData.enCours}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.enCours}
                onChange={(e) =>
                  setFormData({ ...formData, enCours: e.target.checked })
                }
              />
              <span>Currently working here</span>
            </label>
            <div className="flex gap-2">
              <Button
                onClick={handleAddExperience}
                disabled={
                  addExperienceMutation.isPending ||
                  updateExperienceMutation.isPending
                }
                size="sm"
              >
                {editingId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    poste: "",
                    entreprise: "",
                    description: "",
                    dateDebut: "",
                    dateFin: "",
                    enCours: false,
                  });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {experiences.length > 0 ? (
          <div className="space-y-3">
            {experiences.map((experience: any) => (
              <div
                key={experience.id}
                className="border-l-4 border-orange-500 rounded-lg p-4 bg-orange-50 flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-semibold text-lg">{experience.poste}</p>
                  {experience.entreprise && (
                    <p className="text-sm text-muted-foreground">
                      {experience.entreprise}
                    </p>
                  )}
                  {experience.description && (
                    <p className="text-sm mt-2">{experience.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(experience.dateDebut).toLocaleDateString()} -{" "}
                    {experience.dateFin
                      ? new Date(experience.dateFin).toLocaleDateString()
                      : "Present"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(experience)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteExperienceMutation.mutate(experience.id)
                    }
                    disabled={deleteExperienceMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No experience added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== COMPETENCES SECTION ====================
function CompetencesSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CompetenceCreate>({
    nom: "",
    niveau: "intermediaire",
  });

  const { data: competences = [] } = useQuery({
    queryKey: ["cv-competences"],
    queryFn: async () => {
      const data = await cvApi.listCompetences();
      return Array.isArray(data) ? data : [];
    },
  });

  const addCompetenceMutation = useMutation({
    mutationFn: (data: CompetenceCreate) => cvApi.addCompetence(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-competences"] });
      setFormData({ nom: "", niveau: "intermediaire" });
      setShowForm(false);
      toast.success("Skill added");
    },
    onError: () => toast.error("Failed to add skill"),
  });

  const updateCompetenceMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CompetenceCreate>;
    }) => cvApi.updateCompetence(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-competences"] });
      setFormData({ nom: "", niveau: "intermediaire" });
      setEditingId(null);
      setShowForm(false);
      toast.success("Skill updated");
    },
    onError: () => toast.error("Failed to update skill"),
  });

  const deleteCompetenceMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteCompetence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-competences"] });
      toast.success("Skill deleted");
    },
    onError: () => toast.error("Failed to delete skill"),
  });

  const handleAddCompetence = () => {
    if (!formData.nom.trim()) {
      toast.error("Skill name is required");
      return;
    }
    if (editingId) {
      updateCompetenceMutation.mutate({ id: editingId, data: formData });
    } else {
      addCompetenceMutation.mutate(formData);
    }
  };

  const handleEdit = (competence: any) => {
    setFormData(competence);
    setEditingId(competence.id);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Skills
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-purple-500 pl-4 space-y-3 bg-purple-50 p-4 rounded">
            <Input
              placeholder="Skill name *"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
            />
            <Select
              value={formData.niveau}
              onValueChange={(value: any) =>
                setFormData({ ...formData, niveau: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debutant">Beginner</SelectItem>
                <SelectItem value="intermediaire">Intermediate</SelectItem>
                <SelectItem value="avance">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCompetence}
                disabled={
                  addCompetenceMutation.isPending ||
                  updateCompetenceMutation.isPending
                }
                size="sm"
              >
                {editingId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ nom: "", niveau: "intermediaire" });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {competences.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {competences.map((competence: any) => (
              <div
                key={competence.id}
                className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm flex items-center gap-2 group"
              >
                {competence.nom}
                <span className="text-xs opacity-75">
                  ({competence.niveau})
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(competence)}
                    className="hover:text-purple-900"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() =>
                      deleteCompetenceMutation.mutate(competence.id)
                    }
                    disabled={deleteCompetenceMutation.isPending}
                    className="hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No skills added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== LANGUES SECTION ====================
function LanguesSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<LangueCreate>({
    nom: "",
    niveau: "B1",
  });

  const { data: langues = [] } = useQuery({
    queryKey: ["cv-langues"],
    queryFn: async () => {
      const data = await cvApi.listLangues();
      return Array.isArray(data) ? data : [];
    },
  });

  const addLangueMutation = useMutation({
    mutationFn: (data: LangueCreate) => cvApi.addLangue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-langues"] });
      setFormData({ nom: "", niveau: "B1" });
      setShowForm(false);
      toast.success("Language added");
    },
    onError: () => toast.error("Failed to add language"),
  });

  const updateLangueMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LangueCreate> }) =>
      cvApi.updateLangue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-langues"] });
      setFormData({ nom: "", niveau: "B1" });
      setEditingId(null);
      setShowForm(false);
      toast.success("Language updated");
    },
    onError: () => toast.error("Failed to update language"),
  });

  const deleteLangueMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteLangue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-langues"] });
      toast.success("Language deleted");
    },
    onError: () => toast.error("Failed to delete language"),
  });

  const handleAddLangue = () => {
    if (!formData.nom.trim()) {
      toast.error("Language name is required");
      return;
    }
    if (editingId) {
      updateLangueMutation.mutate({ id: editingId, data: formData });
    } else {
      addLangueMutation.mutate(formData);
    }
  };

  const handleEdit = (langue: any) => {
    setFormData(langue);
    setEditingId(langue.id);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Languages
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-blue-500 pl-4 space-y-3 bg-blue-50 p-4 rounded">
            <Input
              placeholder="Language name *"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
            />
            <Select
              value={formData.niveau}
              onValueChange={(value: any) =>
                setFormData({ ...formData, niveau: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 (Beginner)</SelectItem>
                <SelectItem value="A2">A2 (Elementary)</SelectItem>
                <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                <SelectItem value="B2">B2 (Upper Intermediate)</SelectItem>
                <SelectItem value="C1">C1 (Advanced)</SelectItem>
                <SelectItem value="C2">C2 (Proficient)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={handleAddLangue}
                disabled={
                  addLangueMutation.isPending || updateLangueMutation.isPending
                }
                size="sm"
              >
                {editingId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ nom: "", niveau: "B1" });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {langues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {langues.map((langue: any) => (
              <div
                key={langue.id}
                className="border-l-4 border-blue-500 rounded-lg p-4 bg-blue-50 flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-semibold">{langue.nom}</p>
                  <p className="text-sm text-muted-foreground">
                    Level: {langue.niveau}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(langue)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLangueMutation.mutate(langue.id)}
                    disabled={deleteLangueMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No languages added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
