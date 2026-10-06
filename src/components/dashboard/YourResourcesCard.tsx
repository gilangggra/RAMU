import Link from "next/link";
import { Package, Sparkles, Clock, ArrowRight, Plus, Layers, CheckCircle2 } from "lucide-react";

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
}

export function YourResourcesCard({ actorName, sector, isBrand, assets }: YourResourcesCardProps) {
  const totalAssets = assets.length;

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              Aset &amp; Inventaris Kreatif
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight mt-1.5">
            Aset &amp; Peralatan Milik Anda
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xl">
            Peralatan, ruang studio, busana, dan keahlian yang Anda daftarkan di RAMU untuk dipadukan dengan proyek kolaborasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/readiness"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>Kelola Inventaris</span>
          </Link>
          <Link
            href="/readiness?tab=assets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-stone-300" />
            <span>Tambah Aset Baru</span>
          </Link>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white/80 border border-dashed border-stone-200 space-y-3 shadow-2xs">
          <Package className="w-8 h-8 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-800">Belum ada aset terdaftar</p>
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
              Daftarkan peralatan, fasilitas studio, sampel pakaian, atau keahlian Anda agar sistem dapat menemukan kecocokan kolaborasi.
            </p>
          </div>
          <Link
            href="/readiness"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 hover:underline pt-1"
          >
            <span>Daftarkan Sekarang</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const attrs = asset.attributes || {};
            const startingRate = attrs.starting_rate || attrs.price || null;
            const turnAround = attrs.turnaround_time || null;

            return (
              <div
                key={asset.id}
                className="p-4 rounded-2xl bg-gradient-to-b from-white to-stone-50/70 border border-stone-200/80 hover:border-stone-400/80 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between group shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-stone-700 border border-stone-200">
                      {asset.subtype || asset.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Aktif Siap Pakai
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-2">
                    {asset.name}
                  </h3>

                  {startingRate && (
                    <div className="text-[11px] font-bold text-stone-700 bg-white p-2 rounded-xl border border-stone-200/60 shadow-2xs">
                      Rate / Nilai: <span className="text-stone-900 font-extrabold">{startingRate}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>
                      {attrs.capacity
                        ? `Kapasitas: ${attrs.capacity} ${attrs.unit || "slot/bln"}`
                        : turnAround || "Kapasitas Siap Pakai"}
                    </span>
                  </span>
                  <Link
                    href="/readiness?tab=assets"
                    className="font-semibold text-stone-700 group-hover:text-stone-950 hover:underline"
                  >
                    Detail &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BANNER RESOURCE IDLE (Collaborative Economy Concept) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-white to-stone-50/80 border border-stone-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-700" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Optimalisasi Studio &amp; Peralatan Siap Pakai
            </h4>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed max-w-2xl">
            Punya jadwal kosong studio, kamera yang sedang siap dipakai, atau bahan koleksi? Cantumkan di profil Anda agar dicocokkan otomatis dalam proyek kolaborasi kreatif bersama mitra terverifikasi.
          </p>
        </div>

        <Link
          href="/readiness"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs"
        >
          <span>Atur Ketersediaan Aset</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
        </Link>
      </div>
    </div>
  );
}
