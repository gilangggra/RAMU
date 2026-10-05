"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  LayoutGrid,
  List,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Check,
  Sparkles,
  Briefcase,
  Calendar,
  Layers,
  Activity,
  ArrowUpRight,
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
  initialTab?: string;
  initialSearch?: string;
  initialView?: "grid" | "list";
}

export function CollaborationCatalogView({
  collaborations,
  currentActorId,
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
      {/* 1. ATTIO SEGMENTED TABS NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-0">
        <div className="flex items-center gap-1 text-xs overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2.5 px-3.5 flex items-center gap-2 font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "text-stone-900 font-semibold border-b-2 border-stone-900 -mb-px"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center pb-2 sm:pb-2.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            title="Tampilan Grid Kartu"
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                : "bg-white text-stone-500 hover:text-stone-900 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            title="Tampilan List Tabel"
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                : "bg-white text-stone-500 hover:text-stone-900 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. ATTIO SEARCH & CONTROL TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul proyek, nama mitra, atau peran..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-200 rounded-lg placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="text-[11px] font-medium hidden sm:inline text-stone-400">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs font-medium bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 transition-all cursor-pointer"
            >
              <option value="updated">Terbaru Diperbarui</option>
              <option value="progress">Progres Tertinggi</option>
              <option value="tasks">Jumlah Tugas Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. CONTENT AREA (GRID OR LIST) */}
      {filteredCollaborations.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/70 flex items-center justify-center mx-auto text-stone-500">
            {searchQuery ? <Search className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-semibold text-stone-900">
              {searchQuery
                ? "Tidak Ada Proyek yang Cocok"
                : activeTab === "completed"
                ? "Belum Ada Proyek Selesai"
                : "Belum Ada Proyek Kolaborasi Aktif"}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              {searchQuery
                ? `Tidak ditemukan hasil yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain atau bersihkan pencarian.`
                : activeTab === "completed"
                ? "Semua proyek yang sudah selesai dieksekusi dan disetujui akan diarsipkan di sini secara rapi."
                : "Pilih salah satu brief di Papan Proyek atau eksplorasi rekomendasi komplementaritas resource untuk memulai perikatan kolaborasi baru."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            ) : (
              <>
                <Link
                  href="/projects"
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Jelajahi Papan Proyek</span>
                </Link>
                <Link
                  href="/collaborate"
                  className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                  <span>Hub Kompatibilitas</span>
                </Link>
              </>
            )}
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
            const hasSpk = collab.hasLinkedSpk || signedCount > 0;

            const isCompleted = collab.status === "COMPLETED";

            return (
              <div
                key={collab.id}
                className="bg-white rounded-xl border border-stone-200/80 hover:border-stone-300 hover:shadow-xs transition-all p-5 flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Category, Status & SPK Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200/60">
                        {oppPatternName}
                      </span>

                      {/* SPK Legal Badge */}
                      {allSigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>SPK Sah &amp; Terikat</span>
                        </span>
                      ) : signedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                          <FileCheck className="w-3 h-3 text-amber-700" />
                          <span>SPK {signedCount}/{totalParticipants} Teken</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200/60">
                          <FileText className="w-3 h-3 text-stone-400" />
                          <span>SPK Multi-Pihak</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                        isCompleted
                          ? "bg-stone-100 text-stone-700 border border-stone-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
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
                    <h3 className="text-base sm:text-lg font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1 tracking-tight">
                      {collab.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-normal">
                      {collab.description || collab.plan?.objective || "Workspace eksekusi kolaborasi aktif."}
                    </p>
                  </div>

                  {/* Participants Avatar Row */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-medium text-stone-600">
                        Mitra Tim ({collab.participants.length})
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {allSigned ? "Semua telah menandatangani" : `${signedCount}/${totalParticipants} bertandatangan`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {collab.participants.map((p) => {
                        const isYou = p.actorId === currentActorId;
                        const isSigned = Boolean(p.signedAt);
                        return (
                          <div
                            key={p.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                              isYou
                                ? "bg-stone-900 text-white border-stone-900"
                                : "bg-stone-50 text-stone-700 border-stone-200/70"
                            }`}
                            title={`${p.actor.name} (${p.actor.sector}) - ${p.roleCode}`}
                          >
                            {/* Avatar image or initial */}
                            <ActorAvatar
                              name={p.actor.name}
                              avatarUrl={p.actor.owner?.avatarUrl}
                              className="w-4 h-4 rounded-full"
                              textClassName="text-[8px]"
                            />
                            <span className="font-medium truncate max-w-[120px] text-[11px]">
                              {p.actor.name}
                              {isYou && " (Anda)"}
                            </span>
                            {isSigned && (
                              <span title="Telah menandatangani SPK" className="inline-flex">
                                <CheckCircle2
                                  className={`w-3 h-3 shrink-0 ${
                                    isYou ? "text-emerald-300" : "text-emerald-600"
                                  }`}
                                />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dual Metric Bars: Tasks & Milestones */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-lg bg-stone-50/80 border border-stone-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-medium">Tugas</span>
                        <span className="font-semibold text-stone-900">
                          {doneTasks}/{totalTasks}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-200/70 overflow-hidden">
                        <div
                          className="h-full bg-stone-900 rounded-full transition-all duration-300"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-stone-50/80 border border-stone-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-medium">Milestone</span>
                        <span className="font-semibold text-emerald-700">
                          {doneMilestones}/{totalMilestones}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-200/70 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${milestoneProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(collab.updatedAt || collab.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/collaborations/${collab.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-900 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Buka Ruang Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW TABLE */
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Proyek &amp; Pola</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Mitra Tim</th>
                  <th className="py-3 px-4">Progres Tugas</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Legalitas SPK</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
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
                      className="hover:bg-stone-50/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <Link
                            href={`/collaborations/${collab.id}`}
                            className="font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1"
                          >
                            {collab.title}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-stone-500 font-medium">
                              {oppPatternName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            isCompleted
                              ? "bg-stone-100 text-stone-700 border border-stone-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
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
                              className="w-6 h-6 rounded-full border-2 border-white overflow-hidden shrink-0 inline-flex items-center justify-center"
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
                            <span className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[9px] font-semibold text-stone-600">
                              +{collab.participants.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[120px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-stone-500">
                            <span>{doneTasks}/{totalTasks} Tugas</span>
                            <span className="font-semibold text-stone-800">{taskProgress}%</span>
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                            <div
                              className="h-full bg-stone-900 rounded-full"
                              style={{ width: `${taskProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 font-medium">
                        <span className="text-emerald-700 font-semibold">{doneMilestones}</span>
                        <span className="text-stone-400">/{totalMilestones} Selesai</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {allSigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Sah Terikat</span>
                          </span>
                        ) : signedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                            <FileCheck className="w-3 h-3 text-amber-700" />
                            <span>{signedCount}/{totalParticipants} Teken</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200/60">
                            <FileText className="w-3 h-3 text-stone-400" />
                            <span>Draft SPK</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/collaborations/${collab.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <span>Buka</span>
                          <ArrowRight className="w-3 h-3" />
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
