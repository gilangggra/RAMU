import { redirect } from "next/navigation";
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
import { AppShell } from "@/components/layout/AppShell";

interface NeedsPageProps {
  searchParams: Promise<{ error?: string }>;
}

const NEED_LABELS: Record<
  NeedCategory,
  { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string; badge: string }
> = {
  CAPABILITY_NEED: { label: "Kebutuhan Kapabilitas", desc: "Skill atau keahlian yang belum dimiliki", icon: Brain, color: "text-[#7C3AED]", badge: "bg-[#EDE8FF] text-[#7C3AED] border-[#DDD6FE]" },
  RESOURCE_NEED: { label: "Kebutuhan Sumber Daya", desc: "Sumber daya yang dibutuhkan", icon: Zap, color: "text-[#0D9488]", badge: "bg-[#E0F7F0] text-[#0D9488] border-[#99F6E4]" },
  MATERIAL_NEED: { label: "Kebutuhan Material", desc: "Bahan baku atau komponen", icon: Layers, color: "text-[#E66A48]", badge: "bg-[#FFF7ED] text-[#E66A48] border-[#F9D8C4]" },
  PRODUCTION_NEED: { label: "Kebutuhan Produksi", desc: "Kapasitas atau fasilitas produksi", icon: Factory, color: "text-[#2563EB]", badge: "bg-[#E2F4FD] text-[#2563EB] border-[#BFDBFE]" },
  MARKET_NEED: { label: "Kebutuhan Pasar", desc: "Akses ke pasar atau segmen tertentu", icon: ShoppingCart, color: "text-[#0D9488]", badge: "bg-[#E0F7F0] text-[#0D9488] border-[#99F6E4]" },
  DISTRIBUTION_NEED: { label: "Kebutuhan Distribusi", desc: "Kanal distribusi atau logistik", icon: Truck, color: "text-[#2563EB]", badge: "bg-[#E2F4FD] text-[#2563EB] border-[#BFDBFE]" },
  CREATIVE_NEED: { label: "Kebutuhan Kreatif", desc: "Desain, konten, atau aset visual", icon: Palette, color: "text-[#E66A48]", badge: "bg-[#FFF7ED] text-[#E66A48] border-[#F9D8C4]" },
  TECHNOLOGY_NEED: { label: "Kebutuhan Teknologi", desc: "Tools, platform, atau infrastruktur tech", icon: Laptop, color: "text-[#7C3AED]", badge: "bg-[#EDE8FF] text-[#7C3AED] border-[#DDD6FE]" },
  FUNDING_NEED: { label: "Kebutuhan Pendanaan", desc: "Modal atau investasi", icon: CircleDollarSign, color: "text-[#FFB800]", badge: "bg-[#FFFDE6] text-[#B45309] border-[#FDE68A]" },
  SPACE_NEED: { label: "Kebutuhan Ruang", desc: "Ruang kerja, studio, atau gudang", icon: Home, color: "text-[#E66A48]", badge: "bg-[#FFF7ED] text-[#E66A48] border-[#F9D8C4]" },
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
    <AppShell actor={actor} activeRoute="/needs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#27213D] tracking-tight">Kebutuhan Kolaborasi (Needs)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F7F0] text-[#0D9488] border border-[#99F6E4]">
                {needs.length} aktif
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#716B7E]">
              Apa yang <strong className="text-[#27213D]">{actor.name}</strong> butuhkan dari mitra kolaborator? Opportunity Engine akan mencocokkan kebutuhan ini dengan aset rekan lain.
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
            <h2 className="text-xs font-bold text-[#9E98A8] uppercase tracking-wider">+ Tambah Kebutuhan</h2>
            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-xs space-y-5">
              <form action={createNeed} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Kategori Kebutuhan *</label>
                  <select
                    name="category"
                    defaultValue="CAPABILITY_NEED"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all"
                  >
                    {Object.entries(NEED_LABELS).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Deskripsi Kebutuhan *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="misal: Fotografer fashion editorial & retoucher"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Detail Tambahan (Opsional)</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Spesifikasi atau kriteria yang dicari..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all resize-none"
                  />
                </div>

                {goals.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Terkait Goal (Opsional)</label>
                    <select
                      name="relatedGoalId"
                      defaultValue=""
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all"
                    >
                      <option value="">— Tidak dikaitkan ke goal tertentu —</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#716B7E]">Menautkan need ke goal meningkatkan akurasi scoring Opportunity Engine.</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Prioritas (1–5)</label>
                  <select
                    name="priority"
                    defaultValue="3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all"
                  >
                    <option value="5">5 — Sangat Tinggi</option>
                    <option value="4">4 — Tinggi</option>
                    <option value="3">3 — Sedang</option>
                    <option value="2">2 — Rendah</option>
                    <option value="1">1 — Sangat Rendah</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Simpan Kebutuhan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-xs font-bold text-[#9E98A8] uppercase tracking-wider">Kebutuhan Terdaftar</h2>

            {needs.length === 0 ? (
              <div className="p-10 rounded-[28px] bg-white/95 border border-dashed border-stone-300 text-center space-y-2 shadow-xs">
                <div className="flex justify-center">
                  <Search className="w-10 h-10 text-stone-400" />
                </div>
                <p className="text-sm font-semibold text-[#27213D]">Belum ada kebutuhan yang didaftarkan.</p>
                <p className="text-xs text-[#716B7E]">Kebutuhan yang jelas membantu Engine menemukan mitra komplementer yang tepat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needs.map((need) => {
                  const meta = NEED_LABELS[need.category];
                  const IconComp = meta.icon;
                  return (
                    <div
                      key={need.id}
                      className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 hover:border-stone-300 transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 flex-shrink-0 mt-0.5">
                            <IconComp className={`w-5 h-5 ${meta.color}`} />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${meta.badge}`}>
                                {meta.label}
                              </span>
                              <span className="text-[10px] font-semibold text-[#716B7E] bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                                Prioritas {need.priority}/5
                              </span>
                            </div>
                            <p className="font-bold text-[#27213D] text-sm">{need.title}</p>
                            {need.description && (
                              <p className="text-xs text-[#716B7E] leading-relaxed">{need.description}</p>
                            )}
                            {need.relatedGoal && (
                              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#716B7E]">
                                <ArrowRight className="w-3 h-3 text-[#0D9488]" />
                                <span>Terkait Goal:</span>
                                <span className="text-[#0D9488] font-bold">{need.relatedGoal.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <form action={deleteNeed.bind(null, need.id)}>
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
