"use client";

interface GooglePreviewProps {
  title: string;
  description: string;
  url: string;
  siteName?: string;
}

export function GooglePreview({
  title,
  description,
  url,
  siteName = "Your Site",
}: GooglePreviewProps) {
  // Google typically truncates titles at ~60 chars and descriptions at ~160 chars
  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const displayDescription =
    description.length > 160 ? description.slice(0, 157) + "..." : description;

  // Format URL for display
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const urlParts = displayUrl.split("/").filter(Boolean);

  return (
    <div className="max-w-[600px] font-arial">
      <div className="text-xs text-[#202124] flex items-center gap-1 mb-1">
        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold">
          {siteName.charAt(0).toUpperCase()}
        </div>
        <span>{siteName}</span>
      </div>
      <div className="text-xs text-[#4d5156] mb-1">
        {urlParts.map((part, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-1">›</span>}
            {part}
          </span>
        ))}
      </div>
      <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer leading-[1.3] mb-1">
        {displayTitle || "Page Title"}
      </h3>
      <p className="text-sm text-[#4d5156] leading-[1.58]">
        {displayDescription || "Add a meta description for this page."}
      </p>
    </div>
  );
}
