import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  open: boolean;
  src?: string | null;
  alt?: string;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({
  open,
  src,
  alt = "Preview",
  onOpenChange,
}: ImagePreviewDialogProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none">
        <div className="flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className="max-w-[95vw] max-h-[90vh] rounded-lg shadow-lg bg-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
