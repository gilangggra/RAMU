"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Scissors,
  Eye,
  Maximize2,
  X,
  Pencil,
} from "lucide-react";

export interface MuaAttributes {
  primary_kit_brands?: string[];
  makeup_styles?: string[];
  hair_specialties?: string[];
  sanitation_standards?: string[];
  touchup_standby_hours?: number;
  experience_years?: number;
  skin_types_handled?: string[];
  rate_starting_at?: string;
  portfolio_gallery?: Array<{
    title: string;
    url: string;
    role?: string;
    client?: string;
    caption?: string;
  }>;
}

interface MuaSpecsCardProps {
  attributes: MuaAttributes;
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

export function MuaSpecsCard({ attributes, actorName, isCurrentActor, actorAssets }: MuaSpecsCardProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    caption?: string;
  } | null>(null);

  const kitBrands = attributes.primary_kit_brands || [
    "Dior Backstage",
    "MAC Cosmetics Pro",
    "Make Up For Ever Ultra HD",
    "Charlotte Tilbury",
    "NARS Cosmetics",
    "Shu Uemura",
    "Laura Mercier",
    "Danessa Myricks",
  ];

  const makeupStyles = attributes.makeup_styles || [
    "Editorial & Avant-Garde",
    "High Fashion Lookbook",
    "Clean Skin / 'No-Makeup' Glow",
    "Glass Skin Dewy Finish",
    "Commercial Beauty & Katalog",
    "Creative Color & Metallic Accents",
  ];

  const hairSpecialties = attributes.hair_specialties || [
    "Sleek High Bun & Wet Look",
    "Textured Effortless Waves",
    "Editorial Sculpted Hair",
    "Modern Hijab Styling & Pins",
    "Hairpiece & Extension Blending",
  ];

  const sanitationStandards = attributes.sanitation_standards || [
    "Sterilisasi kuas dengan alkohol 70% & pembersih antiseptik sebelum sesi",
    "Aplikator maskara, lipstik, dan puff menggunakan alat sekali pakai (disposable)",
    "Pencampuran alas bedak menggunakan palet stainless steel steril",
    "Produk ramah kulit sensitif & hypoallergenic berkualitas tinggi",
  ];

  const portfolioWorks = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK")
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      const tearSheet = (attrs?.tear_sheet && typeof attrs.tear_sheet === "object") ? (attrs.tear_sheet as Record<string, unknown>) : null;
      return {
        title: a.name,
        url: (attrs?.image_url as string) || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
        role: (attrs?.role as string) || a.subtype || "Lead Makeup Artist",
        client: (tearSheet?.client as string) || (attrs?.client as string) || "Karya Portofolio",
        caption: a.description || undefined,
      };
    });

  const gallery = (attributes.portfolio_gallery && attributes.portfolio_gallery.length > 0)
    ? attributes.portfolio_gallery
    : portfolioWorks.length > 0
    ? portfolioWorks
    : [
        {
          title: "Clean Editorial Glow — IFW Lookbook",
          url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
          role: "Lead Makeup Artist",
          client: "Label Busana Jakarta",
          caption: "Fokus pada tekstur kulit alami dengan kilau dewy dan riasan mata minimalis di bawah studio lighting.",
        },
        {
          title: "High Fashion Bold Graphic Eyeliner",
          url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
          role: "Creative MUA & Hair",
          client: "Editorial Magazine Indonesia",
          caption: "Aplikasi eyeliner grafis presisi tinggi tahan air dan rambut sleek wet look.",
        },
        {
          title: "Commercial Catalog Natural Radiance",
          url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80",
          role: "Commercial Beauty Stylist",
          client: "E-Commerce Fashion Campaign",
          caption: "Riasan fresh tahan 8 jam pemotretan dengan sentuhan touch-up berkala.",
        },
      ];

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Kit Overview */}
      <section className="p-7 sm:p-8 rounded-none bg-white border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Makeup &amp; Hair Artist Specification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E1B2E] tracking-tight">
              Standar Profesional Rias &amp; Rambut {actorName}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E]">
              <Clock className="w-3.5 h-3.5 text-rose-600" />
              <span>Standby Touch-Up: Hingga {attributes.touchup_standby_hours || 8} Jam Sesi</span>
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

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Makeup Styles */}
          <div className="p-5 rounded-none bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Eye className="w-4 h-4 text-rose-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Spesialisasi Gaya Rias
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {makeupStyles.map((style, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{style}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Hair Specialties */}
          <div className="p-5 rounded-none bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Scissors className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Kapabilitas Tata Rambut / Hijab
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {hairSpecialties.map((hair, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{hair}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Kit Brands */}
          <div className="p-5 rounded-none bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Brand Kit &amp; Produk Utama
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {kitBrands.map((brand, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-none bg-white border border-stone-200 text-[11px] font-bold text-stone-700 shadow-2xs"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hygiene and Sanitation Assurance */}
        <div className="p-5 rounded-none bg-emerald-50/50 border border-emerald-200/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Protokol Higienitas &amp; Sanitasi Alat (Clean Standard)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-stone-600">
            {sanitationStandards.map((std, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{std}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Visual Looks Gallery */}
      {gallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-none bg-white border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Galeri Hasil Riasan On-Set ({gallery.length})
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Dokumentasi hasil makeup &amp; styling pada pemotretan lookbook dan editorial komersial.
              </p>
            </div>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
            {gallery.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(item)}
                className="break-inside-avoid mb-3 group relative cursor-pointer overflow-hidden rounded-none bg-stone-100 border border-stone-200/80 block hover:shadow-xl transition-all"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-auto object-cover rounded-none block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300">
                    {item.client || "Client Work"}
                  </span>
                  <h4 className="font-bold text-sm leading-tight mt-0.5">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-amber-300 mt-2 font-medium">
                    <Maximize2 className="w-3 h-3" />
                    <span>Perbesar Foto</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-none overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] bg-stone-900 w-full overflow-hidden">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-none bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-1">
              <h3 className="font-bold text-base text-[#1E1B2E]">{selectedImage.title}</h3>
              {selectedImage.caption && (
                <p className="text-xs text-stone-500 leading-relaxed">{selectedImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
