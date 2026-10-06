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
  Pencil,
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
  capabilities?: string[];
  wardrobe_restrictions?: string;
  chaperone_allowed?: boolean;
  travel_radius?: string;
  comp_card?: CompCardPhoto[];
  portfolio_gallery?: PortfolioGalleryItem[];
  video_reel_title?: string;
}

interface ModelCompCardProps {
  attributes: ModelAttributes;
  actorName: string;
  avatarUrl?: string | null;
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

export function ModelCompCard({ attributes, actorName, avatarUrl, isCurrentActor, actorAssets }: ModelCompCardProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  const portfolioWorks: PortfolioGalleryItem[] = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK")
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      const tearSheet = (attrs?.tear_sheet && typeof attrs.tear_sheet === "object") ? (attrs.tear_sheet as Record<string, unknown>) : null;
      return {
        title: a.name,
        url: (attrs?.image_url as string) || avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        role: (attrs?.role as string) || a.subtype || "Model",
        client: (tearSheet?.client as string) || (attrs?.client as string) || "Editorial",
      };
    });

  const portfolioGallery = (attributes.portfolio_gallery && attributes.portfolio_gallery.length > 0)
    ? attributes.portfolio_gallery
    : portfolioWorks;

  const portfolioCompCards: CompCardPhoto[] = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK")
    .slice(0, 3)
    .map((a, idx) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      const angleLabels = ["Full Body Angle", "Profile Side Angle", "Editorial Angle"];
      return {
        type: angleLabels[idx] || a.subtype || "Polaroid Look",
        url: (attrs?.image_url as string) || avatarUrl || "",
        caption: a.name || `Tampilan ${angleLabels[idx] || "Karya"}`,
      };
    })
    .filter((p) => Boolean(p.url));

  let compCardPhotos: CompCardPhoto[] = [];
  if (attributes.comp_card && attributes.comp_card.length > 0) {
    compCardPhotos = attributes.comp_card;
  } else if (portfolioCompCards.length > 0) {
    if (avatarUrl && !portfolioCompCards.some((p) => p.url === avatarUrl)) {
      compCardPhotos = [
        { type: "Headshot Resmi", url: avatarUrl, caption: `Foto profil resmi ${actorName}` },
        ...portfolioCompCards.slice(0, 2),
      ];
    } else {
      compCardPhotos = portfolioCompCards;
    }
  } else if (avatarUrl) {
    compCardPhotos = [
      {
        type: "Headshot Resmi",
        url: avatarUrl,
        caption: `Foto profil resmi ${actorName}`,
      },
    ];
  }

  return (
    <div className="space-y-8">

      <section className="p-7 sm:p-8 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700">
              <Camera className="w-3.5 h-3.5" />
              <span>Official Comp Card & Physical Measurements</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Karakteristik Fisik & Polaroids {actorName}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {attributes.video_reel_title && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-semibold text-[#27213D]">
                <Film className="w-4 h-4 text-[#E66A48]" />
                <span>{attributes.video_reel_title}</span>
              </div>
            )}
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Comp Card</span>
              </button>
            )}
          </div>
        </div>

        {compCardPhotos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
              <span>Polaroid Angles (Natural Light • Zero Makeup)</span>
              <span className="text-[11px] font-semibold text-[#716B7E]">Klik foto untuk memperbesar</span>
            </div>

            <div className="columns-1 sm:columns-3 gap-3">
              {compCardPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage({ url: photo.url, title: photo.type, caption: photo.caption })}
                  className="break-inside-avoid mb-3 group relative cursor-pointer overflow-hidden rounded-xl bg-stone-100 border border-stone-200/80 hover:shadow-xl transition-all block"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-auto object-cover rounded-xl block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                    <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="text-xs font-bold text-white uppercase tracking-wider">{photo.type}</div>
                      <p className="text-[11px] text-stone-300 line-clamp-2 font-medium">{photo.caption}</p>
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

        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
            <Ruler className="w-3.5 h-3.5 text-[#E66A48]" />
            <span>Pengukuran Tubuh & Fitting Specs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">Tinggi Badan</div>
              <div className="text-lg font-black text-[#27213D] mt-0.5">
                {attributes.height_cm ? `${attributes.height_cm} cm` : "-"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Standard Editorial</div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">B-W-H (Dada/Pinggang/Pinggul)</div>
              <div className="text-base font-black text-[#27213D] mt-0.5">
                {attributes.bust_waist_hips || "84-60-89 cm"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Proporsional Lookbook</div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">Ukuran Baju (Sample)</div>
              <div className="text-base font-black text-purple-700 mt-0.5">
                {attributes.clothing_size || "S / 36 EU"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Kesesuaian Busana Desainer</div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-[10px] font-bold text-stone-400 uppercase">Ukuran Sepatu</div>
              <div className="text-base font-black text-[#27213D] mt-0.5">
                {attributes.shoe_size || "39 EU"}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Standard Runway Footwear</div>
            </div>
          </div>

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

        {/* CAPABILITIES & WARDROBE RESTRICTIONS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
          {(attributes.capabilities && attributes.capabilities.length > 0) && (
            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/60 space-y-2">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                Kapabilitas &amp; Ekspresi On-Set:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {attributes.capabilities.map((cap) => (
                  <span key={cap} className="px-2.5 py-0.5 rounded-md bg-white border border-purple-200 text-purple-800 text-[11px] font-semibold">
                    ✓ {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Kebijakan Wardrobe &amp; Akomodasi:
            </span>
            <div className="space-y-1 text-[11px] text-stone-700">
              {attributes.wardrobe_restrictions && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-500 shrink-0">Batasan Wardrobe:</span>
                  <span className="font-bold text-right">{attributes.wardrobe_restrictions}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Pendamping On-Set:</span>
                <span className="font-bold text-emerald-700">
                  {attributes.chaperone_allowed ? "✓ Manajer / Chaperone Diizinkan" : "Independen"}
                </span>
              </div>
              {attributes.travel_radius && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Jangkauan Kerja:</span>
                  <span className="font-semibold text-stone-800">{attributes.travel_radius}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {portfolioGallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
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

          <div className="columns-1 sm:columns-2 gap-3">
            {portfolioGallery.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage({ url: item.url, title: item.title, caption: `${item.role} • ${item.client}` })}
                className="break-inside-avoid mb-3 group cursor-pointer rounded-xl bg-stone-100 border border-stone-200/80 overflow-hidden hover:shadow-xl transition-all relative block"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-auto object-cover rounded-xl block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-2xl bg-white/20 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                        {item.role}
                      </span>
                      <span className="text-[10px] text-stone-300 font-medium">
                        Klien: {item.client}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                    <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-amber-300">
                      <Maximize2 className="w-3 h-3" />
                      <span>Lihat Resolusi Penuh</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-stone-900 rounded-xl overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors shrink-0"
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
