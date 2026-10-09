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
  { id: "Stylist", label: "Fashion Stylist & Wardrobe" },
  { id: "MUA", label: "Makeup & Hair (MUA)" },
  { id: "Studio", label: "Studio & Ruang" },
];

export const PROJECT_COMPENSATION_FILTERS = [
  { id: "ALL", label: "Semua Kompensasi", badge: "Semua Kompensasi" },
  { id: "PAID", label: "Honorarium Flat per Peran", badge: "Fee Flat per Peran" },
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
    <div className="space-y-3.5 pb-5 border-b border-slate-200/60">
      {/* 1. TOP ROW: GLASS SEARCH & VIEW MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <div className="relative flex items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari lowongan brief, brand, peran yang dicari, atau target luaran..."
              className="w-full pl-10 pr-24 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-white/80 focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-hidden shadow-xs"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    updateQuery({ search: null });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-full"
                  title="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary-pill px-3.5 py-1.5 text-[11px] font-semibold cursor-pointer shadow-xs"
              >
                {isPending ? "Mencari..." : "Cari"}
              </button>
            </div>
          </div>
        </form>

        {/* VIEW MODE TOGGLE (ROUNDED PILL CONTROL) */}
        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md p-1 rounded-full border border-white/80 self-end sm:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => updateQuery({ view: "grid" })}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              currentView === "grid"
                ? "bg-[#4CC9FE] text-white shadow-xs font-semibold"
                : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
            }`}
            title="Tampilan Kartu Galeri (Grid)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateQuery({ view: "list" })}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              currentView === "list"
                ? "bg-[#4CC9FE] text-white shadow-xs font-semibold"
                : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
            }`}
            title="Tampilan Baris Ringkas (List)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. SECOND ROW: GLASS FILTER SELECTORS & QUICK CHIPS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* ROLE SELECTOR */}
          <div className="relative inline-flex items-center">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={currentRole}
              onChange={(e) => updateQuery({ role: e.target.value })}
              className={`pl-8 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all outline-hidden appearance-none backdrop-blur-md ${
                currentRole !== "ALL"
                  ? "bg-[#4CC9FE] text-white border-[#4CC9FE] shadow-xs font-semibold"
                  : "bg-white/80 text-slate-700 border-white/80 hover:bg-white shadow-2xs"
              }`}
            >
              {PROJECT_ROLE_FILTERS.map((r) => (
                <option key={r.id} value={r.id} className="bg-white text-slate-900">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* COMPENSATION SELECTOR */}
          <div className="relative inline-flex items-center">
            <CircleDollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={currentCompensation}
              onChange={(e) => updateQuery({ compensation: e.target.value })}
              className={`pl-8 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all outline-hidden appearance-none backdrop-blur-md ${
                currentCompensation !== "ALL"
                  ? "bg-[#4CC9FE] text-white border-[#4CC9FE] shadow-xs font-semibold"
                  : "bg-white/80 text-slate-700 border-white/80 hover:bg-white shadow-2xs"
              }`}
            >
              {PROJECT_COMPENSATION_FILTERS.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900">
                  {c.badge}
                </option>
              ))}
            </select>
          </div>

          {/* LOCATION SELECTOR */}
          <div className="relative inline-flex items-center">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={currentLocation}
              onChange={(e) => updateQuery({ location: e.target.value })}
              className={`pl-8 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all outline-hidden appearance-none backdrop-blur-md ${
                currentLocation !== "ALL"
                  ? "bg-[#4CC9FE] text-white border-[#4CC9FE] shadow-xs font-semibold"
                  : "bg-white/80 text-slate-700 border-white/80 hover:bg-white shadow-2xs"
              }`}
            >
              {PROJECT_LOCATION_FILTERS.map((l) => (
                <option key={l.id} value={l.id} className="bg-white text-slate-900">
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border backdrop-blur-md ${
              currentCompensation === "PAID"
                ? "bg-[#4CC9FE] text-white border-[#4CC9FE] shadow-xs font-semibold"
                : "bg-white/80 hover:bg-white text-slate-700 border-white/80 shadow-2xs"
            }`}
          >
            {currentCompensation === "PAID" && <Check className="w-3 h-3 text-white" />}
            <span>Hanya Berbayar (Paid)</span>
          </button>

          {/* USER SECTOR QUICK MATCH BUTTON */}
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border backdrop-blur-md ${
                currentRole !== "ALL" &&
                (userSector.toLowerCase().includes(currentRole.toLowerCase()) ||
                  currentRole.toLowerCase().includes(userSector.toLowerCase()))
                  ? "bg-[#4CC9FE] text-white border-[#4CC9FE] shadow-xs font-semibold"
                  : "bg-white/80 hover:bg-white text-slate-700 border-white/80 shadow-2xs"
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#0284c7]" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 bg-white/60 hover:bg-white rounded-full border border-white/80 transition-all cursor-pointer shadow-2xs"
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
          <span className="text-[11px] font-medium text-slate-400">
            Filter diterapkan:
          </span>
          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/90 text-slate-700 rounded-full text-[11px] font-medium border border-white/90 shadow-2xs">
              Kata kunci: &ldquo;{currentSearch}&rdquo;
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateQuery({ search: null });
                }}
                className="hover:text-slate-900 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeRoleObj && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/90 text-slate-700 rounded-full text-[11px] font-medium border border-white/90 shadow-2xs">
              Peran: {activeRoleObj.label}
              <button
                type="button"
                onClick={() => updateQuery({ role: "ALL" })}
                className="hover:text-slate-900 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeCompObj && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/90 text-slate-700 rounded-full text-[11px] font-medium border border-white/90 shadow-2xs">
              Kompensasi: {activeCompObj.badge}
              <button
                type="button"
                onClick={() => updateQuery({ compensation: "ALL" })}
                className="hover:text-slate-900 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeLocObj && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/90 text-slate-700 rounded-full text-[11px] font-medium border border-white/90 shadow-2xs">
              Lokasi: {activeLocObj.label}
              <button
                type="button"
                onClick={() => updateQuery({ location: "ALL" })}
                className="hover:text-slate-900 cursor-pointer ml-0.5"
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
