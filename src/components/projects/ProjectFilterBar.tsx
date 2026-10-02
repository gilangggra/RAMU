"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, MapPin, CircleDollarSign } from "lucide-react";

interface ProjectFilterBarProps {
  currentSearch?: string;
  currentRole?: string;
  currentLocation?: string;
  currentCompensation?: string;
}

export const PROJECT_ROLE_FILTERS = [
  { id: "ALL", label: "Semua Kebutuhan Peran" },
  { id: "Foto", label: "Fotografer" },
  { id: "Model", label: "Model / Muse" },
  { id: "Stylist", label: "Fashion Stylist" },
  { id: "MUA", label: "Makeup & Hair (MUA)" },
  { id: "Video", label: "Videografer" },
  { id: "Desain", label: "Fashion Designer" },
];

export const PROJECT_LOCATION_FILTERS = [
  { id: "ALL", label: "Semua Kota / Lokasi" },
  { id: "Jakarta", label: "Jakarta / Jabodetabek" },
  { id: "Bandung", label: "Bandung" },
  { id: "Bali", label: "Bali" },
  { id: "Surabaya", label: "Surabaya" },
  { id: "Yogyakarta", label: "Yogyakarta" },
];

export const PROJECT_COMPENSATION_FILTERS = [
  { id: "ALL", label: "Semua Skema Kompensasi" },
  { id: "PAID", label: "Fee Komersial (Paid)" },
  { id: "REVENUE_SHARE", label: "Bagi Hasil (Revenue Share)" },
  { id: "VOLUNTEER", label: "Gotong Royong / Barter" },
];

export function ProjectFilterBar({
  currentSearch = "",
  currentRole = "ALL",
  currentLocation = "ALL",
  currentCompensation = "ALL",
}: ProjectFilterBarProps) {
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
    // Always keep current tab or default to browse
    if (!params.has("tab")) {
      params.set("tab", "browse");
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
    const params = new URLSearchParams();
    params.set("tab", searchParams?.get("tab") || "browse");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    (currentRole !== "ALL" && currentRole !== "") ||
    (currentLocation !== "ALL" && currentLocation !== "") ||
    (currentCompensation !== "ALL" && currentCompensation !== "");

  return (
    <div className="space-y-4 pb-6 border-b border-stone-200">
      {/* SEARCH INPUT BAR */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari project brief, tema editorial, kebutuhan kru (Fotografer, MUA, Model, Stylist), lokasi..."
            className="w-full pl-11 pr-24 py-3.5 bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-xs sm:text-sm font-medium text-stone-800 placeholder:text-stone-400 transition-colors rounded-none outline-none shadow-2xs"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateQuery({ search: null });
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="px-3.5 py-1.5 bg-[#1E1B2E] hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
            >
              {isPending ? "Mencari..." : "Cari"}
            </button>
          </div>
        </div>
      </form>

      {/* ROLE QUICK FILTERS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mr-1 hidden sm:inline-block">
          Peran:
        </span>
        {PROJECT_ROLE_FILTERS.map((filter) => {
          const isSelected =
            currentRole === filter.id ||
            (filter.id === "ALL" && (!currentRole || currentRole === "ALL"));
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => updateQuery({ role: filter.id === "ALL" ? null : filter.id })}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border ${
                isSelected
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* SECONDARY ROW: LOCATION & COMPENSATION DROPDOWNS / FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Lokasi Selector */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-[11px] font-semibold text-stone-500">Lokasi:</span>
            <select
              value={currentLocation}
              onChange={(e) => updateQuery({ location: e.target.value === "ALL" ? null : e.target.value })}
              className="px-2.5 py-1 bg-white border border-stone-200 text-xs font-semibold text-stone-800 rounded-none focus:border-[#1E1B2E] outline-none cursor-pointer"
            >
              {PROJECT_LOCATION_FILTERS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kompensasi Selector */}
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-[11px] font-semibold text-stone-500">Skema:</span>
            <select
              value={currentCompensation}
              onChange={(e) => updateQuery({ compensation: e.target.value === "ALL" ? null : e.target.value })}
              className="px-2.5 py-1 bg-white border border-stone-200 text-xs font-semibold text-stone-800 rounded-none focus:border-[#1E1B2E] outline-none cursor-pointer"
            >
              {PROJECT_COMPENSATION_FILTERS.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-auto"
          >
            <X className="w-3 h-3" />
            <span>Reset Semua Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
