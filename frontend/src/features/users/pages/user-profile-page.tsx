import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { transformUrl } from "@/lib/url-utils";

export function UserProfilePage() {
  const { userId } = useParams();
  const numericId = Number(userId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "profile", numericId],
    queryFn: () => usersApi.getProfile(numericId),
    enabled: Number.isFinite(numericId),
  });

  const user = data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Button variant="outline" asChild>
          <Link to="/projets">Back to Projects</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          )}
          {isError && (
            <p className="text-sm text-red-600">Failed to load profile.</p>
          )}
          {!isLoading && !isError && user && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
                  {user.photoDeProfil ? (
                    <img
                      src={transformUrl(user.photoDeProfil)}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600">
                      {user.fullName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-lg font-semibold">{user.fullName}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.user_type}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Grade:</span>
                  <p className="font-medium">{user.grade || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-600">University:</span>
                  <p className="font-medium">{user.university?.nom || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Etablissement:</span>
                  <p className="font-medium">
                    {user.etablissement?.nom || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Departement:</span>
                  <p className="font-medium">
                    {user.departement?.nom || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Laboratoire:</span>
                  <p className="font-medium">
                    {user.laboratoire?.nom || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Equipe:</span>
                  <p className="font-medium">{user.equipe?.nom || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Specialites:</span>
                  <p className="font-medium">
                    {user.specialite && user.specialite.length > 0
                      ? user.specialite.map((s) => s.nom).join(", ")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">
                    Thematiques de Recherche:
                  </span>
                  <p className="font-medium">
                    {user.thematiqueDeRecherche &&
                    user.thematiqueDeRecherche.length > 0
                      ? user.thematiqueDeRecherche.map((t) => t.nom).join(", ")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
