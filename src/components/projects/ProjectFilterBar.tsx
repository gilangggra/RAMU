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
  Check,
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
  { id: "ALL", label: "Semua Kompensasi", badge: "Semua Kompensasi" },
  { id: "PAID", label: "Fee Komersial (Paid)", badge: "Paid (Berbayar)" },
  { id: "BARTER", label: "Barter Produk / Jasa", badge: "Barter Portofolio" },
  { id: "TFP", label: "TFP (Trade for Portfolio)", badge: "TFP Kolaborasi" },
  { id: "REVENUE_SHARE", label: "Bagi Hasil (Revenue Share)", badge: "Bagi Hasil" },
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
    <div className="space-y-3.5 pb-5 border-b border-stone-200/80">
      {/* 1. TOP ROW: ATTIO MINIMAL SEARCH & VIEW MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <div className="relative flex items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari lowongan brief, brand, peran yang dicari, atau target luaran..."
              className="w-full pl-9 pr-24 py-2.5 bg-white rounded-lg border border-stone-200/90 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-xs font-medium text-stone-900 placeholder:text-stone-400 transition-all outline-hidden shadow-2xs"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    updateQuery({ search: null });
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer rounded"
                  title="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold rounded-md transition-colors cursor-pointer shadow-2xs"
              >
                {isPending ? "Mencari..." : "Cari"}
              </button>
            </div>
          </div>
        </form>

        {/* VIEW MODE TOGGLE (ATTIO SEGMENTED ICON CONTROL) */}
        <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg border border-stone-200/70 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => updateQuery({ view: "grid" })}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              currentView === "grid"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "text-stone-400 hover:text-stone-700"
            }`}
            title="Tampilan Kartu Galeri (Grid)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateQuery({ view: "list" })}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              currentView === "list"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "text-stone-400 hover:text-stone-700"
            }`}
            title="Tampilan Baris Ringkas (List)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. SECOND ROW: ATTIO FILTER DROPDOWNS & QUICK CHIPS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* ROLE SELECTOR */}
          <div className="relative inline-flex items-center">
            <Briefcase className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentRole}
              onChange={(e) => updateQuery({ role: e.target.value })}
              className={`pl-7 pr-6 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors outline-hidden appearance-none ${
                currentRole !== "ALL"
                  ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                  : "bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50"
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
            <CircleDollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentCompensation}
              onChange={(e) => updateQuery({ compensation: e.target.value })}
              className={`pl-7 pr-6 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors outline-hidden appearance-none ${
                currentCompensation !== "ALL"
                  ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                  : "bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50"
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
            <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentLocation}
              onChange={(e) => updateQuery({ location: e.target.value })}
              className={`pl-7 pr-6 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors outline-hidden appearance-none ${
                currentLocation !== "ALL"
                  ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                  : "bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50"
              }`}
            >
              {PROJECT_LOCATION_FILTERS.map((l) => (
                <option key={l.id} value={l.id} className="bg-white text-stone-900">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* QUICK TOGGLE: BERBAYAR ONLY */}
          <button
            type="button"
            onClick={() =>
              updateQuery({
                compensation: currentCompensation === "PAID" ? "ALL" : "PAID",
              })
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              currentCompensation === "PAID"
                ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200/90"
            }`}
          >
            {currentCompensation === "PAID" && <Check className="w-3 h-3 text-emerald-400" />}
            <span>Hanya Berbayar (Paid)</span>
          </button>

          {/* USER SECTOR QUICK MATCH BUTTON (CLEAN ATTIO STYLE) */}
          {userSector && (
            <button
              type="button"
              onClick={() => {
                const detectedRole = PROJECT_ROLE_FILTERS.find(
                  (r) =>
                    r.label.toLowerCase().includes(userSector.toLowerCase()) ||
                    userSector.toLowerCase().includes(r.id.toLowerCase())
                );
                const targetRoleId = detectedRole ? detectedRole.id : userSector;
                updateQuery({
                  role: currentRole === targetRoleId ? "ALL" : targetRoleId,
                });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                currentRole !== "ALL" &&
                (userSector.toLowerCase().includes(currentRole.toLowerCase()) ||
                  currentRole.toLowerCase().includes(userSector.toLowerCase()))
                  ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80"
              }`}
            >
              <Sparkles className="w-3 h-3 text-stone-500" />
              <span>Sesuai Profil ({userSector})</span>
            </button>
          )}
        </div>

        {/* ACTIVE FILTERS & RESET */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. ACTIVE FILTER CHIPS */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
          <span className="text-[11px] font-medium text-stone-400">
            Filter diterapkan:
          </span>
          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium border border-stone-200/60">
              Kata kunci: &ldquo;{currentSearch}&rdquo;
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateQuery({ search: null });
                }}
                className="hover:text-stone-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeRoleObj && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium border border-stone-200/60">
              Peran: {activeRoleObj.label}
              <button
                type="button"
                onClick={() => updateQuery({ role: "ALL" })}
                className="hover:text-stone-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeCompObj && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium border border-stone-200/60">
              Kompensasi: {activeCompObj.badge}
              <button
                type="button"
                onClick={() => updateQuery({ compensation: "ALL" })}
                className="hover:text-stone-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeLocObj && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium border border-stone-200/60">
              Lokasi: {activeLocObj.label}
              <button
                type="button"
                onClick={() => updateQuery({ location: "ALL" })}
                className="hover:text-stone-900 cursor-pointer"
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
