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
        {/* Attio Segmented Control */}
        <div className="inline-flex items-center p-1 bg-stone-100/90 rounded-xl border border-stone-200/70 w-fit shrink-0">
          <button
            type="button"
            onClick={() => updateQuery({ scope: "all" })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentScope === "all"
                ? "bg-white text-stone-900 shadow-2xs font-bold"
                : "text-stone-500 hover:text-stone-900 font-medium"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-stone-500" />
            <span>Semua Koleksi Ekosistem</span>
          </button>

          <button
            type="button"
            onClick={() => updateQuery({ scope: "mine" })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentScope === "mine"
                ? "bg-white text-stone-900 shadow-2xs font-bold"
                : "text-stone-500 hover:text-stone-900 font-medium"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-stone-600" />
            <span>Portofolio Saya</span>
            {myCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold transition-colors ${
                  currentScope === "mine"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-200/80 text-stone-700"
                }`}
              >
                {myCount}
              </span>
            )}
          </button>
        </div>

        {/* Attio Search Input */}
        <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search
              className={`w-3.5 h-3.5 ${
                isPending ? "text-stone-800 animate-pulse" : "text-stone-400"
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
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-stone-200/80 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 shadow-2xs transition-colors font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {SHOWCASE_CATEGORIES.map((category) => {
          const active = currentCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => updateQuery({ category: category.id })}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shrink-0 ${
                active
                  ? "bg-stone-900 text-white font-semibold shadow-2xs"
                  : "bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/80 font-medium shadow-2xs"
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/70 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
