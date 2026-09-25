import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createGoal, deleteGoal } from "./actions";
import { GoalCategory } from "@prisma/client";
import {
  Globe,
  Wrench,
  Sparkles,
  TrendingUp,
  Zap,
  Handshake,
  DoorOpen,
  Palette,
  Landmark,
  Settings,
  AlertCircle,
  Target,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

interface GoalsPageProps {
  searchParams: Promise<{ error?: string }>;
}

const GOAL_LABELS: Record<GoalCategory, { label: string; desc: string; icon: React.ReactNode }> = {
  EDITORIAL_PUBLICATION: { label: "Publikasi Editorial", desc: "Tampil di majalah/media kreatif", icon: <Globe className="w-5 h-5 text-[#1E1B2E]" /> },
  COMMERCIAL_CAMPAIGN: { label: "Kampanye Komersial", desc: "Kampanye promosi produk/brand", icon: <Wrench className="w-5 h-5 text-[#1E1B2E]" /> },
  PORTFOLIO_BUILDING: { label: "Kolaborasi Portofolio (TFP)", desc: "Membangun karya portfolio bersama", icon: <Palette className="w-5 h-5 text-[#1E1B2E]" /> },
  BRAND_AWARENESS: { label: "Brand Awareness", desc: "Meningkatkan eksposur dan reach", icon: <Sparkles className="w-5 h-5 text-[#1E1B2E]" /> },
  REVENUE_GENERATION: { label: "Proyek Komersial Berbayar", desc: "Monetisasi dan profitabilitas", icon: <TrendingUp className="w-5 h-5 text-[#1E1B2E]" /> },
  SKILL_DEVELOPMENT: { label: "Pengembangan Keahlian", desc: "Eksplorasi teknik dan skill baru", icon: <Zap className="w-5 h-5 text-[#1E1B2E]" /> },
};

const PRIORITY_LABELS: Record<number, { label: string; color: string; badge: string }> = {
  1: { label: "Sangat Rendah", color: "text-[#716B7E]", badge: "bg-stone-100 text-stone-600 border-stone-200" },
  2: { label: "Rendah", color: "text-[#1E1B2E]", badge: "bg-stone-100 text-stone-600 border-stone-200" },
  3: { label: "Sedang", color: "text-[#1E1B2E]", badge: "bg-stone-100 text-stone-600 border-stone-200" },
  4: { label: "Tinggi", color: "text-[#1E1B2E]", badge: "bg-stone-100 text-stone-600 border-stone-200" },
  5: { label: "Sangat Tinggi", color: "text-[#1E1B2E]", badge: "bg-[#1E1B2E] text-white border-[#1E1B2E]" },
};

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });
  if (!actor) redirect("/onboarding");

  const goals = await prisma.goal.findMany({
    where: { actorId: actor.id, status: "ACTIVE" },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const params = await searchParams;

  return (
    <AppShell actor={actor} activeRoute="/goals">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#27213D] tracking-tight">Tujuan Kolaborasi (Goals)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-[#1E1B2E] border border-stone-200">
                {goals.length} aktif
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#716B7E]">
              Apa yang ingin dicapai <strong className="text-[#27213D]">{actor.name}</strong>? Digunakan Opportunity Engine untuk menghitung Goal Alignment dalam setiap rekomendasi.
            </p>
          </div>
        </div>

        {params.error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <p>{params.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest mb-6">+ Tambah Goal Baru</h2>
            <div className="pt-2">
              <form action={createGoal} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Kategori Goal *</label>
                  <select
                    name="category"
                    defaultValue="BRAND_AWARENESS"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] cursor-pointer appearance-none"
                  >
                    {Object.entries(GOAL_LABELS).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Judul Goal *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="misal: Masuk ke pasar Gen-Z via kampanye fashion film"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Deskripsi (Opsional)</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Konteks sasaran atau target kuantitatif..."
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Prioritas (1–5)</label>
                  <select
                    name="priority"
                    defaultValue="3"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] cursor-pointer appearance-none"
                  >
                    {[1, 2, 3, 4, 5].map((p) => (
                      <option key={p} value={p}>{p} — {PRIORITY_LABELS[p].label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 px-6 py-4 bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  <span>Simpan Goal</span>
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-xs font-bold text-[#9E98A8] uppercase tracking-wider">Goal Terdaftar</h2>

            {goals.length === 0 ? (
              <div className="p-10 rounded-[28px] bg-white/95 border border-dashed border-stone-300 text-center space-y-2 shadow-xs">
                <div className="flex justify-center">
                  <Target className="w-10 h-10 text-stone-400" />
                </div>
                <p className="text-sm font-semibold text-[#27213D]">Belum ada goal yang didaftarkan.</p>
                <p className="text-xs text-[#716B7E]">Tentukan minimal 1 goal agar Engine dapat menilai Goal Alignment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => {
                  const meta = GOAL_LABELS[goal.category];
                  const prio = PRIORITY_LABELS[goal.priority] || PRIORITY_LABELS[3];
                  return (
                    <div
                      key={goal.id}
                      className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 hover:border-stone-300 transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 flex-shrink-0 mt-0.5">
                            {meta.icon}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#7C3AED]">{meta.label}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prio.badge}`}>
                                P{goal.priority} · {prio.label}
                              </span>
                            </div>
                            <p className="font-bold text-[#27213D] text-sm">{goal.title}</p>
                            {goal.description && (
                              <p className="text-xs text-[#716B7E] leading-relaxed">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        <form action={deleteGoal.bind(null, goal.id)}>
                          <button
                            type="submit"
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 text-xs text-[#716B7E] hover:text-rose-600 border border-stone-200 hover:border-rose-200 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
