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
  TALENT_NEED: { label: "Model / Aktor", desc: "Talenta untuk pemotretan atau kampanye", icon: Brain, color: "text-[#1E1B2E]", badge: "bg-stone-100 text-[#1E1B2E] border-stone-200" },
  CREW_NEED: { label: "Kru Profesional", desc: "Fotografer, MUA, Fashion Stylist", icon: Palette, color: "text-[#1E1B2E]", badge: "bg-stone-100 text-[#1E1B2E] border-stone-200" },
  LOCATION_NEED: { label: "Studio / Lokasi", desc: "Ruang kerja atau lokasi pemotretan", icon: Home, color: "text-[#1E1B2E]", badge: "bg-stone-100 text-[#1E1B2E] border-stone-200" },
  EQUIPMENT_NEED: { label: "Peralatan Produksi", desc: "Sewa Kamera, Lighting, atau alat", icon: Zap, color: "text-[#1E1B2E]", badge: "bg-stone-100 text-[#1E1B2E] border-stone-200" },
  WARDROBE_NEED: { label: "Pakaian & Properti", desc: "Koleksi busana atau props khusus", icon: Layers, color: "text-[#1E1B2E]", badge: "bg-stone-100 text-[#1E1B2E] border-stone-200" },
  FUNDING_NEED: { label: "Pendanaan Sponsor", desc: "Sponsor atau dukungan finansial", icon: CircleDollarSign, color: "text-[#1E1B2E]", badge: "bg-stone-100 text-[#1E1B2E] border-stone-200" },
  PUBLICATION_NEED: { label: "Akses Publikasi", desc: "Akses ke majalah atau media fesyen", icon: Truck, color: "text-[#1E1B2E]", badge: "bg-stone-100 text-[#1E1B2E] border-stone-200" },
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
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest mb-6">+ Tambah Kebutuhan Baru</h2>
            <div className="pt-2">
              <form action={createNeed} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Kategori Kebutuhan *</label>
                  <select
                    name="category"
                    defaultValue="TALENT_NEED"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] cursor-pointer appearance-none"
                  >
                    {Object.entries(NEED_LABELS).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Deskripsi Kebutuhan *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="misal: Fotografer fashion editorial & retoucher"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Detail Tambahan (Opsional)</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Spesifikasi atau kriteria yang dicari..."
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors resize-none"
                  />
                </div>

                {goals.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Terkait Goal (Opsional)</label>
                    <select
                      name="relatedGoalId"
                      defaultValue=""
                      className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] cursor-pointer appearance-none"
                    >
                      <option value="">— Tidak dikaitkan ke goal tertentu —</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-stone-500 mt-1">Menautkan need ke goal meningkatkan akurasi scoring Opportunity Engine.</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Prioritas (1–5)</label>
                  <select
                    name="priority"
                    defaultValue="3"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] cursor-pointer appearance-none"
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
                  className="w-full mt-8 px-6 py-4 bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Simpan Kebutuhan</span>
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
