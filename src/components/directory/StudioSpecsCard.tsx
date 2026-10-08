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
  Pencil,
  Check,
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
  space_type?: string[];
  max_people_capacity?: number;
  max_crew_capacity?: number;
  available_setups?: string[];
  lighting_gear?: string[];
  props_available?: boolean;
  facilities?: string[];
  gear_included?: string[];
  operating_hours?: string;
  overtime_policy?: string;
  studio_gallery?: StudioGalleryPhoto[];
}

interface StudioSpecsCardProps {
  attributes: StudioAttributes;
  studioName: string;
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

export function StudioSpecsCard({ attributes, studioName, isCurrentActor, actorAssets }: StudioSpecsCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<StudioGalleryPhoto | null>(null);

  const portfolioWorks: StudioGalleryPhoto[] = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK" || a.category === "STUDIO_SPACE")
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      return {
        title: a.name,
        url: (attrs?.image_url as string) || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80",
        caption: a.description || "Fasilitas studio dan area produksi visual.",
      };
    });

  const gallery = (attributes.studio_gallery && attributes.studio_gallery.length > 0)
    ? attributes.studio_gallery
    : portfolioWorks;

  const facilities = attributes.facilities || [];
  const gearList = attributes.lighting_gear || attributes.gear_included || [];
  const setups = attributes.available_setups || [];

  return (
    <div className="space-y-8">

      <section className="p-7 sm:p-8 rounded-[22px] bg-white/95 border border-slate-200/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs font-bold text-sky-800">
              <Building2 className="w-3.5 h-3.5 text-[#4CC9FE]" />
              <span>Spesifikasi Cyclorama &amp; Parameter Ruangan Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Kapasitas Ruang &amp; Fitur Teknis {studioName}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Terverifikasi Siap Produksi</span>
            </div>
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                }}
                className="btn-primary-pill !text-xs !py-1.5 !px-4 shadow-sm shadow-[#4CC9FE]/20 font-semibold cursor-pointer inline-flex items-center gap-1.5 text-white active:scale-95"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Spesifikasi</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Luas Area Indoor
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {attributes.area_sqm || 120} <span className="text-sm font-bold text-slate-500">m²</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Kapasitas hingga 15 kru</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tinggi Plafon (Ceiling)
            </div>
            <div className="text-2xl font-extrabold text-[#4CC9FE]">
              {attributes.ceiling_height_m || 4.5} <span className="text-sm font-bold text-slate-500">meter</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Ideal untuk overhead boom</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Daya Listrik
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {attributes.electrical_capacity || "16.500 Watt"}
            </div>
            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>3-Phase Dedicated</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Bentuk Cyclorama
            </div>
            <div className="text-sm font-extrabold text-sky-700 leading-snug">
              {attributes.cyclorama_type || "Seamless White L-Curve"}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Tanpa sudut bayangan</div>
          </div>
        </div>

        {/* SETUPS & OPERATIONAL LIMITS */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {setups.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Setups &amp; Backdrop Pilihan
              </span>
              <div className="flex flex-wrap gap-1.5">
                {setups.map((setp) => (
                  <span key={setp} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-[11px] font-bold">
                    ✓ {setp}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Jam Operasional &amp; Kapasitas Kru
            </span>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Jam Operasional:</span>
                <span className="font-bold text-slate-900">{attributes.operating_hours || "08:00 – 22:00 WIB"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kapasitas Maksimal:</span>
                <span className="font-bold text-slate-900">{attributes.max_people_capacity || 15} Orang Kru</span>
              </div>
              {attributes.overtime_policy && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Overtime:</span>
                  <span className="font-semibold text-amber-800 truncate max-w-[200px]">{attributes.overtime_policy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {gallery.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Galeri Visual Studio &amp; Set Area</span>
              <span className="text-[11px] font-semibold text-slate-500">Klik foto untuk inspeksi detail</span>
            </div>

            <div className="columns-1 sm:columns-2 gap-3">
              {gallery.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(photo)}
                  className="break-inside-avoid mb-3 group cursor-pointer rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden hover:shadow-xl transition-all relative block"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-auto object-cover rounded-2xl block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                    <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {photo.title}
                      </h4>
                      {photo.caption && (
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{photo.caption}</p>
                      )}
                      <div className="pt-1.5 flex items-center gap-1 text-[10px] font-bold text-sky-300">
                        <Maximize2 className="w-3 h-3" />
                        <span>Inspeksi Set Studio</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gearList.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-[#4CC9FE]" />
              <span>Daftar Lighting &amp; Peralatan On-Site (Sudah Termasuk)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gearList.map((gear, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-xs text-slate-900 flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-sky-100 text-[#4CC9FE] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="font-medium leading-snug">{gear}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {facilities.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Fasilitas Ruangan &amp; Kenyamanan Kru</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {facilities.map((fac, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-sky-50/50 border border-sky-200/60 text-xs text-slate-900 flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-medium">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 rounded-[22px] overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
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

            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <div>
                <h3 className="text-base font-extrabold">{selectedPhoto.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPhoto.caption}</p>
              </div>
              <a
                href={selectedPhoto.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors shrink-0"
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
