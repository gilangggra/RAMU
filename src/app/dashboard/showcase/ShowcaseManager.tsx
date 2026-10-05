"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Film,
  Camera,
  Play,
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
  registeredActors = [],
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
      const isVid =
        attrs.media_type === "VIDEO" ||
        Boolean(attrs.video_url) ||
        a.subtype?.toLowerCase().includes("video");
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
        return (
          attrs.media_type === "VIDEO" ||
          Boolean(attrs.video_url) ||
          a.subtype?.toLowerCase().includes("video")
        );
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
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Manajemen Portofolio &amp; Karya
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Unggah dan kurasi karya visual terbaik Anda lengkap dengan verifikasi tim dan spesifikasi Tear-Sheet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-stone-300" />
          <span>Unggah Karya Baru</span>
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="p-12 bg-white border border-stone-200/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
            <ImageIcon className="w-6 h-6 stroke-1" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-sm font-bold text-stone-900">Belum Ada Karya Terunggah</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tarik perhatian klien dan calon mitra kolaborasi dengan memamerkan mahakarya visual Anda. Tambahkan foto atau video dan sematkan kredit tim sekarang.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-black shadow-2xs transition-colors cursor-pointer"
          >
            Unggah Karya Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* CATEGORY FILTER PILLS */}
          {categories.list.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setFilterCategory("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none shrink-0 ${
                  filterCategory === "ALL"
                    ? "bg-stone-900 text-white font-semibold shadow-2xs"
                    : "bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/80 shadow-2xs"
                }`}
              >
                <span>Semua</span>
                <span
                  className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    filterCategory === "ALL" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {categories.totalCount}
                </span>
              </button>

              {categories.list.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none shrink-0 whitespace-nowrap ${
                    filterCategory === cat.id
                      ? "bg-stone-900 text-white font-semibold shadow-2xs"
                      : "bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/80 shadow-2xs"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      filterCategory === cat.id ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}

              {categories.videoCount > 0 &&
                !categories.list.some((c) => c.id.toLowerCase().includes("video")) && (
                  <button
                    type="button"
                    onClick={() => setFilterCategory("VIDEO")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none shrink-0 whitespace-nowrap inline-flex items-center gap-1 ${
                      filterCategory === "VIDEO"
                        ? "bg-stone-900 text-white font-semibold shadow-2xs"
                        : "bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/80 shadow-2xs"
                    }`}
                  >
                    <Film className="w-3 h-3 text-stone-400" />
                    <span>Video</span>
                    <span
                      className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        filterCategory === "VIDEO"
                          ? "bg-white/20 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {categories.videoCount}
                    </span>
                  </button>
                )}
            </div>
          )}

          {/* ASSETS GRID */}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    className="w-full rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Media Container */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-stone-100 mb-2.5 group">
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
                          className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        />
                      )}

                      {attrs?.image_url ? (
                        <img
                          src={attrs.image_url}
                          alt={asset.name}
                          className="w-full h-full object-cover object-center block transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                          <ImageIcon className="w-8 h-8 opacity-50" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-[10px] font-semibold text-white tracking-wide border border-white/10 shadow-2xs">
                          {asset.subtype}
                        </span>

                        <div className="flex items-center gap-1">
                          {isVideo ? (
                            <span className="p-1 rounded-md bg-stone-900/80 backdrop-blur-md text-white border border-white/10 shadow-2xs">
                              <Play className="w-2.5 h-2.5 fill-current" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-stone-900/80 backdrop-blur-md text-white border border-white/10 shadow-2xs">
                              <Camera className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Delete Overlay Button on Hover */}
                      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleDelete(asset.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg bg-stone-900/90 hover:bg-rose-600 text-white backdrop-blur-md transition-colors shadow-sm cursor-pointer"
                          title="Hapus Karya"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="px-1 space-y-1">
                      <h3 className="text-xs sm:text-[13px] font-bold text-stone-900 line-clamp-1">
                        {asset.name}
                      </h3>
                      {attrs?.project_url && (
                        <a
                          href={attrs.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium hover:text-stone-900 transition-colors"
                        >
                          <span>Tautan Proyek</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white border border-stone-200/80 rounded-2xl shadow-2xs space-y-2">
              <p className="text-xs text-stone-500">Tidak ada karya yang sesuai dengan filter ini.</p>
              <button
                type="button"
                onClick={() => setFilterCategory("ALL")}
                className="text-xs font-semibold text-stone-900 hover:underline cursor-pointer"
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
