import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createAsset, archiveAsset } from "./actions";
import { AssetCategory, AssetRole } from "@prisma/client";
import { AlertCircle, Package, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

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
  PRODUCT: "bg-blue-50 text-blue-700 border-blue-200",
  MATERIAL: "bg-orange-50 text-orange-700 border-orange-200",
  CAPABILITY: "bg-purple-50 text-purple-700 border-purple-200",
  RESOURCE: "bg-teal-50 text-teal-700 border-teal-200",
  PRODUCTION: "bg-cyan-50 text-cyan-700 border-cyan-200",
  MARKET: "bg-emerald-50 text-emerald-700 border-emerald-200",
  AUDIENCE: "bg-pink-50 text-pink-700 border-pink-200",
  CREATIVE_ASSET: "bg-amber-50 text-amber-700 border-amber-200",
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
    <AppShell actor={actor} activeRoute="/assets">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#27213D] tracking-tight">Manajemen Aset Kreatif</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4]">
                {assets.length} aset aktif
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#716B7E]">
              Daftarkan apa yang dapat dikontribusikan <strong className="text-[#27213D]">{actor.name}</strong> ke dalam kolaborasi ekonomi kreatif.
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
            <h2 className="text-xs font-bold text-[#9E98A8] uppercase tracking-wider">+ Tambah Aset Baru</h2>
            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-xs space-y-5">
              <form action={createAsset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Nama Aset *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="misal: Kain Batik Tulis Motif Parang"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Kategori *</label>
                  <select
                    name="category"
                    defaultValue="PRODUCT"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] focus:outline-none focus:bg-white focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/15 transition-all"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Subtipe / Spesifikasi *</label>
                  <input
                    name="subtype"
                    type="text"
                    required
                    placeholder="misal: Batik Tulis, Logam Filigree, Fotografi Produk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Peran dalam Kolaborasi</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer hover:border-[#E66A48]/50 transition-colors text-xs text-[#27213D]">
                        <input type="checkbox" name="roles" value={val} className="accent-[#E66A48] w-3 h-3" />
                        <span className="truncate">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Deskripsi (Opsional)</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Jelaskan spesifikasi, kualitas, atau keunikan aset ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/15 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Kapasitas</label>
                    <input name="capacity" type="number" min="1" placeholder="300" className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/15 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#9E98A8]">Satuan</label>
                    <input name="unit" type="text" placeholder="pcs/bulan" className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/15 transition-all" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#E66A48] hover:bg-[#D45938] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Simpan Aset</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-xs font-bold text-[#9E98A8] uppercase tracking-wider">Aset Terdaftar</h2>

            {assets.length === 0 ? (
              <div className="p-10 rounded-[28px] bg-white/95 border border-dashed border-stone-300 text-center space-y-2 shadow-xs">
                <div className="flex justify-center">
                  <Package className="w-10 h-10 text-stone-400" />
                </div>
                <p className="text-sm font-semibold text-[#27213D]">Belum ada aset yang didaftarkan.</p>
                <p className="text-xs text-[#716B7E]">Daftarkan minimal 1 aset agar Opportunity Engine dapat menganalisis potensi kolaborasi.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 hover:border-stone-300 transition-all shadow-xs group space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${CATEGORY_BADGE_COLORS[asset.category]}`}>
                            {CATEGORY_LABELS[asset.category]}
                          </span>
                          <span className="text-xs text-[#716B7E] font-mono">{asset.subtype}</span>
                        </div>
                        <h3 className="font-bold text-[#27213D] text-sm">{asset.name}</h3>
                        {asset.description && (
                          <p className="text-xs text-[#716B7E] leading-relaxed line-clamp-2">{asset.description}</p>
                        )}
                      </div>

                      <form action={archiveAsset.bind(null, asset.id)}>
                        <button
                          type="submit"
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 text-xs text-[#716B7E] hover:text-rose-600 border border-stone-200 hover:border-rose-200 cursor-pointer"
                        >
                          Arsip
                        </button>
                      </form>
                    </div>

                    {asset.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {asset.roles.map((role) => (
                          <span key={role} className="px-2 py-0.5 rounded-md bg-stone-100 text-[11px] font-medium text-[#27213D] border border-stone-200">
                            {ROLE_LABELS[role as AssetRole]}
                          </span>
                        ))}
                      </div>
                    )}

                    {asset.attributes && Object.keys(asset.attributes as object).length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-stone-100">
                        {Object.entries(asset.attributes as Record<string, unknown>).map(([k, v]) => (
                          <span key={k} className="text-[11px] text-[#9E98A8]">
                            <span className="text-[#716B7E] font-medium">{k.replace(/_/g, " ")}:</span> {String(v)}
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
      </div>
    </AppShell>
  );
}
