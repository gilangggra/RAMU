import Link from "next/link";
import { Package, Clock, ArrowRight, Plus, Layers } from "lucide-react";

interface ResourceAsset {
  id: string;
  name: string;
  category: string;
  subtype: string;
  roles?: string[];
  attributes: any;
}

interface YourResourcesCardProps {
  actorName: string;
  sector: string;
  isBrand: boolean;
  assets: ResourceAsset[];
  totalCount?: number;
}

export function YourResourcesCard({ actorName, sector, isBrand, assets, totalCount }: YourResourcesCardProps) {
  const totalAssets = totalCount ?? assets.length;

  return (
    <div className="p-5 md:p-6 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0284c7]" />
            <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
              Aset &amp; Inventaris Anda
            </h2>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/70">
              {totalAssets} Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl font-normal">
            Peralatan, fasilitas studio, dan kapasitas kerja yang Anda sediakan untuk kolaborasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings/specs"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] border border-white/80 text-xs font-semibold transition-all shrink-0 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Kelola Spesifikasi</span>
          </Link>
          <Link
            href="/settings/specs"
            className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Tambah Resource</span>
          </Link>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-slate-200 space-y-2.5">
          <Package className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">Belum ada aset terdaftar</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto font-normal">
              Daftarkan peralatan, studio, atau bahan yang Anda miliki agar kreator lain dapat menemukan dan mengajak kerja sama.
            </p>
          </div>
          <Link
            href="/settings/specs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline pt-1"
          >
            <span>Daftarkan Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {assets.slice(0, 6).map((asset) => {
            const attrs = asset.attributes || {};
            const startingRate = attrs.starting_rate || attrs.price || null;
            const turnAround = attrs.turnaround_time || null;
            const imageUrl = attrs.image_url || null;

            return (
              <div
                key={asset.id}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between group shadow-2xs"
              >
                <div className="space-y-2.5">
                  {/* VISUAL IMAGE & BADGE HEADER */}
                  {imageUrl ? (
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70">
                      <img
                        src={imageUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs">
                          {asset.subtype || asset.category}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Siap Pakai
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                        {asset.subtype || asset.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Siap Pakai
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#0f172a] group-hover:text-[#0284c7] transition-colors leading-snug">
                      {asset.name}
                    </h3>

                    {startingRate && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200/60 mt-1.5">
                        Nilai / Tarif: <span className="text-slate-900 font-bold">{startingRate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {attrs.capacity
                        ? `Kapasitas: ${attrs.capacity} ${attrs.unit || "slot/bln"}`
                        : turnAround || "Siap Pakai"}
                    </span>
                  </span>
                  <Link
                    href="/settings/specs"
                    className="font-medium text-[#0284c7] hover:text-[#0369a1] hover:underline"
                  >
                    Detail &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
          </div>

          {assets.length > 6 && (
            <div className="pt-1 text-center">
              <Link
                href="/settings/specs"
                className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] transition-colors inline-flex items-center gap-1"
              >
                <span>Lihat Seluruh {totalAssets} Aset di Profil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* FOOTER HELPER BOX */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-slate-900">
            Punya peralatan atau jadwal studio yang kosong?
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
            Cantumkan di profil Anda agar kreator lain dapat mengajukan kerja sama produksi atau pemanfaatan bersama secara transparan.
          </p>
        </div>

        <Link
          href="/settings/availability"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 shrink-0 transition-colors shadow-2xs"
        >
          <span>Atur Ketersediaan</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
