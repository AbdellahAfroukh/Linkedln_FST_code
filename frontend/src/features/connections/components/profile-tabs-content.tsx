import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Mail,
  ExternalLink,
  Building2,
  GraduationCap,
  Users,
  Download,
} from "lucide-react";
import type { UserDetailResponse } from "@/types";
import { postsApi } from "@/api/posts";
import { projetsApi } from "@/api/projets";
import { connectionsApi } from "@/api/connections";
import { cvApi } from "@/api/cv";
import { transformUrl } from "@/lib/url-utils";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

interface ProfileTabsContentProps {
  user: UserDetailResponse;
  onProfileClick?: (userId: number) => void;
}

export function ProfileTabsContent({
  user,
  onProfileClick,
}: ProfileTabsContentProps) {
  const [activeTab, setActiveTab] = useState("organizations");
  const currentUser = useAuthStore((state) => state.user);

  // Query for user's posts
  const { data: postsData } = useQuery({
    queryKey: ["posts", "user", user.id],
    queryFn: () => postsApi.getUserPosts(user.id),
    enabled: activeTab === "posts",
  });

  // Query for user's projects (only if enseignant)
  const { data: projectsData } = useQuery({
    queryKey: ["projets", "user", user.id],
    queryFn: () => projetsApi.getUserProjets(user.id),
    enabled: activeTab === "projects" && user.user_type === "enseignant",
  });

  // Query for mutual connections
  const { data: mutualConnectionsData } = useQuery({
    queryKey: ["connections", "mutual", user.id],
    queryFn: () => connectionsApi.getMutual(user.id),
    enabled: activeTab === "mutual",
  });

  const handleDownloadUserCV = async () => {
    try {
      toast.info("Generating CV PDF...");
      const blob = await cvApi.downloadUserCVPDF(user.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${user.nom}_${user.prenom}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CV downloaded successfully");
    } catch (error: any) {
      // Extract the actual error message from the API response
      let errorMessage = "Unable to download CV.";

      console.error("CV Download Error:", error); // Debug log
      console.error("Error Response:", error?.response); // Debug response
      console.error("Error Response Data:", error?.response?.data); // Debug response data

      // Check for FastAPI error response with detail field
      if (error?.response?.data) {
        const data = error.response.data;
        // If data is an object with detail field
        if (typeof data === "object" && data.detail) {
          errorMessage =
            typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail);
        }
        // If data is a string, use it directly
        else if (typeof data === "string") {
          errorMessage = data;
        }
        // If data has a message field
        else if (data.message) {
          errorMessage = data.message;
        }
      }
      // Check for axios error message
      else if (error?.message) {
        // Don't show generic "Request failed with status code 404"
        if (!error.message.includes("Request failed with status code")) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const googleScholarUrl = user.googleScholarId
    ? `https://scholar.google.com/citations?user=${user.googleScholarId}&hl=fr&oi=ao`
    : null;

  return (
    <ScrollArea className="flex-1 px-6 overflow-y-auto">
      <div className="space-y-6 pb-4">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={transformUrl(user.photoDeProfil)} />
            <AvatarFallback className="text-2xl">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.fullName}</h2>
            {user.grade && (
              <p className="text-lg text-muted-foreground">{user.grade}</p>
            )}
            {user.user_type && (
              <p className="text-sm text-primary font-semibold capitalize">
                {user.user_type === "doctorant"
                  ? "Doctorant"
                  : user.user_type === "enseignant"
                    ? "Enseignant"
                    : user.user_type}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{user.email}</p>
            </div>
            {googleScholarUrl && (
              <a
                href={googleScholarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
              >
                <GraduationCap className="h-4 w-4" />
                Google Scholar Profile
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleDownloadUserCV}
            >
              <Download className="h-4 w-4 mr-2" />
              Download CV
            </Button>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-3">
          {user.nom && user.prenom && (
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="font-medium">
                {user.prenom} {user.nom}
              </p>
            </div>
          )}
          {user.dateDeNaissance && (
            <div>
              <Label className="text-muted-foreground">Date of Birth</Label>
              <p className="font-medium">{user.dateDeNaissance}</p>
            </div>
          )}
          {user.numeroDeSomme && (
            <div>
              <Label className="text-muted-foreground">Numero de Somme</Label>
              <p className="font-medium">{user.numeroDeSomme}</p>
            </div>
          )}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="organizations">
              <Building2 className="h-4 w-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger
              value="projects"
              disabled={user.user_type !== "enseignant"}
            >
              Projects
            </TabsTrigger>
            <TabsTrigger value="mutual">
              <Users className="h-4 w-4 mr-2" />
              Mutual
            </TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-3">
            <div className="space-y-2">
              {user.university && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  {user.university.Logo ? (
                    <img
                      src={user.university.Logo}
                      alt={user.university.nom}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-primary/20 rounded flex items-center justify-center text-xs font-bold">
                      U
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">University</p>
                    <p className="text-xs text-muted-foreground">
                      {user.university.nom}
                    </p>
                  </div>
                </div>
              )}
              {user.etablissement && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  {user.etablissement.Logo ? (
                    <img
                      src={user.etablissement.Logo}
                      alt={user.etablissement.nom}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-blue-500/20 rounded flex items-center justify-center text-xs font-bold">
                      E
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Etablissement</p>
                    <p className="text-xs text-muted-foreground">
                      {user.etablissement.nom}
                    </p>
                  </div>
                </div>
              )}
              {user.departement && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="h-10 w-10 bg-green-500/20 rounded flex items-center justify-center text-xs font-bold">
                    D
                  </div>
                  <div>
                    <p className="text-sm font-medium">Departement</p>
                    <p className="text-xs text-muted-foreground">
                      {user.departement.nom}
                    </p>
                  </div>
                </div>
              )}
              {user.laboratoire && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="h-10 w-10 bg-purple-500/20 rounded flex items-center justify-center text-xs font-bold">
                    L
                  </div>
                  <div>
                    <p className="text-sm font-medium">Laboratory</p>
                    <p className="text-xs text-muted-foreground">
                      {user.laboratoire.nom}
                    </p>
                  </div>
                </div>
              )}
              {user.equipe && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="h-10 w-10 bg-orange-500/20 rounded flex items-center justify-center text-xs font-bold">
                    T
                  </div>
                  <div>
                    <p className="text-sm font-medium">Team</p>
                    <p className="text-xs text-muted-foreground">
                      {user.equipe.nom}
                    </p>
                  </div>
                </div>
              )}
              {user.specialite && user.specialite.length > 0 && (
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm font-medium mb-2">Specialites</p>
                  <div className="flex flex-wrap gap-1">
                    {user.specialite.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {spec.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.thematiqueDeRecherche &&
                user.thematiqueDeRecherche.length > 0 && (
                  <div className="p-3 bg-muted rounded">
                    <p className="text-sm font-medium mb-2">
                      Thematiques de Recherche
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {user.thematiqueDeRecherche.map((them, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                        >
                          {them.nom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {!user.university &&
                !user.etablissement &&
                !user.departement &&
                !user.laboratoire &&
                !user.equipe && (
                  <p className="text-xs text-muted-foreground italic">
                    No organizations assigned
                  </p>
                )}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-3">
            {postsData?.posts && postsData.posts.length > 0 ? (
              <div className="space-y-3">
                {postsData.posts.map((post: any) => (
                  <div key={post.id} className="p-4 bg-muted rounded-lg">
                    <p className="text-sm mb-2">{post.content}</p>

                    {/* Publication Link */}
                    {post.publication && post.publication.googleScholarUrl && (
                      <a
                        href={post.publication.googleScholarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 mb-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {post.publication.title}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {/* Attachments */}
                    {post.attachement && (
                      <div className="mt-2">
                        {post.attachement.match(
                          /\.(jpg|jpeg|png|gif|webp)$/i,
                        ) ? (
                          <img
                            src={transformUrl(post.attachement)}
                            alt="Post attachment"
                            className="rounded-lg max-h-64 w-full object-cover"
                          />
                        ) : post.attachement.match(/\.pdf$/i) ? (
                          <a
                            href={transformUrl(post.attachement)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                            <span className="text-sm font-medium">
                              View PDF
                            </span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <a
                            href={transformUrl(post.attachement)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View attachment
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <span>
                        {post.timestamp
                          ? new Date(post.timestamp).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                      <span>{post.comments?.length || 0} comments</span>
                      <span>{post.reactions?.length || 0} reactions</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-8">
                No posts yet
              </p>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-3">
            {projectsData?.projets && projectsData.projets.length > 0 ? (
              <div className="space-y-3">
                {projectsData.projets.map((projet: any) => (
                  <div key={projet.id} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">{projet.titre}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {projet.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Budget: {projet.budget} MAD</span>
                      <span>{projet.dureeEnMois} months</span>
                      <span className="capitalize">{projet.statut}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-8">
                No projects yet
              </p>
            )}
          </TabsContent>

          {/* Mutual Connections Tab */}
          <TabsContent value="mutual" className="space-y-3">
            {mutualConnectionsData && mutualConnectionsData.length > 0 ? (
              <div className="space-y-2">
                {mutualConnectionsData
                  .map((connection: any) => {
                    // Determine which user is the mutual connection
                    // The backend returns connections from current user's perspective
                    // So we need to find the "other" user (not the current logged-in user)
                    const mutualUser =
                      connection.sender?.id === currentUser?.id
                        ? connection.receiver
                        : connection.sender;

                    // Skip if user data is missing or if it's the profile user
                    if (!mutualUser || mutualUser.id === user.id) return null;

                    return {
                      id: mutualUser.id,
                      connection,
                      mutualUser,
                    };
                  })
                  .filter(Boolean)
                  .filter(
                    (item, index, self) =>
                      item &&
                      self.findIndex((t) => t && t.id === item.id) === index,
                  )
                  .map((item: any) => (
                    <div
                      key={item.connection.id}
                      className="flex items-center gap-3 p-2 bg-muted rounded hover:bg-muted/80 transition-colors cursor-pointer"
                      onClick={() => onProfileClick?.(item.mutualUser.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={transformUrl(item.mutualUser.photoDeProfil)}
                        />
                        <AvatarFallback>
                          {getInitials(item.mutualUser.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {item.mutualUser.fullName}
                        </p>
                        {item.mutualUser.grade && (
                          <p className="text-xs text-muted-foreground">
                            {item.mutualUser.grade}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-8">
                No mutual connections
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
