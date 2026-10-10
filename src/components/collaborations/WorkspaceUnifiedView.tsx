"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CollaborationCatalogView,
  CollaborationItem,
} from "@/components/collaborations/CollaborationCatalogView";
import {
  BookingsClientView,
  BookingActor,
  BookingItem,
} from "@/app/dashboard/bookings/BookingsClientView";
import {
  FolderKanban,
  FileText,
  Activity,
  CheckCircle2,
  Layers,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";

interface WorkspaceUnifiedViewProps {
  actor: BookingActor;
  isAdmin?: boolean;
  collaborations: CollaborationItem[];
  incomingBookings: BookingItem[];
  outgoingBookings: BookingItem[];
  initialSection?: "workspaces" | "contracts";
  initialCollabTab?: string;
  initialCollabSearch?: string;
  initialCollabView?: "grid" | "list";
  activeCount: number;
  completedCount: number;
  doneTasks: number;
  totalTasks: number;
  achievedMilestones: number;
  totalMilestones: number;
  uniquePartnersCount: number;
}

export function WorkspaceUnifiedView({
  actor,
  isAdmin = false,
  collaborations,
  incomingBookings,
  outgoingBookings,
  initialSection = "workspaces",
  initialCollabTab = "all",
  initialCollabSearch = "",
  initialCollabView = "grid",
  activeCount,
  completedCount,
  doneTasks,
  totalTasks,
  achievedMilestones,
  totalMilestones,
  uniquePartnersCount,
}: WorkspaceUnifiedViewProps) {
  const searchParams = useSearchParams();

  const urlSection = searchParams.get("section");
  const effectiveInitial = isAdmin ? "workspaces" : (urlSection === "contracts" ? "contracts" : initialSection);
  const [activeSection, setActiveSection] = useState<"workspaces" | "contracts">(effectiveInitial);

  useEffect(() => {
    if (isAdmin) {
      if (activeSection !== "workspaces") setActiveSection("workspaces");
      return;
    }
    if (urlSection === "contracts" && activeSection !== "contracts") {
      setActiveSection("contracts");
    } else if (urlSection === "workspaces" && activeSection !== "workspaces") {
      setActiveSection("workspaces");
    }
  }, [urlSection, activeSection, isAdmin]);

  const handleSectionSwitch = (section: "workspaces" | "contracts") => {
    if (isAdmin) return;
    setActiveSection(section);
    const params = new URLSearchParams(window.location.search);
    params.set("section", section);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const pendingIncomingCount = incomingBookings.filter((b) => b.status === "PENDING").length;
  const totalBookingsCount = incomingBookings.length + outgoingBookings.length;

  return (
    <div className="space-y-6 w-full">
      {/* 1. HEADER BANNER KONSISTEN (RAMU DESIGN SYSTEM) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {isAdmin ? "Audit Ruang Kerja Kolaborasi" : "Workspace & Kontrak"}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4CC9FE]/15 text-[#0284c7] text-[10px] font-bold border border-[#4CC9FE]/30">
              <Sparkles className="w-3 h-3 text-[#0284c7]" />
              {isAdmin ? "Mode Audit Platform" : "Ekosistem RAMU"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {isAdmin
              ? "Pusat pemantauan dan audit ruang kerja tim kreatif, milestone produksi, dan kepatuhan pelaksanaan proyek kolaboratif di platform RAMU."
              : "Pusat kolaborasi terpadu untuk mengelola ruang kerja tim kreatif, milestone produksi, penugasan tugas operasional, serta kepastian kontrak kerja resmi (SPK)."}
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-slate-900 text-xs font-semibold border border-white/80 shadow-xs transition-all cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>Eksplorasi Proyek</span>
            </Link>
            <Link
              href="/directory?tab=matched"
              className="btn-primary-pill !text-xs !py-2 !px-4.5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Rekomendasi Mitra</span>
            </Link>
          </div>
        )}
      </header>

      {/* 2. SECTION SWITCHER BAR KONSISTEN (GLASSMORPHISM ROUNDED-[24px]) */}
      {!isAdmin ? (
        <div className="bg-white/60 backdrop-blur-2xl p-3 sm:p-3.5 rounded-[22px] border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100/80 border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleSectionSwitch("workspaces")}
              className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-full active:scale-95 ${
                activeSection === "workspaces"
                  ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25 border-transparent"
                  : "bg-white/80 hover:bg-white text-slate-600 hover:text-[#0284c7] border border-white/80 shadow-2xs"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Ruang Kerja Tim</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeSection === "workspaces"
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {collaborations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSectionSwitch("contracts")}
              className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-full active:scale-95 ${
                activeSection === "contracts"
                  ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25 border-transparent"
                  : "bg-white/80 hover:bg-white text-slate-600 hover:text-[#0284c7] border border-white/80 shadow-2xs"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kontrak &amp; SPK</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeSection === "contracts"
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {totalBookingsCount}
              </span>
              {pendingIncomingCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{pendingIncomingCount} Perlu Ditanggapi</span>
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium px-2 hidden sm:block">
            {activeSection === "workspaces"
              ? "Mode Produksi & Penugasan Operasional"
              : "Mode Manajemen Kontrak & Perikatan Legal"}
          </div>
        </div>
      ) : null}

      {/* 3. KONTEN TAB: WORKSPACES */}
      {activeSection === "workspaces" && (
        <div className="space-y-6">
          {/* METRIC ANALYTIC RIBBON (KONSISTEN 24px DENGAN DASHBOARD & BOOKINGS) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Tile 1: Kolaborasi Aktif */}
            <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 truncate">Kolaborasi Aktif</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80 shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 ">
                  {activeCount}
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80 shadow-2xs">
                  Produksi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Sedang tahap produksi aktif</p>
            </div>

            {/* Tile 2: Proyek Tuntas */}
            <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 truncate">Proyek Tuntas</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/80 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 ">
                  {completedCount}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                  Selesai
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Karya &amp; arsip tersimpan rapi</p>
            </div>

            {/* Tile 3: Tugas & Milestone */}
            <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 truncate">Tugas &amp; Milestone</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-100/80 shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 ">
                  {doneTasks}
                </span>
                <span className="text-[11px] font-bold text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80 shadow-2xs">
                  /{totalTasks} Tugas
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold truncate">
                {achievedMilestones}/{totalMilestones} Milestone tercapai
              </p>
            </div>

            {/* Tile 4: Mitra Terhubung */}
            <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 truncate">Mitra Terhubung</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/80 shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 ">
                  {uniquePartnersCount}
                </span>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/80 shadow-2xs">
                  Talenta
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Kolektif lintas bidang terikat</p>
            </div>
          </section>

          {/* Catalog View */}
          <CollaborationCatalogView
            collaborations={collaborations}
            currentActorId={actor.id}
            isAdmin={isAdmin}
            initialTab={initialCollabTab}
            initialSearch={initialCollabSearch}
            initialView={initialCollabView}
          />
        </div>
      )}

      {/* 4. KONTEN TAB: CONTRACTS & SPK */}
      {activeSection === "contracts" && (
        <div className="space-y-6">
          <BookingsClientView
            primaryActor={actor}
            incomingBookings={incomingBookings}
            outgoingBookings={outgoingBookings}
            embedded={true}
          />
        </div>
      )}
    </div>
  );
}
