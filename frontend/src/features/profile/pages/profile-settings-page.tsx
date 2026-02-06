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
import { transformUrl } from "@/lib/url-utils";
import { useTranslation } from "react-i18next";

const profileUpdateSchema = z.object({
  nom: z.string().min(1, "profile.lastNameRequired"),
  prenom: z.string().min(1, "profile.firstNameRequired"),
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
  password: z.string().min(1, "profile.passwordRequired"),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
type Disable2FAForm = z.infer<typeof disable2FASchema>;

export function ProfileSettingsPage() {
  const { t } = useTranslation();
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
      toast.success(t("profile.profileUpdated"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || t("profile.failedToUpdateProfile"),
      );
    },
  });

  // 2FA setup mutation
  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (data) => {
      setQrCode(data.qr_code);
      setOtpSecret(data.secret);
      setShow2FASetup(true);
      toast.success(t("profile.scanQRCode"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || t("profile.failedToSetup2FA"),
      );
    },
  });

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: (token: string) =>
      authApi.enable2FA({ token, email: user?.email || "" }),
    onSuccess: async () => {
      toast.success(t("profile.2FAEnabled"));
      setShow2FASetup(false);
      setQrCode(null);
      setOtpSecret(null);
      setOtpToken("");
      // Refresh user data
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || t("profile.invalidOTP"));
    },
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: authApi.disable2FA,
    onSuccess: async () => {
      toast.success(t("profile.2FADisabled"));
      disable2FAForm.reset();
      // Refresh user data
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || t("profile.failedToDisable2FA"),
      );
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
      toast.error(t("profile.enterOTP"));
      return;
    }
    enable2FAMutation.mutate(otpToken);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {t("profile.profileSettings")}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            {t("profile.profileInformation")}
          </Button>
          <Button
            variant={activeTab === "security" ? "default" : "outline"}
            onClick={() => setActiveTab("security")}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {t("profile.security")}
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
                      src={transformUrl(profilePhotoUrl)}
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
                  <CardTitle>{t("profile.updateProfileInformation")}</CardTitle>
                  <CardDescription>
                    {t("profile.updateDescription")}
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
                    <Label htmlFor="prenom">{t("profile.firstName")} *</Label>
                    <Input
                      id="prenom"
                      placeholder={t("profile.firstNamePlaceholder")}
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
                    <Label htmlFor="nom">{t("profile.lastName")} *</Label>
                    <Input
                      id="nom"
                      placeholder={t("profile.lastNamePlaceholder")}
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
                    <Label htmlFor="grade">{t("profile.grade")}</Label>
                    <Input
                      id="grade"
                      placeholder={t("profile.gradePlaceholder")}
                      value={profileForm.watch("grade") || ""}
                      onChange={(e) =>
                        profileForm.setValue("grade", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="dateDeNaissance">
                    {t("profile.dateOfBirth")}
                  </Label>
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
                  label={t("profile.profilePhoto")}
                  type="image"
                  currentUrl={profileForm.watch("photoDeProfil") || ""}
                  onUploadSuccess={(url) =>
                    profileForm.setValue("photoDeProfil", url)
                  }
                />

                <div className="space-y-2">
                  <Label htmlFor="universityId">
                    {t("profile.university")}
                  </Label>
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
                    <option value="">{t("profile.selectUniversity")}</option>
                    {universities?.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etablissementId">
                    {t("profile.etablissement")}
                  </Label>
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
                    <option value="">{t("profile.selectEtablissement")}</option>
                    {filteredEtablissements?.map((etab) => (
                      <option key={etab.id} value={etab.id}>
                        {etab.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departementId">
                    {t("profile.departement")}
                  </Label>
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
                    <option value="">{t("profile.selectDepartement")}</option>
                    {filteredDepartements?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laboratoireId">
                    {t("profile.laboratoire")}
                  </Label>
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
                    <option value="">{t("profile.selectLaboratoire")}</option>
                    {filteredLaboratoires?.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipeId">{t("profile.equipe")}</Label>
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
                    <option value="">{t("profile.selectEquipe")}</option>
                    {filteredEquipes?.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.specialites")}</Label>
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
                  <Label>{t("profile.thematiques")}</Label>
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
                    <Label htmlFor="numeroDeSomme">
                      {t("profile.numeroDeSomme")}
                    </Label>
                    <Input
                      id="numeroDeSomme"
                      placeholder={t("profile.numeroDeSommePlaceholder")}
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
                  {t("profile.updateProfile")}
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
                <CardTitle>{t("profile.twoFactorAuth")}</CardTitle>
                <CardDescription>
                  {t("profile.twoFactorAuthDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{t("profile.2FAStatus")}</p>
                      <p className="text-sm text-gray-600">
                        {user?.otp_configured
                          ? t("profile.enabled")
                          : t("profile.disabled")}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        user?.otp_configured
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user?.otp_configured
                        ? t("profile.active")
                        : t("profile.inactive")}
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
                          {t("profile.enable2FA")}
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center">
                            <p className="font-medium mb-2">
                              {t("profile.scanQRInstruction")}
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
                                {t("profile.orEnterSecret")}{" "}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                  {otpSecret}
                                </code>
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="otpToken">
                              {t("profile.enter6DigitCode")}
                            </Label>
                            <Input
                              id="otpToken"
                              placeholder={t("profile.otpPlaceholder")}
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
                              {t("profile.verifyAndEnable")}
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
                              {t("common.cancel")}
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
                          {t("profile.enterPasswordToDisable2FA")}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={t("profile.yourPassword")}
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
                        {t("profile.disable2FA")}
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
