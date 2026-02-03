import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { googleScholarApi } from "@/api/google-scholar";
import { toast } from "sonner";

export function GoogleScholarPage() {
  const queryClient = useQueryClient();
  const [googleScholarId, setGoogleScholarId] = useState("");

  const integrationQuery = useQuery({
    queryKey: ["google-scholar", "integration"],
    queryFn: googleScholarApi.getIntegration,
    retry: false,
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
      toast.success("Google Scholar linked");
    },
    onError: () => toast.error("Failed to link Google Scholar"),
  });

  const updateMutation = useMutation({
    mutationFn: googleScholarApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-scholar"] });
      toast.success("Google Scholar updated");
    },
    onError: () => toast.error("Failed to update Google Scholar"),
  });

  const unlinkMutation = useMutation({
    mutationFn: googleScholarApi.unlink,
    onSuccess: () => {
      setGoogleScholarId("");
      queryClient.invalidateQueries({ queryKey: ["google-scholar"] });
      toast.success("Google Scholar unlinked");
    },
    onError: () => toast.error("Failed to unlink Google Scholar"),
  });

  const syncMutation = useMutation({
    mutationFn: googleScholarApi.sync,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["google-scholar", "publications"],
      });
      toast.success(data.message || "Publications synced");
    },
    onError: () => toast.error("Failed to sync publications"),
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
    },
    onError: () => toast.error("Failed to update publication"),
  });

  const handleSave = () => {
    if (!googleScholarId.trim()) {
      toast.error("Google Scholar ID is required");
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
          <CardTitle>Google Scholar Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleScholarId">Google Scholar ID</Label>
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
              {integration ? "Update" : "Link"}
            </Button>
            {integration && (
              <Button
                variant="outline"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending ? "Syncing..." : "Sync Publications"}
              </Button>
            )}
            {integration && (
              <Button
                variant="destructive"
                onClick={() => unlinkMutation.mutate()}
                disabled={unlinkMutation.isPending}
              >
                Unlink
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
          <CardTitle>Publications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!integration && (
            <p className="text-sm text-muted-foreground">
              Link your Google Scholar account to view publications.
            </p>
          )}
          {publicationsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading publications...
            </p>
          )}
          {publicationsQuery.data?.publications.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No publications found.
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
                · {pub.citationCount} citations
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
                  {pub.isPosted ? "Unpost" : "Post"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
