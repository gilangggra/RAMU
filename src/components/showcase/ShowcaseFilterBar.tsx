"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, Compass, UserCheck, X, Sparkles } from "lucide-react";

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
    <div className="space-y-3">
      {/* 1. TOP CONTROL ROW: Segmented Tab Bar + Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Control */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 backdrop-blur-sm rounded-full border border-slate-200/80 w-fit shrink-0">
          <button
            type="button"
            onClick={() => updateQuery({ scope: "all" })}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
              currentScope === "all"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50 font-semibold border border-transparent"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Semua Koleksi Ekosistem</span>
          </button>

          <button
            type="button"
            onClick={() => updateQuery({ scope: "mine" })}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
              currentScope === "mine"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50 font-semibold border border-transparent"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Portofolio Saya</span>
            {myCount > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
                  currentScope === "mine"
                    ? "btn-primary-pill text-white shadow-xs"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {myCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search
              className={`w-3.5 h-3.5 ${
                isPending ? "text-[#0284c7] animate-pulse" : "text-slate-400"
              }`}
            />
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
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/80 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 shadow-2xs transition-colors font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer outline-none focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1">
        {SHOWCASE_CATEGORIES.map((category) => {
          const active = currentCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => updateQuery({ category: category.id })}
              className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
                active
                  ? "btn-primary-pill !py-1.5 !px-4 text-white font-bold shadow-md shadow-[#4CC9FE]/25 border-transparent"
                  : "bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0284c7] border border-slate-200/80 hover:border-[#4CC9FE]/40 font-semibold shadow-2xs"
              }`}
            >
              {category.label}
            </button>
          );
        })}

        {(currentCategory !== "ALL" || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              updateQuery({ category: "ALL", q: "" });
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer shrink-0 outline-none focus:outline-none"
          >
            <X className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
