"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Pencil,
  X,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  updateProjectBriefAction,
  closeProjectBriefAction,
  deleteProjectBriefAction,
} from "@/app/projects/actions";

const PROJECT_TYPES = [
  "Campaign Iklan",
  "Peluncuran Produk",
  "Produksi Konten",
  "Branding & Visual Identity",
  "Kolaborasi Produk Baru",
  "Ekshibisi & Event",
  "Riset & Pengembangan",
  "Lainnya",
];

interface BriefManageMenuProps {
  briefId: string;
  briefStatus: string;
  initialTitle: string;
  initialDescription: string;
  initialProjectType: string;
  initialTargetOutput: string;
  initialLocation: string;
  initialEstimatedDuration: string;
  initialTargetLaunch: string;
  initialCompensationModel: string;
  initialEstimatedTotal: string;
  initialBudgetNotes: string;
  initialAestheticStyle: string;
}

export function BriefManageMenu({
  briefId,
  briefStatus,
  initialTitle,
  initialDescription,
  initialProjectType,
  initialTargetOutput,
  initialLocation,
  initialEstimatedDuration,
  initialTargetLaunch,
  initialCompensationModel,
  initialEstimatedTotal,
  initialBudgetNotes,
  initialAestheticStyle,
}: BriefManageMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [projectType, setProjectType] = useState(initialProjectType);
  const [targetOutput, setTargetOutput] = useState(initialTargetOutput);
  const [location, setLocation] = useState(initialLocation);
  const [estimatedDuration, setEstimatedDuration] = useState(initialEstimatedDuration);
  const [targetLaunch, setTargetLaunch] = useState(initialTargetLaunch);
  const [compensationModel, setCompensationModel] = useState(initialCompensationModel || "PAID");
  const [estimatedTotal, setEstimatedTotal] = useState(initialEstimatedTotal);
  const [budgetNotes, setBudgetNotes] = useState(initialBudgetNotes);
  const [aestheticStyle, setAestheticStyle] = useState(initialAestheticStyle);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isClosed = briefStatus === "CLOSED" || briefStatus === "CANCELLED";

  async function handleUpdate() {
    const formData = new FormData();
    formData.append("briefId", briefId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("projectType", projectType);
    formData.append("targetOutput", targetOutput);
    formData.append("location", location);
    formData.append("estimatedDuration", estimatedDuration);
    formData.append("targetLaunch", targetLaunch);
    formData.append("compensationModel", compensationModel);
    formData.append("estimatedTotal", estimatedTotal);
    formData.append("budgetNotes", budgetNotes);
    formData.append("aestheticStyle", aestheticStyle);

    startTransition(async () => {
      const result = await updateProjectBriefAction(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Brief berhasil diperbarui." });
        setTimeout(() => { setShowEditModal(false); setMessage(null); router.refresh(); }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Gagal memperbarui." });
      }
    });
  }

  async function handleClose() {
    startTransition(async () => {
      const result = await closeProjectBriefAction(briefId);
      if (result.success) {
        setShowCloseConfirm(false);
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Gagal menutup brief." });
      }
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteProjectBriefAction(briefId);
      if (result.success) {
        router.push("/projects");
      } else {
        setMessage({ type: "error", text: result.error || "Gagal menghapus brief." });
        setShowDeleteConfirm(false);
      }
    });
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
        >
          <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
          <span>Kelola Brief</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {!isClosed && (
              <button
                onClick={() => { setMenuOpen(false); setShowEditModal(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Edit Detail Brief</span>
              </button>
            )}
            {!isClosed && (
              <button
                onClick={() => { setMenuOpen(false); setShowCloseConfirm(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-amber-600" />
                <span>Tutup Brief</span>
              </button>
            )}
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Brief</span>
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-[22px] border border-white/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Project Brief</h2>
                <p className="text-xs text-slate-500 mt-0.5">Perubahan akan langsung terlihat di halaman publik.</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setMessage(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Judul Brief *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs font-medium text-slate-800 outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi / Konsep *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 resize-none leading-relaxed outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jenis Proyek</label>
                  <div className="relative">
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 pr-10 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors cursor-pointer shadow-2xs"
                    >
                      {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Luaran</label>
                  <input
                    type="text"
                    value={targetOutput}
                    onChange={(e) => setTargetOutput(e.target.value)}
                    placeholder="mis. 10 foto editorial, 2 video reels..."
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lokasi</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="mis. Bandung, Jakarta, Remote"
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Model Kompensasi</label>
                  <div className="relative">
                    <select
                      value={compensationModel}
                      onChange={(e) => setCompensationModel(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 pr-10 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors cursor-pointer shadow-2xs"
                    >
                      <option value="PAID">Fee Komersial Penuh (Paid Flat Fee)</option>
                      <option value="REVENUE_SHARE">Bagi Hasil Komersial (Revenue Share)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimasi Durasi</label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="mis. 2 minggu, 1 bulan..."
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Peluncuran</label>
                  <input
                    type="text"
                    value={targetLaunch}
                    onChange={(e) => setTargetLaunch(e.target.value)}
                    placeholder="mis. Akhir Oktober 2026"
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimasi Nilai Proyek</label>
                  <input
                    type="text"
                    value={estimatedTotal}
                    onChange={(e) => setEstimatedTotal(e.target.value)}
                    placeholder="mis. Rp 5.000.000"
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gaya Estetika</label>
                  <input
                    type="text"
                    value={aestheticStyle}
                    onChange={(e) => setAestheticStyle(e.target.value)}
                    placeholder="mis. Minimalist, Editorial, Rustic..."
                    className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 outline-none transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Catatan Budget</label>
                <textarea
                  rows={2}
                  value={budgetNotes}
                  onChange={(e) => setBudgetNotes(e.target.value)}
                  placeholder="Skema pembagian, catatan negosiasi, dll."
                  className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 text-xs text-slate-800 resize-none outline-none transition-colors shadow-2xs"
                />
              </div>

              {message && (
                <div className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-medium ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                  {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {message.text}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white/90 backdrop-blur-md">
              <button onClick={() => { setShowEditModal(false); setMessage(null); }} className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={isPending || !title || !description}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38b6eb] text-white text-xs font-semibold shadow-md shadow-[#4CC9FE]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isPending ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLOSE CONFIRM */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-[22px] border border-white/80 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tutup Brief Ini?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Brief tidak akan muncul lagi di papan proyek publik.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Status brief akan berubah menjadi <strong>CLOSED</strong>. Kreator yang sudah melamar masih bisa dilihat, tapi brief tidak menerima peminat baru. Tindakan ini tidak dapat dibatalkan.
            </p>
            {message?.type === "error" && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button onClick={() => setShowCloseConfirm(false)} className="px-5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                <span>{isPending ? "Menutup..." : "Ya, Tutup Brief"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-[22px] border border-white/80 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Brief Ini?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tindakan ini permanen dan tidak dapat diurungkan.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Semua data brief, termasuk semua lamaran kreator yang masuk, akan <strong className="text-rose-700">dihapus permanen</strong>. Brief dengan kolaborator yang sudah diterima tidak dapat dihapus.
            </p>
            {message?.type === "error" && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button onClick={() => { setShowDeleteConfirm(false); setMessage(null); }} className="px-5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isPending ? "Menghapus..." : "Hapus Permanen"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}