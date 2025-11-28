"use client";

import Image from "next/image";

interface FacebookPreviewProps {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export function FacebookPreview({
  title,
  description,
  url,
  image,
}: FacebookPreviewProps) {
  // Facebook truncates titles at ~60 chars and descriptions at ~160 chars
  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const displayDescription =
    description.length > 160 ? description.slice(0, 157) + "..." : description;

  // Extract domain from URL
  const domain = url.replace(/^https?:\/\//, "").split("/")[0].toUpperCase();

  return (
    <div className="max-w-[500px] border border-gray-300 rounded-sm overflow-hidden bg-white">
      {/* Image Section */}
      <div className="relative w-full h-[261px] bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-gray-400 text-center">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">No OG image set</p>
              <p className="text-xs">Recommended: 1200×630px</p>
            </div>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="p-3 bg-[#f2f3f5] border-t border-gray-300">
        <div className="text-xs text-[#606770] uppercase tracking-wide">
          {domain}
        </div>
        <div className="text-base font-semibold text-[#1d2129] leading-[20px] mt-1 line-clamp-2">
          {displayTitle || "Page Title"}
        </div>
        <div className="text-sm text-[#606770] leading-[20px] mt-1 line-clamp-1">
          {displayDescription || "Add a meta description for this page."}
        </div>
      </div>
    </div>
  );
}
