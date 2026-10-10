"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RamuLogo } from "@/components/brand/RamuLogo";
import { ArrowRight, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setIsLoggedIn(true);
      });
    } catch {}
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
      {/* Floating Glassmorphic Pill Capsule Container */}
      <div 
        className={`max-w-7xl mx-auto pointer-events-auto rounded-full transition-all duration-300 flex items-center justify-between ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl saturate-160 border border-white/90 shadow-[0_12px_40px_-8px_rgba(39,33,61,0.08),0_2px_6px_rgba(0,0,0,0.03)] py-2.5 px-5 sm:px-6 ring-1 ring-black/[0.03]"
            : "bg-white/65 backdrop-blur-lg saturate-140 border border-white/80 shadow-[0_8px_30px_-6px_rgba(39,33,61,0.04),0_1px_3px_rgba(0,0,0,0.02)] py-3 px-5 sm:px-6 ring-1 ring-black/[0.02]"
        }`}
      >
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3 group">
          <RamuLogo
            size={32}
            theme="dark"
            className="shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-wider text-[#27213D]">
                RAMU
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE] animate-pulse" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#716B7E]">
              Platform Industri Kreatif
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links with Glass Hover Pills */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#716B7E]">
          <Link
            href="/#hero"
            className="px-4 py-2 rounded-full hover:bg-stone-100/70 hover:text-[#27213D] transition-all duration-200"
          >
            Beranda
          </Link>
          <Link
            href="/directory"
            className="px-4 py-2 rounded-full hover:bg-stone-100/70 hover:text-[#27213D] transition-all duration-200"
          >
            Direktori Talenta
          </Link>
          <Link
            href="/showcase"
            className="px-4 py-2 rounded-full hover:bg-stone-100/70 hover:text-[#27213D] transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Karya &amp; Inspirasi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE]" />
          </Link>
          <Link
            href="/projects"
            className="px-4 py-2 rounded-full hover:bg-stone-100/70 hover:text-[#27213D] transition-all duration-200"
          >
            Eksplorasi Proyek
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4CC9FE]/30 transition-all hover:scale-105 active:scale-95"
            >
              Buka Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-bold px-4 py-2 rounded-full text-[#27213D] hover:bg-stone-100/70 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4CC9FE]/30 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#4CC9FE]/40 flex items-center gap-1.5"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-full text-[#27213D] hover:bg-stone-100/80 transition-colors"
          aria-label="Buka Menu Navigasi"
        >
          {mobileOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer (Matching Glassmorphic Card) */}
      {mobileOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto pointer-events-auto rounded-[28px] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-2xl p-6 space-y-4 animate-fade-in ring-1 ring-black/[0.04]">
          <nav className="flex flex-col gap-2 text-sm font-semibold text-[#716B7E]">
            <Link
              href="/#hero"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-stone-100/70 hover:text-[#27213D] transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/directory"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-stone-100/70 hover:text-[#27213D] transition-colors"
            >
              Direktori Talenta
            </Link>
            <Link
              href="/showcase"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-stone-100/70 hover:text-[#27213D] transition-colors flex items-center justify-between"
            >
              <span>Karya &amp; Inspirasi</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE]" />
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-stone-100/70 hover:text-[#27213D] transition-colors"
            >
              Eksplorasi Proyek
            </Link>
          </nav>

          <div className="pt-4 border-t border-stone-200/60 flex flex-col gap-2.5">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white text-xs font-bold shadow-md shadow-[#4CC9FE]/30"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-stone-300 bg-white/80 text-[#27213D] text-xs font-bold"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white text-xs font-bold shadow-md shadow-[#4CC9FE]/30 transition-all"
                >
                  Mulai Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
