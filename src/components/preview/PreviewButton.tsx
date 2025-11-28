"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, ExternalLink, Copy, Check, Link2 } from "lucide-react";

interface PreviewButtonProps {
  contentType: "post" | "page" | "product";
  contentId: string;
  contentSlug?: string;
  disabled?: boolean;
}

export function PreviewButton({
  contentType,
  contentId,
  contentSlug,
  disabled = false,
}: PreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          contentSlug,
          expiresIn: 3600, // 1 hour
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewUrl(data.previewUrl);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to generate preview");
      }
    } catch (error) {
      console.error("Failed to generate preview:", error);
      alert("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  const handleCopyLink = async () => {
    if (previewUrl) {
      const fullUrl = `${window.location.origin}${previewUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    setPreviewUrl(null);
    handleGeneratePreview();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        disabled={disabled || !contentId}
        className="gap-2"
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview {contentType}
            </DialogTitle>
            <DialogDescription>
              Preview your {contentType} before publishing. The preview link
              expires in 1 hour.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : previewUrl ? (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <code className="text-sm flex-1 truncate">{previewUrl}</code>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleOpenPreview}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Anyone with this link can preview the {contentType}
                </p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Failed to generate preview link
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
