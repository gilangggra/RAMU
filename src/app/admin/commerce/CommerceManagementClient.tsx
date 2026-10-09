"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  FileText,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  Scale,
  Calendar,
  CreditCard,
  Building,
  User,
} from "lucide-react";

interface BookingItem {
  id: string;
  status: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  budget?: string | null;
  details: any;
  createdAt: string | Date;
  requester: {
    id: string;
    name: string;
    sector: string;
    location?: string | null;
  };
  target: {
    id: string;
    name: string;
    sector: string;
    location?: string | null;
  };
}

export function CommerceManagementClient({ initialBookings }: { initialBookings: BookingItem[] }) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedSPK, setSelectedSPK] = useState<BookingItem | null>(null);

  const filtered = bookings.filter((b) => {
    if (filter !== "ALL" && b.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.requester.name.toLowerCase().includes(q) ||
        b.target.name.toLowerCase().includes(q) ||
        (b.budget && b.budget.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Information Banner: Financial Isolation */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-3 shadow-2xs">
        <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-amber-900 leading-relaxed font-normal">
          <p className="font-semibold text-amber-950">Protokol Perlindungan Finansial Platform</p>
          <p className="text-[11px] text-amber-900">
            Sesuai kepatuhan tata kelola RAMU, pembatalan pesanan dan pengembalian dana <strong>tidak dapat dilakukan sepihak</strong> di tabel transaksi.
            Semua intervensi pemutusan kontrak komersial wajib diproses melalui berkas mediasi di{" "}
            <Link href="/admin/disputes" className="font-semibold underline hover:text-amber-950">
              Pusat Resolusi Sengketa (Dispute Center)
            </Link>{" "}
            agar tercatat resmi di Audit Trail.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: "Semua Transaksi" },
            { id: "PENDING", label: "Menunggu" },
            { id: "ACCEPTED", label: "Disetujui (Aktif)" },
            { id: "DECLINED", label: "Ditolak" },
            { id: "COMPLETED", label: "Selesai" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? "bg-[#4CC9FE] text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:text-[#111827] hover:bg-white/80 border border-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari pemohon atau penyedia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada transaksi yang cocok</p>
            <p className="text-[11px] text-slate-400 font-normal">Silakan ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/80 bg-white/30">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pihak Pemohon (Klien/Studio)
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pihak Pelaksana (Kreator)
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Nilai Kontrak
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Jadwal Kerja
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Dokumen Legal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold text-[#111827]">{b.requester.name}</p>
                      <p className="text-[10px] text-slate-500">{b.requester.sector}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold text-[#111827]">{b.target.name}</p>
                      <p className="text-[10px] text-slate-500">{b.target.sector}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                        {b.budget || "Sesuai Negosiasi"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border inline-block ${
                          b.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                            : b.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200/70 animate-pulse"
                            : b.status === "DECLINED"
                            ? "bg-rose-50 text-rose-700 border-rose-200/70"
                            : "bg-sky-50 text-sky-700 border-sky-200/70"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-[11px] text-slate-700 font-medium">
                        Mulai: {new Date(b.startDate).toLocaleDateString("id-ID")}
                      </div>
                      {b.endDate && (
                        <div className="text-[10px] text-slate-400">
                          Selesai: {new Date(b.endDate).toLocaleDateString("id-ID")}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSPK(b)}
                        className="px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Lihat salinan legal Surat Perintah Kerja (SPK)"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span>Lihat SPK</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official SPK Document Viewer Modal */}
      {selectedSPK && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-[24px] p-6 md:p-8 shadow-xl border border-white/75 space-y-6 my-8 print:p-0 print:border-none print:shadow-none print:bg-white print:rounded-none">
            {/* Modal Actions Bar (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-800" />
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">Salinan Surat Perintah Kerja (SPK)</h3>
                  <p className="text-[10px] text-slate-400">Sistem Perjanjian Kerja Sama Digital Platform RAMU</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-slate-200/60"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSPK(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Formal Printable Document Layout */}
            <div className="border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6 text-stone-900 font-sans bg-white print:border-none print:p-0">
              {/* Document Header */}
              <div className="border-b-2 border-stone-900 pb-4 text-center space-y-1">
                <div className="font-bold text-lg tracking-tight text-stone-900">
                  RAMU CREATIVE ENGINE
                </div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  Surat Perintah Kerja (SPK) &amp; Perjanjian Jasa Kreatif Digital
                </div>
                <div className="text-[10px] font-mono text-stone-400 pt-1">
                  NO: SPK/RAMU/{new Date(selectedSPK.createdAt).getFullYear()}/{selectedSPK.id.substring(0, 8).toUpperCase()}
                </div>
              </div>

              {/* Parties */}
              <div className="space-y-3 text-xs">
                <p className="leading-relaxed text-stone-600">
                  Pada hari ini, terbit kesepakatan penugasan kerja sama profesional antara pihak-pihak berikut:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      PIHAK PERTAMA (Pemberi Kerja)
                    </span>
                    <p className="text-xs font-bold text-stone-900">{selectedSPK.requester.name}</p>
                    <p className="text-stone-500">{selectedSPK.requester.sector}</p>
                    <p className="text-stone-400 text-[10px]">{selectedSPK.requester.location || "Lokasi tidak dicantumkan"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      PIHAK KEDUA (Pelaksana Jasa)
                    </span>
                    <p className="text-xs font-bold text-stone-900">{selectedSPK.target.name}</p>
                    <p className="text-stone-500">{selectedSPK.target.sector}</p>
                    <p className="text-stone-400 text-[10px]">{selectedSPK.target.location || "Lokasi tidak dicantumkan"}</p>
                  </div>
                </div>
              </div>

              {/* Scope & Details */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  I. Rincian &amp; Ruang Lingkup Penugasan
                </h4>
                <div className="p-4 rounded-xl bg-stone-50/50 border border-stone-200/80 space-y-2 leading-relaxed">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Nilai Kompensasi:</span>
                    <span className="col-span-2 font-bold text-emerald-800">{selectedSPK.budget || "Ditetapkan sesuai kesepakatan"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Jadwal Penugasan:</span>
                    <span className="col-span-2 text-stone-800">
                      {new Date(selectedSPK.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      {selectedSPK.endDate && ` s/d ${new Date(selectedSPK.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Catatan Khusus:</span>
                    <span className="col-span-2 text-stone-700 italic">
                      {(selectedSPK.details as any)?.message || (selectedSPK.details as any)?.notes || "Penugasan langsung melalui booking komersial terverifikasi."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Terms & Dispute Clause */}
              <div className="space-y-2 text-[11px] text-stone-600 leading-relaxed">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  II. Klausul Mediasi &amp; Penyelesaian Sengketa
                </h4>
                <p>
                  1. Segala deliverables wajib diserahkan sesuai tenggat waktu yang disepakati bersama di workspace proyek RAMU.<br />
                  2. Apabila timbul perselisihan teknis maupun finansial, para pihak sepakat untuk menyelesaikannya melalui mekanisme mediasi resmi pada <strong>Pusat Resolusi Sengketa (Dispute Center) RAMU</strong> sebelum menempuh jalur hukum lainnya.<br />
                  3. Keputusan mediasi administrator RAMU bersifat mengikat bagi status pembayaran di dalam platform.
                </p>
              </div>

              {/* Signature Block */}
              <div className="pt-6 text-xs">
                <div className="grid grid-cols-2 gap-8 text-center pt-4">
                  <div className="space-y-12">
                    <p className="text-stone-500">Pihak Pertama</p>
                    <div className="border-t border-stone-300 pt-1 font-bold text-stone-900">
                      {selectedSPK.requester.name}
                    </div>
                  </div>
                  <div className="space-y-12">
                    <p className="text-stone-500">Pihak Kedua</p>
                    <div className="border-t border-stone-300 pt-1 font-bold text-stone-900">
                      {selectedSPK.target.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-200/80 pt-4 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedSPK(null)}
                className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-200/60"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
