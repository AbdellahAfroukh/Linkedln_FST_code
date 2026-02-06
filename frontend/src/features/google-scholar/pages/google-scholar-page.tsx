import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { googleScholarApi } from "@/api/google-scholar";
import { toast } from "sonner";

export function GoogleScholarPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [googleScholarId, setGoogleScholarId] = useState("");

  const integrationQuery = useQuery({
    queryKey: ["google-scholar", "integration"],
    queryFn: googleScholarApi.getIntegration,
    retry: false,
    meta: {
      // Suppress 404 errors in console - it's normal to not have an integration
      ignoreGlobalErrorHandler: true,
    },
  });

  const integration = integrationQuery.data;

  useEffect(() => {
    if (integration?.googleScholarId) {
      setGoogleScholarId(integration.googleScholarId);
    }
  }, [integration?.googleScholarId]);

  const linkMutation = useMutation({
    mutationFn: googleScholarApi.link,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-scholar"] });
      toast.success(t("googleScholar.linked"));
    },
    onError: () => toast.error(t("googleScholar.failedToLink")),
  });

  const updateMutation = useMutation({
    mutationFn: googleScholarApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-scholar"] });
      toast.success(t("googleScholar.updated"));
    },
    onError: () => toast.error(t("googleScholar.failedToUpdate")),
  });

  const unlinkMutation = useMutation({
    mutationFn: googleScholarApi.unlink,
    onSuccess: () => {
      setGoogleScholarId("");
      queryClient.invalidateQueries({ queryKey: ["google-scholar"] });
      toast.success(t("googleScholar.unlinked"));
    },
    onError: () => toast.error(t("googleScholar.failedToUnlink")),
  });

  const syncMutation = useMutation({
    mutationFn: googleScholarApi.sync,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["google-scholar", "publications"],
      });
      toast.success(data.message || t("googleScholar.synced"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || t("googleScholar.failedToSync");
      toast.error(message);
    },
  });

  const publicationsQuery = useQuery({
    queryKey: ["google-scholar", "publications"],
    queryFn: () => googleScholarApi.getPublications({ skip: 0, limit: 50 }),
    enabled: !!integration,
  });

  const togglePostedMutation = useMutation({
    mutationFn: ({ id, isPosted }: { id: number; isPosted: boolean }) =>
      googleScholarApi.togglePublicationPosted(id, isPosted),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-scholar", "publications"],
      });
      // Invalidate all post-related queries to show new publication posts immediately
      queryClient.invalidateQueries({
        queryKey: ["posts", "my-posts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", "feed"],
      });
    },
    onError: () => toast.error(t("googleScholar.failedToUpdate2")),
  });

  const handleSave = () => {
    if (!googleScholarId.trim()) {
      toast.error(t("googleScholar.googleScholarId"));
      return;
    }
    if (integration) {
      updateMutation.mutate({ googleScholarId: googleScholarId.trim() });
    } else {
      linkMutation.mutate({ googleScholarId: googleScholarId.trim() });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("googleScholar.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleScholarId">
              {t("googleScholar.googleScholarId")}
            </Label>
            <Input
              id="googleScholarId"
              placeholder="e.g., 3RA5IZkAAAAJ"
              value={googleScholarId}
              onChange={(e) => setGoogleScholarId(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={linkMutation.isPending || updateMutation.isPending}
            >
              {integration
                ? t("googleScholar.updateAccount")
                : t("googleScholar.linkAccount")}
            </Button>
            {integration && (
              <Button
                variant="outline"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending
                  ? t("common.loading")
                  : t("googleScholar.syncPublications")}
              </Button>
            )}
            {integration && (
              <Button
                variant="destructive"
                onClick={() => unlinkMutation.mutate()}
                disabled={unlinkMutation.isPending}
              >
                {t("googleScholar.unlinkAccount")}
              </Button>
            )}
          </div>
          {integration && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Profile URL: {integration.profileUrl || "N/A"}</div>
              <div>
                Last synced:{" "}
                {integration.lastSynced
                  ? new Date(integration.lastSynced).toLocaleDateString()
                  : "Never"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("googleScholar.publications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!integration && (
            <p className="text-sm text-muted-foreground">
              Link your Google Scholar account to view publications.
            </p>
          )}
          {publicationsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          )}
          {publicationsQuery.data?.publications.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("googleScholar.noPublications")}
            </p>
          )}
          {publicationsQuery.data?.publications.map((pub) => (
            <div key={pub.id} className="border rounded-lg p-4 space-y-2">
              <div className="font-medium">{pub.title}</div>
              {pub.summary && (
                <p className="text-sm text-muted-foreground">{pub.summary}</p>
              )}
              <div className="text-xs text-gray-500">
                {pub.publicationDate
                  ? new Date(pub.publicationDate).toLocaleDateString()
                  : "Unknown date"}{" "}
                · {pub.citationCount} {t("googleScholar.citations")}
              </div>
              {pub.googleScholarUrl && (
                <a
                  href={pub.googleScholarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  View on Google Scholar
                </a>
              )}
              <div>
                <Button
                  size="sm"
                  variant={pub.isPosted ? "default" : "outline"}
                  onClick={() =>
                    togglePostedMutation.mutate({
                      id: pub.id,
                      isPosted: !pub.isPosted,
                    })
                  }
                >
                  {pub.isPosted
                    ? t("googleScholar.removeFromFeed")
                    : t("googleScholar.postToFeed")}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
