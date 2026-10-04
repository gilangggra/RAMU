"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Filter, RotateCcw } from "lucide-react";

interface DirectoryFilterBarProps {
  currentSearch?: string;
  currentType?: string;
  currentSector?: string;
  currentLocation?: string;
  currentStyle?: string;
  currentCompensation?: string;
  currentSort?: string;
}

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
    <div className="space-y-6 pb-6 border-b border-stone-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md group">
          <Search className="w-4 h-4 text-stone-400 absolute left-0 top-1/2 -translate-y-1/2 group-focus-within:text-[#1E1B2E] transition-colors pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari talenta, studio, brand, keahlian..."
            className="w-full pl-8 pr-8 py-2 bg-transparent border-b border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-all rounded-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateQuery({ search: null });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1E1B2E] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Kota</span>
            <select
              value={currentLocation}
              onChange={(e) => updateQuery({ location: e.target.value })}
              className="bg-transparent text-xs text-[#1E1B2E] font-medium focus:outline-none cursor-pointer appearance-none pr-3"
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
          </div>

          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Estetika</span>
            <select
              value={currentStyle}
              onChange={(e) => updateQuery({ style: e.target.value })}
              className="bg-transparent text-xs text-[#1E1B2E] font-medium focus:outline-none cursor-pointer appearance-none pr-3"
            >
              <option value="ALL">Semua Gaya</option>
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
          </div>

          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Skema</span>
            <select
              value={currentCompensation}
              onChange={(e) => updateQuery({ compensation: e.target.value })}
              className="bg-transparent text-xs text-[#1E1B2E] font-medium focus:outline-none cursor-pointer appearance-none pr-3"
            >
              <option value="ALL">Semua Skema</option>
              <option value="PAID">Paid Commercial</option>
              <option value="BARTER">Barter / TFP</option>
              <option value="REVENUE_SHARE">Bagi Hasil</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Urutkan</span>
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sortBy: e.target.value })}
              className="bg-transparent text-xs text-[#1E1B2E] font-semibold focus:outline-none cursor-pointer appearance-none pr-3"
            >
              <option value="recommended">Rekomendasi AI</option>
              <option value="recent">Terbaru Bergabung</option>
              <option value="portfolio">Portofolio Terbanyak</option>
              <option value="name">Nama (A - Z)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-800 transition-colors pb-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE FILTER BADGES */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Aktif:
          </span>
          {currentSort && currentSort !== "recommended" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-amber-50 text-amber-950 border border-amber-200">
              Urutan: {currentSort === "recent" ? "Terbaru Bergabung" : currentSort === "portfolio" ? "Portofolio Terbanyak" : currentSort === "name" ? "Nama A-Z" : currentSort}
              <button
                onClick={() => updateQuery({ sortBy: null })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 text-[#1E1B2E] border border-stone-200">
              Kata kunci: &ldquo;{currentSearch}&rdquo;
              <button
                onClick={() => {
                  setSearch("");
                  updateQuery({ search: null });
                }}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentType !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 text-[#1E1B2E] border border-stone-200">
              Entitas: {currentType === "STUDIO" ? "Studio" : currentType === "BRAND" ? "Brand & Label" : currentType === "INDIVIDUAL" ? "Talenta Kreatif" : currentType}
              <button
                onClick={() => updateQuery({ actorType: null })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentSector !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 text-[#1E1B2E] border border-stone-200">
              Subsektor: {currentSector}
              <button
                onClick={() => updateQuery({ sector: null })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentLocation !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 text-[#1E1B2E] border border-stone-200">
              Kota: {currentLocation}
              <button
                onClick={() => updateQuery({ location: null })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentStyle !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 text-[#1E1B2E] border border-stone-200">
              Estetika: {currentStyle}
              <button
                onClick={() => updateQuery({ style: null })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentCompensation !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 text-[#1E1B2E] border border-stone-200">
              Skema: {currentCompensation}
              <button
                onClick={() => updateQuery({ compensation: null })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ENTITY TYPE TABS & SECTOR CHIPS */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: "ALL", label: "Semua Entitas" },
            { id: "STUDIO", label: "Studio Foto & Ruang" },
            { id: "INDIVIDUAL", label: "Talenta Kreatif" },
            { id: "BRAND", label: "Brand & Label" },
            { id: "COLLECTIVE", label: "Kolektif" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => updateQuery({ actorType: type.id })}
              className={`pb-1 whitespace-nowrap text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                currentType === type.id
                  ? "text-[#1E1B2E] border-b-2 border-[#1E1B2E] font-bold"
                  : "text-stone-400 hover:text-stone-600 border-b-2 border-transparent"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1">
          {[
            { id: "ALL", label: "Semua Subsektor" },
            { id: "Studio", label: "Studio Foto" },
            { id: "Fashion Designer / Label", label: "Brand / Designer" },
            { id: "Creative & Art Director", label: "Art Director" },
            { id: "Fotografi Editorial & Fashion", label: "Fotografi" },
            { id: "Stylist & Wardrobe", label: "Stylist" },
            { id: "Model & Talent Visual", label: "Model" },
            { id: "Videografi & Fashion Film", label: "Videografi" },
            { id: "Makeup & Hair Artist (MUA)", label: "MUA & Hair" },
            { id: "Set Design & Props", label: "Set & Props" },
          ].map((sector) => (
            <button
              key={sector.id}
              onClick={() => updateQuery({ sector: sector.id })}
              className={`px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                currentSector === sector.id
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
              }`}
            >
              {sector.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
