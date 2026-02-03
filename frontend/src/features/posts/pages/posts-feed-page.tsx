import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postsApi } from "@/api/posts";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import type { ReactionType } from "@/types";

const REACTIONS: { label: string; value: ReactionType }[] = [
  { label: "👍 Like", value: "like" },
  { label: "❤️ Love", value: "love" },
  { label: "😂 Funny", value: "funny" },
  { label: "😡 Angry", value: "angry" },
  { label: "😢 Sad", value: "sad" },
  { label: "👎 Dislike", value: "dislike" },
];

export function PostsFeedPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [attachement, setAttachement] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>(
    {},
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", "feed"],
    queryFn: () => postsApi.getFeed(),
  });

  const createPostMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      setContent("");
      setAttachement("");
      setIsPublic(true);
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      toast.success("Post created");
    },
    onError: () => toast.error("Failed to create post"),
  });

  const deletePostMutation = useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      toast.success("Post deleted");
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      postsApi.addComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const reactMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: number; type: ReactionType }) =>
      postsApi.reactToPost(postId, { type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: () => toast.error("Failed to react"),
  });

  const removeReactionMutation = useMutation({
    mutationFn: (postId: number) => postsApi.removePostReaction(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: () => toast.error("Failed to remove reaction"),
  });

  const posts = data?.posts ?? [];

  const handleCreatePost = () => {
    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }
    createPostMutation.mutate({
      content: content.trim(),
      attachement: attachement.trim() || undefined,
      isPublic,
    });
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const isImageUrl = (url?: string) => {
    if (!url) return false;
    // Check file extension
    const hasImageExtension =
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url);
    // Check if it's a data URL
    const isDataUrl = url.startsWith("data:image/");
    return hasImageExtension || isDataUrl;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Input
              id="post-content"
              placeholder="Share something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-attachment">Attachment URL (optional)</Label>
            <Input
              id="post-attachment"
              placeholder="https://example.com/file"
              value={attachement}
              onChange={(e) => setAttachement(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public post
          </label>
          <Button
            onClick={handleCreatePost}
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading feed...</p>
          )}
          {isError && (
            <p className="text-sm text-red-600">Failed to load posts.</p>
          )}
          {!isLoading && posts.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          )}

          {posts.map((post) => {
            const userReaction = post.reactions.find(
              (r) => r.userId === user?.id,
            );
            return (
              <div key={post.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
                      {post.user.photoDeProfil ? (
                        <img
                          src={post.user.photoDeProfil}
                          alt={post.user.fullName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">
                          {getInitials(post.user.fullName)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{post.user.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(post.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {user?.id === post.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePostMutation.mutate(post.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <p className="text-sm whitespace-pre-wrap">{post.content}</p>

                {post.attachement && (
                  <div className="mt-3">
                    <img
                      src={post.attachement}
                      alt="Post attachment"
                      className="w-full max-h-96 rounded-lg border object-contain bg-gray-50"
                      onError={(e) => {
                        console.error(
                          "Failed to load image:",
                          post.attachement,
                        );
                        // Replace img with link on error
                        const link = document.createElement("a");
                        link.href = post.attachement;
                        link.target = "_blank";
                        link.rel = "noreferrer";
                        link.className =
                          "inline-flex items-center gap-2 text-sm text-blue-600 hover:underline";
                        link.textContent = "📎 View attachment";
                        e.currentTarget.replaceWith(link);
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {REACTIONS.map((reaction) => (
                    <Button
                      key={reaction.value}
                      variant={
                        userReaction?.type === reaction.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (userReaction?.type === reaction.value) {
                          removeReactionMutation.mutate(post.id);
                        } else {
                          reactMutation.mutate({
                            postId: post.id,
                            type: reaction.value,
                          });
                        }
                      }}
                    >
                      {reaction.label}
                    </Button>
                  ))}
                </div>

                <div className="text-xs text-gray-500">
                  {post.reactions.length} reactions · {post.comments.length}{" "}
                  comments
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`comment-${post.id}`}>Add comment</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`comment-${post.id}`}
                      placeholder="Write a comment..."
                      value={commentDrafts[post.id] || ""}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const draft = (commentDrafts[post.id] || "").trim();
                        if (!draft) {
                          toast.error("Comment cannot be empty");
                          return;
                        }
                        addCommentMutation.mutate({
                          postId: post.id,
                          content: draft,
                        });
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [post.id]: "",
                        }));
                      }}
                    >
                      Comment
                    </Button>
                  </div>
                </div>

                {post.comments.length > 0 && (
                  <div className="space-y-2">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 rounded-md p-3"
                      >
                        <div className="text-sm font-medium">
                          {comment.user.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
