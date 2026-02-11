import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  nom: z.string().min(1, "Last name is required"),
  prenom: z.string().min(1, "First name is required"),
  universityId: z.number().optional().nullable(),
  etablissementId: z.number().optional().nullable(),
  departementId: z.number().optional().nullable(),
  laboratoireId: z.number().optional().nullable(),
  equipeId: z.number().optional().nullable(),
  specialiteIds: z.array(z.number()).optional(),
  thematiqueDeRechercheIds: z.array(z.number()).optional(),
  numeroDeSomme: z.string().optional().nullable(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(null);
  const [selectedEtablissementId, setSelectedEtablissementId] = useState<
    number | null
  >(null);

  // Redirect admin users to admin dashboard
  if (user?.user_type === "admin") {
    navigate("/admin");
    return null;
  }

  // Redirect users who already completed their profile
  if (user?.profile_completed) {
    navigate("/dashboard");
    return null;
  }

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: "",
      prenom: "",
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

  // Fetch all organization data
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

  // Filter etablissements by selected university
  const filteredEtablissements = etablissements?.filter(
    (etab) =>
      !selectedUniversityId || etab.universityId === selectedUniversityId,
  );

  // Filter departements by selected etablissement
  const filteredDepartements = departements?.filter(
    (dept) =>
      !selectedEtablissementId ||
      dept.etablissementId === selectedEtablissementId,
  );

  // Filter equipes and laboratoires by selected university
  const filteredEquipes = equipes?.filter(
    (equipe) =>
      !selectedUniversityId || equipe.universityId === selectedUniversityId,
  );

  const filteredLaboratoires = laboratoires?.filter(
    (lab) => !selectedUniversityId || lab.universityId === selectedUniversityId,
  );

  const completeMutation = useMutation({
    mutationFn: authApi.completeProfile,
    onSuccess: (data) => {
      setUser(data);
      toast.success("Profile completed successfully!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to complete profile");
    },
  });

  const onSubmit = (data: ProfileForm) => {
    // Convert empty strings to null
    const payload = {
      ...data,
      numeroDeSomme: data.numeroDeSomme || null,
      universityId: data.universityId || null,
      etablissementId: data.etablissementId || null,
      departementId: data.departementId || null,
      laboratoireId: data.laboratoireId || null,
      equipeId: data.equipeId || null,
      specialiteIds: data.specialiteIds || [],
      thematiqueDeRechercheIds: data.thematiqueDeRechercheIds || [],
    };
    completeMutation.mutate(payload);
  };

  const isEnseignant = user?.user_type === "enseignant";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please fill in your profile information to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">First Name *</Label>
                  <Input
                    id="prenom"
                    placeholder="John"
                    {...form.register("prenom")}
                  />
                  {form.formState.errors.prenom && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.prenom.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom">Last Name *</Label>
                  <Input id="nom" placeholder="Doe" {...form.register("nom")} />
                  {form.formState.errors.nom && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.nom.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="universityId">University</Label>
                <select
                  id="universityId"
                  className="w-full px-3 py-2 border rounded-md"
                  {...form.register("universityId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : null;
                    setSelectedUniversityId(value);
                    form.setValue("universityId", value);
                    form.setValue("etablissementId", null);
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
                  {...form.register("etablissementId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : null;
                    setSelectedEtablissementId(value);
                    form.setValue("etablissementId", value);
                    form.setValue("departementId", null);
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
                  {...form.register("departementId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
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
                  {...form.register("laboratoireId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
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
                  {...form.register("equipeId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
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
                            form.watch("specialiteIds")?.includes(spec.id) ||
                            false
                          }
                          onChange={(e) => {
                            const current = form.watch("specialiteIds") || [];
                            if (e.target.checked) {
                              form.setValue("specialiteIds", [
                                ...current,
                                spec.id,
                              ]);
                            } else {
                              form.setValue(
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
                <Label>Thematiques de Recherche (Select all that apply)</Label>
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
                            form
                              .watch("thematiqueDeRechercheIds")
                              ?.includes(them.id) || false
                          }
                          onChange={(e) => {
                            const current =
                              form.watch("thematiqueDeRechercheIds") || [];
                            if (e.target.checked) {
                              form.setValue("thematiqueDeRechercheIds", [
                                ...current,
                                them.id,
                              ]);
                            } else {
                              form.setValue(
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

              {isEnseignant && (
                <div className="space-y-2">
                  <Label htmlFor="numeroDeSomme">
                    Numero de Somme (Required for Enseignant)
                  </Label>
                  <Input
                    id="numeroDeSomme"
                    placeholder="Enter your numero de somme"
                    {...form.register("numeroDeSomme")}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Complete Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
