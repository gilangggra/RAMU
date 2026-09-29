"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  ExternalLink
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Unggah Karya Baru</span>
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="p-10 rounded-[32px] bg-white/50 border border-stone-200 border-dashed flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white border border-stone-200/70 shadow-xs hover:shadow-xl transition-all duration-500"
            >
              <div className="relative w-full aspect-[4/5] bg-stone-100">
                {asset.attributes?.image_url ? (
                  <img
                    src={asset.attributes.image_url}
                    alt={asset.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}

                <div className="absolute top-3 left-3 z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-[10px] font-mono font-bold text-stone-800 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>TEAR-SHEET AKTIF</span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={isPending}
                      className="p-2 rounded-xl bg-white/20 hover:bg-rose-500/90 text-white backdrop-blur-md transition-colors shadow-sm cursor-pointer"
                      title="Hapus Karya"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-white">
                    <div className="inline-flex px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {asset.subtype}
                    </div>
                    <h3 className="font-extrabold text-sm line-clamp-2 text-white">{asset.name}</h3>
                    {asset.attributes?.project_url && (
                      <a
                        href={asset.attributes.project_url}
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
            </div>
          ))}
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
