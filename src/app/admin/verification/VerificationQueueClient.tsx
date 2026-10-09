"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Camera,
  Search,
  MessageSquare,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { reviewVerificationRequestAction } from "@/app/admin/actions";

interface VerificationItem {
  id: string;
  actorId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
  gearProofUrls: string[];
  portfolioUrl?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  createdAt: string | Date;
  actor: {
    id: string;
    name: string;
    sector: string;
    location?: string | null;
    contactEmail?: string | null;
    actorType: string;
    isVerified: boolean;
  };
}

export function VerificationQueueClient({
  initialRequests,
}: {
  initialRequests: VerificationItem[];
}) {
  const [requests, setRequests] = useState<VerificationItem[]>(initialRequests);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [activeModal, setActiveModal] = useState<"REVISION" | "REJECT" | null>(null);
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [modalText, setModalText] = useState("");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const filtered = requests.filter((item) => {
    if (filter !== "ALL" && item.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.actor.name.toLowerCase().includes(q) ||
        item.actor.sector.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApprove = (item: VerificationItem) => {
    if (!confirm(`Konfirmasi setujui verifikasi untuk "${item.actor.name}" dan sematkan Verified Badge?`)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("requestId", item.id);
      formData.set("actorId", item.actorId);
      formData.set("status", "APPROVED");

      const res = await reviewVerificationRequestAction(formData);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === item.id
              ? { ...r, status: "APPROVED", actor: { ...r.actor, isVerified: true } }
              : r
          )
        );
      } else {
        alert(res.error || "Gagal menyetujui verifikasi");
      }
    });
  };

  const handleModalSubmit = () => {
    if (!selectedItem || !activeModal) return;
    if (!modalText.trim()) {
      alert("Silakan isi keterangan terlebih dahulu.");
      return;
    }

    const newStatus = activeModal === "REVISION" ? "REVISION_REQUESTED" : "REJECTED";

    startTransition(async () => {
      const formData = new FormData();
      formData.set("requestId", selectedItem.id);
      formData.set("actorId", selectedItem.actorId);
      formData.set("status", newStatus);
      if (activeModal === "REVISION") {
        formData.set("notes", modalText);
      } else {
        formData.set("rejectionReason", modalText);
      }

      const res = await reviewVerificationRequestAction(formData);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === selectedItem.id
              ? {
                  ...r,
                  status: newStatus as any,
                  notes: activeModal === "REVISION" ? modalText : r.notes,
                  rejectionReason: activeModal === "REJECT" ? modalText : r.rejectionReason,
                }
              : r
          )
        );
        setActiveModal(null);
        setSelectedItem(null);
        setModalText("");
      } else {
        alert(res.error || "Gagal memperbarui status verifikasi");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: "Semua Permintaan" },
            { id: "PENDING", label: "Menunggu Review" },
            { id: "APPROVED", label: "Disetujui" },
            { id: "REVISION_REQUESTED", label: "Perlu Revisi" },
            { id: "REJECTED", label: "Ditolak" },
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
            placeholder="Cari nama talenta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-[#111827]">Tidak Ada Permintaan Verifikasi</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
              {filter !== "ALL"
                ? `Tidak ada pengajuan verifikasi dengan filter status "${filter}".`
                : "Semua pengajuan verifikasi talenta telah selesai diproses oleh tim admin."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/80 bg-white/30">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Talenta / Studio
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Bukti Gear &amp; Dokumen
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Catatan Permintaan
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Aksi Moderasi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/60 transition-colors">
                    {/* Actor Details */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.actor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#111827]">
                              {item.actor.name}
                            </span>
                            {item.actor.isVerified && (
                              <span className="p-0.5 rounded-full bg-emerald-50 text-emerald-700" title="Verified Creator">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{item.actor.sector}</p>
                          <Link
                            href={`/directory/${item.actorId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-semibold hover:text-[#111827] hover:underline mt-0.5"
                          >
                            <span>Lihat Profil</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Gear Proofs & Photos */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        {item.gearProofUrls && item.gearProofUrls.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.gearProofUrls.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setActivePhoto(url)}
                                className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 hover:border-slate-400 transition-all cursor-pointer relative group"
                                title="Klik untuk memperbesar bukti gear"
                              >
                                <img src={url} alt={`Bukti Gear ${i + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Camera className="w-3 h-3 text-white" />
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Tidak melampirkan foto</span>
                        )}

                        {item.portfolioUrl && (
                          <a
                            href={item.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-[#111827] hover:underline"
                          >
                            <span>Portofolio Eksternal</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Notes / Reason */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.notes || "Pengajuan lencana verifikasi standar platform."}
                      </p>
                      {item.rejectionReason && (
                        <p className="text-[10px] text-rose-600 font-medium mt-1">
                          Alasan tolak: {item.rejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border inline-block ${
                          item.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                            : item.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200/70 animate-pulse"
                            : item.status === "REVISION_REQUESTED"
                            ? "bg-sky-50 text-sky-700 border-sky-200/70"
                            : "bg-rose-50 text-rose-700 border-rose-200/70"
                        }`}
                      >
                        {item.status === "APPROVED"
                          ? "Disetujui"
                          : item.status === "PENDING"
                          ? "Menunggu Review"
                          : item.status === "REVISION_REQUESTED"
                          ? "Perlu Revisi"
                          : "Ditolak"}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== "APPROVED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleApprove(item)}
                            className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Setujui dan beri lencana Verified"
                          >
                            <Check className="w-3 h-3" />
                            <span>Setujui</span>
                          </button>
                        )}

                        {item.status !== "REVISION_REQUESTED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setSelectedItem(item);
                              setActiveModal("REVISION");
                              setModalText(item.notes || "");
                            }}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-slate-200/60"
                            title="Minta revisi bukti atau portofolio"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Revisi</span>
                          </button>
                        )}

                        {item.status !== "REJECTED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setSelectedItem(item);
                              setActiveModal("REJECT");
                              setModalText("");
                            }}
                            className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-rose-200/70"
                            title="Tolak permohonan verifikasi"
                          >
                            <X className="w-3 h-3" />
                            <span>Tolak</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Revision / Reject Input */}
      {activeModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[24px] p-6 shadow-xl border border-white/75 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${activeModal === "REVISION" ? "text-sky-600" : "text-rose-600"}`} />
                <h3 className="text-xs font-bold text-[#111827]">
                  {activeModal === "REVISION"
                    ? `Minta Revisi: ${selectedItem.actor.name}`
                    : `Tolak Verifikasi: ${selectedItem.actor.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setSelectedItem(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {activeModal === "REVISION"
                  ? "Catatan Perbaikan Dokumen (akan dikirim ke kreator):"
                  : "Alasan Penolakan Permohonan Verifikasi:"}
              </label>
              <textarea
                rows={4}
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                placeholder={
                  activeModal === "REVISION"
                    ? "Contoh: Mohon unggah foto nota pembelian atau nomor seri kamera secara jelas..."
                    : "Contoh: Portofolio eksternal belum mencukupi standar kurasi minimum..."
                }
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setSelectedItem(null);
                }}
                className="px-3.5 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleModalSubmit}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs ${
                  activeModal === "REVISION"
                    ? "bg-[#4CC9FE] hover:bg-[#3bbbf0]"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isPending ? "Menyimpan..." : activeModal === "REVISION" ? "Kirim Permintaan Revisi" : "Konfirmasi Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-stone-900 rounded-2xl overflow-hidden p-2">
            <img src={activePhoto} alt="Bukti Gear" className="w-full h-full object-contain rounded-xl max-h-[80vh]" />
            <p className="text-center text-xs text-stone-400 mt-2">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}
    </div>
  );
}
