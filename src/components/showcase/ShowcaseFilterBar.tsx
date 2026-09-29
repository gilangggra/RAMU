"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, Compass, UserCheck } from "lucide-react";

const SHOWCASE_CATEGORIES = [
  { id: "ALL", label: "Semua Koleksi" },
  { id: "Fotografi", label: "Fotografi" },
  { id: "Video Komersial", label: "Video Komersial" },
  { id: "Fashion Styling", label: "Fashion Styling" },
  { id: "Desain Grafis", label: "Desain Grafis" },
  { id: "3D & Animasi", label: "3D & Animasi" },
  { id: "Lainnya", label: "Lainnya" },
];

interface ShowcaseFilterBarProps {
  myCount?: number;
}

export function ShowcaseFilterBar({ myCount = 0 }: ShowcaseFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentScope = searchParams.get("scope") === "mine" ? "mine" : "all";
  const currentCategory = searchParams.get("category") || "ALL";
  const initialSearch = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const updateQuery = (updates: { scope?: string; category?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.scope !== undefined) {
      if (updates.scope === "all") params.delete("scope");
      else params.set("scope", updates.scope);
    }

    if (updates.category !== undefined) {
      if (updates.category === "ALL") params.delete("category");
      else params.set("category", updates.category);
    }
    
    if (updates.q !== undefined) {
      if (!updates.q) params.delete("q");
      else params.set("q", updates.q);
    }

    startTransition(() => {
      router.push(`/showcase?${params.toString()}`);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get("q") || "")) {
        updateQuery({ q: searchTerm });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams]);

  return (
    <div className="relative mb-8 z-20 space-y-4">
      
      {/* ── TOP SCOPE SWITCHER: COSMOS.SO / VSCO EDITORIAL DUAL TOGGLE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-white/75 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_2px_12px_rgba(39,33,61,0.03)] w-fit">
          <button
            type="button"
            onClick={() => updateQuery({ scope: "all" })}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentScope === "all"
                ? "bg-[#1E1B2E] text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Jelajah Ekosistem</span>
          </button>
          
          <button
            type="button"
            onClick={() => updateQuery({ scope: "mine" })}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentScope === "mine"
                ? "bg-[#1E1B2E] text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Portofolio Saya</span>
            {myCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold transition-colors ${
                currentScope === "mine" ? "bg-white/20 text-white" : "bg-stone-200/80 text-stone-700"
              }`}>
                {myCount}
              </span>
            )}
          </button>
        </div>

        {/* Informative Sub-Indicator */}
        {currentScope === "mine" && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs font-medium animate-fade-in w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>Menampilkan karya buatan &amp; kolaborasi resmi Anda</span>
          </div>
        )}
      </div>

      {/* Top Search Bar Row */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors ${isPending ? 'text-amber-500 animate-pulse' : 'text-[#1E1B2E]'}`} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            currentScope === "mine"
              ? "Cari dalam portofolio Anda (judul karya, kategori, rekan kru)..."
              : "Cari gaya visual, nama karya, atau nama kreator..."
          }
          className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/20 shadow-[0_8px_30px_rgba(39,33,61,0.04)] font-medium transition-all"
        />
      </div>

      {/* Categories Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {SHOWCASE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => updateQuery({ category: category.id })}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                currentCategory === category.id
                  ? "bg-[#1E1B2E] text-white shadow-xs"
                  : "bg-white/60 text-stone-500 hover:text-stone-900 hover:bg-white border border-white/80"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
