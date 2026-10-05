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
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
          <p className="font-bold">Protokol Perlindungan Finansial Platform</p>
          <p>
            Sesuai kepatuhan tata kelola RAMU, pembatalan pesanan dan pengembalian dana <strong>tidak dapat dilakukan sepihak</strong> di tabel transaksi.
            Semua intervensi pemutusan kontrak komersial wajib diproses melalui berkas mediasi di{" "}
            <Link href="/admin/disputes" className="font-extrabold underline hover:text-amber-950">
              Pusat Resolusi Sengketa (Dispute Center)
            </Link>{" "}
            agar tercatat resmi di Audit Trail.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? "bg-[#1E1B2E] text-white shadow-xs"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari pemohon atau penyedia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-[#27213D] outline-none bg-transparent placeholder-stone-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-stone-700">Tidak ada transaksi yang cocok</p>
            <p className="text-[11px] text-stone-400">Silakan ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Pihak Pemohon (Klien/Studio)
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Pihak Pelaksana (Kreator)
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Nilai Kontrak
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Jadwal Kerja
                  </th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Dokumen Legal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-[#1E1B2E]">{b.requester.name}</p>
                      <p className="text-[10px] text-stone-500">{b.requester.sector}</p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-[#1E1B2E]">{b.target.name}</p>
                      <p className="text-[10px] text-stone-500">{b.target.sector}</p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {b.budget || "Sesuai Negosiasi"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${
                          b.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : b.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            : b.status === "DECLINED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-[11px] text-stone-600 font-medium">
                        Mulai: {new Date(b.startDate).toLocaleDateString("id-ID")}
                      </div>
                      {b.endDate && (
                        <div className="text-[10px] text-stone-400">
                          Selesai: {new Date(b.endDate).toLocaleDateString("id-ID")}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSPK(b)}
                        className="px-3 py-1.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Lihat salinan legal Surat Perintah Kerja (SPK)"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-8 shadow-2xl border border-stone-200 space-y-6 my-8 print:p-0 print:border-none print:shadow-none">
            {/* Modal Actions Bar (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E]">Salinan Surat Perintah Kerja (SPK)</h3>
                  <p className="text-[10px] text-stone-400">Sistem Perjanjian Kerja Sama Digital Platform RAMU</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSPK(null)}
                  className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formal Printable Document Layout */}
            <div className="border border-stone-300 rounded-2xl p-8 space-y-6 text-[#1E1B2E] font-serif bg-white shadow-2xs print:border-none print:p-0">
              {/* Document Header */}
              <div className="border-b-2 border-stone-900 pb-4 text-center space-y-1">
                <div className="font-sans font-black text-xl tracking-wider text-[#1E1B2E]">
                  RAMU CREATIVE ENGINE
                </div>
                <div className="font-sans text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                  Surat Perintah Kerja (SPK) &amp; Perjanjian Jasa Kreatif Digital
                </div>
                <div className="font-sans text-[11px] font-mono text-stone-400 pt-1">
                  NO: SPK/RAMU/{new Date(selectedSPK.createdAt).getFullYear()}/{selectedSPK.id.substring(0, 8).toUpperCase()}
                </div>
              </div>

              {/* Parties */}
              <div className="space-y-4 font-sans text-xs">
                <p className="leading-relaxed">
                  Pada hari ini, terbit kesepakatan penugasan kerja sama profesional antara pihak-pihak berikut:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      PIHAK PERTAMA (Pemberi Kerja)
                    </span>
                    <p className="text-sm font-bold text-[#1E1B2E]">{selectedSPK.requester.name}</p>
                    <p className="text-stone-500">{selectedSPK.requester.sector}</p>
                    <p className="text-stone-400 text-[11px]">{selectedSPK.requester.location || "Lokasi tidak dicantumkan"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      PIHAK KEDUA (Pelaksana Jasa)
                    </span>
                    <p className="text-sm font-bold text-[#1E1B2E]">{selectedSPK.target.name}</p>
                    <p className="text-stone-500">{selectedSPK.target.sector}</p>
                    <p className="text-stone-400 text-[11px]">{selectedSPK.target.location || "Lokasi tidak dicantumkan"}</p>
                  </div>
                </div>
              </div>

              {/* Scope & Details */}
              <div className="space-y-3 font-sans text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  I. Rincian &amp; Ruang Lingkup Penugasan
                </h4>
                <div className="p-4 rounded-xl bg-stone-50/50 border border-stone-200 space-y-2 leading-relaxed">
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
              <div className="space-y-2 font-sans text-[11px] text-stone-600 leading-relaxed">
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
              <div className="pt-6 font-sans text-xs">
                <div className="grid grid-cols-2 gap-8 text-center pt-4">
                  <div className="space-y-12">
                    <p className="text-stone-500">Pihak Pertama</p>
                    <div className="border-t border-stone-300 pt-1 font-bold text-[#1E1B2E]">
                      {selectedSPK.requester.name}
                    </div>
                  </div>
                  <div className="space-y-12">
                    <p className="text-stone-500">Pihak Kedua</p>
                    <div className="border-t border-stone-300 pt-1 font-bold text-[#1E1B2E]">
                      {selectedSPK.target.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-stone-100 pt-4 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedSPK(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer"
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
