"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Inbox,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  Handshake,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  BookingStatusManager,
  BookingRequesterActions,
  ConvertBookingButton,
  BookingContactActions,
  ViewSpkButton,
  BookingMilestoneTracker,
} from "./BookingStatusManager";

export interface BookingActor {
  id: string;
  name: string;
  sector: string;
  actorType?: string;
  location?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

export interface BookingItem {
  id: string;
  requesterId: string;
  targetId: string;
  status: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  budget?: string | null;
  details?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
  requester: BookingActor;
  target: BookingActor;
}

interface BookingsClientViewProps {
  primaryActor: BookingActor;
  incomingBookings: BookingItem[];
  outgoingBookings: BookingItem[];
  embedded?: boolean;
}

function formatBudgetDisplay(budget?: string | null): string {
  if (!budget) return "Sesuai kesepakatan";
  const trimmed = budget.trim();
  if (/^rp/i.test(trimmed)) return trimmed;
  const numeric = Number(trimmed.replace(/[^0-9.-]+/g, ""));
  if (!isNaN(numeric) && numeric > 0 && /^\d+$/.test(trimmed)) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numeric);
  }
  return trimmed;
}

export function BookingsClientView({
  primaryActor,
  incomingBookings,
  outgoingBookings,
  embedded = false,
}: BookingsClientViewProps) {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "all">("incoming");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Counts
  const pendingIncomingCount = useMemo(
    () => incomingBookings.filter((b) => b.status === "PENDING").length,
    [incomingBookings]
  );
  const activeIncomingCount = useMemo(
    () => incomingBookings.filter((b) => b.status === "ACCEPTED").length,
    [incomingBookings]
  );
  const totalOutgoingCount = outgoingBookings.length;

  // Selected list
  const currentList = useMemo(() => {
    let list: (BookingItem & { _direction: "incoming" | "outgoing" })[] = [];
    if (activeTab === "incoming") {
      list = incomingBookings.map((b) => ({ ...b, _direction: "incoming" }));
    } else if (activeTab === "outgoing") {
      list = outgoingBookings.map((b) => ({ ...b, _direction: "outgoing" }));
    } else {
      const inc = incomingBookings.map((b) => ({ ...b, _direction: "incoming" as const }));
      const out = outgoingBookings.map((b) => ({ ...b, _direction: "outgoing" as const }));
      list = [...inc, ...out].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      list = list.filter((b) => {
        if (statusFilter === "WORKSPACE") {
          return Boolean(b.details?.collaborationId);
        }
        return b.status === statusFilter;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) => {
        const partnerName = (b._direction === "incoming" ? b.requester.name : b.target.name).toLowerCase();
        const partnerSector = (b._direction === "incoming" ? b.requester.sector : b.target.sector).toLowerCase();
        const refCode = `spk-ramu-${b.id.slice(0, 8)}`.toLowerCase();
        const budget = (b.budget || "").toLowerCase();
        const notes = (b.details?.notes || b.details?.projectTitle || b.details?.conceptSummary || "").toLowerCase();
        return (
          partnerName.includes(q) ||
          partnerSector.includes(q) ||
          refCode.includes(q) ||
          budget.includes(q) ||
          notes.includes(q)
        );
      });
    }

    return list;
  }, [activeTab, statusFilter, searchQuery, incomingBookings, outgoingBookings]);

  return (
    <div className="space-y-6 w-full">
      {/* 1. HEADER BANNER */}
      {!embedded && (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
                Manajemen Kolaborasi &amp; Kontrak SPK
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4CC9FE]/15 text-[#0284c7] text-[10px] font-bold border border-[#4CC9FE]/30">
                <Sparkles className="w-3 h-3 text-[#0284c7]" />
                Ekosistem RAMU
              </span>
            </div>
            <p className="text-xs text-[#475569] mt-1">
              Kelola kolaborasi masuk, pengajuan kerja sama kreatif, dan kepastian kontrak kerja resmi (SPK) platform RAMU.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/messages"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] text-xs font-semibold border border-white/80 shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Buka Messenger</span>
            </Link>
            <Link
              href="/directory"
              className="btn-primary-pill !text-xs !py-2 !px-4.5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Eksplorasi Mitra Baru</span>
            </Link>
          </div>
        </header>
      )}

      {/* 2. METRIC ANALYTIC RIBBON (MATCHES DASHBOARD [24px] CARDS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Tile 1 */}
        <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 truncate">Menunggu Konfirmasi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/80 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-[#0f172a] font-mono">
              {pendingIncomingCount}
            </span>
            {pendingIncomingCount > 0 ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Perlu Tindakan
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
                Terkendali
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate">Kolaborasi masuk siap ditinjau</p>
        </div>

        {/* Tile 2 */}
        <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 truncate">Kolaborasi Disetujui</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/80 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-[#0f172a] font-mono">
              {activeIncomingCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
              Disetujui
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Jadwal &amp; kontrak kerja terikat</p>
        </div>

        {/* Tile 3 */}
        <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 truncate">Pengajuan Terkirim</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-100/80 shadow-2xs">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-[#0f172a] font-mono">
              {totalOutgoingCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200/70 shadow-2xs">
              Terkirim
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Proposal &amp; booking ke mitra</p>
        </div>

        {/* Tile 4 */}
        <div className="p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5 transition-all group hover:bg-white/80 hover:border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 truncate">Workspace Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80 shadow-2xs">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-[#0f172a] font-mono">
              {[...incomingBookings, ...outgoingBookings].filter((b) => b.details?.collaborationId).length}
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80 shadow-2xs">
              Workspace Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Tugas &amp; serah terima terintegrasi</p>
        </div>
      </section>

      {/* 3. CONTROLS: SEGMENTED TABS, FILTER & SEARCH */}
      <div className="bg-white/60 backdrop-blur-2xl p-3 sm:p-3.5 rounded-[22px] border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Segmented Tab with Project Blue Active State */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100/80 border border-slate-200/60">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-full active:scale-95 ${
              activeTab === "incoming"
                ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25 border-transparent"
                : "bg-white/80 hover:bg-white text-slate-600 hover:text-[#0284c7] border border-white/80 shadow-2xs"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Kolaborasi Masuk</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === "incoming"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {incomingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-full active:scale-95 ${
              activeTab === "outgoing"
                ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25 border-transparent"
                : "bg-white/80 hover:bg-white text-slate-600 hover:text-[#0284c7] border border-white/80 shadow-2xs"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Pengajuan Terkirim</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === "outgoing"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {outgoingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-full active:scale-95 ${
              activeTab === "all"
                ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25 border-transparent"
                : "bg-white/80 hover:bg-white text-slate-600 hover:text-[#0284c7] border border-white/80 shadow-2xs"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Riwayat</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-white/80 border border-slate-200/90 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all cursor-pointer shadow-2xs"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Konfirmasi</option>
              <option value="NEGOTIATING">Reschedule Diajukan</option>
              <option value="ACCEPTED">Disetujui (Aktif)</option>
              <option value="WORKSPACE">Workspace Aktif</option>
              <option value="COMPLETED">Selesai (Tuntas)</option>
              <option value="CANCELLED">Dibatalkan</option>
              <option value="DECLINED">Ditolak</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mitra, nomor SPK, judul..."
              className="w-full sm:w-64 pl-9 pr-3.5 py-2 bg-white/80 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 4. BOOKINGS LIST */}
      {currentList.length === 0 ? (
        <div className="p-12 sm:p-14 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[22px] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3.5 max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] mx-auto shadow-2xs">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0f172a]">
              {searchQuery || statusFilter !== "ALL"
                ? "Tidak ada data yang sesuai filter"
                : activeTab === "incoming"
                ? "Belum ada kolaborasi masuk"
                : activeTab === "outgoing"
                ? "Belum ada pengajuan kolaborasi terkirim"
                : "Belum ada riwayat kolaborasi"}
            </h3>
            <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
              {searchQuery || statusFilter !== "ALL"
                ? "Coba sesuaikan kata kunci pencarian atau ubah opsi filter status di atas."
                : "Seluruh kesepakatan dari direktori profil maupun negosiasi di messenger resmi RAMU akan tercatat aman dengan proteksi SPK di sini."}
            </p>
          </div>
          {searchQuery || statusFilter !== "ALL" ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="inline-flex items-center px-4.5 py-2 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold cursor-pointer border border-white/80 shadow-xs transition-colors"
            >
              Reset Filter
            </button>
          ) : (
            <Link
              href="/directory"
              className="btn-primary-pill !text-xs !py-2.5 !px-6 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Jelajahi Mitra &amp; Talenta</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((booking) => {
            const isIncoming = booking._direction === "incoming";
            const partner = isIncoming ? booking.requester : booking.target;
            const refCode = `SPK-RAMU-${booking.id.slice(0, 8).toUpperCase()}`;
            const collabId = booking.details?.collaborationId;

            return (
              <div
                key={booking.id}
                className="p-5 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[22px] shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] hover:bg-white/80 hover:border-white transition-all space-y-4"
              >
                {/* Header: Partner + Status + Ref + Detail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-2 ring-white">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/directory/${partner.id}`}
                          className="font-bold text-[#0f172a] hover:text-[#0284c7] inline-flex items-center gap-1 text-sm group transition-colors"
                        >
                          <span>{partner.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] transition-colors" />
                        </Link>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-200/80 shadow-2xs">
                          {isIncoming ? "Pihak Pemrakarsa / Klien" : "Mitra Pelaksana"}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#475569] mt-0.5">{partner.sector}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={booking.status} collaborationId={collabId} />
                    <span className="text-[11px] font-mono text-slate-500 px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/70 shadow-2xs">
                      {refCode}
                    </span>
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold border border-white/80 transition-colors shadow-2xs"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>

                {/* Key Info: Date, Budget, Details (Inner Panel 2xl) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Tanggal Pelaksanaan</span>
                    </div>
                    <div className="font-bold text-[#0f172a]">
                      {new Date(booking.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {booking.endDate &&
                        ` – ${new Date(booking.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Komitmen Anggaran
                    </div>
                    <div className="font-black text-[#0f172a] font-mono text-sm">
                      {formatBudgetDisplay(booking.budget)}
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Rincian &amp; Spesifikasi
                    </div>
                    <BookingDetailsBadgeList details={booking.details} />
                  </div>
                </div>

                {/* Deal Pipeline Tracker */}
                <BookingMilestoneTracker
                  status={booking.status}
                  dpPercentage={booking.details?.agreedTerms?.dpPercentage || 50}
                  collaborationId={collabId}
                />

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <ViewSpkButton booking={booking as any} />
                    <BookingContactActions
                      phone={partner.contactPhone}
                      email={partner.contactEmail}
                      contactName={partner.name}
                      myRole={isIncoming ? "target" : "requester"}
                      partnerActorId={partner.id}
                      bookingRefCode={`SPK-RAMU-${booking.id.slice(0, 8).toUpperCase()}`}
                      bookingId={booking.id}
                    />
                  </div>

                  {/* Contextual Action (Matching Project Blue Pill) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(booking.status === "PENDING" || booking.status === "NEGOTIATING") && isIncoming && (
                      <BookingStatusManager
                        bookingId={booking.id}
                        partnerName={partner.name}
                        refCode={refCode}
                        currentStartDate={booking.startDate}
                        currentEndDate={booking.endDate}
                        currentBudget={booking.budget}
                      />
                    )}

                    {(booking.status === "PENDING" || booking.status === "NEGOTIATING") && !isIncoming && (
                      <BookingRequesterActions
                        bookingId={booking.id}
                        partnerName={partner.name}
                        refCode={refCode}
                        currentStartDate={booking.startDate}
                        currentEndDate={booking.endDate}
                        currentBudget={booking.budget}
                      />
                    )}

                    {(booking.status === "ACCEPTED" || booking.status === "COMPLETED") && (
                      <ConvertBookingButton
                        bookingId={booking.id}
                        collaborationId={collabId}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BookingDetailsBadgeList({ details }: { details: any }) {
  if (!details || typeof details !== "object") {
    return <span className="text-slate-400 italic text-xs">Standar platform</span>;
  }

  const entries = Object.entries(details).filter(
    ([key, val]) =>
      key !== "collaborationId" &&
      key !== "agreedTerms" &&
      key !== "offerMessageId" &&
      key !== "source" &&
      key !== "dispute" &&
      val &&
      String(val).trim() !== ""
  );

  if (entries.length === 0) {
    return <span className="text-slate-400 italic text-xs">Standar platform</span>;
  }

  const labelMap: Record<string, string> = {
    roomType: "Ruangan",
    addons: "Add-ons",
    role: "Peran",
    usageRights: "Lisensi",
    location: "Lokasi",
    deliverables: "Luaran",
    referenceUrl: "Moodboard",
    wardrobe: "Busana",
    hours: "Durasi",
    crew: "Kru",
    concept: "Konsep",
    notes: "Catatan",
    projectTitle: "Judul",
    outputDetails: "Lingkup",
    sessionDate: "Jadwal",
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.slice(0, 3).map(([k, v]) => {
        const valStr = String(v);
        const isUrl = valStr.startsWith("http://") || valStr.startsWith("https://");

        return (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 text-[10px] text-slate-700 shadow-2xs max-w-[200px] truncate"
          >
            <span className="font-bold text-[#0f172a]">{labelMap[k] || k}:</span>
            {isUrl ? (
              <a
                href={valStr}
                target="_blank"
                rel="noreferrer"
                className="text-[#0284c7] font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Link</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#0284c7]" />
              </a>
            ) : (
              <span className="truncate">{valStr}</span>
            )}
          </span>
        );
      })}
      {entries.length > 3 && (
        <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 font-semibold border border-slate-200/60">
          +{entries.length - 3} lainnya
        </span>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  collaborationId,
}: {
  status: string;
  collaborationId?: string | null;
}) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80 shadow-2xs">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Selesai (Tuntas)</span>
      </span>
    );
  }
  if (collaborationId) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold shadow-2xs">
        <Handshake className="w-3 h-3 text-indigo-600" />
        <span>Workspace Aktif</span>
      </span>
    );
  }
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/70 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Disetujui</span>
      </span>
    );
  }
  if (status === "NEGOTIATING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/70 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span>Reschedule Diajukan</span>
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/70 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>Dibatalkan</span>
      </span>
    );
  }
  if (status === "DECLINED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200/70 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Ditolak</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/70 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>Menunggu Konfirmasi</span>
    </span>
  );
}
