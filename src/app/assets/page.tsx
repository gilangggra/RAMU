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
  PORTFOLIO_WORK: "Karya / Portofolio",
  EQUIPMENT: "Peralatan (Kamera/Lighting)",
  STUDIO_SPACE: "Ruang Studio / Lokasi",
  SKILL_TALENT: "Keahlian / Modeling",
  WARDROBE_PROP: "Wardrobe / Properti",
  AUDIENCE_REACH: "Jangkauan Audiens",
};

const ROLE_LABELS: Record<AssetRole, string> = {
  INPUT: "Input Produksi",
  CAPABILITY: "Keahlian Eksekusi",
  COMPONENT: "Komponen Pendukung",
  ENABLER: "Enabler",
  CHANNEL: "Distribusi",
  MARKET_ACCESS: "Akses Pasar",
  CREATIVE_ELEMENT: "Elemen Kreatif Visual",
  RESOURCE: "Sumber Daya Fisik",
  OUTPUT: "Produk Akhir",
};

const CATEGORY_BADGE_COLORS: Record<AssetCategory, string> = {
  PORTFOLIO_WORK: "text-[#1E1B2E] border-[#1E1B2E]",
  EQUIPMENT: "text-stone-600 border-stone-300",
  STUDIO_SPACE: "text-[#1E1B2E] border-[#1E1B2E]",
  SKILL_TALENT: "text-stone-600 border-stone-300",
  WARDROBE_PROP: "text-[#1E1B2E] border-[#1E1B2E]",
  AUDIENCE_REACH: "text-stone-600 border-stone-300",
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
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest mb-6">+ Tambah Aset Baru</h2>
            <div className="pt-2">
              <form action={createAsset} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Nama Aset *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="misal: Studio Foto Indoor 50m2"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Kategori *</label>
                  <select
                    name="category"
                    defaultValue="PORTFOLIO_WORK"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] cursor-pointer appearance-none"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Subtipe / Spesifikasi *</label>
                  <input
                    name="subtype"
                    type="text"
                    required
                    placeholder="misal: Lensa Prime, Fashion Stylist"
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Peran dalam Kolaborasi</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-4 h-4 border border-stone-300 group-hover:border-[#1E1B2E] transition-colors">
                          <input type="checkbox" name="roles" value={val} className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                          <div className="hidden peer-checked:block w-2 h-2 bg-[#1E1B2E]"></div>
                        </div>
                        <span className="text-xs font-light text-stone-600 group-hover:text-[#1E1B2E] transition-colors truncate">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Deskripsi (Opsional)</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Jelaskan spesifikasi, kualitas, atau keunikan aset ini..."
                    className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Kapasitas / Kuantitas</label>
                    <input name="capacity" type="number" min="1" placeholder="misal: 1, 5, 100" className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Satuan</label>
                    <input name="unit" type="text" placeholder="misal: Jam, Baju, Orang" className="w-full px-0 py-3 bg-transparent border-b border-stone-300 text-sm font-light text-[#1E1B2E] placeholder:text-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-colors" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 px-6 py-4 bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Simpan ke Inventori</span>
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
