"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, RotateCcw, Filter, ChevronDown } from "lucide-react";

interface DirectoryFilterBarProps {
  currentSearch?: string;
  currentType?: string;
  currentSector?: string;
  currentLocation?: string;
  currentStyle?: string;
  currentCompensation?: string;
  currentSort?: string;
}

const ENTITY_TABS = [
  { id: "ALL", label: "Semua Entitas" },
  { id: "INDIVIDUAL", label: "Talenta Kreatif" },
  { id: "STUDIO", label: "Studio Foto & Ruang" },
  { id: "BRAND", label: "Brand & UMKM Mode" },
];

const SECTOR_PILLS = [
  { id: "ALL", label: "Semua Peran" },
  { id: "Fashion Brand/UMKM", label: "Brand/UMKM" },
  { id: "Fashion Designer", label: "Designer" },
  { id: "Photographer", label: "Photographer" },
  { id: "Model", label: "Model" },
  { id: "MUA/Stylist", label: "MUA / Stylist" },
  { id: "Studio", label: "Studio" },
];

export function DirectoryFilterBar({
  currentSearch = "",
  currentType = "ALL",
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
      if (!value || value === "ALL" || (key === "sortBy" && value === "recommended")) {
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
    currentLocation !== "ALL" ||
    currentStyle !== "ALL" ||
    currentCompensation !== "ALL" ||
    (currentSort !== "recommended" && Boolean(currentSort));

  return (
    <div className="space-y-3.5 pb-2">
      {/* 1. TOP BAR: SEGMENTED ENTITY TABS & SEARCH INPUT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Attio Segmented Control */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 overflow-x-auto no-scrollbar w-fit shrink-0">
          {ENTITY_TABS.map((tab) => {
            const active = currentType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateQuery({ actorType: tab.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Attio Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search
              className={`w-3.5 h-3.5 ${isPending ? "text-slate-800 animate-pulse" : "text-slate-400"}`}
            />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari talenta, studio, brand, keahlian..."
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 shadow-2xs transition-colors font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateQuery({ search: null });
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* 2. SUB-SECTOR PILLS BAR */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {SECTOR_PILLS.map((sector) => {
          const active = currentSector === sector.id;
          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => updateQuery({ sector: sector.id })}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                active
                  ? "btn-primary-pill text-white font-semibold shadow-xs shadow-[#4CC9FE]/30"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 font-medium shadow-2xs hover:text-[#0284c7]"
              }`}
            >
              {sector.label}
            </button>
          );
        })}
      </div>

      {/* 3. ATTIO DROPDOWN CONTROLS ROW */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
        {/* Kota Dropdown */}
        <div className="relative inline-flex items-center">
          <select
            value={currentLocation}
            onChange={(e) => updateQuery({ location: e.target.value })}
            className="appearance-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium shadow-2xs cursor-pointer focus:outline-none focus:border-slate-400 transition-colors"
          >
            <option value="ALL">Semua Kota</option>
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
            className="appearance-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium shadow-2xs cursor-pointer focus:outline-none focus:border-slate-400 transition-colors"
          >
            <option value="ALL">Semua Gaya Estetika</option>
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
            className="appearance-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium shadow-2xs cursor-pointer focus:outline-none focus:border-slate-400 transition-colors"
          >
            <option value="ALL">Semua Skema</option>
            <option value="PAID">Fee Komersial (Paid)</option>
            <option value="REVENUE_SHARE">Bagi Hasil Komersial</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Urutkan Dropdown */}
        <div className="relative inline-flex items-center">
          <select
            value={currentSort}
            onChange={(e) => updateQuery({ sortBy: e.target.value })}
            className="appearance-none bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/80 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold shadow-2xs cursor-pointer focus:outline-none focus:border-slate-400 transition-colors"
          >
            <option value="recommended">Kesesuaian Komplementer</option>
            <option value="recent">Terbaru Bergabung</option>
            <option value="portfolio">Portofolio Terbanyak</option>
            <option value="name">Nama (A - Z)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/70 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* 4. ACTIVE FILTER CHIPS */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter Aktif:</span>
          </span>

          {currentSort && currentSort !== "recommended" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200/80">
              Urutan: {currentSort === "recent" ? "Terbaru" : currentSort === "portfolio" ? "Portofolio Terbanyak" : currentSort === "name" ? "Nama A-Z" : currentSort}
              <button
                type="button"
                onClick={() => updateQuery({ sortBy: null })}
                className="hover:text-slate-950 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </span>
          )}

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200/80">
              Kata kunci: &ldquo;{currentSearch}&rdquo;
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateQuery({ search: null });
                }}
                className="hover:text-slate-950 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </span>
          )}

          {currentType !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200/80">
              Entitas: {currentType === "STUDIO" ? "Studio" : currentType === "BRAND" ? "Brand" : currentType === "INDIVIDUAL" ? "Talenta Kreatif" : currentType}
              <button
                type="button"
                onClick={() => updateQuery({ actorType: null })}
                className="hover:text-slate-950 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </span>
          )}

          {currentSector !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200/80">
              Peran: {currentSector}
              <button
                type="button"
                onClick={() => updateQuery({ sector: null })}
                className="hover:text-slate-950 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </span>
          )}

          {currentLocation !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200/80">
              Kota: {currentLocation}
              <button
                type="button"
                onClick={() => updateQuery({ location: null })}
                className="hover:text-slate-950 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </span>
          )}

          {currentStyle !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200/80">
              Estetika: {currentStyle}
              <button
                type="button"
                onClick={() => updateQuery({ style: null })}
                className="hover:text-slate-950 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </span>
          )}

          {currentCompensation !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200/80">
              Skema: {currentCompensation}
              <button
                type="button"
                onClick={() => updateQuery({ compensation: null })}
                className="hover:text-slate-950 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
