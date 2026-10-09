"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, RotateCcw, ChevronDown, Users, Sparkles, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface DirectoryFilterBarProps {
  currentTab?: string;
  totalActors?: number;
  matchedCount?: number;
  currentSearch?: string;
  currentSector?: string;
  currentLocation?: string;
  currentStyle?: string;
  currentCompensation?: string;
  currentSort?: string;
}

const SECTOR_PILLS = [
  { id: "ALL", label: "Semua Peran" },
  { id: "Fashion Brand/UMKM", label: "Brand / UMKM" },
  { id: "Photographer", label: "Photographer" },
  { id: "Model", label: "Model" },
  { id: "MUA/Stylist", label: "MUA & Stylist" },
  { id: "Studio", label: "Studio Visual" },
];

export function DirectoryFilterBar({
  currentTab = "all",
  totalActors = 0,
  matchedCount = 0,
  currentSearch = "",
  currentSector = "ALL",
  currentLocation = "ALL",
  currentStyle = "ALL",
  currentCompensation = "ALL",
  currentSort = "recommended",
}: DirectoryFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "ALL" || (key === "sortBy" && value === "recommended") || (key === "tab" && value === "all")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      const q = params.toString();
      router.push(q ? `${pathname}?${q}` : pathname);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: search.trim() || null });
  }

  function handleClearAll() {
    setSearch("");
    startTransition(() => {
      const params = new URLSearchParams();
      if (currentTab === "matched") {
        params.set("tab", "matched");
      }
      const q = params.toString();
      router.push(q ? `${pathname}?${q}` : pathname);
    });
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentSector !== "ALL" ||
    currentLocation !== "ALL" ||
    currentStyle !== "ALL" ||
    currentCompensation !== "ALL" ||
    (currentSort !== "recommended" && Boolean(currentSort));

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[22px] shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] p-4 sm:p-5 space-y-3.5">
      {/* 1. TOP ROW: PRIMARY MODE SWITCHER + SEARCH & SORT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Sleek Segmented Mode Switcher */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/70 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => updateQuery({ tab: "all" })}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "all"
                ? "btn-primary-pill text-white font-bold shadow-md shadow-[#4CC9FE]/25"
                : "text-slate-600 hover:text-slate-900 font-medium hover:bg-white/60"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Semua Direktori</span>
            {totalActors > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-white text-slate-700 border border-slate-200/70"
                }`}
              >
                {totalActors}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateQuery({ tab: "matched" })}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "matched"
                ? "btn-primary-pill text-white font-bold shadow-md shadow-[#4CC9FE]/25"
                : "text-slate-600 hover:text-slate-900 font-medium hover:bg-white/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mitra Kompatibel</span>
            {matchedCount > 0 ? (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  currentTab === "matched"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                }`}
              >
                {matchedCount} Match
              </span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentTab === "matched"
                    ? "bg-white/20 text-white"
                    : "bg-[#4CC9FE]/15 text-[#0284c7]"
                }`}
              >
                Smart Match
              </span>
            )}
          </button>
        </div>

        {/* Search Input & Sort Selector */}
        <div className="flex items-center gap-2.5 flex-1 md:max-w-md justify-end">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search
                className={`w-3.5 h-3.5 ${isPending ? "text-[#0284c7] animate-pulse" : "text-slate-400"}`}
              />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari talenta, studio, gaya, keahlian..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200/80 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 shadow-2xs transition-all font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateQuery({ search: null });
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Quick Sort Selector */}
          <div className="relative inline-flex items-center shrink-0">
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sortBy: e.target.value })}
              className="appearance-none bg-slate-50/80 hover:bg-white text-slate-700 border border-slate-200/80 rounded-full pl-3 pr-7 py-2 text-xs font-semibold shadow-2xs cursor-pointer focus:outline-none focus:border-[#4CC9FE] transition-colors"
            >
              <option value="recommended">⇅ Paling Kompatibel</option>
              <option value="recent">⇅ Terbaru</option>
              <option value="portfolio">⇅ Portofolio Terbanyak</option>
              <option value="name">⇅ Nama (A - Z)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. BOTTOM ROW: ROLE / SECTOR PILLS & REFINEMENT DROPDOWNS */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Sector / Role Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {SECTOR_PILLS.map((sector) => {
              const active = currentSector === sector.id;
              return (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => updateQuery({ sector: sector.id })}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                    active
                      ? "btn-primary-pill text-white font-semibold shadow-md shadow-[#4CC9FE]/25"
                      : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 font-medium shadow-2xs hover:text-[#0284c7]"
                  }`}
                >
                  {sector.label}
                </button>
              );
            })}
          </div>

          {/* Refinement Filters Dropdowns */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Kota Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={currentLocation}
                onChange={(e) => updateQuery({ location: e.target.value })}
                className={`appearance-none bg-white hover:bg-slate-50 border rounded-full pl-3 pr-7 py-1.5 text-xs font-medium shadow-2xs cursor-pointer focus:outline-none focus:border-[#4CC9FE] transition-colors ${
                  currentLocation !== "ALL"
                    ? "border-[#4CC9FE] text-[#0284c7] font-semibold"
                    : "border-slate-200/80 text-slate-600"
                }`}
              >
                <option value="ALL">Kota: Semua</option>
                <option value="Jakarta">Jakarta / Jabodetabek</option>
                <option value="Bandung">Bandung</option>
                <option value="Yogyakarta">Yogyakarta</option>
                <option value="Surabaya">Surabaya</option>
                <option value="Bali">Bali</option>
                <option value="Semarang">Semarang</option>
                <option value="Solo">Solo / Surakarta</option>
                <option value="Medan">Medan</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Estetika Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={currentStyle}
                onChange={(e) => updateQuery({ style: e.target.value })}
                className={`appearance-none bg-white hover:bg-slate-50 border rounded-full pl-3 pr-7 py-1.5 text-xs font-medium shadow-2xs cursor-pointer focus:outline-none focus:border-[#4CC9FE] transition-colors ${
                  currentStyle !== "ALL"
                    ? "border-[#4CC9FE] text-[#0284c7] font-semibold"
                    : "border-slate-200/80 text-slate-600"
                }`}
              >
                <option value="ALL">Estetika: Semua</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Editorial">Editorial</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Vintage">Vintage / Analog</option>
                <option value="Avant-Garde">Avant-Garde</option>
                <option value="Commercial">Commercial Clean</option>
                <option value="Traditional">Traditional Fusion</option>
                <option value="Luxury">Luxury</option>
                <option value="High-Fashion">High-Fashion</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Skema Kompensasi Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={currentCompensation}
                onChange={(e) => updateQuery({ compensation: e.target.value })}
                className={`appearance-none bg-white hover:bg-slate-50 border rounded-full pl-3 pr-7 py-1.5 text-xs font-medium shadow-2xs cursor-pointer focus:outline-none focus:border-[#4CC9FE] transition-colors ${
                  currentCompensation !== "ALL"
                    ? "border-[#4CC9FE] text-[#0284c7] font-semibold"
                    : "border-slate-200/80 text-slate-600"
                }`}
              >
                <option value="ALL">Skema: Semua</option>
                <option value="PAID">Fee Komersial</option>
                <option value="REVENUE_SHARE">Bagi Hasil</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors cursor-pointer"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3 h-3 text-rose-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
    </div>
  );
}
