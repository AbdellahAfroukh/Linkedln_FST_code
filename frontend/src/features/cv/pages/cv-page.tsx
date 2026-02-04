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
    | "overview"
    | "contact"
    | "formations"
    | "competences"
    | "langues"
    | "experiences"
  >("overview");
  const [isCreatingCV, setIsCreatingCV] = useState(false);
  const [cvTitle, setCVTitle] = useState("");
  const [cvDescription, setCVDescription] = useState("");

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

  // Toggle CV Public Status Mutation
  const togglePublicMutation = useMutation({
    mutationFn: (isPublic: boolean) => cvApi.setPublic(isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
      toast.success("CV visibility updated");
    },
    onError: () => toast.error("Failed to update CV visibility"),
  });

  const handleTogglePublic = () => {
    if (cv) {
      togglePublicMutation.mutate(!cv.isPublic);
    }
  };

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
            <div>
              <CardTitle className="text-3xl">{cv.titre}</CardTitle>
              {cv.description && (
                <CardDescription className="text-base mt-2">
                  {cv.description}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
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

// Contact Section Component
function ContactSection({ cv }: { cv: any }) {
  const [contact, setContact] = useState<any>(null);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    telephone: "",
    adresse: "",
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["cv-contacts"],
    queryFn: cvApi.listContacts,
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

  const handleAddContact = () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }
    addContactMutation.mutate(formData);
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
                disabled={addContactMutation.isPending}
                size="sm"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
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
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >
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

// Formations Section Component
function FormationsSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormationCreate>({
    diplome: "",
    etablissement: "",
    dateDebut: "",
    dateFin: "",
    enCours: false,
  });

  const { data: formations = [] } = useQuery({
    queryKey: ["cv-formations"],
    queryFn: cvApi.listFormations,
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

  const handleAddFormation = () => {
    if (!formData.diplome || !formData.dateDebut) {
      toast.error("Diploma and start date are required");
      return;
    }
    const data = {
      ...formData,
      dateFin: formData.enCours ? undefined : formData.dateFin || undefined,
    };
    addFormationMutation.mutate(data);
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
                disabled={addFormationMutation.isPending}
                size="sm"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
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
                className="border-l-4 border-green-500 rounded-lg p-4 bg-green-50"
              >
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

// Experiences Section Component
function ExperiencesSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
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
    queryFn: cvApi.listExperiences,
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

  const handleAddExperience = () => {
    if (!formData.poste || !formData.dateDebut) {
      toast.error("Position and start date are required");
      return;
    }
    const data = {
      ...formData,
      dateFin: formData.enCours ? undefined : formData.dateFin || undefined,
    };
    addExperienceMutation.mutate(data);
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
                disabled={addExperienceMutation.isPending}
                size="sm"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
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
                className="border-l-4 border-orange-500 rounded-lg p-4 bg-orange-50"
              >
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

// Competences Section Component
function CompetencesSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CompetenceCreate>({
    nom: "",
    niveau: "intermediaire",
  });

  const { data: competences = [] } = useQuery({
    queryKey: ["cv-competences"],
    queryFn: cvApi.listCompetences,
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

  const handleAddCompetence = () => {
    if (!formData.nom.trim()) {
      toast.error("Skill name is required");
      return;
    }
    addCompetenceMutation.mutate(formData);
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
                disabled={addCompetenceMutation.isPending}
                size="sm"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
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
                className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm flex items-center gap-2"
              >
                {competence.nom}
                <span className="text-xs opacity-75">
                  ({competence.niveau})
                </span>
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

// Langues Section Component
function LanguesSection({ cv }: { cv: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LangueCreate>({
    nom: "",
    niveau: "B1",
  });

  const { data: langues = [] } = useQuery({
    queryKey: ["cv-langues"],
    queryFn: cvApi.listLangues,
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

  const handleAddLangue = () => {
    if (!formData.nom.trim()) {
      toast.error("Language name is required");
      return;
    }
    addLangueMutation.mutate(formData);
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
                disabled={addLangueMutation.isPending}
                size="sm"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
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
                className="border-l-4 border-blue-500 rounded-lg p-4 bg-blue-50"
              >
                <p className="font-semibold">{langue.nom}</p>
                <p className="text-sm text-muted-foreground">
                  Level: {langue.niveau}
                </p>
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
