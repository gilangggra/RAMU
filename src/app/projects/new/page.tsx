"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProjectBriefAction } from "@/app/projects/actions";
import { Lightbulb, MapPin, Clock, CircleDollarSign, Send, Check, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

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

const ASSET_CATEGORIES = [
  { value: "CAPABILITY", label: "Kapabilitas / Keahlian" },
  { value: "PRODUCTION", label: "Kapasitas Produksi" },
  { value: "CREATIVE_ASSET", label: "Aset Kreatif" },
  { value: "PRODUCT", label: "Produk" },
  { value: "MATERIAL", label: "Material" },
  { value: "RESOURCE", label: "Sumber Daya / Peralatan" },
  { value: "MARKET", label: "Akses Pasar / Distribusi" },
  { value: "AUDIENCE", label: "Audiens / Network" },
];

interface RoleInput {
  id: string;
  roleLabel: string;
  assetCategory: string;
  description: string;
  maxCollaborators: number;
}

export default function NewProjectBriefPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [targetOutput, setTargetOutput] = useState("");

  const [roles, setRoles] = useState<RoleInput[]>([
    { id: "1", roleLabel: "", assetCategory: "CAPABILITY", description: "", maxCollaborators: 1 },
  ]);

  const [location, setLocation] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [targetLaunch, setTargetLaunch] = useState("");
  const [estimatedTotal, setEstimatedTotal] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");

  function addRole() {
    setRoles((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        roleLabel: "",
        assetCategory: "CAPABILITY",
        description: "",
        maxCollaborators: 1,
      },
    ]);
  }

  function updateRole(id: string, field: keyof RoleInput, value: string | number) {
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function removeRole(id: string) {
    if (roles.length === 1) return;
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSubmit() {
    setError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("projectType", projectType);
    formData.set("targetOutput", targetOutput);
    formData.set("location", location);
    formData.set("estimatedDuration", estimatedDuration);
    formData.set("targetLaunch", targetLaunch);
    formData.set("estimatedTotal", estimatedTotal);
    formData.set("budgetNotes", budgetNotes);
    formData.set(
      "neededRoles",
      JSON.stringify(
        roles
          .filter((r) => r.roleLabel.trim())
          .map(({ roleLabel, assetCategory, description, maxCollaborators }) => ({
            roleLabel: roleLabel.trim(),
            assetCategory,
            description: description.trim() || undefined,
            maxCollaborators,
          }))
      )
    );

    startTransition(async () => {
      const res = await createProjectBriefAction(formData);
      if (res.success && res.briefId) {
        router.push(`/projects/${res.briefId}`);
      } else {
        setError(res.error || "Gagal membuat project brief.");
        setStep(1);
      }
    });
  }

  const canProceedStep1 =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    targetOutput.trim().length >= 3;

  const canProceedStep2 = roles.some((r) => r.roleLabel.trim().length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            ← Kembali ke Proyek
          </Link>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s === step
                    ? "bg-violet-500 text-white"
                    : s < step
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {s < step ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
              Langkah {step} dari 4
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {step === 1 && "Informasi Proyek"}
              {step === 2 && "Peran yang Dibutuhkan"}
              {step === 3 && "Detail Operasional"}
              {step === 4 && "Review & Publikasi"}
            </h1>
            <p className="text-sm text-slate-400">
              {step === 1 && "Jelaskan proyek yang ingin Anda garap bersama kolaborator."}
              {step === 2 && "Tentukan peran apa saja yang dibutuhkan dalam proyek ini."}
              {step === 3 && "Isi detail timeline dan budget (opsional)."}
              {step === 4 && "Pastikan semua informasi sudah benar sebelum dipublikasikan."}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Judul Proyek *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="misal: Campaign Video Minuman Lokal — Bali Vibes"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Jenis Proyek *
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Target Output *
                  </label>
                  <input
                    value={targetOutput}
                    onChange={(e) => setTargetOutput(e.target.value)}
                    placeholder="misal: Video iklan 60 detik + 10 foto produk berkualitas tinggi"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Deskripsi Proyek *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan konteks, tujuan, dan apa yang ingin dicapai dari proyek ini..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Tambahkan setiap peran yang Anda butuhkan. Kolaborator akan memilih peran yang sesuai dengan kapabilitas mereka.</span>
                </div>

                {roles.map((role, idx) => (
                  <div key={role.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Peran #{idx + 1}
                      </span>
                      {roles.length > 1 && (
                        <button
                          onClick={() => removeRole(role.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase text-slate-500">
                          Label Peran *
                        </label>
                        <input
                          value={role.roleLabel}
                          onChange={(e) => updateRole(role.id, "roleLabel", e.target.value)}
                          placeholder="misal: Videographer"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase text-slate-500">
                          Kategori Aset *
                        </label>
                        <select
                          value={role.assetCategory}
                          onChange={(e) => updateRole(role.id, "assetCategory", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                        >
                          {ASSET_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase text-slate-500">
                        Deskripsi Peran (Opsional)
                      </label>
                      <input
                        value={role.description}
                        onChange={(e) => updateRole(role.id, "description", e.target.value)}
                        placeholder="misal: Pengambilan video di outdoor, editing dinamis"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addRole}
                  className="w-full py-2.5 rounded-2xl border border-dashed border-violet-500/30 hover:border-violet-500 text-violet-400 hover:text-violet-300 text-sm font-medium transition-all cursor-pointer"
                >
                  + Tambah Peran Lain
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-400">
                  Semua field di langkah ini opsional. Anda bisa mengisi, menentukan detail, atau membahasnya nanti bersama kolaborator.
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Lokasi Proyek
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="misal: Bali, atau Remote"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Estimasi Durasi
                    </label>
                    <input
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="misal: 3 Minggu"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Target Peluncuran
                    </label>
                    <input
                      value={targetLaunch}
                      onChange={(e) => setTargetLaunch(e.target.value)}
                      placeholder="misal: Oktober 2026"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Estimasi Anggaran Total
                  </label>
                  <input
                    value={estimatedTotal}
                    onChange={(e) => setEstimatedTotal(e.target.value)}
                    placeholder="misal: Rp 5.000.000 atau Revenue Share"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Catatan Budget
                  </label>
                  <textarea
                    value={budgetNotes}
                    onChange={(e) => setBudgetNotes(e.target.value)}
                    placeholder="misal: Bagi hasil 50:50, biaya produksi ditanggung bersama..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase text-slate-400">Informasi Proyek</div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{title}</div>
                    <div className="text-xs text-violet-400">{projectType}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{description}</div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-500">TARGET:</span>
                    <span className="text-xs text-amber-300">{targetOutput}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase text-slate-400">Peran Dibutuhkan ({roles.filter(r => r.roleLabel).length})</div>
                  <div className="space-y-2">
                    {roles
                      .filter((r) => r.roleLabel.trim())
                      .map((role, idx) => (
                        <div key={role.id} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-200">{role.roleLabel}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{role.assetCategory}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {(location || estimatedDuration || estimatedTotal) && (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-400">Detail Operasional</div>
                    <div className="text-xs text-slate-300 space-y-1.5">
                      {location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>{location}</span>
                        </div>
                      )}
                      {estimatedDuration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>{estimatedDuration}</span>
                        </div>
                      )}
                      {estimatedTotal && (
                        <div className="flex items-center gap-1.5">
                          <CircleDollarSign className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>{estimatedTotal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Setelah dipublikasikan, proyek ini akan muncul di galeri publik dan dapat dilihat oleh semua kreator di RAMU.</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors cursor-pointer"
                >
                  ← Kembali
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                  className="flex-1 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-violet-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>{isPending ? "Mempublikasikan..." : "Publikasikan Project Brief"}</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
