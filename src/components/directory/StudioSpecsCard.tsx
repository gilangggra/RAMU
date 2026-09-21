"use client";

import React, { useState } from "react";
import {
  Building2,
  Maximize2,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  Camera,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface StudioGalleryPhoto {
  title: string;
  url: string;
  caption: string;
}

export interface StudioAttributes {
  area_sqm?: number;
  ceiling_height_m?: number;
  cyclorama_type?: string;
  electrical_capacity?: string;
  floor_type?: string;
  facilities?: string[];
  gear_included?: string[];
  studio_gallery?: StudioGalleryPhoto[];
}

interface StudioSpecsCardProps {
  attributes: StudioAttributes;
  studioName: string;
}

export function StudioSpecsCard({ attributes, studioName }: StudioSpecsCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<StudioGalleryPhoto | null>(null);

  const gallery = attributes.studio_gallery || [];
  const facilities = attributes.facilities || [];
  const gearList = attributes.gear_included || [];

  return (
    <div className="space-y-8">
      {/* 1. Dimension & Cyclorama Specifications Card */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold text-[#E66A48]">
              <Building2 className="w-3.5 h-3.5 text-[#E66A48]" />
              <span>Spesifikasi Cyclorama & Parameter Ruangan Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Kapasitas Ruang & Fitur Teknis {studioName}
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Terverifikasi Siap Produksi</span>
          </div>
        </div>

        {/* 4 Primary Room Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Luas Area Indoor
            </div>
            <div className="text-2xl font-black text-[#27213D]">
              {attributes.area_sqm || 120} <span className="text-sm font-bold text-stone-500">m²</span>
            </div>
            <div className="text-[10px] text-stone-500 font-medium">Kapasitas hingga 15 kru</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Tinggi Plafon (Ceiling)
            </div>
            <div className="text-2xl font-black text-[#E66A48]">
              {attributes.ceiling_height_m || 4.5} <span className="text-sm font-bold text-stone-500">meter</span>
            </div>
            <div className="text-[10px] text-stone-500 font-medium">Ideal untuk overhead boom</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Daya Listrik
            </div>
            <div className="text-xl font-black text-[#27213D]">
              {attributes.electrical_capacity || "16.500 Watt"}
            </div>
            <div className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>3-Phase Dedicated</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Bentuk Cyclorama
            </div>
            <div className="text-sm font-black text-purple-700 leading-snug">
              {attributes.cyclorama_type || "Seamless White L-Curve"}
            </div>
            <div className="text-[10px] text-stone-500 font-medium">Tanpa sudut bayangan</div>
          </div>
        </div>

        {/* 2. Photo Gallery of the Studio */}
        {gallery.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
              <span>Galeri Visual Studio & Set Area</span>
              <span className="text-[11px] font-semibold text-[#716B7E]">Klik foto untuk inspeksi detail</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gallery.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group cursor-pointer rounded-2xl bg-stone-50 border border-stone-200/80 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all space-y-2 p-3"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-200">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                        <Maximize2 className="w-4 h-4" />
                        <span>Inspeksi Set Studio</span>
                      </span>
                    </div>
                  </div>

                  <div className="px-1 space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#27213D] group-hover:text-[#E66A48] transition-colors">
                      {photo.title}
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Included Lighting & Gear List */}
        {gearList.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-[#E66A48]" />
              <span>Daftar Lighting & Peralatan On-Site (Sudah Termasuk)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gearList.map((gear, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-stone-50/90 border border-stone-200/70 text-xs text-[#27213D] flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    ✓
                  </div>
                  <span className="font-medium leading-snug">{gear}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. On-Site Amenities & Facilities */}
        {facilities.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Fasilitas Ruangan & Kenyamanan Kru</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {facilities.map((fac, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/60 text-xs text-[#27213D] flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-medium">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

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

            <div className="relative aspect-[16/10] max-h-[75vh] w-full bg-black/90 flex items-center justify-center">
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
    </div>
  );
}
