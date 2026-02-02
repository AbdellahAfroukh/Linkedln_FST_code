import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CVPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My CV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            CV builder with sections for contact, formation, competences,
            langues, and experiences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
