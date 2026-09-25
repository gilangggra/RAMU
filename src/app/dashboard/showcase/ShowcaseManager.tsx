"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, Sparkles, Image as ImageIcon, Link as LinkIcon, Trash2, ExternalLink } from "lucide-react";
import { createShowcaseAsset, deleteShowcaseAsset } from "@/app/api/assets/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Asset {
  id: string;
  name: string;
  description: string | null;
  subtype: string;
  attributes: any;
  createdAt: Date;
}

export function ShowcaseManager({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createShowcaseAsset(formData);
      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Gagal menambahkan karya");
      }
    });
  }

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
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1E1B2E]">Manajemen Portofolio & Karya</h2>
          <p className="text-sm text-stone-500 mt-1">
            Unggah dan kurasi karya visual terbaik Anda. Ini akan ditampilkan di profil direktori Anda.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Unggah Karya Baru</span>
        </button>
      </div>

      {/* Masonry Grid of Portfolios */}
      {assets.length === 0 ? (
        <div className="p-10 rounded-[32px] bg-white/50 border border-stone-200 border-dashed flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-extrabold text-[#1E1B2E]">Belum Ada Karya</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tarik perhatian klien dan kolaborator dengan memamerkan mahakarya Anda. Tambahkan foto atau tautan video sekarang.
            </p>
          </div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {assets.map((asset) => (
            <div key={asset.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 shadow-xs hover:shadow-xl transition-all duration-500">
              {/* Image Thumbnail */}
              <div className="relative w-full aspect-[4/5] bg-stone-200">
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
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={isPending}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/90 text-white backdrop-blur-md transition-colors"
                      title="Hapus Karya"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="inline-flex px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {asset.subtype}
                    </div>
                    <h3 className="text-white font-extrabold text-sm line-clamp-2">{asset.name}</h3>
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

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B2E]/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 sm:p-8 flex items-center justify-between border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E1B2E]">Unggah Karya</h3>
                  <p className="text-xs text-stone-500 font-medium">Tambahkan mahakarya ke profil Anda</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleCreate} className="p-6 sm:p-8 space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Judul Karya *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Fall Fashion Campaign 2026"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Kategori Spesifik *
                  </label>
                  <select
                    name="subtype"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="Fotografi">Fotografi</option>
                    <option value="Video Komersial">Video Komersial</option>
                    <option value="Fashion Styling">Fashion Styling</option>
                    <option value="Desain Grafis">Desain Grafis</option>
                    <option value="3D & Animasi">3D & Animasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Unggah Foto Cover *
                  </label>
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    required
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#1E1B2E] file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[10px] text-stone-400 mt-1.5">Maksimal 5MB. Format JPG, PNG, atau WebP.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" /> Tautan Proyek (Opsional)
                  </label>
                  <input
                    type="url"
                    name="projectUrl"
                    placeholder="https://youtube.com/... atau https://behance.net/..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Ceritakan sedikit tentang proyek atau peran Anda dalam karya ini..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan Karya"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
