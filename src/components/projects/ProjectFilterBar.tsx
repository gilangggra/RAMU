"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  X,
  MapPin,
  CircleDollarSign,
  Briefcase,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface ProjectFilterBarProps {
  currentSearch?: string;
  currentRole?: string;
  currentLocation?: string;
  currentCompensation?: string;
  currentView?: string;
  userSector?: string;
}

export const PROJECT_ROLE_FILTERS = [
  { id: "ALL", label: "Semua Peran" },
  { id: "Foto", label: "Fotografer" },
  { id: "Model", label: "Model / Muse" },
  { id: "Stylist", label: "Fashion Stylist" },
  { id: "MUA", label: "Makeup & Hair (MUA)" },
  { id: "Video", label: "Videografer / DoP" },
  { id: "Desain", label: "Fashion Designer" },
  { id: "Studio", label: "Studio & Ruang" },
  { id: "Director", label: "Art Director" },
  { id: "Props", label: "Set & Props" },
];

export const PROJECT_COMPENSATION_FILTERS = [
  { id: "ALL", label: "Semua Kompensasi", badge: "Semua" },
  { id: "PAID", label: "Fee Komersial (Paid)", badge: "Paid (Berbayar)" },
  { id: "BARTER", label: "Barter Produk / Jasa", badge: "Barter" },
  { id: "TFP", label: "TFP (Trade for Portfolio)", badge: "TFP" },
  { id: "REVENUE_SHARE", label: "Bagi Hasil (Revenue Share)", badge: "Rev-Share" },
];

export const PROJECT_LOCATION_FILTERS = [
  { id: "ALL", label: "Semua Lokasi" },
  { id: "Jakarta", label: "Jakarta / Jabodetabek" },
  { id: "Bandung", label: "Bandung" },
  { id: "Bali", label: "Bali" },
  { id: "Surabaya", label: "Surabaya" },
  { id: "Yogyakarta", label: "Yogyakarta" },
  { id: "Solo", label: "Solo / Surakarta" },
  { id: "Semarang", label: "Semarang" },
  { id: "Medan", label: "Medan" },
];

export function ProjectFilterBar({
  currentSearch = "",
  currentRole = "ALL",
  currentLocation = "ALL",
  currentCompensation = "ALL",
  currentView = "grid",
  userSector = "",
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
    if (currentView && currentView !== "grid") {
      params.set("view", currentView);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    (currentRole !== "ALL" && currentRole !== "") ||
    (currentLocation !== "ALL" && currentLocation !== "") ||
    (currentCompensation !== "ALL" && currentCompensation !== "");

  const activeRoleObj = PROJECT_ROLE_FILTERS.find(
    (r) => r.id === currentRole && r.id !== "ALL"
  );
  const activeCompObj = PROJECT_COMPENSATION_FILTERS.find(
    (c) => c.id === currentCompensation && c.id !== "ALL"
  );
  const activeLocObj = PROJECT_LOCATION_FILTERS.find(
    (l) => l.id === currentLocation && l.id !== "ALL"
  );

  return (
    <div className="space-y-4 pb-6 border-b border-stone-200">
      {/* 1. TOP ROW: SMART SEARCH & VIEW MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <div className="relative flex items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari brief proyek, tema editorial, kebutuhan kru, atau brand..."
              className="w-full pl-11 pr-24 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-1 focus:ring-[#1E1B2E] text-xs sm:text-sm font-medium text-stone-800 placeholder:text-stone-400 transition-all outline-hidden shadow-2xs"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    updateQuery({ search: null });
                  }}
                  className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer rounded-md"
                  title="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="px-3.5 py-1.5 bg-[#1E1B2E] hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {isPending ? "Mencari..." : "Cari"}
              </button>
            </div>
          </div>
        </form>

        {/* VIEW MODE TOGGLE (GRID VS COMPACT LIST) */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => updateQuery({ view: "grid" })}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              currentView === "grid"
                ? "bg-[#1E1B2E] text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900"
            }`}
            title="Tampilan Kartu Galeri (Grid)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateQuery({ view: "list" })}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              currentView === "list"
                ? "bg-[#1E1B2E] text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900"
            }`}
            title="Tampilan Baris Ringkas (List)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SECOND ROW: COMPACT SELECTORS & QUICK FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* ROLE SELECTOR */}
          <div className="relative inline-flex items-center">
            <Briefcase className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
            <select
              value={currentRole}
              onChange={(e) => updateQuery({ role: e.target.value })}
              className={`pl-8 pr-7 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors outline-hidden appearance-none bg-stone-50 hover:bg-white ${
                currentRole !== "ALL"
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                  : "border-stone-200 text-stone-700"
              }`}
            >
              {PROJECT_ROLE_FILTERS.map((r) => (
                <option key={r.id} value={r.id} className="bg-white text-stone-900">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* COMPENSATION SELECTOR */}
          <div className="relative inline-flex items-center">
            <CircleDollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
            <select
              value={currentCompensation}
              onChange={(e) => updateQuery({ compensation: e.target.value })}
              className={`pl-8 pr-7 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors outline-hidden appearance-none bg-stone-50 hover:bg-white ${
                currentCompensation !== "ALL"
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                  : "border-stone-200 text-stone-700"
              }`}
            >
              {PROJECT_COMPENSATION_FILTERS.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-stone-900">
                  {c.badge}
                </option>
              ))}
            </select>
          </div>

          {/* LOCATION SELECTOR */}
          <div className="relative inline-flex items-center">
            <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
            <select
              value={currentLocation}
              onChange={(e) => updateQuery({ location: e.target.value })}
              className={`pl-8 pr-7 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors outline-hidden appearance-none bg-stone-50 hover:bg-white ${
                currentLocation !== "ALL"
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                  : "border-stone-200 text-stone-700"
              }`}
            >
              {PROJECT_LOCATION_FILTERS.map((l) => (
                <option key={l.id} value={l.id} className="bg-white text-stone-900">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* USER SECTOR QUICK MATCH BUTTON */}
          {userSector && (
            <button
              type="button"
              onClick={() => {
                const detectedRole = PROJECT_ROLE_FILTERS.find((r) =>
                  r.label.toLowerCase().includes(userSector.toLowerCase()) ||
                  userSector.toLowerCase().includes(r.id.toLowerCase())
                );
                const targetRoleId = detectedRole ? detectedRole.id : userSector;
                updateQuery({
                  role: currentRole === targetRoleId ? "ALL" : targetRoleId,
                });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                currentRole !== "ALL" &&
                (userSector.toLowerCase().includes(currentRole.toLowerCase()) ||
                  currentRole.toLowerCase().includes(userSector.toLowerCase()))
                  ? "bg-amber-400 text-stone-950 border-amber-400 shadow-xs"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200/80"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sesuai Peran Saya ({userSector})</span>
            </button>
          )}
        </div>

        {/* ACTIVE FILTERS & RESET */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. ACTIVE FILTER CHIPS (IF ANY) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Filter Aktif:
          </span>
          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-xs font-medium">
              Kata kunci: &ldquo;{currentSearch}&rdquo;
              <button
                type="button"
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
          {activeRoleObj && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-xs font-medium">
              Peran: {activeRoleObj.label}
              <button
                type="button"
                onClick={() => updateQuery({ role: "ALL" })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeCompObj && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-xs font-medium">
              Kompensasi: {activeCompObj.badge}
              <button
                type="button"
                onClick={() => updateQuery({ compensation: "ALL" })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeLocObj && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-xs font-medium">
              Lokasi: {activeLocObj.label}
              <button
                type="button"
                onClick={() => updateQuery({ location: "ALL" })}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
