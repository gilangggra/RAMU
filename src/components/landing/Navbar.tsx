"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RamuLogo } from "@/components/brand/RamuLogo";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");
  const isDarkNavbar = false;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDarkNavbar
            ? "bg-[#0E0C15]/90 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5)] border-b border-stone-800 py-3.5"
            : "bg-white/90 backdrop-blur-md shadow-[0_4px_24px_rgba(39,33,61,0.06)] border-b border-stone-200/60 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <RamuLogo
            size={32}
            theme={isDarkNavbar && !scrolled ? "white" : scrolled && isDarkNavbar ? "white" : "dark"}
            className="shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-black text-xl tracking-wider transition-colors ${
                  isDarkNavbar ? "text-white" : "text-stone-900"
                }`}
              >
                RAMU
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span
              className={`text-[10px] font-semibold tracking-wider uppercase ${
                isDarkNavbar ? "text-stone-400" : "text-stone-500"
              }`}
            >
              Platform Industri Kreatif
            </span>
          </div>
        </Link>

        <nav
          className={`hidden md:flex items-center gap-7 text-sm font-medium ${
            isDarkNavbar ? "text-stone-300" : "text-[#716B7E]"
          }`}
        >
          <Link
            href="/#hero"
            className={`transition-colors py-1 hover:font-semibold ${
              isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/directory"
            className={`transition-colors py-1 hover:font-semibold ${
              isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
            }`}
          >
            Direktori Talenta
          </Link>
          <Link
            href="/showcase"
            className={`transition-colors py-1 hover:font-semibold flex items-center gap-1 ${
              isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
            }`}
          >
            <span>Karya &amp; Inspirasi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </Link>
          <Link
            href="/projects"
            className={`transition-colors py-1 hover:font-semibold ${
              isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
            }`}
          >
            Eksplorasi Proyek
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-full bg-[#1E1B2E] hover:bg-black text-white text-sm font-extrabold shadow-[0_4px_16px_rgba(30,27,46,0.25)] transition-all hover:scale-105"
            >
              Buka Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-semibold px-4 py-2 transition-colors ${
                  isDarkNavbar ? "text-stone-300 hover:text-white" : "text-[#27213D] hover:text-[#27213D]/70"
                }`}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-stone-950 text-sm font-black shadow-[0_4px_16px_rgba(251,191,36,0.35)] transition-all hover:scale-105"
              >
                Mulai Sekarang
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-xl transition-colors ${
            isDarkNavbar
              ? "text-stone-300 hover:text-white hover:bg-white/10"
              : "text-[#27213D] hover:bg-stone-100"
          }`}
          aria-label="Buka Menu"
        >
          {mobileOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div
          className={`md:hidden border-b px-6 py-6 space-y-4 shadow-xl ${
            isDarkNavbar
              ? "bg-[#171523]/95 backdrop-blur-xl border-stone-800 text-stone-200"
              : "bg-[#FFFDFC] border-stone-200 text-[#716B7E]"
          }`}
        >
          <nav
            className={`flex flex-col gap-3 text-base font-medium ${
              isDarkNavbar ? "text-stone-300" : "text-[#716B7E]"
            }`}
          >
            <Link
              href="/#hero"
              onClick={() => setMobileOpen(false)}
              className={`py-1.5 transition-colors ${
                isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/directory"
              onClick={() => setMobileOpen(false)}
              className={`py-1.5 transition-colors ${
                isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
              }`}
            >
              Direktori Talenta
            </Link>
            <Link
              href="/showcase"
              onClick={() => setMobileOpen(false)}
              className={`py-1.5 flex items-center justify-between transition-colors ${
                isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
              }`}
            >
              <span>Karya &amp; Inspirasi</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileOpen(false)}
              className={`py-1.5 transition-colors ${
                isDarkNavbar ? "hover:text-amber-300" : "hover:text-[#27213D]"
              }`}
            >
              Eksplorasi Proyek
            </Link>
          </nav>
          <div
            className={`pt-4 border-t flex flex-col gap-3 ${
              isDarkNavbar ? "border-stone-800" : "border-stone-100"
            }`}
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-[#1E1B2E] text-white text-sm font-extrabold shadow-sm"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`w-full text-center py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    isDarkNavbar
                      ? "border border-stone-700 bg-stone-900/80 text-stone-200 hover:bg-stone-800"
                      : "border border-stone-200 text-[#27213D]"
                  }`}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-sm font-black text-stone-950 shadow-md transition-all"
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
