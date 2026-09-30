"use client";

import React, { useState } from "react";
import {
  Video,
  Film,
  Camera,
  Layers,
  Sparkles,
  Maximize2,
  X,
  Volume2,
  Sliders,
  CheckCircle2,
  Play,
  Pencil,
} from "lucide-react";

export interface VideographerAttributes {
  primary_cinema_camera?: string;
  secondary_camera?: string;
  cine_lenses?: string[];
  stabilization_rigs?: string[];
  audio_gear?: string[];
  post_production_suite?: string[];
  video_formats?: string[];
  rate_starting_at?: string;
  portfolio_videos?: Array<{
    title: string;
    url: string;
    thumbnail?: string;
    role?: string;
    client?: string;
    duration?: string;
    caption?: string;
  }>;
}

interface VideographerSpecsCardProps {
  attributes: VideographerAttributes;
  actorName: string;
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

export function VideographerSpecsCard({ attributes, actorName, isCurrentActor, actorAssets }: VideographerSpecsCardProps) {
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    url: string;
    thumbnail?: string;
    role?: string;
    client?: string;
    duration?: string;
    caption?: string;
  } | null>(null);

  const cinemaCameras = [
    attributes.primary_cinema_camera || "Sony FX3 Full-Frame Cinema Line (4K 120p 10-Bit 4:2:2)",
    attributes.secondary_camera || "Sony A7S III (B-Cam Gimbal Rig)",
  ].filter(Boolean);

  const cineLenses = attributes.cine_lenses || [
    "DZOFilm Vespis Cine Prime Kit (25mm, 35mm, 50mm, 75mm T2.1)",
    "Sony FE 24-70mm f/2.8 GM II (Zoom Run & Gun)",
    "Tiffen Black Pro-Mist 1/4 & NiSi True Color VND Filters",
    "Sirui 50mm T2.9 1.6x Full-Frame Anamorphic",
  ];

  const stabilizationRigs = attributes.stabilization_rigs || [
    "DJI RS3 Pro Gimbal dengan Wireless LiDAR Auto-Focus",
    "Tilta Nucleus-M Wireless Follow Focus System",
    "Hollyland Mars 4K Wireless Video Transmitter ke Monitor Sutradara",
    "Easyrig Minimax (Dukungan kamera handheld seharian)",
  ];

  const audioGear = attributes.audio_gear || [
    "Sennheiser MKH416 Shotgun Microphone + Boom Pole",
    "DJI Mic 2 Wireless System (32-Bit Float Internal Recording)",
    "Zoom F6 6-Channel Field Recorder",
  ];

  const postSuite = attributes.post_production_suite || [
    "DaVinci Resolve Studio (ACES Color Management & Film Emulation)",
    "Adobe Premiere Pro CC (Editorial Cut & Offline Editing)",
    "Adobe After Effects (Motion Graphics & Kinetic Typography)",
    "Lisensi Musik Komersial Legal (Artlist & Musicbed Enterprise)",
  ];

