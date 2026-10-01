"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, Compass, UserCheck, X } from "lucide-react";

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
    <div className="relative mb-6 z-20 space-y-3">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="inline-flex items-center p-1 bg-white/80 backdrop-blur-xl border border-stone-200/70 rounded-full shadow-[0_2px_10px_rgba(39,33,61,0.03)] w-fit shrink-0">
          <button
            type="button"
            onClick={() => updateQuery({ scope: "all" })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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

        <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 transition-colors ${isPending ? 'text-amber-500 animate-pulse' : 'text-stone-400'}`} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              currentScope === "mine"
                ? "Cari di portofolio Anda..."
                : "Cari karya, kreator, gaya visual..."
            }
            className="w-full pl-9.5 pr-8 py-2 bg-white/75 backdrop-blur-xl border border-stone-200/70 rounded-full text-xs text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {SHOWCASE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => updateQuery({ category: category.id })}
            className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer shrink-0 ${
              currentCategory === category.id
                ? "bg-[#1E1B2E] text-white shadow-xs font-semibold"
                : "bg-white/60 hover:bg-white/95 text-stone-500 hover:text-stone-900 border border-stone-200/60"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
