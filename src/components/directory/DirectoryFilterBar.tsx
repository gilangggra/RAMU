"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

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
    <div className="space-y-6 pb-6 border-b border-stone-200">
      
      {/* Top Row: Search & Location */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md group">
          <Search className="w-4 h-4 text-stone-400 absolute left-0 top-1/2 -translate-y-1/2 group-focus-within:text-[#1E1B2E] transition-colors pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search portfolios, studios, roles..."
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

        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">City</span>
            <select
              value={currentLocation}
              onChange={(e) => updateQuery({ location: e.target.value })}
              className="bg-transparent text-sm text-[#1E1B2E] font-medium focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="ALL">Worldwide</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Yogyakarta">Yogyakarta</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Bali">Bali</option>
            </select>
          </div>
          
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-[#1E1B2E] transition-colors pb-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* Actor Types */}
        <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Entities" },
            { id: "STUDIO", label: "Studios" },
            { id: "INDIVIDUAL", label: "Creatives" },
            { id: "MSME", label: "Brands" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => updateQuery({ actorType: type.id })}
              className={`pb-1 whitespace-nowrap text-xs font-semibold uppercase tracking-widest transition-all ${
                currentType === type.id
                  ? "text-[#1E1B2E] border-b border-[#1E1B2E]"
                  : "text-stone-400 hover:text-stone-600 border-b border-transparent"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Sectors */}
        <div className="flex items-center gap-4 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Sectors" },
            { id: "Fashion Designer / Label", label: "Fashion Designer / Label" },
            { id: "Creative & Art Director", label: "Creative & Art Director" },
            { id: "Fotografi Editorial & Fashion", label: "Fotografi Editorial & Fashion" },
            { id: "Stylist & Wardrobe", label: "Stylist & Wardrobe" },
            { id: "Model & Talent Visual", label: "Model & Talent Visual" },
            { id: "Videografi & Fashion Film", label: "Videografi & Fashion Film" },
            { id: "Makeup & Hair Artist (MUA)", label: "Makeup & Hair Artist (MUA)" },
            { id: "Set Design & Props", label: "Set Design & Props" },
            { id: "Lainnya", label: "Lainnya" },
          ].map((sector) => (
            <button
              key={sector.id}
              onClick={() => updateQuery({ sector: sector.id })}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                currentSector === sector.id
                  ? "bg-[#1E1B2E] text-white"
                  : "bg-transparent text-stone-500 hover:bg-stone-100"
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
