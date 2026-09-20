import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createAsset, archiveAsset } from "./actions";
import { AssetCategory, AssetRole } from "@prisma/client";
import { AlertCircle, Package, ArrowRight } from "lucide-react";

interface AssetsPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  PRODUCT: "Produk",
  MATERIAL: "Material / Bahan Baku",
  CAPABILITY: "Kapabilitas / Keahlian",
  RESOURCE: "Sumber Daya",
  PRODUCTION: "Fasilitas Produksi",
  MARKET: "Akses Pasar",
  AUDIENCE: "Basis Audiens",
  CREATIVE_ASSET: "Aset Kreatif / IP",
};

const ROLE_LABELS: Record<AssetRole, string> = {
  INPUT: "Input / Bahan",
  CAPABILITY: "Kapabilitas",
  COMPONENT: "Komponen",
  ENABLER: "Enabler / Pendukung",
  CHANNEL: "Kanal Distribusi",
  MARKET_ACCESS: "Akses Pasar",
  CREATIVE_ELEMENT: "Elemen Kreatif",
  RESOURCE: "Sumber Daya",
  OUTPUT: "Output / Produk Jadi",
};

const CATEGORY_BADGE_COLORS: Record<AssetCategory, string> = {
  PRODUCT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  MATERIAL: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  CAPABILITY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  RESOURCE: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  PRODUCTION: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  MARKET: "bg-green-500/10 text-green-400 border-green-500/20",
  AUDIENCE: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  CREATIVE_ASSET: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
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

  const assets = await prisma.asset.findMany({
    where: { actorId: actor.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
  });

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-transparent blur-[100px] rounded-full" />
      </div>

      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
                R
              </div>
              <span className="font-bold text-lg tracking-tight text-white">RAMU</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-xs">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Dashboard</Link>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium">Aset</span>
              <Link href="/goals" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">Goal</Link>
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
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Aset</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {assets.length} aset aktif
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Daftarkan apa yang dapat dikontribusikan <span className="text-slate-300 font-medium">{actor.name}</span> ke dalam kolaborasi.
            </p>
          </div>
        </div>

        {params.error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>{params.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">+ Tambah Aset Baru</h2>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
              <form action={createAsset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nama Aset *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="misal: Kain Batik Tulis Motif Parang"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kategori *</label>
                  <select
                    name="category"
                    defaultValue="PRODUCT"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Subtipe / Spesifikasi *</label>
                  <input
                    name="subtype"
                    type="text"
                    required
                    placeholder="misal: Batik Tulis, Logam Filigree, Fotografi Produk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Peran dalam Kolaborasi</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-blue-500/40 transition-colors text-xs text-slate-300">
                        <input type="checkbox" name="roles" value={val} className="accent-blue-500 w-3 h-3" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deskripsi (Opsional)</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Jelaskan spesifikasi, kualitas, atau keunikan aset ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kapasitas</label>
                    <input name="capacity" type="number" min="1" placeholder="300" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Satuan</label>
                    <input name="unit" type="text" placeholder="pcs/bulan" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Simpan Aset</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Aset Terdaftar</h2>

            {assets.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <div className="flex justify-center">
                  <Package className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">Belum ada aset yang didaftarkan.</p>
                <p className="text-xs text-slate-500">Daftarkan minimal 1 aset agar Opportunity Engine dapat bekerja.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_BADGE_COLORS[asset.category]}`}>
                            {CATEGORY_LABELS[asset.category]}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{asset.subtype}</span>
                        </div>
                        <h3 className="font-bold text-white text-sm">{asset.name}</h3>
                        {asset.description && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{asset.description}</p>
                        )}
                      </div>

                      <form action={archiveAsset.bind(null, asset.id)}>
                        <button
                          type="submit"
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-xs text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 cursor-pointer"
                        >
                          Arsip
                        </button>
                      </form>
                    </div>

                    {asset.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {asset.roles.map((role) => (
                          <span key={role} className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700/50">
                            {ROLE_LABELS[role as AssetRole]}
                          </span>
                        ))}
                      </div>
                    )}

                    {asset.attributes && Object.keys(asset.attributes as object).length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-800/60">
                        {Object.entries(asset.attributes as Record<string, unknown>).map(([k, v]) => (
                          <span key={k} className="text-[11px] text-slate-500">
                            <span className="text-slate-400 font-medium">{k.replace(/_/g, " ")}:</span> {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
