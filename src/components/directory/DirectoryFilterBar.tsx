"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, X, Building2, User, Sparkles, MapPin } from "lucide-react";

interface DirectoryFilterBarProps {
  currentSearch?: string;
  currentType?: string;
  currentSector?: string;
  currentLocation?: string;
}

export function DirectoryFilterBar({
  currentSearch = "",
  currentType = "ALL",
  currentSector = "ALL",
  currentLocation = "ALL",
}: DirectoryFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: search.trim() || null });
  }

  function handleClearAll() {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentType !== "ALL" ||
    currentSector !== "ALL" ||
    currentLocation !== "ALL";

  return (
    <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari talenta, studio cyclorama, fotografer, model, desainer, atau kapabilitas..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FFB800]/50 focus:border-[#FFB800] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateQuery({ search: null });
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 rounded-2xl bg-[#27213D] hover:bg-[#352D54] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Cari</span>
        </button>
      </form>

      {/* Filter Selectors Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5 text-[#E66A48]" />
            <span>Filter:</span>
          </div>

          {/* Actor Type Quick Pills */}
          <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => updateQuery({ actorType: "ALL" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentType === "ALL"
                  ? "bg-white text-[#27213D] shadow-xs"
                  : "text-stone-500 hover:text-[#27213D]"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => updateQuery({ actorType: "STUDIO" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentType === "STUDIO"
                  ? "bg-white text-[#E66A48] shadow-xs"
                  : "text-stone-500 hover:text-[#27213D]"
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Studio Foto & Visual</span>
            </button>
            <button
              type="button"
              onClick={() => updateQuery({ actorType: "INDIVIDUAL" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentType === "INDIVIDUAL"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-stone-500 hover:text-[#27213D]"
              }`}
            >
              <User className="w-3 h-3" />
              <span>Talenta Kreatif</span>
            </button>
            <button
              type="button"
              onClick={() => updateQuery({ actorType: "MSME" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentType === "MSME"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-stone-500 hover:text-[#27213D]"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Brand & Kriya</span>
            </button>
          </div>

          {/* Sector Selector */}
          <select
            value={currentSector}
            onChange={(e) => updateQuery({ sector: e.target.value })}
            className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-semibold text-[#27213D] focus:outline-none focus:ring-1 focus:ring-[#FFB800] cursor-pointer"
          >
            <option value="ALL">Semua Subsektor</option>
            <option value="Fotografi">Fotografi & Visual</option>
            <option value="Fashion">Fashion & Tekstil</option>
            <option value="Kriya">Kriya & Aksesoris</option>
            <option value="Stylist">Styling & Creative Direction</option>
            <option value="Model">Modeling Editorial</option>
          </select>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={currentLocation}
              onChange={(e) => updateQuery({ location: e.target.value })}
              className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-semibold text-[#27213D] focus:outline-none focus:ring-1 focus:ring-[#FFB800] cursor-pointer"
            >
              <option value="ALL">Semua Domisili</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Yogyakarta">Yogyakarta</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Magetan">Magetan</option>
              <option value="Bali">Bali</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1 rounded-lg text-[11px] font-bold text-stone-500 hover:text-[#E66A48] hover:bg-[#FFF7ED] transition-all flex items-center gap-1 ml-auto cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
