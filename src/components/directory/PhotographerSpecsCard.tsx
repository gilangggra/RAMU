"use client";

import React, { useState } from "react";
import {
  Camera,
  Aperture,
  Video,
  MonitorPlay,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface PortfolioGalleryItem {
  title: string;
  url: string;
  role: string;
  client: string;
  caption?: string;
}

export interface PhotographerAttributes {
  primary_camera?: string;
  secondary_camera?: string;
  lenses?: string[];
  lighting_gear?: string[];
  drone_aerial?: boolean;
  video_format?: string;
  editing_software?: string[];
  specialties?: string[];
  delivery_time_days?: number;
  rate_starting_at?: string;
  portfolio_gallery?: PortfolioGalleryItem[];
}

interface PhotographerSpecsCardProps {
  attributes: PhotographerAttributes;
  actorName: string;
}

export function PhotographerSpecsCard({ attributes, actorName }: PhotographerSpecsCardProps) {
  const portfolioGallery = attributes.portfolio_gallery || [];
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  return (
    <div className="space-y-8">
      {/* 1. Gear & Technical Specs Section */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <Camera className="w-3.5 h-3.5" />
              <span>Technical & Gear Specifications</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Kapasitas Produksi & Peralatan {actorName}
            </h2>
          </div>
          
          {attributes.rate_starting_at && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shrink-0">
              <MonitorPlay className="w-4 h-4 text-emerald-600" />
              <span>Tarif Mulai: {attributes.rate_starting_at}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Aperture className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Kamera Utama</span>
            </div>
            <div className="text-sm font-black text-[#27213D]">
              {attributes.primary_camera || "Kamera Mirrorless Full-Frame"}
            </div>
            {attributes.secondary_camera && (
              <div className="text-xs text-stone-500">
                Backup: {attributes.secondary_camera}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Camera className="w-4 h-4 text-purple-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Lensa Unggulan</span>
            </div>
            <ul className="text-xs font-semibold text-[#27213D] space-y-1">
              {(attributes.lenses || ["Lensa Prime 50mm", "Lensa Zoom 24-70mm"]).slice(0, 3).map((lens, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{lens}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Pencahayaan & Studio</span>
            </div>
            <ul className="text-xs font-semibold text-[#27213D] space-y-1">
              {(attributes.lighting_gear || ["Strobe Lighting", "Continuous LED"]).slice(0, 3).map((light, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{light}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Video className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Format Video & Drone</span>
            </div>
            <div className="text-xs font-semibold text-[#27213D] space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white border border-stone-200 rounded text-[10px]">
                  {attributes.video_format || "4K 10-bit"}
                </span>
                {attributes.drone_aerial && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px]">
                    Drone Aerial
                  </span>
                )}
              </div>
              <div className="text-stone-500 pt-1">
                Output Resolusi Tinggi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showreel Placeholder */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
          <Video className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
            Video Showreel & Behind the Scenes
          </h2>
        </div>
        
        <div className="w-full aspect-video rounded-2xl bg-stone-100 overflow-hidden relative group cursor-pointer border border-stone-200/50">
          <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/20 transition-colors z-10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3">
            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-[#27213D] ml-1" />
            </div>
            <span className="text-sm font-bold text-white drop-shadow-md">Putar Showreel</span>
          </div>
          {/* Mock background pattern instead of a real video for MVP */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #27213D 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px] font-bold">
            01:45 • 4K Resolution
          </div>
        </div>
      </section>

      {/* 2. Portfolio Gallery Section */}
      {portfolioGallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Galeri Karya & Klien
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {portfolioGallery.map((item, idx) => (
              <div
                key={idx}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-stone-100 border border-stone-200/80 aspect-[4/3]"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-wide">
                      <CheckCircle2 className="w-3 h-3 text-blue-300" />
                      <span>{item.client}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs text-stone-300 font-medium">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center text-white rounded-b-lg">
              <h3 className="text-lg font-bold">{selectedImage.title}</h3>
              {selectedImage.caption && <p className="text-sm text-stone-300 mt-1">{selectedImage.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
