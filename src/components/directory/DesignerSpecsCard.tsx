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
}

export function DesignerSpecsCard({ attributes, actorName }: DesignerSpecsCardProps) {
  const portfolioGallery = attributes.portfolio_gallery || [];
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  return (
    <div className="space-y-8">
      {/* 1. Design DNA & Skills Section */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-pink-700">
              <PenTool className="w-3.5 h-3.5" />
              <span>Design Discipline & Software</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Kapabilitas Desain {actorName}
            </h2>
          </div>
          
          {attributes.rate_starting_at && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs font-semibold text-[#27213D] shrink-0">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Tarif Mulai: {attributes.rate_starting_at}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
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

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
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

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
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
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase">DNA Estetika Visual</span>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {attributes.style_dna}
            </p>
          </div>
        )}
      </section>

      {/* 2. Portfolio Gallery Section */}
      {portfolioGallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <ImageIcon className="w-4 h-4 text-pink-500" />
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
                      <CheckCircle2 className="w-3 h-3 text-pink-300" />
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
