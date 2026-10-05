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
  Sparkles,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import {
  BookingStatusManager,
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
}

export function BookingsClientView({
  primaryActor,
  incomingBookings,
  outgoingBookings,
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
      {/* 1. ATTIO HEADER BANNER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Manajemen Pesanan &amp; SPK
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Pantau pesanan masuk, permintaan sewa terkirim, dan kepastian kontrak kerja resmi platform RAMU.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200/80 shadow-2xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
            <span>Buka Messenger</span>
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-300" />
            <span>Cari Mitra Baru</span>
          </Link>
        </div>
      </header>

      {/* 2. ATTIO 4-TILE ANALYTIC RIBBON */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500">
            <span className="truncate">Menunggu Respons</span>
            <Clock className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
              {pendingIncomingCount}
            </span>
            {pendingIncomingCount > 0 ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Perlu Tindakan
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/60">
                Terkendali
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-400 truncate">Pesanan masuk siap ditinjau</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500">
            <span className="truncate">Pesanan Masuk Aktif</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
              {activeIncomingCount}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              Disetujui
            </span>
          </div>
          <p className="text-[11px] text-stone-400 truncate">Jadwal &amp; kontrak kerja terikat</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500">
            <span className="truncate">Permintaan Saya</span>
            <Send className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
              {totalOutgoingCount}
            </span>
            <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
              Terkirim
            </span>
          </div>
          <p className="text-[11px] text-stone-400 truncate">Proposal / booking ke mitra lain</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500">
            <span className="truncate">Ruang Kolaborasi</span>
            <Handshake className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
              {[...incomingBookings, ...outgoingBookings].filter((b) => b.details?.collaborationId).length}
            </span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
              Workspace Aktif
            </span>
          </div>
          <p className="text-[11px] text-stone-400 truncate">Tugas &amp; serah terima terintegrasi</p>
        </div>
      </section>

      {/* 3. CONTROLS: SEGMENTED TABS, FILTER & SEARCH */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Segmented Tab */}
        <div className="inline-flex items-center bg-stone-100 p-1 rounded-lg text-xs font-medium text-stone-600">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "incoming"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "hover:text-stone-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Pesanan Masuk</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                pendingIncomingCount > 0
                  ? "bg-stone-900 text-white"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {incomingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "outgoing"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "hover:text-stone-900"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Permintaan Saya</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-600 font-bold">
              {outgoingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "hover:text-stone-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-stone-50/80 border border-stone-200/80 rounded-lg text-xs text-stone-800 font-medium focus:bg-white focus:outline-hidden focus:border-stone-400 focus:ring-2 focus:ring-stone-200/50 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Respons</option>
              <option value="ACCEPTED">Disetujui (Aktif)</option>
              <option value="WORKSPACE">Workspace Aktif</option>
              <option value="DECLINED">Ditolak</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari partner, SPK, rincian..."
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-stone-50/80 border border-stone-200/80 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-stone-400 focus:ring-2 focus:ring-stone-200/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. BOOKINGS LIST */}
      {currentList.length === 0 ? (
        <div className="p-12 bg-white border border-stone-200/80 rounded-2xl text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900">
            {searchQuery || statusFilter !== "ALL"
              ? "Tidak ada transaksi yang sesuai filter"
              : activeTab === "incoming"
              ? "Belum ada pesanan masuk"
              : activeTab === "outgoing"
              ? "Anda belum mengajukan pesanan / sewa"
              : "Belum ada data transaksi"}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery || statusFilter !== "ALL"
              ? "Coba sesuaikan kata kunci pencarian atau ubah filter status di atas."
              : "Seluruh tawaran dari perpesanan resmi RAMU maupun booking dari direktori akan tercatat rapi di sini."}
          </p>
          {(searchQuery || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs font-semibold text-stone-900 underline hover:text-black cursor-pointer pt-1"
            >
              Reset Filter
            </button>
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
                className="p-5 sm:p-6 bg-white border border-stone-200/80 rounded-2xl shadow-2xs hover:border-stone-300 transition-all space-y-4"
              >
                {/* Header: Partner + Status + Ref + Detail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/directory/${partner.id}`}
                          className="font-semibold text-stone-900 hover:underline inline-flex items-center gap-1 text-sm group"
                        >
                          <span>{partner.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                        </Link>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60">
                          {isIncoming ? "Pemesan / Klien" : "Penyedia Jasa"}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500">{partner.sector}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={booking.status} collaborationId={collabId} />
                    <span className="text-[11px] font-mono text-stone-400 px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200/60">
                      {refCode}
                    </span>
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200/80 transition-colors"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    </Link>
                  </div>
                </div>

                {/* Key Info: Date, Budget, Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/60 text-xs">
                  <div>
                    <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>Tanggal Pelaksanaan</span>
                    </div>
                    <div className="font-semibold text-stone-900">
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
                    <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      Komitmen Anggaran
                    </div>
                    <div className="font-bold text-stone-900">
                      {booking.budget || "Sesuai kesepakatan"}
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <ViewSpkButton booking={booking as any} />
                    <BookingContactActions
                      phone={partner.contactPhone}
                      email={partner.contactEmail}
                      contactName={partner.name}
                      myRole={isIncoming ? "target" : "requester"}
                      partnerActorId={partner.id}
                    />
                  </div>

                  {/* Contextual Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {booking.status === "PENDING" && isIncoming && (
                      <BookingStatusManager bookingId={booking.id} />
                    )}

                    {booking.status === "ACCEPTED" && (
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
    return <span className="text-stone-400 italic text-xs">Standar platform</span>;
  }

  const entries = Object.entries(details).filter(
    ([key, val]) =>
      key !== "collaborationId" &&
      key !== "agreedTerms" &&
      key !== "offerMessageId" &&
      key !== "source" &&
      val &&
      String(val).trim() !== ""
  );

  if (entries.length === 0) {
    return <span className="text-stone-400 italic text-xs">Standar platform</span>;
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
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-stone-200/80 text-[10px] text-stone-700 shadow-2xs max-w-[200px] truncate"
          >
            <span className="font-semibold text-stone-900">{labelMap[k] || k}:</span>
            {isUrl ? (
              <a
                href={valStr}
                target="_blank"
                rel="noreferrer"
                className="text-stone-900 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Link</span>
                <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
              </a>
            ) : (
              <span className="truncate">{valStr}</span>
            )}
          </span>
        );
      })}
      {entries.length > 3 && (
        <span className="text-[10px] text-stone-400 px-1.5 py-0.5 rounded bg-stone-100 font-medium">
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
  if (collaborationId) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-[10px] font-semibold tracking-wider shadow-2xs">
        <Handshake className="w-3 h-3 text-stone-300" />
        <span>Workspace Aktif</span>
      </span>
    );
  }
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Disetujui</span>
      </span>
    );
  }
  if (status === "DECLINED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Ditolak</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>Menunggu Respons</span>
    </span>
  );
}
