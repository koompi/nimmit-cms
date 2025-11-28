"use client";

import Image from "next/image";

interface TwitterPreviewProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  cardType?: "summary" | "summary_large_image";
}

export function TwitterPreview({
  title,
  description,
  url,
  image,
  cardType = "summary_large_image",
}: TwitterPreviewProps) {
  // Twitter truncates titles at ~70 chars and descriptions at ~200 chars
  const displayTitle = title.length > 70 ? title.slice(0, 67) + "..." : title;
  const displayDescription =
    description.length > 200 ? description.slice(0, 197) + "..." : description;

  // Extract domain from URL
  const domain = url.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();

  if (cardType === "summary") {
    return (
      <div className="max-w-[438px] border border-gray-200 rounded-2xl overflow-hidden bg-white flex">
        {/* Image Section */}
        <div className="relative w-[125px] h-[125px] bg-gray-100 flex-shrink-0">
          {image ? (
            <Image
              src={image}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="p-3 flex flex-col justify-center min-w-0">
          <div className="text-[13px] text-[#536471] truncate">{domain}</div>
          <div className="text-[15px] font-bold text-[#0f1419] leading-5 line-clamp-2">
            {displayTitle || "Page Title"}
          </div>
          <div className="text-[15px] text-[#536471] leading-5 line-clamp-2 mt-0.5">
            {displayDescription}
          </div>
        </div>
      </div>
    );
  }

  // summary_large_image
  return (
    <div className="max-w-[506px] border border-gray-200 rounded-2xl overflow-hidden bg-white">
      {/* Image Section */}
      <div className="relative w-full h-[252px] bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
              <p className="text-sm">No Twitter image set</p>
              <p className="text-xs">Recommended: 1200×628px</p>
            </div>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="p-3 border-t border-gray-100">
        <div className="text-[15px] font-bold text-[#0f1419] leading-5 line-clamp-2">
          {displayTitle || "Page Title"}
        </div>
        <div className="text-[15px] text-[#536471] leading-5 line-clamp-2 mt-0.5">
          {displayDescription || "Add a meta description for this page."}
        </div>
        <div className="text-[13px] text-[#536471] mt-0.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {domain}
        </div>
      </div>
    </div>
  );
}
