"use client";

import { useState, useTransition } from "react";
import { Settings2, Plus, Edit2, Trash2, X, Check, Wrench, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { upsertRoleBlueprintAction, deleteRoleBlueprintAction } from "../actions";

interface RoleBlueprintItem {
  id: string;
  roleName: string;
  skillsArray: string[];
  recommendedTools: string[];
  rateJunior: string | null;
  rateMid: string | null;
  rateSenior: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function RoleBlueprintManagerClient({
  initialBlueprints,
}: {
  initialBlueprints: RoleBlueprintItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<RoleBlueprintItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [roleName, setRoleName] = useState("");
  const [skills, setSkills] = useState("");
  const [tools, setTools] = useState("");
  const [rateJunior, setRateJunior] = useState("");
  const [rateMid, setRateMid] = useState("");
  const [rateSenior, setRateSenior] = useState("");

  const openCreateModal = () => {
    setEditingBlueprint(null);
    setRoleName("");
    setSkills("");
    setTools("");
    setRateJunior("");
    setRateMid("");
    setRateSenior("");
    setModalOpen(true);
  };

  const openEditModal = (bp: RoleBlueprintItem) => {
    setEditingBlueprint(bp);
    setRoleName(bp.roleName);
    setSkills(bp.skillsArray.join(", "));
    setTools(bp.recommendedTools.join(", "));
    setRateJunior(bp.rateJunior || "");
    setRateMid(bp.rateMid || "");
    setRateSenior(bp.rateSenior || "");
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setFeedback({ type: "error", text: "Nama peran profesi wajib diisi." });
      return;
    }

    const formData = new FormData();
    if (editingBlueprint) formData.append("id", editingBlueprint.id);
    formData.append("roleName", roleName.trim());
    formData.append("skills", skills);
    formData.append("tools", tools);
    formData.append("rateJunior", rateJunior);
    formData.append("rateMid", rateMid);
    formData.append("rateSenior", rateSenior);

    startTransition(async () => {
      const res = await upsertRoleBlueprintAction(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          text: editingBlueprint
            ? `Blueprint "${roleName}" berhasil diperbarui.`
            : `Blueprint "${roleName}" berhasil ditambahkan.`,
        });
        setModalOpen(false);
      } else {
        setFeedback({ type: "error", text: res.error || "Gagal menyimpan blueprint." });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    startTransition(async () => {
      const res = await deleteRoleBlueprintAction(id);
      if (res.success) {
        setFeedback({ type: "success", text: `Blueprint "${name}" berhasil dihapus.` });
        setDeleteConfirmId(null);
      } else {
        setFeedback({ type: "error", text: res.error || "Gagal menghapus blueprint." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="hover:opacity-75 p-1 rounded transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-[#27213D]">Katalog Standar Profesi</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Total {initialBlueprints.length} blueprint standar kompetensi dan acuan kompensasi terdaftar.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#27213D] text-white text-xs font-bold hover:bg-[#3b325c] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Blueprint Peran
        </button>
      </div>

      {/* Grid of Blueprints */}
      {initialBlueprints.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-stone-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Settings2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-700">Belum Ada Blueprint Peran</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Standarisasi profesi kru dan acuan tarif pasar belum dikonfigurasi. Klik tombol di atas untuk menambahkan.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Blueprint Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {initialBlueprints.map((bp) => (
            <div
              key={bp.id}
              className="rounded-2xl bg-white border border-stone-200 overflow-hidden hover:border-indigo-500/25 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <h3 className="text-sm font-bold text-[#27213D]">{bp.roleName}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(bp)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Blueprint"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(bp.id)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Blueprint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Skills */}
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      Keahlian Utama
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {bp.skillsArray.length > 0 ? (
                        bp.skillsArray.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-stone-50 text-[#27213D] font-medium border border-stone-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">Belum ditentukan</span>
                      )}
                    </div>
                  </div>

                  {/* Gear / Tools */}
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3 h-3 text-indigo-500" />
                      Alat Kerja Rekomendasi
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {bp.recommendedTools.length > 0 ? (
                        bp.recommendedTools.map((g, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100"
                          >
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">Belum ditentukan</span>
                      )}
                    </div>
                  </div>

                  {/* Rates */}
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                      Panduan Acuan Tarif Pasar
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center">
                        <p className="text-[9px] font-bold text-stone-400 uppercase">Junior</p>
                        <p className="text-[10px] font-bold text-emerald-700 mt-0.5 truncate">
                          {bp.rateJunior || "—"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center">
                        <p className="text-[9px] font-bold text-stone-400 uppercase">Mid</p>
                        <p className="text-[10px] font-bold text-amber-700 mt-0.5 truncate">
                          {bp.rateMid || "—"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center">
                        <p className="text-[9px] font-bold text-stone-400 uppercase">Senior</p>
                        <p className="text-[10px] font-bold text-rose-700 mt-0.5 truncate">
                          {bp.rateSenior || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete confirmation modal per item */}
              {deleteConfirmId === bp.id && (
                <div className="px-5 py-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Hapus blueprint peran ini permanen?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200/50 rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(bp.id, bp.roleName)}
                      className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#27213D]">
                    {editingBlueprint ? "Sunting Blueprint Peran" : "Tambah Blueprint Baru"}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Konfigurasi standar skill dan panduan tarif industri kreatif.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#27213D] uppercase tracking-wider mb-1.5">
                  Nama Peran Profesi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Colorist / Sound Designer / Lead Animator"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27213D] uppercase tracking-wider mb-1.5">
                  Keahlian Utama (Pisahkan dengan tanda koma)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: DaVinci Resolve, Color matching, ACES color pipeline, HDR grading"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27213D] uppercase tracking-wider mb-1.5">
                  Alat Kerja / Perangkat Rekomendasi (Pisahkan dengan koma)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tangent Element panel, calibrated OLED monitor, DaVinci Mini"
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27213D] uppercase tracking-wider mb-2">
                  Panduan Tarif Pasar
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[10px] font-semibold text-stone-500 mb-1">Junior</span>
                    <input
                      type="text"
                      placeholder="Rp 1–2 jt/hari"
                      value={rateJunior}
                      onChange={(e) => setRateJunior(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-stone-500 mb-1">Mid-Level</span>
                    <input
                      type="text"
                      placeholder="Rp 2,5–5 jt/hari"
                      value={rateMid}
                      onChange={(e) => setRateMid(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-stone-500 mb-1">Senior</span>
                    <input
                      type="text"
                      placeholder="Rp 6–12 jt/hari"
                      value={rateSenior}
                      onChange={(e) => setRateSenior(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#27213D] text-white text-xs font-bold hover:bg-[#3b325c] transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {editingBlueprint ? "Simpan Perubahan" : "Simpan Blueprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
