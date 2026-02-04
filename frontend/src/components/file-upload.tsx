import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadApi } from "@/api/upload";
import { transformUrl } from "@/lib/url-utils";
import { toast } from "sonner";
import { Upload, Loader2, Image, FileText } from "lucide-react";

interface FileUploadProps {
  label: string;
  type: "image" | "document" | "any";
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  accept?: string;
}

export function FileUpload({
  label,
  type,
  currentUrl,
  onUploadSuccess,
  accept,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      let uploadFn;
      if (type === "image") {
        uploadFn = uploadApi.uploadImage;
      } else if (type === "document") {
        uploadFn = uploadApi.uploadDocument;
      } else {
        // "any" type - try image first, fall back to document
        uploadFn = uploadApi.uploadImage;
      }

      const result = await uploadFn(file).catch(async (err) => {
        // If image upload fails and type is "any", try document upload
        if (type === "any") {
          return await uploadApi.uploadDocument(file);
        }
        throw err;
      });

      const fullUrl = transformUrl(result.url)!;
      setPreviewUrl(fullUrl);
      onUploadSuccess(fullUrl);
      toast.success(
        `${type === "image" ? "Image" : "Document"} uploaded successfully`,
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={
            accept ||
            (type === "image"
              ? "image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              : type === "document"
                ? ".pdf,.doc,.docx,.txt,.xls,.xlsx"
                : "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.pdf,.doc,.docx,.txt,.xls,.xlsx")
          }
          onChange={handleFileChange}
          disabled={isUploading}
          className="flex-1"
        />
        <Button
          type="button"
          disabled={isUploading}
          variant="outline"
          size="icon"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : type === "image" ? (
            <Image className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </Button>
      </div>
      {type === "image" && previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
