"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, Bike, ShoppingBag, FileText, MapPin, HelpCircle } from "lucide-react";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  question?: string;
  slug?: string;
  url: string;
  type: "ebike" | "accessory" | "post" | "page" | "store" | "faq";
  heroImage?: string;
  image?: string;
  featuredImage?: string;
  tagline?: string;
  excerpt?: string;
  answer?: string;
  price?: number;
  city?: string;
  country?: string;
}

interface SearchResults {
  query: string;
  totalCount: number;
  results: {
    ebikes: SearchResult[];
    accessories: SearchResult[];
    posts: SearchResult[];
    pages: SearchResult[];
    stores: SearchResult[];
    faqs: SearchResult[];
  };
}

const typeIcons = {
  ebike: Bike,
  accessory: ShoppingBag,
  post: FileText,
  page: FileText,
  store: MapPin,
  faq: HelpCircle,
};

const typeLabels = {
  ebike: "E-Bike",
  accessory: "Accessory",
  post: "Blog Post",
  page: "Page",
  store: "Store",
  faq: "FAQ",
};

export function SearchModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      search(value);
    }, 300);
  };

  const handleResultClick = () => {
    onClose();
    setQuery("");
    setResults(null);
  };

  if (!isOpen) return null;

  const allResults = results ? [
    ...results.results.ebikes,
    ...results.results.accessories,
    ...results.results.posts,
    ...results.results.stores,
    ...results.results.faqs,
  ] : [];

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative max-w-2xl mx-auto mt-20 sm:mt-32">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search e-bikes, accessories, blog posts..."
              className="w-full pl-12 pr-12 py-4 text-lg border-b focus:outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults(null);
                  inputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#fdc501]" />
              </div>
            )}

            {!loading && query.length >= 2 && results && allResults.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
              </div>
            )}

            {!loading && results && allResults.length > 0 && (
              <div className="py-2">
                {/* E-Bikes */}
                {results.results.ebikes.length > 0 && (
                  <ResultSection 
                    title="E-Bikes" 
                    results={results.results.ebikes}
                    onResultClick={handleResultClick}
                  />
                )}

                {/* Accessories */}
                {results.results.accessories.length > 0 && (
                  <ResultSection 
                    title="Accessories" 
                    results={results.results.accessories}
                    onResultClick={handleResultClick}
                  />
                )}

                {/* Blog Posts */}
                {results.results.posts.length > 0 && (
                  <ResultSection 
                    title="Blog Posts" 
                    results={results.results.posts}
                    onResultClick={handleResultClick}
                  />
                )}

                {/* Stores */}
                {results.results.stores.length > 0 && (
                  <ResultSection 
                    title="Stores" 
                    results={results.results.stores}
                    onResultClick={handleResultClick}
                  />
                )}

                {/* FAQs */}
                {results.results.faqs.length > 0 && (
                  <ResultSection 
                    title="FAQs" 
                    results={results.results.faqs}
                    onResultClick={handleResultClick}
                  />
                )}
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="py-8 px-4">
                <p className="text-sm text-gray-500 text-center mb-4">Quick Links</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    href="/our-rides"
                    onClick={handleResultClick}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-[#fdc501] hover:text-black transition-colors"
                  >
                    Our Rides
                  </Link>
                  <Link
                    href="/accessories"
                    onClick={handleResultClick}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-[#fdc501] hover:text-black transition-colors"
                  >
                    Accessories
                  </Link>
                  <Link
                    href="/find-store"
                    onClick={handleResultClick}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-[#fdc501] hover:text-black transition-colors"
                  >
                    Find a Store
                  </Link>
                  <Link
                    href="/contact"
                    onClick={handleResultClick}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-[#fdc501] hover:text-black transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
            <span>Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">ESC</kbd> to close</span>
            <span>{results?.totalCount || 0} results</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultSection({ 
  title, 
  results,
  onResultClick 
}: { 
  title: string; 
  results: SearchResult[];
  onResultClick: () => void;
}) {
  return (
    <div className="mb-2">
      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </div>
      {results.map((result) => (
        <ResultItem key={result.id} result={result} onClick={onResultClick} />
      ))}
    </div>
  );
}

function ResultItem({ 
  result, 
  onClick 
}: { 
  result: SearchResult;
  onClick: () => void;
}) {
  const Icon = typeIcons[result.type];
  const displayName = result.name || result.title || result.question || "Untitled";
  const description = result.tagline || result.excerpt || result.answer || 
    (result.city && result.country ? `${result.city}, ${result.country}` : null);
  const imageUrl = result.heroImage || result.image || result.featuredImage;

  return (
    <Link
      href={result.url}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      {/* Image or Icon */}
      {imageUrl ? (
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={imageUrl}
            alt={displayName}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{displayName}</div>
        {description && (
          <div className="text-sm text-gray-500 truncate">{description}</div>
        )}
      </div>

      {/* Type Badge */}
      <span className="text-xs text-gray-400 flex-shrink-0">
        {typeLabels[result.type]}
      </span>

      {/* Price if applicable */}
      {result.price && (
        <span className="text-sm font-medium text-gray-900 flex-shrink-0">
          ${result.price.toLocaleString()}
        </span>
      )}
    </Link>
  );
}

// Search Button Component to trigger the modal
export function SearchButton({ 
  className = "",
  isDark = false 
}: { 
  className?: string;
  isDark?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isDark 
            ? "text-white/70 hover:text-white hover:bg-white/10" 
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        } ${className}`}
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
        <span className="hidden sm:inline text-sm">Search</span>
        <kbd className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
          isDark ? "bg-white/10" : "bg-gray-100"
        }`}>
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
