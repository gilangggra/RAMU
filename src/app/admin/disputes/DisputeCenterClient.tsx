"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Scale,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  X,
  FileText,
  User,
  ShieldAlert,
} from "lucide-react";
import { resolveDisputeAction } from "@/app/admin/actions";
import { DisputeStatus } from "@prisma/client";

interface DisputeItem {
  id: string;
  bookingId?: string | null;
  reporterId: string;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolutionNotes?: string | null;
  createdAt: string | Date;
  reporter: {
    id: string;
    name: string;
    sector: string;
  };
  booking?: {
    id: string;
    budget?: string | null;
    startDate: string | Date;
    status: string;
    requester: { id: string; name: string };
    target: { id: string; name: string };
  } | null;
}

export function DisputeCenterClient({ initialDisputes }: { initialDisputes: DisputeItem[] }) {
  const [disputes, setDisputes] = useState<DisputeItem[]>(initialDisputes);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Resolution Modal State
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<DisputeStatus>("RESOLVED");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const filtered = disputes.filter((d) => {
    if (filter !== "ALL" && d.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.reporter.name.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q) ||
        (d.booking?.requester.name && d.booking.requester.name.toLowerCase().includes(q)) ||
        (d.booking?.target.name && d.booking.target.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleResolveSubmit = () => {
    if (!selectedDispute || !resolutionNotes.trim()) {
      alert("Catatan keputusan mediasi wajib diisi.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("disputeId", selectedDispute.id);
      formData.set("status", resolutionStatus);
      formData.set("resolutionNotes", resolutionNotes.trim());

      const res = await resolveDisputeAction(formData);
      if (res.success) {
        setDisputes((prev) =>
          prev.map((d) =>
            d.id === selectedDispute.id
              ? { ...d, status: resolutionStatus, resolutionNotes: resolutionNotes.trim() }
              : d
          )
        );
        setSelectedDispute(null);
        setResolutionNotes("");
      } else {
        alert(res.error || "Gagal memperbarui status sengketa.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: "Semua Sengketa" },
            { id: "OPEN", label: "Perlu Mediasi (Open)" },
            { id: "IN_MEDIATION", label: "Sedang Berlangsung" },
            { id: "RESOLVED", label: "Selesai (Resolved)" },
            { id: "DISMISSED", label: "Ditolak (Dismissed)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? "bg-stone-900 text-white shadow-2xs"
                  : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari pelapor atau alasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-stone-900 outline-none bg-transparent placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Main Dispute List or Clean Honest Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-stone-200/90 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-stone-900">Belum Ada Laporan Sengketa Aktif</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed font-normal">
              {filter !== "ALL"
                ? `Tidak ada berkas sengketa dengan filter status "${filter}".`
                : "Seluruh transaksi komersial dan kolaborasi di platform berjalan normal tanpa laporan perselisihan."}
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/70">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Integritas Ekosistem Terjaga
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-700 shrink-0 font-bold text-xs">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900">
                        Pelapor: {item.reporter.name}
                      </span>
                      <span className="text-[10px] text-stone-400">({item.reporter.sector})</span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Dilaporkan pada: {new Date(item.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                      item.status === "OPEN"
                        ? "bg-rose-50 text-rose-700 border-rose-200/70 animate-pulse font-bold"
                        : item.status === "IN_MEDIATION"
                        ? "bg-amber-50 text-amber-700 border-amber-200/70"
                        : item.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                        : "bg-stone-100 text-stone-600 border-stone-200/70"
                    }`}
                  >
                    {item.status === "OPEN"
                      ? "Perlu Mediasi (Open)"
                      : item.status === "IN_MEDIATION"
                      ? "Sedang Mediasi"
                      : item.status === "RESOLVED"
                      ? "Selesai (Resolved)"
                      : "Ditolak (Dismissed)"}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDispute(item);
                      setResolutionStatus(item.status === "OPEN" ? "IN_MEDIATION" : "RESOLVED");
                      setResolutionNotes(item.resolutionNotes || "");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    Tindak Lanjuti Mediasi
                  </button>
                </div>
              </div>

              {/* Dispute Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Reason & Evidence */}
                <div className="md:col-span-2 space-y-2">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    Uraian Masalah / Keberatan Pelapor
                  </span>
                  <p className="text-stone-700 leading-relaxed bg-stone-50/70 p-3 rounded-xl border border-stone-200/70 font-normal">
                    {item.reason}
                  </p>

                  {item.evidenceUrls && item.evidenceUrls.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-semibold text-stone-400 block mb-1">Bukti Terlampir:</span>
                      <div className="flex gap-2 flex-wrap">
                        {item.evidenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold inline-flex items-center gap-1 border border-stone-200/60"
                          >
                            <span>Bukti Berkas {i + 1}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.resolutionNotes && (
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 space-y-1 mt-2">
                      <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                        Catatan Keputusan Mediasi Admin
                      </span>
                      <p className="text-emerald-950 leading-relaxed font-normal">{item.resolutionNotes}</p>
                    </div>
                  )}
                </div>

                {/* Associated Booking Context */}
                <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2.5">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Konteks Kontrak / Booking
                  </span>
                  {item.booking ? (
                    <div className="space-y-1.5 text-stone-700">
                      <div>
                        <p className="text-[10px] text-stone-400">Pemberi Kerja:</p>
                        <p className="font-semibold text-stone-900">{item.booking.requester.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400">Pelaksana Jasa:</p>
                        <p className="font-semibold text-stone-900">{item.booking.target.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400">Nilai Kontrak:</p>
                        <p className="font-semibold text-emerald-800">{item.booking.budget || "Sesuai Kesepakatan"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400">Status Pesanan:</p>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-white border border-stone-200/80">
                          {item.booking.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stone-400 italic text-[11px]">Tidak terikat pada satu booking spesifik.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mediation Decision Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-stone-900">
                  Resolusi Mediasi Sengketa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Tentukan Status Mediasi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "IN_MEDIATION", label: "Buka Mediasi" },
                    { id: "RESOLVED", label: "Sengketa Selesai" },
                    { id: "DISMISSED", label: "Tolak Laporan" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setResolutionStatus(opt.id as DisputeStatus)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                        resolutionStatus === opt.id
                          ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                          : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Catatan Keputusan Mediasi &amp; Instruksi Penyelesaian (Wajib):
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Contoh: Berdasarkan bukti file RAW di workspace, kedua pihak sepakat revisi diselesaikan dalam 3 hari kerja tanpa penambahan biaya..."
                  className="w-full p-3 rounded-lg border border-stone-200 text-xs text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/80">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="px-3.5 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleResolveSubmit}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-black transition-colors cursor-pointer shadow-2xs"
              >
                {isPending ? "Menyimpan..." : "Kirim Keputusan Mediasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
