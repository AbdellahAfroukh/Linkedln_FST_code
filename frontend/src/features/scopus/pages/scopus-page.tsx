import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scopusApi } from "@/api/scopus";
import { toast } from "sonner";

export function ScopusPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [scopusAuthorId, setScopusAuthorId] = useState("");

  const integrationQuery = useQuery({
    queryKey: ["scopus", "integration"],
    queryFn: scopusApi.getIntegration,
    retry: false,
    meta: {
      // Suppress 404 errors in console - it's normal to not have an integration
      ignoreGlobalErrorHandler: true,
    },
  });

  const integration = integrationQuery.data;

  useEffect(() => {
    if (integration?.scopusAuthorId) {
      setScopusAuthorId(integration.scopusAuthorId);
    }
  }, [integration?.scopusAuthorId]);

  const linkMutation = useMutation({
    mutationFn: scopusApi.link,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scopus"] });
      toast.success(t("scopus.linked"));
    },
    onError: () => toast.error(t("scopus.failedToLink")),
  });

  const updateMutation = useMutation({
    mutationFn: scopusApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scopus"] });
      toast.success(t("scopus.updated"));
    },
    onError: () => toast.error(t("scopus.failedToUpdate")),
  });

  const unlinkMutation = useMutation({
    mutationFn: scopusApi.unlink,
    onSuccess: () => {
      setScopusAuthorId("");
      queryClient.invalidateQueries({ queryKey: ["scopus"] });
      toast.success(t("scopus.unlinked"));
    },
    onError: () => toast.error(t("scopus.failedToUnlink")),
  });

  const syncMutation = useMutation({
    mutationFn: scopusApi.sync,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["scopus", "publications"],
      });
      toast.success(data.message || t("scopus.synced"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || t("scopus.failedToSync");
      toast.error(message);
    },
  });

  const publicationsQuery = useQuery({
    queryKey: ["scopus", "publications"],
    queryFn: () => scopusApi.getPublications({ skip: 0, limit: 50 }),
    enabled: !!integration,
  });

  const togglePostedMutation = useMutation({
    mutationFn: ({ id, isPosted }: { id: number; isPosted: boolean }) =>
      scopusApi.togglePublicationPosted(id, isPosted),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["scopus", "publications"],
      });
      // Invalidate all post-related queries to show new publication posts immediately
      queryClient.invalidateQueries({
        queryKey: ["posts", "my-posts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", "feed"],
      });
    },
    onError: () => toast.error(t("scopus.failedToUpdate2")),
  });

  const handleSave = () => {
    if (!scopusAuthorId.trim()) {
      toast.error(t("scopus.scopusAuthorId"));
      return;
    }
    if (integration) {
      updateMutation.mutate({ scopusAuthorId: scopusAuthorId.trim() });
    } else {
      linkMutation.mutate({ scopusAuthorId: scopusAuthorId.trim() });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("scopus.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scopusAuthorId">{t("scopus.scopusAuthorId")}</Label>
            <Input
              id="scopusAuthorId"
              placeholder="e.g., 57123456789"
              value={scopusAuthorId}
              onChange={(e) => setScopusAuthorId(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={linkMutation.isPending || updateMutation.isPending}
            >
              {integration
                ? t("scopus.updateAccount")
                : t("scopus.linkAccount")}
            </Button>
            {integration && (
              <Button
                variant="outline"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending
                  ? t("common.loading")
                  : t("scopus.syncPublications")}
              </Button>
            )}
            {integration && (
              <Button
                variant="destructive"
                onClick={() => unlinkMutation.mutate()}
                disabled={unlinkMutation.isPending}
              >
                {t("scopus.unlinkAccount")}
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
          <CardTitle>{t("scopus.publications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!integration && (
            <p className="text-sm text-muted-foreground">
              Link your Scopus account to view publications.
            </p>
          )}
          {publicationsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          )}
          {publicationsQuery.data?.publications.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("scopus.noPublications")}
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
                · {pub.citationCount} {t("scopus.citations")}
              </div>
              {pub.scopusUrl && (
                <a
                  href={pub.scopusUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  View on Scopus
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
                    ? t("scopus.removeFromFeed")
                    : t("scopus.postToFeed")}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
