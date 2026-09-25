import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createConstraint, deleteConstraint } from "./actions";
import { ConstraintType, ConstraintSeverity } from "@prisma/client";
import {
  CircleDollarSign,
  Package,
  Clock,
  Calendar,
  MapPin,
  Hourglass,
  ShoppingCart,
  Wrench,
  Brain,
  Scale,
  ShieldCheck,
  Globe,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

interface ConstraintsPageProps {
  searchParams: Promise<{ error?: string }>;
}

const CONSTRAINT_LABELS: Record<
  ConstraintType,
  { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }
> = {
  BUDGET: { label: "Anggaran", desc: "Batas biaya yang tersedia", icon: CircleDollarSign, placeholder: "5000000 (dalam Rupiah)" },
  CAPACITY: { label: "Kapasitas Produksi", desc: "Batas volume yang dapat diproduksi", icon: Package, placeholder: "300 (pcs/bulan)" },
  TIME: { label: "Waktu / Tenggat", desc: "Batas waktu atau deadline proyek", icon: Clock, placeholder: "30 (hari)" },
  AVAILABILITY: { label: "Ketersediaan", desc: "Periode atau slot waktu yang tersedia", icon: Calendar, placeholder: "Q1 2026" },
  LOCATION: { label: "Lokasi / Geografis", desc: "Batasan wilayah operasional", icon: MapPin, placeholder: "Pulau Jawa" },
  LEAD_TIME: { label: "Lead Time", desc: "Waktu minimum pengerjaan", icon: Hourglass, placeholder: "14 (hari)" },
  MINIMUM_ORDER: { label: "Minimum Order", desc: "Jumlah pemesanan minimum", icon: ShoppingCart, placeholder: "50 (pcs)" },
  EQUIPMENT: { label: "Peralatan", desc: "Keterbatasan alat atau mesin", icon: Wrench, placeholder: "Mesin jahit industri" },
  CAPABILITY: { label: "Kapabilitas", desc: "Keahlian yang tidak dimiliki", icon: Brain, placeholder: "Desain 3D" },
  LEGAL: { label: "Hukum / Regulasi", desc: "Batasan peraturan atau izin", icon: Scale, placeholder: "Harus bersertifikat SNI" },
  IP: { label: "Kekayaan Intelektual", desc: "Batasan hak cipta atau merk", icon: ShieldCheck, placeholder: "Merek dagang / Desain terdaftar HKI" },
  MARKET: { label: "Pasar", desc: "Batasan segmen atau geografi pasar", icon: Globe, placeholder: "Pasar domestik saja" },
};

const SEVERITY_CONFIG: Record<ConstraintSeverity, { label: string; color: string; desc: string }> = {
  HARD: { label: "Hard (Pasti)", color: "bg-rose-50 text-rose-700 border-rose-200", desc: "Tidak bisa dikompromikan" },
  SOFT: { label: "Soft (Fleksibel)", color: "bg-amber-50 text-amber-700 border-amber-200", desc: "Bisa dinegosiasikan" },
  UNKNOWN: { label: "Unknown", color: "bg-stone-100 text-stone-600 border-stone-200", desc: "Belum diketahui dampaknya" },
};

export default async function ConstraintsPage({ searchParams }: ConstraintsPageProps) {
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

  const constraints = await prisma.constraint.findMany({
    where: { actorId: actor.id },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });

  const params = await searchParams;

  const hardCount = constraints.filter((c) => c.severity === "HARD").length;
  const softCount = constraints.filter((c) => c.severity === "SOFT").length;

  return (
    <AppShell actor={actor} activeRoute="/constraints">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-[#27213D] tracking-tight">Batasan Operasional (Constraints)</h1>
              {hardCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {hardCount} hard
                </span>
              )}
              {softCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {softCount} soft
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#716B7E]">
              Apa yang membatasi kapasitas atau operasional <strong className="text-[#27213D]">{actor.name}</strong>? Opportunity Engine menggunakan batasan ini untuk menilai kelayakan (Feasibility) kolaborasi secara realistis.
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
            <h2 className="text-xs font-bold text-[#9E98A8] uppercase tracking-wider">+ Tambah Batasan Baru</h2>
            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-xs space-y-5">
              <form action={createConstraint} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Tipe Batasan *</label>
                  <select
                    name="type"
                    defaultValue="CAPACITY"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] focus:outline-none focus:bg-white focus:border-[#E59F00] focus:ring-2 focus:ring-[#E59F00]/15 transition-all"
                  >
                    {Object.entries(CONSTRAINT_LABELS).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Nilai / Batas *</label>
                  <input
                    name="value"
                    type="text"
                    required
                    placeholder="Masukkan nilai batasan..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E59F00] focus:ring-2 focus:ring-[#E59F00]/15 transition-all"
                  />
                  <p className="text-[11px] text-[#716B7E]">Contoh: 5000000 untuk budget (Rp), 300 untuk kapasitas (pcs/bulan), atau teks untuk batasan non-numerik.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Satuan (Opsional)</label>
                  <input
                    name="unit"
                    type="text"
                    placeholder="misal: Rupiah, pcs/bulan, hari"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E59F00] focus:ring-2 focus:ring-[#E59F00]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Tingkat Kekakuan *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/80 cursor-pointer hover:border-rose-400 transition-colors text-xs text-[#27213D]">
                      <input type="radio" name="severity" value="HARD" className="accent-rose-600" />
                      <div>
                        <div className="font-bold text-rose-600">Hard</div>
                        <div className="text-[10px] text-[#716B7E]">Tidak bisa ditawar</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/80 cursor-pointer hover:border-amber-400 transition-colors text-xs text-[#27213D]">
                      <input type="radio" name="severity" value="SOFT" defaultChecked className="accent-amber-600" />
                      <div>
                        <div className="font-bold text-amber-600">Soft</div>
                        <div className="text-[10px] text-[#716B7E]">Bisa dinegosiasikan</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Negosiabilitas</label>
                  <select
                    name="negotiability"
                    defaultValue="NEGOTIABLE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] focus:outline-none focus:bg-white focus:border-[#E59F00] focus:ring-2 focus:ring-[#E59F00]/15 transition-all"
                  >
                    <option value="FIXED">Fixed — Mutlak tidak bisa diubah</option>
                    <option value="NEGOTIABLE">Negotiable — Bisa dirundingkan</option>
                    <option value="FLEXIBLE">Flexible — Sangat fleksibel</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Catatan (Opsional)</label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Konteks atau pengecualian khusus..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E59F00] focus:ring-2 focus:ring-[#E59F00]/15 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#E59F00] hover:bg-[#C98B00] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Simpan Batasan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-xs font-bold text-[#9E98A8] uppercase tracking-wider">Batasan Terdaftar</h2>

            {constraints.length === 0 ? (
              <div className="p-10 rounded-[28px] bg-white/95 border border-dashed border-stone-300 text-center space-y-2 shadow-xs">
                <div className="flex justify-center">
                  <ShieldAlert className="w-10 h-10 text-stone-400" />
                </div>
                <p className="text-sm font-semibold text-[#27213D]">Belum ada batasan yang didaftarkan.</p>
                <p className="text-xs text-[#716B7E]">Constraint membantu Engine menghindari rekomendasi yang melebihi kapasitas nyata Anda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {constraints.map((c) => {
                  const meta = CONSTRAINT_LABELS[c.type];
                  const sev = SEVERITY_CONFIG[c.severity];
                  const IconComp = meta.icon;
                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 hover:border-stone-300 transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 flex-shrink-0 mt-0.5">
                            <IconComp className="w-5 h-5 text-[#E59F00]" />
                          </div>
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#27213D]">{meta.label}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${sev.color}`}>
                                {sev.label}
                              </span>
                              <span className="text-[11px] text-[#716B7E] font-medium bg-stone-100 px-2 py-0.5 rounded-md">
                                {c.negotiability.toLowerCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#27213D] text-sm font-mono">
                                {typeof c.value === "object" ? JSON.stringify(c.value) : String(c.value)}
                              </span>
                              {c.unit && <span className="text-xs text-[#716B7E] font-medium">{c.unit}</span>}
                            </div>
                            {c.notes && <p className="text-xs text-[#716B7E] leading-relaxed">{c.notes}</p>}
                          </div>
                        </div>
                        <form action={deleteConstraint.bind(null, c.id)}>
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