  const portfolioWorks = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK")
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      const tearSheet = (attrs?.tear_sheet && typeof attrs.tear_sheet === "object") ? (attrs.tear_sheet as Record<string, unknown>) : null;
      return {
        title: a.name,
        url: (attrs?.video_url as string) || (attrs?.image_url as string) || "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1000&q=80",
        thumbnail: (attrs?.image_url as string) || "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1000&q=80",
        role: (attrs?.role as string) || a.subtype || "Director of Photography",
        client: (tearSheet?.client as string) || (attrs?.client as string) || "Karya Sinematik",
        duration: (attrs?.duration as string) || "0:45 min",
        caption: a.description || undefined,
      };
    });

  const videos = (attributes.portfolio_videos && attributes.portfolio_videos.length > 0)
    ? attributes.portfolio_videos
    : portfolioWorks.length > 0
    ? portfolioWorks
    : [
        {
          title: "Fashion Film Musim Semi — 'Siluet Senja'",
          url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1000&q=80",
          thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1000&q=80",
          role: "Director of Photography & Colorist",
          client: "Label Busana Jakarta",
          duration: "0:45 min",
          caption: "Video lookbook sinematik rasio 9:16 untuk Instagram Reels & TikTok dengan color grading hangat ala seluloid 35mm.",
        },
        {
          title: "TVC Iklan Komersial — 'Urban Movement'",
          url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80",
          thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80",
          role: "Lead Cinematographer",
          client: "Brand Sepatu Lokal",
          duration: "1:00 min",
          caption: "Iklan komersial gerakan dinamis dengan teknik gimbal tracking shot 120fps slow-motion.",
        },
        {
          title: "Behind The Scenes — Lookbook Campaign 2026",
          url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80",
          thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80",
          role: "Videographer & Video Editor",
          client: "Studio Kreatif Nusantara",
          duration: "0:30 min",
          caption: "Cuplikan video dokumentasi proses kreatif tim di balik layar sesi pemotretan majalah.",
        },
      ];

  return (
    <div className="space-y-8">
      {/* 1. Cinema Gear & Audio Section */}
      <section className="p-7 sm:p-8 rounded-none bg-white border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-800">
              <Film className="w-3.5 h-3.5 text-cyan-600" />
              <span>Cinematography &amp; Video Production Specs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E1B2E] tracking-tight">
              Spesifikasi Kamera Sinema &amp; Alat Produksi {actorName}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E]">
              <Video className="w-3.5 h-3.5 text-cyan-600" />
              <span>Format Master: 4K 10-Bit ProRes / S-Log3</span>
            </div>
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

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Col 1: Cinema Cameras */}
          <div className="p-5 rounded-none bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Camera className="w-4 h-4 text-cyan-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Bodi Kamera Sinema
              </span>
            </div>
            <ul className="text-xs font-semibold text-[#1E1B2E] space-y-2">
              {cinemaCameras.map((cam, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span>{cam}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Cine Lenses */}
          <div className="p-5 rounded-none bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Film className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Lensa Sinema &amp; Filter
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {cineLenses.map((lens, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{lens}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Stabilization & Transmit */}
          <div className="p-5 rounded-none bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Gimbal &amp; Monitoring
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {stabilizationRigs.map((rig, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Post-Production */}
          <div className="p-5 rounded-none bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Color Grading &amp; Audio
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {postSuite.map((soft, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-purple-500 font-bold">•</span>
                  <span>{soft}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Visual Video Gallery */}
      {videos.length > 0 && (
        <section className="p-7 sm:p-8 rounded-none bg-white border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Showreel &amp; Cuplikan Karya Video ({videos.length})
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Karya sinematik komersial untuk kampanye lookbook, reels media sosial, dan video iklan produk.
              </p>
            </div>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
            {videos.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedVideo(item)}
                className="break-inside-avoid mb-3 group relative cursor-pointer overflow-hidden rounded-none bg-stone-900 border border-stone-200/80 block"
              >
                <img
                  src={item.thumbnail || item.url}
                  alt={item.title}
                  className="w-full h-auto object-cover rounded-none block transition-transform duration-700 group-hover:scale-[1.02] opacity-90 group-hover:opacity-100"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-none bg-white/95 text-[#1E1B2E] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#E66A48] group-hover:text-white transition-all backdrop-blur-xs">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                    <span>{item.client || "Client Campaign"}</span>
                    <span>{item.duration || "0:45"}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-tight mt-1">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-amber-300 mt-2 font-medium">
                    <Maximize2 className="w-3 h-3" />
                    <span>Lihat Detail Video</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-none overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] bg-stone-950 w-full overflow-hidden flex items-center justify-center">
              <img
                src={selectedVideo.thumbnail || selectedVideo.url}
                alt={selectedVideo.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute flex flex-col items-center gap-2 text-white">
                <div className="w-14 h-14 rounded-none bg-white text-[#1E1B2E] flex items-center justify-center shadow-xl">
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase bg-black/60 px-3 py-1 rounded-none">
                  Pratinjau Kualitas 4K
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 rounded-none bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
                <span>{selectedVideo.role}</span>
                <span>{selectedVideo.client} • {selectedVideo.duration}</span>
              </div>
              <h3 className="font-bold text-lg text-[#1E1B2E]">{selectedVideo.title}</h3>
              {selectedVideo.caption && (
                <p className="text-xs text-stone-500 leading-relaxed">{selectedVideo.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
