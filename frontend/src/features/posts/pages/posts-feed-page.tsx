import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { postsApi } from "@/api/posts";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { ReactionType } from "@/types";
import { transformUrl } from "@/lib/url-utils";
import { FileUpload } from "@/components/file-upload";
import { Trash2 } from "lucide-react";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";

const REACTIONS: { label: string; value: ReactionType }[] = [
  { label: "👍 Like", value: "like" },
  { label: "❤️ Love", value: "love" },
  { label: "😂 Funny", value: "funny" },
  { label: "😡 Angry", value: "angry" },
  { label: "😢 Sad", value: "sad" },
  { label: "👎 Dislike", value: "dislike" },
];

export function PostsFeedPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [attachement, setAttachement] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>(
    {},
  );
  const [selectedPostForComments, setSelectedPostForComments] = useState<
    number | null
  >(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: myPostsData, isLoading: myPostsLoading } = useQuery({
    queryKey: ["posts", "my-posts"],
    queryFn: () =>
      user
        ? postsApi.getUserPosts(user.id, { limit: 100 })
        : Promise.resolve({ posts: [] }),
    enabled: !!user,
  });

  const createPostMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      setContent("");
      setAttachement("");
      setIsPublic(true);
      queryClient.invalidateQueries({ queryKey: ["posts", "my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      toast.success(t("posts.postCreated"));
    },
    onError: () => toast.error(t("posts.failedToCreatePost")),
  });

  const deletePostMutation = useMutation({
    mutationFn: (post: (typeof myPosts)[0]) => postsApi.delete(post.id),
    onSuccess: (_, deletedPost) => {
      queryClient.invalidateQueries({ queryKey: ["posts", "my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      // If the deleted post was a publication post, invalidate Google Scholar cache
      if (deletedPost.publicationId) {
        queryClient.invalidateQueries({
          queryKey: ["google-scholar", "publications"],
        });
      }
      toast.success(t("posts.postDeleted"));
    },
    onError: () => toast.error(t("posts.failedToDeletePost")),
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: ({ postId, isPublic }: { postId: number; isPublic: boolean }) =>
      postsApi.update(postId, { isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      toast.success(t("posts.visibilityUpdated"));
    },
    onError: () => toast.error(t("posts.failedToUpdateVisibility")),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      postsApi.addComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: () => toast.error(t("posts.failedToAddComment")),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => postsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      toast.success(t("posts.commentDeleted"));
    },
    onError: () => toast.error(t("posts.failedToDeleteComment")),
  });

  const reactMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: number; type: ReactionType }) =>
      postsApi.reactToPost(postId, { type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: () => toast.error(t("posts.failedToReact")),
  });

  const removeReactionMutation = useMutation({
    mutationFn: (postId: number) => postsApi.removePostReaction(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: () => toast.error(t("posts.failedToRemoveReaction")),
  });

  const myPosts = myPostsData?.posts ?? [];

  const handleCreatePost = () => {
    if (!content.trim()) {
      toast.error(t("posts.postContentRequired"));
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
  const getFileIcon = (url?: string) => {
    if (!url) return "📄";
    const ext = url.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "pdf":
        return "📕";
      case "doc":
      case "docx":
        return "📘";
      case "xls":
      case "xlsx":
        return "📗";
      case "txt":
        return "📄";
      default:
        return "📎";
    }
  };

  const getFileName = (url?: string) => {
    if (!url) return "Document";
    return url.split("/").pop() || "Document";
  };

  const getReactionCounts = (reactions: (typeof posts)[0]["reactions"]) => {
    const counts: Record<string, number> = {
      like: 0,
      love: 0,
      funny: 0,
      angry: 0,
      sad: 0,
      dislike: 0,
    };
    reactions.forEach((r) => {
      counts[r.type]++;
    });
    return counts;
  };

  const getReactionEmoji = (type: ReactionType): string => {
    const emojiMap: Record<ReactionType, string> = {
      like: "👍",
      love: "❤️",
      funny: "😂",
      angry: "😡",
      sad: "😢",
      dislike: "👎",
    };
    return emojiMap[type];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Create Post Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("posts.createPost")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-content">{t("posts.postContent")}</Label>
            <Input
              id="post-content"
              placeholder={t("posts.postContent")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <FileUpload
            label={t("posts.attachmentImageOrDocument")}
            type="any"
            currentUrl={attachement}
            onUploadSuccess={(url) => setAttachement(url)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            {t("posts.public")}
          </label>
          <Button
            onClick={handleCreatePost}
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending
              ? t("common.loading")
              : t("posts.createPost")}
          </Button>
        </CardContent>
      </Card>

      {/* My Posts Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("posts.myPosts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {myPostsLoading && (
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          )}
          {!myPostsLoading && myPosts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("posts.noPostsYet")}
            </p>
          )}

          {myPosts.map((post) => {
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
                          src={transformUrl(post.user.photoDeProfil)}
                          alt={post.user.fullName}
                          className="h-full w-full object-cover cursor-pointer"
                          onClick={() =>
                            setPreviewImage(
                              transformUrl(post.user.photoDeProfil),
                            )
                          }
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
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{new Date(post.timestamp).toLocaleString()}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] ${
                            post.isPublic
                              ? "border-green-200 text-green-700 bg-green-50"
                              : "border-yellow-200 text-yellow-700 bg-yellow-50"
                          }`}
                        >
                          {post.isPublic
                            ? t("posts.public")
                            : t("posts.private")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user?.id === post.userId && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateVisibilityMutation.mutate({
                            postId: post.id,
                            isPublic: !post.isPublic,
                          })
                        }
                        disabled={updateVisibilityMutation.isPending}
                      >
                        {post.isPublic
                          ? t("posts.makePrivate")
                          : t("posts.makePublic")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePostMutation.mutate(post)}
                      >
                        {t("common.delete")}
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-sm whitespace-pre-wrap">{post.content}</p>

                {post.publication && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📚</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-blue-900">
                          {post.publication.title}
                        </div>
                        <div className="text-xs text-blue-700 mt-1 space-y-1">
                          {post.publication.publicationDate && (
                            <div>
                              {t("posts.published")}:{" "}
                              {new Date(
                                post.publication.publicationDate,
                              ).toLocaleDateString()}
                            </div>
                          )}
                          <div>
                            {t("posts.citations")}:{" "}
                            {post.publication.citationCount}
                          </div>
                        </div>
                        {post.publication.googleScholarUrl && (
                          <a
                            href={post.publication.googleScholarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 underline hover:text-blue-800 inline-block mt-2"
                          >
                            {t("posts.viewOnGoogleScholar")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {post.attachement && (
                  <div className="mt-3">
                    {isImageUrl(post.attachement) ? (
                      <img
                        src={transformUrl(post.attachement)}
                        alt="Post attachment"
                        className="w-full max-h-96 rounded-lg border object-contain bg-gray-50 cursor-pointer"
                        onClick={() =>
                          setPreviewImage(transformUrl(post.attachement))
                        }
                        onError={(e) => {
                          console.error(
                            "Failed to load image:",
                            post.attachement,
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    {!isImageUrl(post.attachement) && (
                      <a
                        href={transformUrl(post.attachement)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                      >
                        <span className="text-3xl">
                          {getFileIcon(post.attachement)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {getFileName(post.attachement)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("posts.clickToDownload")}
                          </p>
                        </div>
                        <span className="text-gray-400">↓</span>
                      </a>
                    )}
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

                <div className="text-xs text-gray-500 flex items-center gap-2">
                  {post.reactions.length > 0 && (
                    <div className="flex items-center gap-1">
                      {Object.entries(getReactionCounts(post.reactions))
                        .filter(([_, count]) => count > 0)
                        .slice(0, 3)
                        .map(([type, count]) => (
                          <span key={type} title={`${count} ${type}`}>
                            {getReactionEmoji(type as ReactionType)}
                            <span className="text-xs font-medium ml-0.5">
                              {count}
                            </span>
                          </span>
                        ))}
                      {post.reactions.length > 0 && (
                        <span>{post.reactions.length}</span>
                      )}
                    </div>
                  )}
                  {post.reactions.length > 0 && post.comments.length > 0 && (
                    <span>·</span>
                  )}
                  {post.comments.length > 0 && (
                    <span>
                      {post.comments.length} {t("posts.comments")}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`comment-${post.id}`}>
                    {t("posts.addComment")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`comment-${post.id}`}
                      placeholder={t("posts.writeComment")}
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
                          toast.error(t("posts.commentEmpty"));
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
                      {t("posts.comment")}
                    </Button>
                  </div>
                </div>

                {post.comments.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {post.comments.length} {t("posts.comments")}
                    </div>
                    {post.comments.slice(0, 2).map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 rounded-md p-3 group relative"
                      >
                        <div className="text-sm font-medium">
                          {comment.user.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        {comment.userId === user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteCommentMutation.mutate(comment.id)
                            }
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {post.comments.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPostForComments(post.id)}
                        className="w-full"
                      >
                        {t("posts.viewAllComments", {
                          count: post.comments.length,
                        })}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
      <ImagePreviewDialog
        open={!!previewImage}
        src={previewImage}
        alt="Preview"
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      />

      <Dialog
        open={selectedPostForComments !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPostForComments(null);
        }}
      >
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("posts.allComments")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-3">
              {myPosts
                .find((post) => post.id === selectedPostForComments)
                ?.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 rounded-md p-3 group relative"
                  >
                    <div className="text-sm font-medium">
                      {comment.user.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                    {comment.userId === user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
