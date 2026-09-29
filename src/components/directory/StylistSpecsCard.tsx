"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Package,
  Layers,
  Maximize2,
  X,
  Compass,
  Shirt,
  Scissors,
} from "lucide-react";

export interface StylistAttributes {
  styling_specialties?: string[];
  wardrobe_archive_count?: number;
  showroom_partners?: string[];
  onset_equipment?: string[];
  aesthetic_dna?: string;
  rate_starting_at?: string;
  styling_gallery?: Array<{
    title: string;
    url: string;
    role?: string;
    client?: string;
    caption?: string;
  }>;
}

interface StylistSpecsCardProps {
  attributes: StylistAttributes;
  actorName: string;
  actorAssets?: Array<{
    id: string;
    name: string;
    category: string;
    subtype: string;
    description?: string | null;
    attributes?: Record<string, unknown> | null;
  }>;
}

export function StylistSpecsCard({ attributes, actorName, actorAssets }: StylistSpecsCardProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    caption?: string;
  } | null>(null);

  const specialties = attributes.styling_specialties || [
    "Editorial Lookbook & Campaign",
    "Contemporary Wastra & Nusantara Fusion",
    "High-Fashion Streetwear & Minimalist Chic",
    "Commercial TVC & Brand Advertising",
    "Color Theory & Visual Concept Moodboarding",
  ];

  const onsetEquipment = attributes.onset_equipment || [
    "Garment Steamer Profesional 2200W (Siap pakai on-set)",
    "Emergency Sewing & Tailoring Kit (Benang, jarum, gunting kain)",
    "Clamps & Invisible Pins (Penyesuaian fitting busana seketika)",
    "Double-Sided Fashion Tape & Fabric Guard",
    "Portable Rolling Garment Rack & Hangers (Muat hingga 40 busana)",
    "Lint Roller & Anti-Static Spray",
  ];

  const showroomPartners = attributes.showroom_partners || [
    "Showroom Desainer Mode Jakarta & Bandung",
    "Arsip Vintage & Rare Fashion Koleksi Pribadi",
    "Jejaring Pengrajin Kain Tradisional (Tenun & Batik)",
    "Studio Aksesoris & Perhiasan Etnik Nusantara",
  ];

  const portfolioWorks = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK")
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      const tearSheet = (attrs?.tear_sheet && typeof attrs.tear_sheet === "object") ? (attrs.tear_sheet as Record<string, unknown>) : null;
      return {
        title: a.name,
        url: (attrs?.image_url as string) || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
        role: (attrs?.role as string) || a.subtype || "Lead Fashion Stylist",
        client: (tearSheet?.client as string) || (attrs?.client as string) || "Karya Portofolio",
        caption: a.description || "Pengarahan gaya dan pemilihan wardrobe profesional.",
      };
    });

  const gallery = (attributes.styling_gallery && attributes.styling_gallery.length > 0)
    ? attributes.styling_gallery
    : portfolioWorks.length > 0
    ? portfolioWorks
    : [
        {
          title: "Moodboard Konsep & Palet Warna Lookbook",
          url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
          role: "Lead Fashion Stylist",
          client: "Label Busana Kontemporer",
          caption: "Pengarahan gaya perpaduan kain tradisional nusantara dengan siluet monokromatis modern.",
        },
        {
          title: "Archive Wardrobe & Koleksi Aksesoris On-Set",
          url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80",
          role: "Wardrobe Director",
          client: "Musim Rilis Summer 2026",
          caption: "Koleksi pakaian arsip dan aksesoris etnik siap pinjam untuk kelengkapan styling kampanye.",
        },
        {
          title: "Editorial Avant-Garde Draping & Layering",
          url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
          role: "Creative Stylist",
          client: "Indonesia Fashion Review",
          caption: "Eksplorasi teknik layering dan kontras tekstur material sutra dengan katun linen alami.",
        },
      ];

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Kit Overview */}
      <section className="p-7 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-bold text-violet-800">
              <Shirt className="w-3.5 h-3.5 text-violet-600" />
              <span>Fashion Styling &amp; Wardrobe Direction</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E1B2E] tracking-tight">
              Kapabilitas Pengarahan Gaya {actorName}
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] shrink-0">
            <Package className="w-4 h-4 text-violet-600" />
            <span>Arsip Wardrobe: {attributes.wardrobe_archive_count || 150}+ Potong Koleksi</span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Styling Specialties */}
          <div className="p-5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Compass className="w-4 h-4 text-violet-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Arah Gaya &amp; Spesialisasi
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {specialties.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: On-set Equipment */}
          <div className="p-5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Scissors className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Peralatan Wardrobe On-Set
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {onsetEquipment.slice(0, 5).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Showroom & Pulling Network */}
          <div className="p-5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Jejaring Peminjaman (Pulling)
              </span>
            </div>
            <ul className="text-xs font-medium text-[#1E1B2E] space-y-1.5">
              {showroomPartners.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Aesthetic DNA Banner */}
        <div className="p-5 rounded-xl bg-violet-50/50 border border-violet-200/80 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-violet-900 block">Karakter Visual &amp; Filosofi Styling:</span>
            <p className="text-stone-600 leading-relaxed">
              {attributes.aesthetic_dna ||
                "Pendekatan estetika modern yang mengutamakan proporsi siluet tubuh model, pemilihan warna harmonis sesuai DNA merek klien, serta ketelitian detail fitting pakaian on-set tanpa kusut."}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Visual Looks Gallery */}
      {gallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Portofolio Moodboard &amp; Hasil Styling ({gallery.length})
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Dokumentasi hasil kurasi busana, moodboard konsep, dan wardrobe styling pada sesi foto editorial.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {gallery.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(item)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-stone-100 border border-stone-200/80 aspect-[3/4]"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">
                    {item.client || "Client Work"}
                  </span>
                  <h4 className="font-bold text-sm leading-tight mt-0.5">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-stone-300 mt-2 font-medium">
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
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
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
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
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
