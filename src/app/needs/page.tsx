import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createNeed, deleteNeed } from "./actions";
import { NeedCategory } from "@prisma/client";
import {
  Brain,
  Zap,
  Layers,
  Factory,
  ShoppingCart,
  Truck,
  Palette,
  Laptop,
  CircleDollarSign,
  Home,
  AlertCircle,
  Search,
  ArrowRight,
} from "lucide-react";

interface NeedsPageProps {
  searchParams: Promise<{ error?: string }>;
}

const NEED_LABELS: Record<
  NeedCategory,
  { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CAPABILITY_NEED: { label: "Kebutuhan Kapabilitas", desc: "Skill atau keahlian yang belum dimiliki", icon: Brain, color: "text-purple-400" },
  RESOURCE_NEED: { label: "Kebutuhan Sumber Daya", desc: "Sumber daya yang dibutuhkan", icon: Zap, color: "text-teal-400" },
  MATERIAL_NEED: { label: "Kebutuhan Material", desc: "Bahan baku atau komponen", icon: Layers, color: "text-orange-400" },
  PRODUCTION_NEED: { label: "Kebutuhan Produksi", desc: "Kapasitas atau fasilitas produksi", icon: Factory, color: "text-cyan-400" },
  MARKET_NEED: { label: "Kebutuhan Pasar", desc: "Akses ke pasar atau segmen tertentu", icon: ShoppingCart, color: "text-green-400" },
  DISTRIBUTION_NEED: { label: "Kebutuhan Distribusi", desc: "Kanal distribusi atau logistik", icon: Truck, color: "text-blue-400" },
  CREATIVE_NEED: { label: "Kebutuhan Kreatif", desc: "Desain, konten, atau aset visual", icon: Palette, color: "text-pink-400" },
  TECHNOLOGY_NEED: { label: "Kebutuhan Teknologi", desc: "Tools, platform, atau infrastruktur tech", icon: Laptop, color: "text-indigo-400" },
  FUNDING_NEED: { label: "Kebutuhan Pendanaan", desc: "Modal atau investasi", icon: CircleDollarSign, color: "text-amber-400" },
  SPACE_NEED: { label: "Kebutuhan Ruang", desc: "Ruang kerja, studio, atau gudang", icon: Home, color: "text-rose-400" },
};

export default async function NeedsPage({ searchParams }: NeedsPageProps) {
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

  const [needs, goals] = await Promise.all([
    prisma.need.findMany({
      where: { actorId: actor.id, status: "ACTIVE" },
      include: { relatedGoal: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.goal.findMany({
      where: { actorId: actor.id, status: "ACTIVE" },
      orderBy: { priority: "desc" },
    }),
  ]);

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[250px] bg-gradient-to-r from-pink-500/8 via-purple-500/8 to-transparent blur-[100px] rounded-full" />
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
              <Link href="/goals" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Goal</Link>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium">Kebutuhan</span>
              <Link href="/constraints" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Batasan</Link>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:block">{actor.name}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Kebutuhan (Needs)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
              {needs.length} aktif
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Apa yang <span className="text-slate-300 font-medium">{actor.name}</span> butuhkan dari kolaborator? Engine akan mencari aktor yang dapat memenuhi kebutuhan ini.
          </p>
        </div>

        {params.error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>{params.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">+ Tambah Kebutuhan</h2>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <form action={createNeed} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kategori Kebutuhan *</label>
                  <select name="category" defaultValue="CAPABILITY_NEED" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors">
                    {Object.entries(NEED_LABELS).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deskripsi Kebutuhan *</label>
                  <input name="title" type="text" required placeholder="misal: Fotografer produk untuk lookbook" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detail Tambahan (Opsional)</label>
                  <textarea name="description" rows={2} placeholder="Spesifikasi atau detail tambahan..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors resize-none" />
                </div>

                {goals.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Terkait Goal (Opsional)</label>
                    <select name="relatedGoalId" defaultValue="" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors">
                      <option value="">— Tidak dikaitkan ke goal tertentu —</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">Menautkan need ke goal meningkatkan akurasi scoring Engine.</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prioritas (1–5)</label>
                  <select name="priority" defaultValue="3" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors">
                    <option value="5">5 — Sangat Tinggi</option>
                    <option value="4">4 — Tinggi</option>
                    <option value="3">3 — Sedang</option>
                    <option value="2">2 — Rendah</option>
                    <option value="1">1 — Sangat Rendah</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all cursor-pointer flex items-center justify-center gap-2">
                  <span>Simpan Kebutuhan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Kebutuhan Terdaftar</h2>
            {needs.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <div className="flex justify-center">
                  <Search className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">Belum ada kebutuhan yang didaftarkan.</p>
                <p className="text-xs text-slate-500">Kebutuhan yang jelas membantu Engine menemukan kolaborator yang tepat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needs.map((need) => {
                  const meta = NEED_LABELS[need.category];
                  const IconComp = meta.icon;
                  return (
                    <div key={need.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            <IconComp className={`w-5 h-5 ${meta.color}`} />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                            <p className="font-semibold text-white text-sm">{need.title}</p>
                            {need.description && <p className="text-xs text-slate-400 leading-relaxed">{need.description}</p>}
                            {need.relatedGoal && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                                <span className="text-[11px] text-slate-500 font-medium">Goal:</span>
                                <span className="text-[11px] text-emerald-400 font-medium">{need.relatedGoal.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <form action={deleteNeed.bind(null, need.id)}>
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
