"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ShoppingBag, X, Menu, ChevronRight, MapPin, Phone, Mail, Search } from "lucide-react";
import { SearchModal } from "@/components/search/SearchModal";

// Product data for the menu
const products = [
  {
    name: "Grood S5",
    tagline: "High-speed city bike",
    price: "$3,498",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
    href: "/our-rides/grood-s5",
    badge: "New",
  },
  {
    name: "Grood A5",
    tagline: "All-terrain adventure",
    price: "$2,998",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    href: "/our-rides/grood-a5",
  },
  {
    name: "Grood S3",
    tagline: "Electric city bike",
    price: "$2,298",
    image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&q=80",
    href: "/our-rides/grood-s3",
  },
];

const menuLinks = [
  { label: "All e-bikes", href: "/our-rides" },
  { label: "Accessories", href: "/accessories" },
  { label: "Apparel", href: "/accessories?category=apparel" },
  { label: "Our Story", href: "/our-story" },
  { label: "Test Ride", href: "/test-rides" },
  { label: "Find Store", href: "/find-store" },
  { label: "Contact", href: "/contact" },
];

// Helper to determine if a color is light or dark
function isLightColor(r: number, g: number, b: number): boolean {
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function GroodHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // true = light text on dark bg

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Detect background color at header position
  const detectBackgroundColor = useCallback(() => {
    // Get element at multiple points to ensure we find the right section
    const headerY = 60; // Slightly below header middle to catch content
    const centerX = window.innerWidth / 2;
    
    // Temporarily hide header to get element behind it
    const header = document.querySelector('header');
    if (header) {
      const originalPointerEvents = header.style.pointerEvents;
      header.style.pointerEvents = 'none';
      
      // Try multiple points to find a themed element
      const points = [
        { x: centerX, y: headerY },
        { x: centerX, y: 80 },
        { x: centerX, y: 100 },
      ];
      
      for (const point of points) {
        const elementBehind = document.elementFromPoint(point.x, point.y);
        
        if (elementBehind) {
          // Check for data-header-theme attribute first (explicit override)
          let current: Element | null = elementBehind;
          while (current) {
            const theme = current.getAttribute('data-header-theme');
            if (theme === 'light') {
              header.style.pointerEvents = originalPointerEvents;
              setIsDarkMode(false);
              return;
            } else if (theme === 'dark') {
              header.style.pointerEvents = originalPointerEvents;
              setIsDarkMode(true);
              return;
            }
            current = current.parentElement;
          }
        }
      }
      
      // If no explicit theme found, check background color
      const elementBehind = document.elementFromPoint(centerX, headerY);
      header.style.pointerEvents = originalPointerEvents;
      
      if (elementBehind) {
        // Walk up to find a non-transparent background
        let current: Element | null = elementBehind;
        while (current) {
          const computedStyle = window.getComputedStyle(current);
          const bgColor = computedStyle.backgroundColor;
          
          const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const [, r, g, b] = match.map(Number);
            const alpha = bgColor.includes('rgba') ? parseFloat(bgColor.split(',')[3] || '1') : 1;
            
            if (alpha >= 0.5) {
              setIsDarkMode(!isLightColor(r, g, b));
              return;
            }
          }
          current = current.parentElement;
        }
        
        // Default to dark mode if can't determine
        setIsDarkMode(true);
      }
    }
  }, []);

  useEffect(() => {
    // Initial detection
    detectBackgroundColor();
    
    // Detect on scroll
    const handleScroll = () => {
      requestAnimationFrame(detectBackgroundColor);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', detectBackgroundColor);
    
    // Also detect after page load and route changes
    const timer = setTimeout(detectBackgroundColor, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', detectBackgroundColor);
      clearTimeout(timer);
    };
  }, [detectBackgroundColor]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setActiveSection(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-md transition-all duration-300",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-black/10 hover:bg-black/20"
            )}
            aria-label="Open menu"
          >
            <Menu className={cn(
              "w-6 h-6 transition-colors duration-300",
              isDarkMode ? "text-white" : "text-black"
            )} />
          </button>

          <Link 
            href="/" 
            className={cn(
              "absolute left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl backdrop-blur-md transition-all duration-300",
              isDarkMode 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-black/10 hover:bg-black/20"
            )}
          >
            <span className={cn(
              "text-xl font-bold tracking-[0.2em] transition-colors duration-300",
              isDarkMode ? "text-white/90" : "text-black/90"
            )}>
              GROOD
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-md transition-all duration-300",
                isDarkMode 
                  ? "bg-white/10 hover:bg-white/20" 
                  : "bg-black/10 hover:bg-black/20"
              )}
              aria-label="Search"
            >
              <Search className={cn(
                "w-5 h-5 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-black"
              )} />
            </button>

            <Link
              href="/cart"
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-md transition-all duration-300",
                isDarkMode 
                  ? "bg-white/10 hover:bg-white/20" 
                  : "bg-black/10 hover:bg-black/20"
              )}
              aria-label="Shopping cart"
            >
              <ShoppingBag className={cn(
                "w-5 h-5 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-black"
              )} />
            </Link>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div
        className={cn(
          "fixed inset-0 z-[100] transition-all duration-500",
          isMenuOpen ? "visible" : "invisible pointer-events-none"
        )}
      >
        {/* Background with reduced opacity */}
        <div
          className={cn(
            "absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-500",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={cn(
            "relative h-full w-full overflow-y-auto transition-all duration-500",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="fixed top-4 left-4 z-10 w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Cart in menu */}
          <Link
            href="/cart"
            onClick={() => setIsMenuOpen(false)}
            className="fixed top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-white" />
          </Link>

          {/* Desktop Layout */}
          <div className="hidden lg:flex min-h-full">
            {/* Left Side - Product Grid */}
            <div className="w-2/3 p-8 pt-24">
              <div className="max-w-5xl mx-auto">
                {/* Section Title */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">E-bikes</h2>
                  <Link
                    href="/our-rides"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <Link
                      key={product.name}
                      href={product.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "group relative bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300",
                        "transform",
                        isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {/* Product Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-[#fdc501] text-black text-xs font-bold px-2 py-1 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#fdc501] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-white/50 mb-2">{product.tagline}</p>
                        <p className="text-white font-medium">{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-12 flex gap-4">
                  <Link
                    href="/test-rides"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Book a Test Ride
                  </Link>
                  <Link
                    href="/find-store"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
                  >
                    Find a Store
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Navigation Links */}
            <div className="w-1/3 border-l border-white/10 p-8 pt-24 flex flex-col">
              <nav className="flex-1 space-y-1">
                {menuLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block py-3 text-2xl font-light text-white/70 hover:text-white hover:translate-x-2 transition-all duration-300",
                      isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                    )}
                    style={{ transitionDelay: `${index * 50 + 200}ms` }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Footer Links */}
              <div className="pt-8 border-t border-white/10 space-y-3">
                <a
                  href="mailto:hello@grood.com"
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  hello@grood.com
                </a>
                <a
                  href="tel:+85512345678"
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  +855 12 345 678
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden min-h-full flex flex-col px-6 py-24">
            {/* Product Showcase */}
            <div className="mb-8">
              <Link
                href="/our-rides/grood-s5"
                onClick={() => setIsMenuOpen(false)}
                className="block relative aspect-video rounded-2xl overflow-hidden group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80"
                  alt="Grood S5"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block bg-[#fdc501] text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
                    New
                  </span>
                  <h3 className="text-xl font-bold text-white">Grood S5</h3>
                  <p className="text-white/70 text-sm">From $3,498</p>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1">
              {menuLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "block py-4 text-3xl font-light text-white border-b border-white/10 transition-all duration-300",
                    isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 space-y-3">
              <Link
                href="/test-rides"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-medium rounded-full"
              >
                <MapPin className="w-5 h-5" />
                Book a Test Ride
              </Link>
              <Link
                href="/find-store"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 border border-white/20 text-white font-medium rounded-full"
              >
                Find a Store
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-white/10 flex gap-6 text-sm">
              <a href="mailto:hello@grood.com" className="text-white/50 hover:text-white">
                hello@grood.com
              </a>
              <a href="tel:+85512345678" className="text-white/50 hover:text-white">
                +855 12 345 678
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
