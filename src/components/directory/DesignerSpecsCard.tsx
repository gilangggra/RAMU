"use client";

import React, { useState } from "react";
import {
  PenTool,
  Monitor,
  LayoutTemplate,
  Layers,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react";

interface PortfolioGalleryItem {
  title: string;
  url: string;
  role: string;
  client: string;
  caption?: string;
}

export interface DesignerAttributes {
  primary_software?: string[];
  design_disciplines?: string[];
  deliverables?: string[];
  style_dna?: string;
  rate_starting_at?: string;
  portfolio_gallery?: PortfolioGalleryItem[];
}

interface DesignerSpecsCardProps {
  attributes: DesignerAttributes;
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

export function DesignerSpecsCard({ attributes, actorName, isCurrentActor, actorAssets }: DesignerSpecsCardProps) {
  const portfolioWorks: PortfolioGalleryItem[] = (actorAssets || [])
    .filter((a) => a.category === "PORTFOLIO_WORK")
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      const tearSheet = (attrs?.tear_sheet && typeof attrs.tear_sheet === "object") ? (attrs.tear_sheet as Record<string, unknown>) : null;
      return {
        title: a.name,
        url: (attrs?.image_url as string) || "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1000&q=80",
        role: (attrs?.role as string) || a.subtype || "Desainer Grafis / Visual",
        client: (tearSheet?.client as string) || (attrs?.client as string) || "Karya Portofolio",
        caption: a.description || undefined,
      };
    });

  const portfolioGallery = (attributes.portfolio_gallery && attributes.portfolio_gallery.length > 0)
    ? attributes.portfolio_gallery
    : portfolioWorks;

  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  return (
    <div className="space-y-8">

      <section className="p-7 sm:p-8 rounded-none bg-white/95 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-pink-50 border border-pink-200 text-xs font-bold text-pink-700">
              <PenTool className="w-3.5 h-3.5" />
              <span>Design Discipline & Software</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Kapabilitas Desain {actorName}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {attributes.rate_starting_at && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-stone-50 border border-stone-200/80 text-xs font-semibold text-[#27213D]">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Tarif Mulai: {attributes.rate_starting_at}</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-none bg-stone-50 border border-stone-200/70 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Software Mastery</span>
            </div>
            <ul className="text-xs font-semibold text-[#27213D] space-y-1">
              {(attributes.primary_software || ["Adobe Illustrator", "Figma"]).slice(0, 4).map((sw, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{sw}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-none bg-stone-50 border border-stone-200/70 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <LayoutTemplate className="w-4 h-4 text-pink-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Disiplin Desain</span>
            </div>
            <ul className="text-xs font-semibold text-[#27213D] space-y-1">
              {(attributes.design_disciplines || ["Brand Identity", "Packaging Design"]).slice(0, 4).map((disc, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>{disc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-none bg-stone-50 border border-stone-200/70 space-y-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Deliverables Standar</span>
            </div>
            <ul className="text-xs font-semibold text-[#27213D] space-y-1">
              {(attributes.deliverables || ["Vector Print-Ready", "Brand Guidelines PDF"]).slice(0, 4).map((del, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {attributes.style_dna && (
          <div className="p-5 rounded-none bg-stone-50 border border-stone-200/70 space-y-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase">DNA Estetika Visual</span>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {attributes.style_dna}
            </p>
          </div>
        )}
      </section>

      {portfolioGallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-none bg-white/95 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <ImageIcon className="w-4 h-4 text-pink-500" />
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Galeri Karya & Klien
            </h2>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
            {portfolioGallery.map((item, idx) => (
              <div
                key={idx}
                className="break-inside-avoid mb-3 group relative cursor-pointer overflow-hidden rounded-none bg-stone-100 border border-stone-200/80 block hover:shadow-xl transition-all"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-auto object-cover rounded-none block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-bold text-white uppercase tracking-wide">
                      <CheckCircle2 className="w-3 h-3 text-pink-300" />
                      <span>{item.client}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">{item.title}</h3>
                    <p className="text-xs text-stone-300 font-medium">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-none shadow-2xl"
            />
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center text-white rounded-none">
              <h3 className="text-lg font-bold">{selectedImage.title}</h3>
              {selectedImage.caption && <p className="text-sm text-stone-300 mt-1">{selectedImage.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
