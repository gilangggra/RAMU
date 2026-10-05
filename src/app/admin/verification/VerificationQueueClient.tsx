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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
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
            placeholder="Cari nama talenta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-[#27213D] outline-none bg-transparent placeholder-stone-400"
          />
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1E1B2E]">Tidak Ada Permintaan Verifikasi</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {filter !== "ALL"
                ? `Tidak ada pengajuan verifikasi dengan filter status "${filter}".`
                : "Semua pengajuan verifikasi talenta telah selesai diproses oleh tim admin."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Talenta / Studio
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Bukti Gear & Dokumen
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Catatan Permintaan
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Aksi Moderasi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Actor Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-xs shrink-0">
                          {item.actor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#1E1B2E]">
                              {item.actor.name}
                            </span>
                            {item.actor.isVerified && (
                              <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Verified Creator">
                                <ShieldCheck className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500">{item.actor.sector}</p>
                          <Link
                            href={`/directory/${item.actorId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold hover:underline mt-0.5"
                          >
                            <span>Lihat Profil Publik</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Gear Proofs & Photos */}
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        {item.gearProofUrls && item.gearProofUrls.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.gearProofUrls.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setActivePhoto(url)}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 hover:border-amber-500 transition-all cursor-pointer relative group"
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
                          <span className="text-[11px] text-stone-400 italic">Tidak melampirkan foto</span>
                        )}

                        {item.portfolioUrl && (
                          <a
                            href={item.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline"
                          >
                            <span>Portofolio Eksternal</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Notes / Reason */}
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {item.notes || "Pengajuan lencana verifikasi standar platform."}
                      </p>
                      {item.rejectionReason && (
                        <p className="text-[10px] text-rose-600 font-medium mt-1">
                          Alasan tolak: {item.rejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${
                          item.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            : item.status === "REVISION_REQUESTED"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
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
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== "APPROVED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleApprove(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
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
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${activeModal === "REVISION" ? "text-sky-600" : "text-rose-600"}`} />
                <h3 className="text-sm font-bold text-[#1E1B2E]">
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
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
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
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-[#27213D] focus:border-amber-500 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleModalSubmit}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer ${
                  activeModal === "REVISION"
                    ? "bg-sky-600 hover:bg-sky-700"
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
