"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Smartphone, Tablet, Monitor, Copy, Check } from "lucide-react";

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<DeviceType, { width: string; label: string }> = {
  desktop: { width: "100%", label: "Desktop" },
  tablet: { width: "768px", label: "Tablet (768px)" },
  mobile: { width: "375px", label: "Mobile (375px)" },
};

export function PreviewToolbar() {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [copied, setCopied] = useState(false);

  if (!isPreview) {
    return null;
  }

  const handleExitPreview = async () => {
    try {
      await fetch("/api/preview", { method: "DELETE" });
      // Reload without preview param
      const url = new URL(window.location.href);
      url.searchParams.delete("preview");
      window.location.href = url.toString();
    } catch (error) {
      console.error("Failed to exit preview:", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <>
      {/* Fixed preview toolbar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-full shadow-lg px-4 py-2 flex items-center gap-4">
        <span className="text-sm font-medium text-amber-400">
          Preview Mode
        </span>

        {/* Device selector */}
        <div className="flex items-center gap-1 border-l border-gray-700 pl-4">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${device === "desktop" ? "bg-gray-700" : ""}`}
            onClick={() => setDevice("desktop")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${device === "tablet" ? "bg-gray-700" : ""}`}
            onClick={() => setDevice("tablet")}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${device === "mobile" ? "bg-gray-700" : ""}`}
            onClick={() => setDevice("mobile")}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        {/* Copy link */}
        <Button
          variant="ghost"
          size="sm"
          className="border-l border-gray-700 pl-4"
          onClick={handleCopyLink}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>

        {/* Exit preview */}
        <Button
          variant="ghost"
          size="sm"
          className="border-l border-gray-700 pl-4 text-red-400 hover:text-red-300"
          onClick={handleExitPreview}
        >
          <X className="h-4 w-4 mr-1" />
          Exit
        </Button>
      </div>

      {/* Device frame overlay for non-desktop */}
      {device !== "desktop" && (
        <style jsx global>{`
          body {
            display: flex;
            justify-content: center;
            background-color: #1f2937;
            padding-top: 20px;
            min-height: 100vh;
          }
          
          body > *:not(.preview-toolbar-container) {
            max-width: ${deviceSizes[device].width};
            background-color: white;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            overflow: hidden;
          }
        `}</style>
      )}
    </>
  );
}
