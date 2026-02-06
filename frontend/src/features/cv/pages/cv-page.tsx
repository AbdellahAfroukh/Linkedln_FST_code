import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast.success(t("cv.cvCreated"));
    },
    onError: () => toast.error(t("cv.failedToCreateCV")),
  });

  // Update CV Mutation
  const updateCVMutation = useMutation({
    mutationFn: (data: {
      description?: string;
      isPublic?: boolean;
      isEnabled?: boolean;
    }) => cvApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      setIsEditingCV(false);
      toast.success(t("cv.cvUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateCV")),
  });

  // Delete CV Mutation
  const deleteCVMutation = useMutation({
    mutationFn: () => cvApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      setShowDeleteCV(false);
      toast.success(t("cv.cvDeleted"));
    },
    onError: () => toast.error(t("cv.failedToDeleteCV")),
  });

  // Toggle CV Public Status Mutation
  const togglePublicMutation = useMutation({
    mutationFn: (isPublic: boolean) => cvApi.setPublic(isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      toast.success(t("cv.cvUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateCVVisibility")),
  });

  // Toggle CV Enabled Status Mutation
  const toggleEnabledMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      enabled ? cvApi.enable() : cvApi.disable(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      toast.success(t("cv.cvUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateCVStatus")),
  });

  const handleCreateCV = () => {
    if (!cvDescription.trim()) {
      toast.error(t("cv.cvTitleRequired"));
      return;
    }
    createCVMutation.mutate({
      description: cvDescription.trim(),
      isPublic: false,
      isEnabled: true,
    });
  };

  const handleUpdateCV = () => {
    updateCVMutation.mutate({
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
      toggleEnabledMutation.mutate(!cv.isEnabled);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info(t("cv.generatingPDF"));
      const blob = await cvApi.downloadPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${user?.nom}_${user?.prenom}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("cv.cvUpdated"));
    } catch (error) {
      toast.error(t("cv.failedToDownloadCV"));
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
              {t("cv.cvFeatureNotAvailable")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">
              {t("cv.cvOnlyForEnseignantsAndDoctorants")}
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
            <p className="text-muted-foreground">{t("cv.loadingCV")}</p>
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
              {t("cv.myCV")}
            </CardTitle>
            <CardDescription>
              {t("cv.createYourProfessionalCV")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4 py-12">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">{t("cv.noCVYet")}</p>
            </div>

            {isCreatingCV ? (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="cv-title">{t("cv.cvTitle")} *</Label>
                  <Input
                    id="cv-title"
                    placeholder={t("cv.cvTitlePlaceholder")}
                    value={cvTitle}
                    onChange={(e) => setCVTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="cv-description">
                    {t("cv.descriptionOptional")}
                  </Label>
                  <Input
                    id="cv-description"
                    placeholder={t("cv.descriptionPlaceholder")}
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
                    {t("cv.createCV")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingCV(false)}
                  >
                    {t("common.cancel")}
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
                {t("cv.createMyFirstCV")}
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
              <CardTitle className="text-3xl">{t("cv.myCV")}</CardTitle>
              {cv.description && (
                <CardDescription className="text-base mt-2">
                  {cv.description}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                {t("cv.downloadPDF")}
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
                    {t("cv.public")}
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    {t("cv.private")}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleEnabled}
                disabled={toggleEnabledMutation.isPending}
                className={cv.isEnabled ? "" : "border-red-300 text-red-700"}
              >
                {cv.isEnabled ? (
                  <>
                    <Power className="h-4 w-4 mr-1" />
                    {t("cv.enabled")}
                  </>
                ) : (
                  <>
                    <PowerOff className="h-4 w-4 mr-1" />
                    {t("cv.disabled")}
                  </>
                )}
              </Button>
              <Dialog open={isEditingCV} onOpenChange={setIsEditingCV}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-1" />
                    {t("common.edit")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("cv.editCV")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-description">
                        {t("cv.description")}
                      </Label>
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
                        {t("cv.saveChanges")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingCV(false)}
                      >
                        {t("common.cancel")}
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
                  {t("common.delete")}
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("cv.deleteCV")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("cv.deleteCVConfirmation")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2 justify-end">
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteCVMutation.mutate()}
                      disabled={deleteCVMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("cv.deleteCV")}
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
          { id: "contact", label: t("cv.contact"), icon: Mail },
          { id: "formations", label: t("cv.education"), icon: Book },
          { id: "experiences", label: t("cv.experience"), icon: Briefcase },
          { id: "competences", label: t("cv.skills"), icon: Award },
          { id: "langues", label: t("cv.languages"), icon: Globe },
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
      {activeTab === "contact" && <ContactSection />}
      {activeTab === "formations" && <FormationsSection />}
      {activeTab === "experiences" && <ExperiencesSection />}
      {activeTab === "competences" && <CompetencesSection />}
      {activeTab === "langues" && <LanguesSection />}
    </div>
  );
}

// ==================== CONTACT SECTION ====================
function ContactSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    telephone: "",
    adressePostale: "",
    siteWeb: "",
    LinkedIn: "",
    GitHub: "",
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
      setFormData({
        telephone: "",
        adressePostale: "",
        siteWeb: "",
        LinkedIn: "",
        GitHub: "",
      });
      setShowForm(false);
      toast.success(t("cv.itemAdded"));
    },
    onError: () => toast.error(t("cv.failedToAddContact")),
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContactCreate> }) =>
      cvApi.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-contacts"] });
      setFormData({
        telephone: "",
        adressePostale: "",
        siteWeb: "",
        LinkedIn: "",
        GitHub: "",
      });
      setEditingId(null);
      setShowForm(false);
      toast.success(t("cv.itemUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateContact")),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-contacts"] });
      toast.success(t("cv.itemDeleted"));
    },
    onError: () => toast.error(t("cv.failedToDeleteContact")),
  });

  const handleAddContact = () => {
    if (
      !formData.telephone &&
      !formData.adressePostale &&
      !formData.siteWeb &&
      !formData.LinkedIn &&
      !formData.GitHub
    ) {
      toast.error(t("cv.emailIsRequired"));
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
          {t("cv.contactInformation")}
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("cv.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-blue-500 pl-4 space-y-3 bg-blue-50 p-4 rounded">
            <Input
              placeholder={t("cv.phone")}
              value={formData.telephone}
              onChange={(e) =>
                setFormData({ ...formData, telephone: e.target.value })
              }
            />
            <Input
              placeholder={t("cv.address")}
              value={formData.adressePostale}
              onChange={(e) =>
                setFormData({ ...formData, adressePostale: e.target.value })
              }
            />
            <Input
              placeholder="Website"
              value={formData.siteWeb}
              onChange={(e) =>
                setFormData({ ...formData, siteWeb: e.target.value })
              }
            />
            <Input
              placeholder="LinkedIn"
              value={formData.LinkedIn}
              onChange={(e) =>
                setFormData({ ...formData, LinkedIn: e.target.value })
              }
            />
            <Input
              placeholder="GitHub"
              value={formData.GitHub}
              onChange={(e) =>
                setFormData({ ...formData, GitHub: e.target.value })
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
                {editingId ? t("common.update") : t("common.save")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    telephone: "",
                    adressePostale: "",
                    siteWeb: "",
                    LinkedIn: "",
                    GitHub: "",
                  });
                }}
                size="sm"
              >
                {t("common.cancel")}
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
                  {contact.telephone && (
                    <p className="text-sm text-muted-foreground">
                      {t("cv.phone")}: {contact.telephone}
                    </p>
                  )}
                  {contact.adressePostale && (
                    <p className="text-sm text-muted-foreground">
                      {t("cv.address")}: {contact.adressePostale}
                    </p>
                  )}
                  {contact.siteWeb && (
                    <p className="text-sm text-muted-foreground">
                      Website: {contact.siteWeb}
                    </p>
                  )}
                  {contact.LinkedIn && (
                    <p className="text-sm text-muted-foreground">
                      LinkedIn: {contact.LinkedIn}
                    </p>
                  )}
                  {contact.GitHub && (
                    <p className="text-sm text-muted-foreground">
                      GitHub: {contact.GitHub}
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
            {t("cv.noContactInfoYet")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== FORMATIONS SECTION ====================
function FormationsSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titre: "",
    etablissement: "",
    anneeDebut: "" as any,
    anneeFin: "" as any,
    description: "",
    isHigherEducation: true,
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
        titre: "",
        etablissement: "",
        anneeDebut: "" as any,
        anneeFin: "" as any,
        description: "",
        isHigherEducation: true,
      });
      setShowForm(false);
      toast.success(t("cv.itemAdded"));
    },
    onError: () => toast.error(t("cv.failedToAddFormation")),
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
        titre: "",
        etablissement: "",
        anneeDebut: "" as any,
        anneeFin: "" as any,
        description: "",
        isHigherEducation: true,
      });
      setEditingId(null);
      setShowForm(false);
      toast.success(t("cv.itemUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateFormation")),
  });

  const deleteFormationMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteFormation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-formations"] });
      toast.success(t("cv.itemDeleted"));
    },
    onError: () => toast.error(t("cv.failedToDeleteFormation")),
  });

  const handleAddFormation = () => {
    if (!formData.titre || !formData.anneeDebut) {
      toast.error(t("cv.diplomaAndStartDateRequired"));
      return;
    }
    const data: FormationCreate = {
      titre: formData.titre,
      etablissement: formData.etablissement,
      anneeDebut: parseInt(formData.anneeDebut as any) || 0,
      anneeFin: formData.anneeFin
        ? parseInt(formData.anneeFin as any)
        : undefined,
      description: formData.description,
      isHigherEducation: formData.isHigherEducation,
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
          {t("cv.education")}
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("cv.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-green-500 pl-4 space-y-3 bg-green-50 p-4 rounded">
            <Input
              placeholder={t("cv.degreeRequired")}
              value={formData.titre}
              onChange={(e) =>
                setFormData({ ...formData, titre: e.target.value })
              }
            />
            <Input
              placeholder={t("cv.institution")}
              value={formData.etablissement}
              onChange={(e) =>
                setFormData({ ...formData, etablissement: e.target.value })
              }
            />
            <Input
              placeholder="Start Year"
              type="number"
              value={formData.anneeDebut}
              onChange={(e) =>
                setFormData({ ...formData, anneeDebut: e.target.value as any })
              }
            />
            <Input
              placeholder="End Year"
              type="number"
              value={formData.anneeFin}
              onChange={(e) =>
                setFormData({ ...formData, anneeFin: e.target.value as any })
              }
            />
            <textarea
              className="w-full border rounded p-2 text-sm"
              placeholder={t("cv.description")}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isHigherEducation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isHigherEducation: e.target.checked,
                  })
                }
              />
              <span>Higher Education</span>
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
                    titre: "",
                    etablissement: "",
                    anneeDebut: "" as any,
                    anneeFin: "" as any,
                    description: "",
                    isHigherEducation: true,
                  });
                }}
                size="sm"
              >
                {t("common.cancel")}
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
                  <p className="font-semibold text-lg">{formation.titre}</p>
                  {formation.etablissement && (
                    <p className="text-sm text-muted-foreground">
                      {formation.etablissement}
                    </p>
                  )}
                  {formation.description && (
                    <p className="text-sm mt-1">{formation.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formation.anneeDebut} -{" "}
                    {formation.anneeFin || t("cv.present")}
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
            {t("cv.noEducationAdded")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== EXPERIENCES SECTION ====================
function ExperiencesSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExperienceCreate>({
    titre: "",
    entreprise: "",
    description: "",
    dateDebut: "",
    dateFin: "",
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
        titre: "",
        entreprise: "",
        description: "",
        dateDebut: "",
        dateFin: "",
      });
      setShowForm(false);
      toast.success(t("cv.itemAdded"));
    },
    onError: () => toast.error(t("cv.failedToAddExperience")),
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
        titre: "",
        entreprise: "",
        description: "",
        dateDebut: "",
        dateFin: "",
      });
      setEditingId(null);
      setShowForm(false);
      toast.success(t("cv.itemUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateExperience")),
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-experiences"] });
      toast.success(t("cv.itemDeleted"));
    },
    onError: () => toast.error(t("cv.failedToDeleteExperience")),
  });

  const handleAddExperience = () => {
    if (!formData.titre || !formData.dateDebut) {
      toast.error(t("cv.positionAndStartDateRequired"));
      return;
    }
    if (editingId) {
      updateExperienceMutation.mutate({ id: editingId, data: formData });
    } else {
      addExperienceMutation.mutate(formData);
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
          {t("cv.experience")}
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("cv.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-orange-500 pl-4 space-y-3 bg-orange-50 p-4 rounded">
            <Input
              placeholder={t("cv.positionRequired")}
              value={formData.titre}
              onChange={(e) =>
                setFormData({ ...formData, titre: e.target.value })
              }
            />
            <Input
              placeholder={t("cv.company")}
              value={formData.entreprise}
              onChange={(e) =>
                setFormData({ ...formData, entreprise: e.target.value })
              }
            />
            <textarea
              className="w-full border rounded p-2 text-sm"
              placeholder={t("cv.description")}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={formData.dateDebut}
              onChange={(e) =>
                setFormData({ ...formData, dateDebut: e.target.value })
              }
            />
            <Input
              type="date"
              placeholder="End Date (optional)"
              value={formData.dateFin}
              onChange={(e) =>
                setFormData({ ...formData, dateFin: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddExperience}
                disabled={
                  addExperienceMutation.isPending ||
                  updateExperienceMutation.isPending
                }
                size="sm"
              >
                {editingId ? t("common.update") : t("common.save")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    titre: "",
                    entreprise: "",
                    description: "",
                    dateDebut: "",
                    dateFin: "",
                  });
                }}
                size="sm"
              >
                {t("common.cancel")}
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
                  <p className="font-semibold text-lg">{experience.titre}</p>
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
                      : t("cv.present")}
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
            {t("cv.noExperienceAdded")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== COMPETENCES SECTION ====================
function CompetencesSection() {
  const { t } = useTranslation();
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
      toast.success(t("cv.itemAdded"));
    },
    onError: () => toast.error(t("cv.failedToAddSkill")),
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
      toast.success(t("cv.itemUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateSkill")),
  });

  const deleteCompetenceMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteCompetence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-competences"] });
      toast.success(t("cv.itemDeleted"));
    },
    onError: () => toast.error(t("cv.failedToDeleteSkill")),
  });

  const handleAddCompetence = () => {
    if (!formData.nom.trim()) {
      toast.error(t("cv.skillNameRequired"));
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
          {t("cv.skills")}
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("cv.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-purple-500 pl-4 space-y-3 bg-purple-50 p-4 rounded">
            <Input
              placeholder={t("cv.skillNameRequired")}
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
                <SelectItem value="debutant">{t("cv.beginner")}</SelectItem>
                <SelectItem value="intermediaire">
                  {t("cv.intermediate")}
                </SelectItem>
                <SelectItem value="avance">{t("cv.advanced")}</SelectItem>
                <SelectItem value="expert">{t("cv.expert")}</SelectItem>
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
                {editingId ? t("common.update") : t("common.save")}
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
                {t("common.cancel")}
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
            {t("cv.noSkillsAdded")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== LANGUES SECTION ====================
function LanguesSection() {
  const { t } = useTranslation();
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
      toast.success(t("cv.itemAdded"));
    },
    onError: () => toast.error(t("cv.failedToAddLanguage")),
  });

  const updateLangueMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LangueCreate> }) =>
      cvApi.updateLangue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-langues"] });
      setFormData({ nom: "", niveau: "B1" });
      setEditingId(null);
      setShowForm(false);
      toast.success(t("cv.itemUpdated"));
    },
    onError: () => toast.error(t("cv.failedToUpdateLanguage")),
  });

  const deleteLangueMutation = useMutation({
    mutationFn: (id: number) => cvApi.deleteLangue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-langues"] });
      toast.success(t("cv.itemDeleted"));
    },
    onError: () => toast.error(t("cv.failedToDeleteLanguage")),
  });

  const handleAddLangue = () => {
    if (!formData.nom.trim()) {
      toast.error(t("cv.languageNameRequired"));
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
          {t("cv.languages")}
        </CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("cv.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border-l-4 border-blue-500 pl-4 space-y-3 bg-blue-50 p-4 rounded">
            <Input
              placeholder={t("cv.languageNameRequired")}
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
                <SelectItem value="A1">{t("cv.a1Beginner")}</SelectItem>
                <SelectItem value="A2">{t("cv.a2Elementary")}</SelectItem>
                <SelectItem value="B1">{t("cv.b1Intermediate")}</SelectItem>
                <SelectItem value="B2">
                  {t("cv.b2UpperIntermediate")}
                </SelectItem>
                <SelectItem value="C1">{t("cv.c1Advanced")}</SelectItem>
                <SelectItem value="C2">{t("cv.c2Proficient")}</SelectItem>
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
                {editingId ? t("common.update") : t("common.save")}
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
                {t("common.cancel")}
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
                    {t("cv.level")}: {langue.niveau}
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
            {t("cv.noLanguagesAdded")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
