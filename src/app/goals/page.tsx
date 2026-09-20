import { redirect } from "next/navigation";
import Link from "next/link";
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

interface GoalsPageProps {
  searchParams: Promise<{ error?: string }>;
}

const GOAL_LABELS: Record<GoalCategory, { label: string; desc: string; icon: React.ReactNode }> = {
  MARKET_EXPANSION: { label: "Ekspansi Pasar", desc: "Menjangkau segmen atau wilayah baru", icon: <Globe className="w-5 h-5 text-emerald-400" /> },
  PRODUCT_DEVELOPMENT: { label: "Pengembangan Produk", desc: "Membuat atau memperbaiki produk baru", icon: <Wrench className="w-5 h-5 text-emerald-400" /> },
  BRAND_GROWTH: { label: "Pertumbuhan Brand", desc: "Meningkatkan visibilitas dan reputasi", icon: <Sparkles className="w-5 h-5 text-emerald-400" /> },
  REVENUE_GROWTH: { label: "Pertumbuhan Pendapatan", desc: "Meningkatkan omset dan profitabilitas", icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> },
  CAPABILITY_EXPANSION: { label: "Ekspansi Kapabilitas", desc: "Menambah skill atau kapasitas produksi", icon: <Zap className="w-5 h-5 text-emerald-400" /> },
  NETWORK_EXPANSION: { label: "Ekspansi Jaringan", desc: "Membangun koneksi strategis baru", icon: <Handshake className="w-5 h-5 text-emerald-400" /> },
  MARKET_ACCESS: { label: "Akses Pasar Baru", desc: "Masuk ke kanal distribusi baru", icon: <DoorOpen className="w-5 h-5 text-emerald-400" /> },
  CREATIVE_EXPERIMENTATION: { label: "Eksperimen Kreatif", desc: "Eksplorasi ide dan konsep inovatif", icon: <Palette className="w-5 h-5 text-emerald-400" /> },
  CULTURAL_PRESERVATION: { label: "Pelestarian Budaya", desc: "Menjaga warisan budaya lokal", icon: <Landmark className="w-5 h-5 text-emerald-400" /> },
  OPERATIONAL_IMPROVEMENT: { label: "Perbaikan Operasional", desc: "Efisiensi proses dan alur kerja", icon: <Settings className="w-5 h-5 text-emerald-400" /> },
};

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Sangat Rendah", color: "text-slate-400" },
  2: { label: "Rendah", color: "text-blue-400" },
  3: { label: "Sedang", color: "text-amber-400" },
  4: { label: "Tinggi", color: "text-orange-400" },
  5: { label: "Sangat Tinggi", color: "text-rose-400" },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-gradient-to-bl from-emerald-500/8 via-teal-500/8 to-transparent blur-[100px] rounded-full" />
      </div>

      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 shadow-md">R</div>
              <span className="font-bold text-lg tracking-tight text-white">RAMU</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-xs">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/assets" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Aset</Link>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium">Goal</span>
              <Link href="/needs" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Kebutuhan</Link>
              <Link href="/constraints" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Batasan</Link>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:block">{actor.name}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Tujuan (Goals)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {goals.length} aktif
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Apa yang ingin dicapai <span className="text-slate-300 font-medium">{actor.name}</span>? Digunakan Engine untuk menilai Goal Alignment.
            </p>
          </div>
        </div>

        {params.error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{params.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">+ Tambah Goal Baru</h2>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
              <form action={createGoal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kategori Goal *</label>
                  <select name="category" defaultValue="MARKET_EXPANSION" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                    {Object.entries(GOAL_LABELS).map(([val, { label, icon }]) => (
                      <option key={val} value={val}>{icon} {label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Judul Goal *</label>
                  <input name="title" type="text" required placeholder="misal: Masuk ke pasar Gen-Z via media sosial" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deskripsi (Opsional)</label>
                  <textarea name="description" rows={2} placeholder="Konteks atau target kuantitatif..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prioritas (1–5)</label>
                  <select name="priority" defaultValue="3" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                    {[1, 2, 3, 4, 5].map((p) => (
                      <option key={p} value={p}>{p} — {PRIORITY_LABELS[p].label}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2">
                  <span>Simpan Goal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Goal Terdaftar</h2>

            {goals.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <div className="flex justify-center">
                  <Target className="w-8 h-8 text-neutral-500" />
                </div>
                <p className="text-sm text-slate-400">Belum ada goal yang didaftarkan.</p>
                <p className="text-xs text-slate-500">Tentukan minimal 1 goal agar Engine dapat menilai Goal Alignment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => {
                  const meta = GOAL_LABELS[goal.category];
                  const prio = PRIORITY_LABELS[goal.priority] || PRIORITY_LABELS[3];
                  return (
                    <div key={goal.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">{meta.icon}</div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-emerald-400">{meta.label}</span>
                              <span className={`text-[11px] font-medium ${prio.color}`}>P{goal.priority} · {prio.label}</span>
                            </div>
                            <p className="font-semibold text-white text-sm">{goal.title}</p>
                            {goal.description && (
                              <p className="text-xs text-slate-400 leading-relaxed">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        <form action={deleteGoal.bind(null, goal.id)}>
                          <button type="submit" className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-xs text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 cursor-pointer">
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
      </main>
    </div>
  );
}
