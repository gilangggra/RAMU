"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Film,
  Camera,
  Play
} from "lucide-react";
import { deleteShowcaseAsset } from "@/app/api/assets/actions";
import { useRouter } from "next/navigation";
import { ShowcaseUploadModal, RegisteredActor } from "@/components/showcase/ShowcaseUploadModal";

interface Asset {
  id: string;
  name: string;
  description: string | null;
  subtype: string;
  attributes: any;
  createdAt: Date;
}

export function ShowcaseManager({
  assets,
  registeredActors = []
}: {
  assets: Asset[];
  registeredActors?: RegisteredActor[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    let videoCount = 0;
    assets.forEach((a) => {
      const attrs = (a.attributes as any) || {};
      const isVid = attrs.media_type === "VIDEO" || Boolean(attrs.video_url) || a.subtype?.toLowerCase().includes("video");
      if (isVid) videoCount++;
      const sub = a.subtype || "Karya";
      counts[sub] = (counts[sub] || 0) + 1;
    });

    return {
      list: Object.entries(counts).map(([name, count]) => ({ id: name, label: name, count })),
      videoCount,
      totalCount: assets.length,
    };
  }, [assets]);

  const filteredAssets = useMemo(() => {
    if (filterCategory === "ALL") return assets;
    if (filterCategory === "VIDEO") {
      return assets.filter((a) => {
        const attrs = (a.attributes as any) || {};
        return attrs.media_type === "VIDEO" || Boolean(attrs.video_url) || a.subtype?.toLowerCase().includes("video");
      });
    }
    return assets.filter((a) => (a.subtype || "Karya") === filterCategory);
  }, [assets, filterCategory]);

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus karya ini?")) return;
    startTransition(async () => {
      const res = await deleteShowcaseAsset(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Gagal menghapus karya");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1E1B2E]">Manajemen Portofolio &amp; Karya</h2>
          <p className="text-sm text-stone-500 mt-1">
            Unggah dan kurasi karya visual terbaik Anda lengkap dengan kredit kolaborasi Tear-Sheet.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-all shadow-xs shrink-0 cursor-pointer rounded-none border border-[#1E1B2E]"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Unggah Karya Baru</span>
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="p-12 bg-white border border-stone-200 border-dashed flex flex-col items-center justify-center text-center space-y-4 rounded-none">
          <div className="w-16 h-16 bg-stone-100 flex items-center justify-center text-stone-400 rounded-none">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-extrabold text-[#1E1B2E]">Belum Ada Karya</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tarik perhatian klien dan kolaborator dengan memamerkan mahakarya Anda. Tambahkan foto dan sematkan kredit tim sekarang.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Category Filter Bar */}
          {categories.list.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setFilterCategory("ALL")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none border rounded-none ${
                  filterCategory === "ALL"
                    ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                    : "bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-200"
                }`}
              >
                <span>Semua</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 ${filterCategory === "ALL" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                  {categories.totalCount}
                </span>
              </button>

              {categories.list.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none border rounded-none whitespace-nowrap ${
                    filterCategory === cat.id
                      ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                      : "bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-200"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 ${filterCategory === cat.id ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                    {cat.count}
                  </span>
                </button>
              ))}

              {categories.videoCount > 0 && !categories.list.some((c) => c.id.toLowerCase().includes("video")) && (
                <button
                  type="button"
                  onClick={() => setFilterCategory("VIDEO")}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none border rounded-none whitespace-nowrap ${
                    filterCategory === "VIDEO"
                      ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                      : "bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-200"
                  }`}
                >
                  <Film className="w-3 h-3 text-amber-500" />
                  <span>Video</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 ${filterCategory === "VIDEO" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                    {categories.videoCount}
                  </span>
                </button>
              )}
            </div>
          )}

          {filteredAssets.length > 0 ? (
            <div
              className={
                filteredAssets.length === 1
                  ? "max-w-xl mx-auto"
                  : filteredAssets.length === 2
                  ? "columns-1 sm:columns-2 gap-4 max-w-4xl mx-auto"
                  : "columns-1 sm:columns-2 lg:columns-3 gap-4"
              }
            >
              {filteredAssets.map((asset) => {
                const attrs = (asset.attributes as any) || {};
                const isVideo =
                  attrs.media_type === "VIDEO" ||
                  Boolean(attrs.video_url) ||
                  asset.subtype?.toLowerCase().includes("video") ||
                  asset.subtype?.toLowerCase().includes("film") ||
                  asset.subtype?.toLowerCase().includes("cinema") ||
                  (attrs.image_url && attrs.image_url.includes("img.youtube.com"));

                const isDirectVideo =
                  isVideo &&
                  attrs.video_url &&
                  (/\.(mp4|webm|mov)(\?.*)?$/i.test(attrs.video_url) ||
                    attrs.video_url.startsWith("/uploads/portfolios/videos/"));

                return (
                  <div
                    key={asset.id}
                    className="break-inside-avoid mb-4 relative group rounded-none overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-500"
                  >
                    {isDirectVideo && attrs.video_url && (
                      <video
                        src={attrs.video_url}
                        muted
                        loop
                        playsInline
                        preload="none"
                        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                        className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-none"
                      />
                    )}

                    {attrs?.image_url ? (
                      <img
                        src={attrs.image_url}
                        alt={asset.name}
                        className="w-full h-auto object-cover rounded-none block transition-transform duration-700 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] flex items-center justify-center text-stone-400 bg-stone-100">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md border border-stone-200 text-[10px] font-mono font-bold text-stone-800 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>TEAR-SHEET AKTIF</span>
                      </div>

                      {isVideo ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-md text-[9px] font-bold text-amber-300 shadow-xs">
                          <Film className="w-3 h-3" />
                          <span>VIDEO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-md text-[9px] font-bold text-stone-200 shadow-xs">
                          <Camera className="w-3 h-3 text-stone-300" />
                          <span>FOTO</span>
                        </span>
                      )}
                    </div>

                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-[#1E1B2E] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#E66A48] group-hover:text-white transition-all backdrop-blur-xs">
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between z-20">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(asset.id)}
                          disabled={isPending}
                          className="p-2 bg-white/20 hover:bg-rose-500/90 text-white backdrop-blur-md transition-colors shadow-xs cursor-pointer rounded-none border border-white/20"
                          title="Hapus Karya"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1 text-white">
                        <div className="inline-flex px-2 py-0.5 bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                          {asset.subtype}
                        </div>
                        <h3 className="font-extrabold text-sm line-clamp-2 text-white">{asset.name}</h3>
                        {attrs?.project_url && (
                          <a
                            href={attrs.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-semibold hover:text-amber-200"
                          >
                            Lihat Proyek <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-stone-50 border border-stone-200 rounded-none space-y-2">
              <p className="text-xs text-stone-500">Tidak ada karya yang sesuai dengan kategori ini.</p>
              <button
                type="button"
                onClick={() => setFilterCategory("ALL")}
                className="text-xs font-bold text-[#E66A48] hover:underline cursor-pointer"
              >
                Tampilkan Semua Karya
              </button>
            </div>
          )}
        </div>
      )}

      <ShowcaseUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        registeredActors={registeredActors}
      />
    </div>
  );
}
