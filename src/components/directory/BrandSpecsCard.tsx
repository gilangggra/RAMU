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
}

export function BrandSpecsCard({ attributes, brandName }: BrandSpecsCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<BrandGalleryPhoto | null>(null);

  const gallery = attributes.brand_gallery || attributes.styling_gallery || [];
  const materials = attributes.fabric_materials || attributes.styling_specialties || [];

  return (
    <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Katalog Koleksi & Karakteristik Desain</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
            DNA Desain & Portofolio Koleksi {brandName}
          </h2>
        </div>

        {attributes.sample_sizes_ready && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold shrink-0">
            <Scissors className="w-3.5 h-3.5" />
            <span>Busana Sampel: {attributes.sample_sizes_ready}</span>
          </div>
        )}
      </div>

      {/* Brand Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {attributes.design_dna && (
          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1 sm:col-span-2">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              DNA & Filosofi Desain
            </div>
            <div className="text-sm font-extrabold text-[#27213D]">
              {attributes.design_dna}
            </div>
          </div>
        )}

        {attributes.capacity_monthly && (
          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
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
                className="px-3 py-1 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-bold text-[#27213D] flex items-center gap-1.5"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gallery.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(photo)}
                className="group cursor-pointer rounded-2xl bg-stone-50 border border-stone-200/80 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all space-y-2 p-2.5"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-200">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </span>
                  </div>
                </div>

                <div className="px-1 space-y-0.5">
                  <h4 className="text-xs font-black text-[#27213D] group-hover:text-[#E66A48] transition-colors leading-snug">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2">{photo.caption}</p>
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
            className="relative max-w-4xl w-full bg-[#1E1B2E] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors shrink-0"
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
