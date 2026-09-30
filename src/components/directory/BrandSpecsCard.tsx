"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Maximize2,
  Scissors,
  Layers,
  X,
  ExternalLink,
  PackageCheck,
  Pencil,
} from "lucide-react";

interface BrandGalleryPhoto {
  title: string;
  url: string;
  caption: string;
}

export interface BrandAttributes {
  design_dna?: string;
  sample_sizes_ready?: string;
  fabric_materials?: string[];
  capacity_monthly?: string;
  brand_gallery?: BrandGalleryPhoto[];
  styling_gallery?: BrandGalleryPhoto[];
  styling_specialties?: string[];
}

interface BrandSpecsCardProps {
  attributes: BrandAttributes;
  brandName: string;
  isCurrentActor?: boolean;
  actorAssets?: Array<{
    id: string;
    name: string;
    category: string;
    subtype: string;
    description?: string | null;
    attributes?: Record<string, unknown> | null;
  }>;
}

export function BrandSpecsCard({ attributes, brandName, isCurrentActor, actorAssets }: BrandSpecsCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<BrandGalleryPhoto | null>(null);

  const portfolioWorks: BrandGalleryPhoto[] = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK")
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      return {
        title: a.name,
        url: (attrs?.image_url as string) || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
        caption: a.description || "Koleksi karya dari showcase resmi brand.",
      };
    });

  const gallery = (attributes.brand_gallery && attributes.brand_gallery.length > 0)
    ? attributes.brand_gallery
    : (attributes.styling_gallery && attributes.styling_gallery.length > 0)
    ? attributes.styling_gallery
    : portfolioWorks;

  const materials = attributes.fabric_materials || attributes.styling_specialties || [];

  return (
    <section className="p-7 sm:p-8 rounded-none bg-white/95 border border-stone-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Katalog Koleksi & Karakteristik Desain</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
            DNA Desain & Portofolio Koleksi {brandName}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {attributes.sample_sizes_ready && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
              <Scissors className="w-3.5 h-3.5" />
              <span>Busana Sampel: {attributes.sample_sizes_ready}</span>
            </div>
          )}
          {isCurrentActor && (
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Spesifikasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Brand Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {attributes.design_dna && (
          <div className="p-4 rounded-none bg-stone-50/80 border border-stone-200/70 space-y-1 sm:col-span-2">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              DNA & Filosofi Desain
            </div>
            <div className="text-sm font-extrabold text-[#27213D]">
              {attributes.design_dna}
            </div>
          </div>
        )}

        {attributes.capacity_monthly && (
          <div className="p-4 rounded-none bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Kapasitas Produksi
            </div>
            <div className="text-sm font-extrabold text-[#E66A48]">
              {attributes.capacity_monthly}
            </div>
          </div>
        )}
      </div>

      {/* Materials / Fabric Tags */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Material Utama & Keahlian Khusus:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {materials.map((mat, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-none bg-stone-50 border border-stone-200/80 text-xs font-bold text-[#27213D] flex items-center gap-1.5"
              >
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{mat}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Brand / Styling Photo Gallery */}
      {gallery.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
            <span>Galeri Koleksi Lookbook</span>
            <span className="text-[11px] font-semibold text-[#716B7E]">Klik foto untuk resolusi penuh</span>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
            {gallery.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(photo)}
                className="break-inside-avoid mb-3 group cursor-pointer rounded-none bg-stone-100 border border-stone-200/80 overflow-hidden hover:shadow-xl transition-all relative block"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover rounded-none block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {photo.title}
                    </h4>
                    {photo.caption && (
                      <p className="text-[11px] text-stone-300 line-clamp-2 font-medium">{photo.caption}</p>
                    )}
                    <div className="pt-1.5 flex items-center gap-1 text-[10px] font-bold text-amber-300">
                      <Maximize2 className="w-3 h-3" />
                      <span>Perbesar Foto</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Image Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#1E1B2E] rounded-none overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-none bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[4/5] sm:aspect-[16/10] max-h-[75vh] w-full bg-black/90 flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-[#27213D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <div>
                <h3 className="text-base font-extrabold">{selectedPhoto.title}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{selectedPhoto.caption}</p>
              </div>
              <a
                href={selectedPhoto.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors shrink-0"
              >
                <span>Buka Resolusi Penuh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
