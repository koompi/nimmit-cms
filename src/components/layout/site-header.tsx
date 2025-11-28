"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type MenuItem = {
  id: string;
  label: string;
  url: string;
  target: string;
  children?: MenuItem[];
};

type HeaderSettings = {
  siteName?: string;
  [key: string]: unknown;
};

export function SiteHeader() {
  const [menu, setMenu] = useState<{ items: MenuItem[] } | null>(null);
  const [settings, setSettings] = useState<HeaderSettings>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch menu and settings
    Promise.all([
      fetch("/api/menus/header").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/settings/public").then((r) => (r.ok ? r.json() : {})),
    ]).then(([menuData, settingsData]) => {
      setMenu(menuData);
      setSettings(settingsData);
    });

    // Handle scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const siteName = settings?.siteName || "Grood";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-black/95 backdrop-blur-md py-3 shadow-lg"
            : "bg-black py-5"
        )}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-black">G</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {siteName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {menu?.items?.map((item: MenuItem) => (
                <div key={item.id} className="relative group">
                  <Link
                    href={item.url}
                    target={item.target}
                    className="text-white/80 hover:text-white text-sm font-medium tracking-wide uppercase transition-colors relative py-2"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-black/95 backdrop-blur-md border border-white/10 rounded-lg py-3 min-w-[200px]">
                        {item.children.map((child: MenuItem) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            target={child.target}
                            className="block px-5 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/contact"
                className="bg-primary text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105"
              >
                Book Test Ride
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative z-10 p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={cn(
                    "w-full h-0.5 bg-white transition-all duration-300 origin-left",
                    isMobileMenuOpen && "rotate-45 translate-x-px"
                  )}
                />
                <span
                  className={cn(
                    "w-full h-0.5 bg-white transition-all duration-300",
                    isMobileMenuOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "w-full h-0.5 bg-white transition-all duration-300 origin-left",
                    isMobileMenuOpen && "-rotate-45 translate-x-px"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black z-40 lg:hidden transition-all duration-500",
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full pt-20">
          <nav className="flex flex-col items-center gap-6">
            {menu?.items?.map((item: MenuItem, index: number) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.target}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-white text-3xl font-light tracking-wide hover:text-primary transition-all duration-300",
                  "transform transition-all duration-500",
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "mt-6 bg-primary text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all",
                "transform transition-all duration-500",
                isMobileMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              )}
              style={{ transitionDelay: "400ms" }}
            >
              Book Test Ride
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
