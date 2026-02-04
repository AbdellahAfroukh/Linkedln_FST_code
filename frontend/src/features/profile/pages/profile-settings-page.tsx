import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, organizationsApi } from "@/api/auth";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, User } from "lucide-react";
import { FileUpload } from "@/components/file-upload";

const profileUpdateSchema = z.object({
  nom: z.string().min(1, "Last name is required"),
  prenom: z.string().min(1, "First name is required"),
  grade: z.string().optional().nullable(),
  dateDeNaissance: z.string().optional().nullable(),
  photoDeProfil: z.string().optional().nullable(),
  universityId: z.number().optional().nullable(),
  etablissementId: z.number().optional().nullable(),
  departementId: z.number().optional().nullable(),
  laboratoireId: z.number().optional().nullable(),
  equipeId: z.number().optional().nullable(),
  specialiteIds: z.array(z.number()).optional(),
  thematiqueDeRechercheIds: z.array(z.number()).optional(),
  numeroDeSomme: z.string().optional().nullable(),
});

const disable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
type Disable2FAForm = z.infer<typeof disable2FASchema>;

export function ProfileSettingsPage() {
  const { user, setUser, fetchUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [otpSecret, setOtpSecret] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState("");
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(user?.universityId || null);
  const [selectedEtablissementId, setSelectedEtablissementId] = useState<
    number | null
  >(user?.etablissementId || null);
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "U";

  // Force refresh user data on mount to get latest from backend
  useEffect(() => {
    fetchUser();
  }, []);

  const profileForm = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      grade: "",
      dateDeNaissance: "",
      photoDeProfil: "",
      universityId: null,
      etablissementId: null,
      departementId: null,
      laboratoireId: null,
      equipeId: null,
      specialiteIds: [],
      thematiqueDeRechercheIds: [],
      numeroDeSomme: "",
    },
  });
  const profilePhotoUrl =
    profileForm.watch("photoDeProfil") || user?.photoDeProfil;

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      const formData = {
        nom: user.nom || "",
        prenom: user.prenom || "",
        grade: user.grade || "",
        dateDeNaissance: user.dateDeNaissance || "",
        photoDeProfil: user.photoDeProfil || "",
        universityId: user.universityId || null,
        etablissementId: user.etablissementId || null,
        departementId: user.departementId || null,
        laboratoireId: user.laboratoireId || null,
        equipeId: user.equipeId || null,
        specialiteIds: user.specialite?.map((s) => s.id) || [],
        thematiqueDeRechercheIds:
          user.thematiqueDeRecherche?.map((t) => t.id) || [],
        numeroDeSomme: user.numeroDeSomme || "",
      };
      profileForm.reset(formData);
      setSelectedUniversityId(user.universityId || null);
      setSelectedEtablissementId(user.etablissementId || null);
    }
  }, [user]);

  const disable2FAForm = useForm<Disable2FAForm>({
    resolver: zodResolver(disable2FASchema),
    defaultValues: {
      password: "",
    },
  });

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

  const { data: specialites } = useQuery({
    queryKey: ["specialites"],
    queryFn: organizationsApi.getSpecialites,
  });

  const { data: thematiques } = useQuery({
    queryKey: ["thematiques"],
    queryFn: organizationsApi.getThematiques,
  });

  // Filter data by selections
  const filteredEtablissements = etablissements?.filter(
    (etab) =>
      !selectedUniversityId || etab.universityId === selectedUniversityId,
  );

  const filteredDepartements = departements?.filter(
    (dept) =>
      !selectedEtablissementId ||
      dept.etablissementId === selectedEtablissementId,
  );

  const filteredEquipes = equipes?.filter(
    (equipe) =>
      !selectedUniversityId || equipe.universityId === selectedUniversityId,
  );

  const filteredLaboratoires = laboratoires?.filter(
    (lab) => !selectedUniversityId || lab.universityId === selectedUniversityId,
  );

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.completeProfile,
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    },
  });

  // 2FA setup mutation
  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (data) => {
      setQrCode(data.qr_code);
      setOtpSecret(data.secret);
      setShow2FASetup(true);
      toast.success("Scan the QR code with your authenticator app");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to setup 2FA");
    },
  });

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: (token: string) =>
      authApi.enable2FA({ token, email: user?.email || "" }),
    onSuccess: async () => {
      toast.success("2FA enabled successfully!");
      setShow2FASetup(false);
      setQrCode(null);
      setOtpSecret(null);
      setOtpToken("");
      // Refresh user data
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Invalid OTP token");
    },
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: authApi.disable2FA,
    onSuccess: async () => {
      toast.success("2FA disabled successfully!");
      disable2FAForm.reset();
      // Refresh user data
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to disable 2FA");
    },
  });

  const onProfileSubmit = (data: ProfileUpdateForm) => {
    const payload = {
      ...data,
      grade: data.grade || null,
      dateDeNaissance: data.dateDeNaissance || null,
      photoDeProfil: data.photoDeProfil || null,
      numeroDeSomme: data.numeroDeSomme || null,
      universityId: data.universityId || null,
      etablissementId: data.etablissementId || null,
      departementId: data.departementId || null,
      laboratoireId: data.laboratoireId || null,
      equipeId: data.equipeId || null,
      specialiteIds: data.specialiteIds || [],
      thematiqueDeRechercheIds: data.thematiqueDeRechercheIds || [],
    };
    updateProfileMutation.mutate(payload);
  };

  const onDisable2FASubmit = (data: Disable2FAForm) => {
    disable2FAMutation.mutate(data);
  };

  const handleSetup2FA = () => {
    setup2FAMutation.mutate();
  };

  const handleEnable2FA = () => {
    if (!otpToken) {
      toast.error("Please enter the OTP token");
      return;
    }
    enable2FAMutation.mutate(otpToken);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile Information
          </Button>
          <Button
            variant={activeTab === "security" ? "default" : "outline"}
            onClick={() => setActiveTab("security")}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Security (2FA)
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={user?.fullName || "User"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600">
                      {userInitials}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle>Update Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal and organizational information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">First Name *</Label>
                    <Input
                      id="prenom"
                      placeholder="John"
                      value={profileForm.watch("prenom") || ""}
                      onChange={(e) =>
                        profileForm.setValue("prenom", e.target.value)
                      }
                    />
                    {profileForm.formState.errors.prenom && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.prenom.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nom">Last Name *</Label>
                    <Input
                      id="nom"
                      placeholder="Doe"
                      value={profileForm.watch("nom") || ""}
                      onChange={(e) =>
                        profileForm.setValue("nom", e.target.value)
                      }
                    />
                    {profileForm.formState.errors.nom && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.nom.message}
                      </p>
                    )}
                  </div>
                </div>

                {user?.user_type === "enseignant" && (
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      placeholder="Professor, Assistant Professor, etc."
                      value={profileForm.watch("grade") || ""}
                      onChange={(e) =>
                        profileForm.setValue("grade", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="dateDeNaissance">Date of Birth</Label>
                  <Input
                    id="dateDeNaissance"
                    type="date"
                    value={profileForm.watch("dateDeNaissance") || ""}
                    onChange={(e) =>
                      profileForm.setValue("dateDeNaissance", e.target.value)
                    }
                  />
                </div>

                <FileUpload
                  label="Profile Photo"
                  type="image"
                  currentUrl={profileForm.watch("photoDeProfil") || ""}
                  onUploadSuccess={(url) =>
                    profileForm.setValue("photoDeProfil", url)
                  }
                />

                <div className="space-y-2">
                  <Label htmlFor="universityId">University</Label>
                  <select
                    id="universityId"
                    className="w-full px-3 py-2 border rounded-md"
                    value={profileForm.watch("universityId") || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setSelectedUniversityId(value);
                      profileForm.setValue("universityId", value);
                      profileForm.setValue("etablissementId", null);
                      setSelectedEtablissementId(null);
                    }}
                  >
                    <option value="">Select University</option>
                    {universities?.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etablissementId">Etablissement</Label>
                  <select
                    id="etablissementId"
                    className="w-full px-3 py-2 border rounded-md"
                    value={profileForm.watch("etablissementId") || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setSelectedEtablissementId(value);
                      profileForm.setValue("etablissementId", value);
                      profileForm.setValue("departementId", null);
                    }}
                    disabled={!selectedUniversityId}
                  >
                    <option value="">Select Etablissement</option>
                    {filteredEtablissements?.map((etab) => (
                      <option key={etab.id} value={etab.id}>
                        {etab.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departementId">Departement</Label>
                  <select
                    id="departementId"
                    className="w-full px-3 py-2 border rounded-md"
                    value={profileForm.watch("departementId") || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;
                      profileForm.setValue("departementId", value);
                    }}
                    disabled={!selectedEtablissementId}
                  >
                    <option value="">Select Departement</option>
                    {filteredDepartements?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laboratoireId">Laboratoire</Label>
                  <select
                    id="laboratoireId"
                    className="w-full px-3 py-2 border rounded-md"
                    value={profileForm.watch("laboratoireId") || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;
                      profileForm.setValue("laboratoireId", value);
                    }}
                    disabled={!selectedUniversityId}
                  >
                    <option value="">Select Laboratoire</option>
                    {filteredLaboratoires?.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipeId">Equipe</Label>
                  <select
                    id="equipeId"
                    className="w-full px-3 py-2 border rounded-md"
                    value={profileForm.watch("equipeId") || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;
                      profileForm.setValue("equipeId", value);
                    }}
                    disabled={!selectedUniversityId}
                  >
                    <option value="">Select Equipe</option>
                    {filteredEquipes?.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Specialites (Select all that apply)</Label>
                  <div className="border rounded-md p-4 max-h-48 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-1 gap-2">
                      {specialites?.map((spec) => (
                        <label
                          key={spec.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={
                              profileForm
                                .watch("specialiteIds")
                                ?.includes(spec.id) || false
                            }
                            onChange={(e) => {
                              const current =
                                profileForm.watch("specialiteIds") || [];
                              if (e.target.checked) {
                                profileForm.setValue("specialiteIds", [
                                  ...current,
                                  spec.id,
                                ]);
                              } else {
                                profileForm.setValue(
                                  "specialiteIds",
                                  current.filter((id) => id !== spec.id),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{spec.nom}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Thematiques de Recherche (Select all that apply)
                  </Label>
                  <div className="border rounded-md p-4 max-h-48 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-1 gap-2">
                      {thematiques?.map((them) => (
                        <label
                          key={them.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={
                              profileForm
                                .watch("thematiqueDeRechercheIds")
                                ?.includes(them.id) || false
                            }
                            onChange={(e) => {
                              const current =
                                profileForm.watch("thematiqueDeRechercheIds") ||
                                [];
                              if (e.target.checked) {
                                profileForm.setValue(
                                  "thematiqueDeRechercheIds",
                                  [...current, them.id],
                                );
                              } else {
                                profileForm.setValue(
                                  "thematiqueDeRechercheIds",
                                  current.filter((id) => id !== them.id),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{them.nom}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {user?.user_type === "enseignant" && (
                  <div className="space-y-2">
                    <Label htmlFor="numeroDeSomme">Numero de Somme</Label>
                    <Input
                      id="numeroDeSomme"
                      placeholder="Enter numero de somme"
                      value={profileForm.watch("numeroDeSomme") || ""}
                      onChange={(e) =>
                        profileForm.setValue("numeroDeSomme", e.target.value)
                      }
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">2FA Status</p>
                      <p className="text-sm text-gray-600">
                        {user?.otp_configured ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        user?.otp_configured
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user?.otp_configured ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {!user?.otp_configured ? (
                    <div className="space-y-4">
                      {!show2FASetup ? (
                        <Button
                          onClick={handleSetup2FA}
                          disabled={setup2FAMutation.isPending}
                          className="w-full"
                        >
                          {setup2FAMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Enable 2FA
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center">
                            <p className="font-medium mb-2">
                              Scan this QR code with your authenticator app
                            </p>
                            {qrCode && (
                              <div className="flex justify-center mb-4">
                                <img
                                  src={qrCode}
                                  alt="QR Code"
                                  className="border rounded-lg"
                                />
                              </div>
                            )}
                            {otpSecret && (
                              <p className="text-sm text-gray-600 mb-4">
                                Or enter this secret key manually:{" "}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                  {otpSecret}
                                </code>
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="otpToken">
                              Enter the 6-digit code from your app
                            </Label>
                            <Input
                              id="otpToken"
                              placeholder="123456"
                              value={otpToken}
                              onChange={(e) => setOtpToken(e.target.value)}
                              maxLength={6}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleEnable2FA}
                              disabled={enable2FAMutation.isPending}
                              className="flex-1"
                            >
                              {enable2FAMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Verify and Enable
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShow2FASetup(false);
                                setQrCode(null);
                                setOtpSecret(null);
                                setOtpToken("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form
                      onSubmit={disable2FAForm.handleSubmit(onDisable2FASubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          Enter your password to disable 2FA
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Your password"
                          {...disable2FAForm.register("password")}
                        />
                        {disable2FAForm.formState.errors.password && (
                          <p className="text-sm text-red-600">
                            {disable2FAForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={disable2FAMutation.isPending}
                        className="w-full"
                      >
                        {disable2FAMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Disable 2FA
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
