"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  LayoutGrid,
  List,
  ShieldCheck,
  FileCheck,
  FileText,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

export interface CollaborationItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startedAt: Date | string | null;
  targetEndAt: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  plan?: {
    id?: string;
    title?: string;
    objective?: string;
    opportunityId?: string | null;
    opportunity?: {
      id?: string;
      pattern?: {
        name: string;
        code: string;
        category?: string | null;
      } | null;
    } | null;
  } | null;
  participants: Array<{
    id: string;
    actorId: string;
    roleCode: string;
    status: string;
    signedAt: Date | string | null;
    actor: {
      id: string;
      name: string;
      sector: string;
      location?: string | null;
      actorType?: string;
      owner?: {
        avatarUrl?: string | null;
      } | null;
    };
  }>;
  tasks: Array<{
    id: string;
    status: string;
    title?: string;
    priority?: string;
    dueDate?: Date | string | null;
  }>;
  milestones: Array<{
    id: string;
    status: string;
    title?: string;
    targetDate?: Date | string | null;
  }>;
  hasLinkedSpk?: boolean;
}

interface CollaborationCatalogViewProps {
  collaborations: CollaborationItem[];
  currentActorId: string;
  isAdmin?: boolean;
  initialTab?: string;
  initialSearch?: string;
  initialView?: "grid" | "list";
}

