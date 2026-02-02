import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GoogleScholarPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Scholar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Link your Google Scholar profile and sync publications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
