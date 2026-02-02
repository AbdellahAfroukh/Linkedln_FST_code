import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConnectionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connections management: send/accept/reject requests, view accepted
            connections.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
