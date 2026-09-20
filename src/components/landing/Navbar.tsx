"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-[0_4px_24px_rgba(39,33,61,0.06)] border-b border-stone-200/60 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl bg-[#FFB800] flex items-center justify-center shadow-[0_4px_16px_rgba(255,184,0,0.4)] transition-transform group-hover:scale-105">
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D9D2FF]" />
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-[#27213D] stroke-[2.4]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
              <path d="M18 8l4 4-4 4" />
              <path d="M8 12h14" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#27213D]">
                RAMU
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD45A]" />
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#716B7E]">
              Mesin Peluang Kolaborasi
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#716B7E]">
          <Link
            href="/#hero"
            className="hover:text-[#27213D] transition-colors py-1 hover:font-semibold"
          >
            Beranda
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-[#27213D] transition-colors py-1 hover:font-semibold"
          >
            Cara Kerja
          </Link>
          <Link
            href="/#opportunities"
            className="hover:text-[#27213D] transition-colors py-1 hover:font-semibold"
          >
            Peluang
          </Link>
          <Link
            href="/#differentiator"
            className="hover:text-[#27213D] transition-colors py-1 hover:font-semibold"
          >
            Tentang
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#27213D] hover:text-[#27213D]/70 px-4 py-2 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] text-sm font-extrabold shadow-[0_4px_16px_rgba(255,184,0,0.35)] transition-all hover:scale-105"
          >
            Mulai Sekarang
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl text-[#27213D] hover:bg-stone-100 transition-colors"
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
        <div className="md:hidden bg-[#FFFDFC] border-b border-stone-200 px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-3 text-base font-medium text-[#716B7E]">
            <Link
              href="/#hero"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#27213D] py-1.5"
            >
              Beranda
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#27213D] py-1.5"
            >
              Cara Kerja
            </Link>
            <Link
              href="/#opportunities"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#27213D] py-1.5"
            >
              Peluang
            </Link>
            <Link
              href="/#differentiator"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#27213D] py-1.5"
            >
              Tentang
            </Link>
          </nav>
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#27213D]"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-[#FFD45A] text-sm font-bold text-[#27213D] shadow-md"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
