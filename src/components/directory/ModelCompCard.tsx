"use client";

import React, { useState } from "react";
import {
  Ruler,
  Camera,
  Film,
  Sparkles,
  Maximize2,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface CompCardPhoto {
  type: string;
  url: string;
  caption: string;
}

interface PortfolioGalleryItem {
  title: string;
  url: string;
  role: string;
  client: string;
}

export interface ModelAttributes {
  height_cm?: number;
  weight_kg?: number;
  bust_waist_hips?: string;
  clothing_size?: string;
  shoe_size?: string;
  hair_color?: string;
  eye_color?: string;
  skin_undertone?: string;
  experience_years?: number;
  specialties?: string[];
  comp_card?: CompCardPhoto[];
  portfolio_gallery?: PortfolioGalleryItem[];
  video_reel_title?: string;
}

interface ModelCompCardProps {
  attributes: ModelAttributes;
  actorName: string;
}

export function ModelCompCard({ attributes, actorName }: ModelCompCardProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  const compCardPhotos = attributes.comp_card || [];
  const portfolioGallery = attributes.portfolio_gallery || [];

  return (
    <div className="space-y-8">
      {/* 1. Comp Card & Body Measurements Section */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700">
              <Camera className="w-3.5 h-3.5" />
              <span>Official Comp Card & Physical Measurements</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Karakteristik Fisik & Polaroids {actorName}
            </h2>
          </div>

          {attributes.video_reel_title && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs font-semibold text-[#27213D] shrink-0">
              <Film className="w-4 h-4 text-[#E66A48]" />
              <span>{attributes.video_reel_title}</span>
            </div>
          )}
        </div>

        {/* Polaroid Comp Card Grid (3 Angles) */}
        {compCardPhotos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
              <span>Polaroid Angles (Natural Light • Zero Makeup)</span>
              <span className="text-[11px] font-semibold text-[#716B7E]">Klik foto untuk memperbesar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {compCardPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage({ url: photo.url, title: photo.type, caption: photo.caption })}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-stone-100 border border-stone-200/80 p-2.5 space-y-2 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-200">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Perbesar</span>
                      </span>
                    </div>
                  </div>

                  <div className="px-1 space-y-0.5">
                    <div className="text-xs font-extrabold text-[#27213D]">{photo.type}</div>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Physical Measurements Grid */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
            <Ruler className="w-3.5 h-3.5 text-[#E66A48]" />
            <span>Pengukuran Tubuh & Fitting Specs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">Tinggi Badan</div>
              <div className="text-lg font-black text-[#27213D] mt-0.5">
                {attributes.height_cm ? `${attributes.height_cm} cm` : "-"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Standard Editorial</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">B-W-H (Dada/Pinggang/Pinggul)</div>
              <div className="text-base font-black text-[#27213D] mt-0.5">
                {attributes.bust_waist_hips || "84-60-89 cm"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Proporsional Lookbook</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">Ukuran Baju (Sample)</div>
              <div className="text-base font-black text-purple-700 mt-0.5">
                {attributes.clothing_size || "S / 36 EU"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Kesesuaian Busana Desainer</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">Ukuran Sepatu</div>
              <div className="text-base font-black text-[#27213D] mt-0.5">
                {attributes.shoe_size || "39 EU"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Standard Runway Footwear</div>
            </div>
          </div>

          {/* Secondary Physical Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-stone-50/50 border border-stone-200/60 text-xs flex items-center justify-between">
              <span className="text-stone-500">Warna Rambut:</span>
              <span className="font-bold text-[#27213D]">{attributes.hair_color || "Hitam Alami"}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50/50 border border-stone-200/60 text-xs flex items-center justify-between">
              <span className="text-stone-500">Warna Mata:</span>
              <span className="font-bold text-[#27213D]">{attributes.eye_color || "Cokelat Tua"}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50/50 border border-stone-200/60 text-xs flex items-center justify-between">
              <span className="text-stone-500">Skin Undertone:</span>
              <span className="font-bold text-[#27213D]">{attributes.skin_undertone || "Warm Olive"}</span>
            </div>
          </div>
        </div>

        {/* Specialties Tags */}
        {attributes.specialties && attributes.specialties.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Spesialisasi & Bidang Modeling
            </div>
            <div className="flex flex-wrap gap-2">
              {attributes.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold text-[#E66A48] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E66A48]" />
                  <span>{spec}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. Visual Portfolio & Campaign Gallery */}
      {portfolioGallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Editorial & Commercial Lookbook Works</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight mt-1">
                Portofolio Kampanye Visual
              </h2>
            </div>
            <span className="text-xs font-bold text-stone-400">
              {portfolioGallery.length} Karya Pilihan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {portfolioGallery.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage({ url: item.url, title: item.title, caption: `${item.role} • ${item.client}` })}
                className="group cursor-pointer rounded-2xl bg-stone-50 border border-stone-200/80 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all space-y-3 p-3"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-200">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                      <Maximize2 className="w-4 h-4" />
                      <span>Lihat Resolusi Penuh</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white">
                      {item.role}
                    </span>
                  </div>
                </div>

                <div className="px-1 space-y-1">
                  <h4 className="text-sm font-black text-[#27213D] group-hover:text-[#E66A48] transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>Peran: <strong className="text-[#27213D]">{item.role}</strong></span>
                    <span className="text-stone-400">Klien: {item.client}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#1E1B2E] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[4/5] sm:aspect-[16/10] max-h-[75vh] w-full bg-black/90 flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-[#27213D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <div>
                <h3 className="text-base font-extrabold">{selectedImage.title}</h3>
                {selectedImage.caption && (
                  <p className="text-xs text-stone-400 mt-0.5">{selectedImage.caption}</p>
                )}
              </div>
              <a
                href={selectedImage.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors shrink-0"
              >
                <span>Buka Gambar Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