export function CollaborationCatalogView({
  collaborations,
  currentActorId,
  isAdmin = false,
  initialTab = "all",
  initialSearch = "",
  initialView = "grid",
}: CollaborationCatalogViewProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialView);
  const [sortBy, setSortBy] = useState<"updated" | "progress" | "tasks">("updated");

  // Tab counts
  const totalCount = collaborations.length;
  const activeCount = collaborations.filter((c) => c.status === "ACTIVE").length;
  const completedCount = collaborations.filter((c) => c.status === "COMPLETED").length;

  // Filtered & sorted collaborations
  const filteredCollaborations = useMemo(() => {
    let result = [...collaborations];

    // Filter by tab
    if (activeTab === "active") {
      result = result.filter((c) => c.status === "ACTIVE");
    } else if (activeTab === "completed") {
      result = result.filter((c) => c.status === "COMPLETED");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(q);
        const descMatch = (c.description || "").toLowerCase().includes(q);
        const objMatch = (c.plan?.objective || "").toLowerCase().includes(q);
        const patternMatch = (c.plan?.opportunity?.pattern?.name || "").toLowerCase().includes(q);
        const partnerMatch = c.participants.some(
          (p) =>
            p.actor.name.toLowerCase().includes(q) ||
            p.actor.sector.toLowerCase().includes(q) ||
            p.roleCode.toLowerCase().includes(q)
        );
        return titleMatch || descMatch || objMatch || patternMatch || partnerMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "progress") {
        const aTotalTasks = a.tasks.length;
        const aDone = a.tasks.filter((t) => t.status === "DONE").length;
        const aProg = aTotalTasks > 0 ? aDone / aTotalTasks : 0;

        const bTotalTasks = b.tasks.length;
        const bDone = b.tasks.filter((t) => t.status === "DONE").length;
        const bProg = bTotalTasks > 0 ? bDone / bTotalTasks : 0;

        return bProg - aProg;
      }
      if (sortBy === "tasks") {
        return b.tasks.length - a.tasks.length;
      }
      // default "updated"
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    return result;
  }, [collaborations, activeTab, searchQuery, sortBy]);

  const tabs = [
    { key: "all", label: "Semua Proyek", count: totalCount },
    { key: "active", label: "Sedang Berjalan", count: activeCount },
    { key: "completed", label: "Tuntas Selesai", count: completedCount },
  ];

  return (
    <div className="space-y-5">
      {/* 1. CONTROLS TOOLBAR: TABS + SEARCH + SORT + VIEW (MATCHES BOOKINGSCLIENTVIEW) */}
      <div className="bg-white/60 backdrop-blur-2xl p-3 sm:p-3.5 rounded-[22px] border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Segmented Filter Pills */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100/80 border border-slate-200/60 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-full active:scale-95 whitespace-nowrap ${
                  isActive
                    ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25 border-transparent"
                    : "bg-white/80 hover:bg-white text-slate-600 hover:text-[#0284c7] border border-white/80 shadow-2xs"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Sort & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek, mitra, peran..."
              className="w-full sm:w-56 pl-9 pr-7 py-2 bg-white/80 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2 bg-white/80 border border-slate-200/90 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all cursor-pointer shadow-2xs"
            >
              <option value="updated">Terbaru Diperbarui</option>
              <option value="progress">Progres Tertinggi</option>
              <option value="tasks">Tugas Terbanyak</option>
            </select>
          </div>

          {/* Grid vs List View Pills */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Tampilan Grid Kartu"
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#0284c7] shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Tampilan Tabel"
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#0284c7] shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. KONTEN AREA (GRID ATAU LIST) */}
      {filteredCollaborations.length === 0 ? (
        <div className="p-12 sm:p-14 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[22px] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3.5 max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] mx-auto shadow-2xs">
            {searchQuery ? <Search className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {searchQuery
                ? "Tidak ada proyek yang sesuai pencarian"
                : activeTab === "completed"
                ? "Belum ada proyek yang selesai"
                : "Belum ada ruang kerja kolaborasi aktif"}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-normal leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan hasil yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain atau bersihkan filter.`
                : activeTab === "completed"
                ? "Semua proyek yang sudah rampung dieksekusi dan disetujui akan diarsipkan di tab ini secara rapi."
                : "Jelajahi brief di Eksplorasi Proyek atau rekomendasi mitra komplementer untuk memulai kolaborasi baru."}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-5 py-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold border border-white/80 shadow-xs transition-all cursor-pointer"
              >
                Reset Pencarian
              </button>
            ) : !isAdmin ? (
              <>
                <Link
                  href="/projects"
                  className="btn-primary-pill !text-xs !py-2.5 !px-5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Jelajahi Papan Proyek</span>
                </Link>
                <Link
                  href="/directory?tab=matched"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-slate-900 text-xs font-semibold border border-white/80 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rekomendasi Mitra</span>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCollaborations.map((collab) => {
            const totalTasks = collab.tasks.length;
            const doneTasks = collab.tasks.filter((t) => t.status === "DONE").length;
            const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

            const totalMilestones = collab.milestones.length;
            const doneMilestones = collab.milestones.filter((m) => m.status === "ACHIEVED").length;
            const milestoneProgress =
              totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

            const oppPatternName =
              collab.plan?.opportunity?.pattern?.name || "Proyek Kolaboratif";

            // SPK signing calculation
            const totalParticipants = collab.participants.length;
            const signedCount = collab.participants.filter((p) => Boolean(p.signedAt)).length;
            const allSigned = totalParticipants > 0 && signedCount === totalParticipants;
            const isCompleted = collab.status === "COMPLETED";

            return (
              <div
                key={collab.id}
                className="p-5 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[22px] shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] hover:bg-white/80 hover:border-white transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Category, Status & SPK Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-slate-700 border border-slate-200/80 shadow-2xs">
                        {oppPatternName}
                      </span>

                      {/* SPK Legal Badge */}
                      {allSigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>SPK Sah Terikat</span>
                        </span>
                      ) : signedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                          <FileCheck className="w-3 h-3 text-amber-600" />
                          <span>SPK {signedCount}/{totalParticipants} Ditandatangani</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-slate-600 border border-slate-200/70 shadow-2xs">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>Draf SPK</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${
                        isCompleted
                          ? "bg-slate-100 text-slate-700 border-slate-200/80"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                      }`}
                    >
                      {!isCompleted && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span>{isCompleted ? "Selesai" : "Berjalan"}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <Link
                      href={`/collaborations/${collab.id}`}
                      className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-[#0284c7] transition-colors line-clamp-1 inline-flex items-center gap-1.5"
                    >
                      <span>{collab.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] transition-colors" />
                    </Link>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {collab.description || collab.plan?.objective || "Ruang kerja eksekusi kolaborasi aktif."}
                    </p>
                  </div>

                  {/* Inner Panel: Team & Metrics (rounded-2xl) */}
                  <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 space-y-3">
                    {/* Participants Avatar Row */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Mitra Tim ({collab.participants.length})</span>
                        <span className="font-normal text-slate-500 capitalize">
                          {allSigned ? "Seluruh pihak bertandatangan" : `${signedCount}/${totalParticipants} bertandatangan`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {collab.participants.map((p) => {
                          const isYou = p.actorId === currentActorId;
                          const isSigned = Boolean(p.signedAt);
                          return (
                            <div
                              key={p.id}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                                isYou
                                  ? "bg-[#111827] text-white border-[#111827] shadow-2xs"
                                  : "bg-white/80 text-slate-700 border-slate-200/80 shadow-2xs"
                              }`}
                              title={`${p.actor.name} (${p.actor.sector}) - ${p.roleCode}`}
                            >
                              <ActorAvatar
                                name={p.actor.name}
                                avatarUrl={p.actor.owner?.avatarUrl}
                                className="w-4 h-4 rounded-full"
                                textClassName="text-[8px]"
                              />
                              <span className="truncate max-w-[120px] text-[11px]">
                                {p.actor.name}
                                {isYou && " (Anda)"}
                              </span>
                              {isSigned && (
                                <CheckCircle2
                                  className={`w-3 h-3 shrink-0 ${
                                    isYou ? "text-emerald-300" : "text-emerald-600"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dual Metric Bars: Tasks & Milestones */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <span>Tugas</span>
                          </span>
                          <span className="font-mono text-[#0284c7]">
                            {doneTasks}/{totalTasks}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0284c7] to-[#4CC9FE] rounded-full transition-all duration-300"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            <span>Milestone</span>
                          </span>
                          <span className="font-mono text-emerald-700">
                            {doneMilestones}/{totalMilestones}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${milestoneProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      Diperbarui{" "}
                      {new Date(collab.updatedAt || collab.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/collaborations/${collab.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 hover:text-[#0284c7] text-xs font-semibold border border-white/80 shadow-2xs group-hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <span>Buka Ruang Kerja</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW TABLE (MATCHES ROUNDED-[24PX] GLASSMORPHISM) */
        <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[22px] shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Proyek &amp; Pola</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Mitra Tim</th>
                  <th className="py-3.5 px-4">Progres Tugas</th>
                  <th className="py-3.5 px-4">Milestone</th>
                  <th className="py-3.5 px-4">Legalitas SPK</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCollaborations.map((collab) => {
                  const totalTasks = collab.tasks.length;
                  const doneTasks = collab.tasks.filter((t) => t.status === "DONE").length;
                  const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                  const totalMilestones = collab.milestones.length;
                  const doneMilestones = collab.milestones.filter((m) => m.status === "ACHIEVED").length;

                  const oppPatternName =
                    collab.plan?.opportunity?.pattern?.name || "Proyek Kolaboratif";

                  const totalParticipants = collab.participants.length;
                  const signedCount = collab.participants.filter((p) => Boolean(p.signedAt)).length;
                  const allSigned = totalParticipants > 0 && signedCount === totalParticipants;
                  const isCompleted = collab.status === "COMPLETED";

                  return (
                    <tr
                      key={collab.id}
                      className="hover:bg-white/80 transition-colors group"
                    >
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="space-y-0.5">
                          <Link
                            href={`/collaborations/${collab.id}`}
                            className="font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors line-clamp-1 text-xs"
                          >
                            {collab.title}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {oppPatternName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${
                            isCompleted
                              ? "bg-slate-100 text-slate-700 border-slate-200/80"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                          }`}
                        >
                          {!isCompleted && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          <span>{isCompleted ? "Selesai" : "Berjalan"}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center -space-x-1.5">
                          {collab.participants.slice(0, 3).map((p) => (
                            <span
                              key={p.id}
                              className="w-6 h-6 rounded-full border-2 border-white overflow-hidden shrink-0 inline-flex items-center justify-center shadow-2xs"
                              title={`${p.actor.name} (${p.actor.sector})`}
                            >
                              <ActorAvatar
                                name={p.actor.name}
                                avatarUrl={p.actor.owner?.avatarUrl}
                                className="w-full h-full rounded-full"
                                textClassName="text-[9px]"
                              />
                            </span>
                          ))}
                          {collab.participants.length > 3 && (
                            <span className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600 shadow-2xs">
                              +{collab.participants.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[120px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span>{doneTasks}/{totalTasks} Tugas</span>
                            <span className="font-bold text-slate-800 font-mono">{taskProgress}%</span>
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#0284c7] to-[#4CC9FE] rounded-full"
                              style={{ width: `${taskProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        <span className="text-emerald-700 font-bold font-mono">{doneMilestones}</span>
                        <span className="text-slate-400">/{totalMilestones} Tuntas</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {allSigned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Sah Terikat</span>
                          </span>
                        ) : signedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                            <FileCheck className="w-3 h-3 text-amber-600" />
                            <span>{signedCount}/{totalParticipants} Ditandatangani</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-slate-600 border border-slate-200/70 shadow-2xs">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Draf SPK</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Link
                          href={`/collaborations/${collab.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-[#0284c7] text-xs font-semibold border border-white/80 transition-colors shadow-2xs"
                        >
                          <span>Buka</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
