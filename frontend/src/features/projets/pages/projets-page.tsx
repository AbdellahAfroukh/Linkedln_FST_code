import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjetsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Research Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Browse and manage research projects. Enseignants can create
            projects.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
