import { redirect } from "next/navigation";
import Link from "next/link";
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

interface ConstraintsPageProps {
  searchParams: Promise<{ error?: string }>;
}

const CONSTRAINT_LABELS: Record<
  ConstraintType,
  { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }
> = {
  BUDGET: { label: "Anggaran", desc: "Batas biaya yang tersedia", icon: CircleDollarSign, placeholder: '5000000 (dalam Rupiah)' },
  CAPACITY: { label: "Kapasitas Produksi", desc: "Batas volume yang dapat diproduksi", icon: Package, placeholder: '300 (pcs/bulan)' },
  TIME: { label: "Waktu / Tenggat", desc: "Batas waktu atau deadline proyek", icon: Clock, placeholder: '30 (hari)' },
  AVAILABILITY: { label: "Ketersediaan", desc: "Periode atau slot waktu yang tersedia", icon: Calendar, placeholder: 'Q1 2026' },
  LOCATION: { label: "Lokasi / Geografis", desc: "Batasan wilayah operasional", icon: MapPin, placeholder: 'Pulau Jawa' },
  LEAD_TIME: { label: "Lead Time", desc: "Waktu minimum pengerjaan", icon: Hourglass, placeholder: '14 (hari)' },
  MINIMUM_ORDER: { label: "Minimum Order", desc: "Jumlah pemesanan minimum", icon: ShoppingCart, placeholder: '50 (pcs)' },
  EQUIPMENT: { label: "Peralatan", desc: "Keterbatasan alat atau mesin", icon: Wrench, placeholder: 'Mesin jahit industri' },
  CAPABILITY: { label: "Kapabilitas", desc: "Keahlian yang tidak dimiliki", icon: Brain, placeholder: 'Desain digital' },
  LEGAL: { label: "Hukum / Regulasi", desc: "Batasan peraturan atau izin", icon: Scale, placeholder: 'Harus bersertifikat SNI' },
  IP: { label: "Kekayaan Intelektual", desc: "Batasan hak cipta atau merk", icon: ShieldCheck, placeholder: 'Motif batik terdaftar' },
  MARKET: { label: "Pasar", desc: "Batasan segmen atau geografi pasar", icon: Globe, placeholder: 'Pasar domestik saja' },
};

const SEVERITY_CONFIG: Record<ConstraintSeverity, { label: string; color: string; desc: string }> = {
  HARD: { label: "Hard", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", desc: "Tidak bisa dikompromikan" },
  SOFT: { label: "Soft", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", desc: "Bisa dinegosiasikan" },
  UNKNOWN: { label: "Unknown", color: "bg-slate-700/50 text-slate-400 border-slate-700", desc: "Belum diketahui dampaknya" },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-tl from-rose-500/8 via-orange-500/8 to-transparent blur-[100px] rounded-full" />
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
              <Link href="/needs" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Kebutuhan</Link>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium">Batasan</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:block">{actor.name}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Batasan (Constraints)</h1>
            {hardCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {hardCount} hard
              </span>
            )}
            {softCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {softCount} soft
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Apa yang membatasi <span className="text-slate-300 font-medium">{actor.name}</span>? Engine menggunakan data ini untuk menilai Feasibility opportunity.
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
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">+ Tambah Batasan Baru</h2>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <form action={createConstraint} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tipe Batasan *</label>
                  <select name="type" defaultValue="CAPACITY" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors">
                    {Object.entries(CONSTRAINT_LABELS).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nilai / Batas *</label>
                  <input name="value" type="text" required placeholder="Masukkan nilai constraint..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors" />
                  <p className="text-[11px] text-slate-500">Contoh: 5000000 untuk budget (Rp), 300 untuk kapasitas (pcs/bulan), atau teks untuk batasan non-numerik.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Satuan (Opsional)</label>
                  <input name="unit" type="text" placeholder="misal: Rupiah, pcs/bulan, hari" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tingkat Kekakuan *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-rose-500/40 transition-colors text-xs text-slate-300">
                      <input type="radio" name="severity" value="HARD" className="accent-rose-500" />
                      <div>
                        <div className="font-semibold text-rose-400">Hard</div>
                        <div className="text-[10px] text-slate-500">Tidak bisa dikompromikan</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors text-xs text-slate-300">
                      <input type="radio" name="severity" value="SOFT" defaultChecked className="accent-amber-500" />
                      <div>
                        <div className="font-semibold text-amber-400">Soft</div>
                        <div className="text-[10px] text-slate-500">Bisa dinegosiasikan</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Negosiabilitas</label>
                  <select name="negotiability" defaultValue="NEGOTIABLE" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors">
                    <option value="FIXED">Fixed — Tidak bisa diubah</option>
                    <option value="NEGOTIABLE">Negotiable — Bisa dirundingkan</option>
                    <option value="FLEXIBLE">Flexible — Sangat fleksibel</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Catatan (Opsional)</label>
                  <textarea name="notes" rows={2} placeholder="Konteks atau pengecualian..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors resize-none" />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2">
                  <span>Simpan Batasan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Batasan Terdaftar</h2>
            {constraints.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <div className="flex justify-center">
                  <ShieldAlert className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">Belum ada batasan yang didaftarkan.</p>
                <p className="text-xs text-slate-500">Constraint membantu Engine menghindari opportunity yang secara praktis tidak feasible.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {constraints.map((c) => {
                  const meta = CONSTRAINT_LABELS[c.type];
                  const sev = SEVERITY_CONFIG[c.severity];
                  const IconComp = meta.icon;
                  return (
                    <div key={c.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            <IconComp className="w-5 h-5 text-rose-400" />
                          </div>
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-300">{meta.label}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sev.color}`}>
                                {sev.label}
                              </span>
                              <span className="text-[11px] text-slate-500">{c.negotiability.toLowerCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm font-mono">
                                {typeof c.value === "object" ? JSON.stringify(c.value) : String(c.value)}
                              </span>
                              {c.unit && <span className="text-xs text-slate-400">{c.unit}</span>}
                            </div>
                            {c.notes && <p className="text-xs text-slate-400 leading-relaxed">{c.notes}</p>}
                          </div>
                        </div>
                        <form action={deleteConstraint.bind(null, c.id)}>
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
