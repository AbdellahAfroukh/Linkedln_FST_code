import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChatsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Chat interface with conversation list and message threads.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
