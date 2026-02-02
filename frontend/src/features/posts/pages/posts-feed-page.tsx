import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PostsFeedPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Posts Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Posts feed with create post, comments, and reactions will be
            implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
