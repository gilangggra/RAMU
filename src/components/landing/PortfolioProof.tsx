"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  Building, 
  Users, 
  ExternalLink,
  Layers,
  Award
} from "lucide-react";

export function PortfolioProof() {
  const [filter, setFilter] = useState<string>("ALL");

  const portfolioItems = [
    {
      id: "port-1",
      title: "Lookbook Editorial Musim Semi 2026",
      category: "LOOKBOOK",
      categoryLabel: "Editorial Fashion",
      brand: "Maison Senja x Studio Loft Sudirman",
      collaborators: "Brand Busana + Daylight Studio + Fotografer 35mm",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      metrics: {
        savings: "Hemat Rp 18.500.000",
        score: "96% Fit",
        output: "32 Final Editorial Looks",
      },
      desc: "Kolaborasi antara label busana lokal dengan pemilik studio daylight loft yang idle di hari Selasa. Dilengkapi fotografer analog untuk majalah mode.",
    },
    {
      id: "port-2",
      title: "Katalog E-Commerce 24 SKU Musim Panas",
      category: "ECOMMERCE",
      categoryLabel: "Komersial & E-Commerce",
      brand: "Urban Thread x Studio Cyclorama",
      collaborators: "Streetwear Brand + Studio Cyclorama + Model Editorial",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
      metrics: {
        savings: "Hemat Rp 14.000.000",
        score: "94% Fit",
        output: "24 SKU Reels & Foto",
      },
      desc: "Produksi katalog cepat 1 hari kerja memanfaatkan slot idle studio cyclorama. Menghasilkan aset foto e-commerce dan video reels berdaya jual tinggi.",
    },
    {
      id: "port-3",
      title: "Haute Couture Wastra Tenun Fashion Film",
      category: "FILM",
      categoryLabel: "Fashion Film 4K",
      brand: "Atelier Wastra x Cinema Collective",
      collaborators: "Atelier Gaun + Creative Director + Sinematografer FX3",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
      metrics: {
        savings: "Hemat Rp 22.000.000",
        score: "98% Fit",
        output: "Fashion Film 4K Kurasi",
      },
      desc: "Atelier mode menyumbangkan busana tenun eksklusif ditukar dengan kamera bioskop FX3 dan sound design profesional untuk submisi festival internasional.",
    },
    {
      id: "port-4",
      title: "Kampanye Visual Footwear Minimalis",
      category: "ECOMMERCE",
      categoryLabel: "Komersial Produk",
      brand: "Nusantara Footwear x Still-Life Studio",
      collaborators: "Brand Sepatu + Still-Life Stylist + Lighting Specialist",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop",
      metrics: {
        savings: "Hemat Rp 9.800.000",
        score: "92% Fit",
        output: "18 Flatlay & On-Model",
      },
      desc: "Optimalisasi set lighting studio idle untuk foto katalog alas kaki lokal dengan kualitas visual setara brand global.",
    },
  ];

  const filteredItems = filter === "ALL" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === filter);

  return (
    <section id="portfolio" className="py-20 sm:py-28 bg-[#FAF8F5] relative border-b border-stone-200/60 overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-1/3 w-[500px] h-[500px] bg-[#4CC9FE]/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 mb-4 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Bukti Portofolio &amp; Hasil Nyata
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#27213D] tracking-tight leading-[1.12]">
              Bukti nyata karya kelas atas <br className="hidden sm:block" />
              tanpa <span className="text-[#4CC9FE]">beban modal ratusan juta.</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed">
              Jelajahi hasil produksi kolaborasi riil yang sukses dieksekusi melalui pertukaran aset komplementer dan perlindungan SPK legal terverifikasi.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "Semua Karya" },
              { id: "LOOKBOOK", label: "Editorial Lookbook" },
              { id: "ECOMMERCE", label: "E-Commerce" },
              { id: "FILM", label: "Fashion Film" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filter === btn.id
                    ? "bg-[#27213D] text-white shadow-md shadow-stone-900/10"
                    : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[28px] border border-stone-200/80 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-stone-900/10 hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div>
                {/* Visual Image Preview */}
                <div className="relative h-64 overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Pill Over Image */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#27213D] px-3 py-1 rounded-full border border-stone-200/60 shadow-xs">
                      {item.categoryLabel}
                    </span>
                  </div>

                  {/* Score Pill Over Image */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#27213D]/90 backdrop-blur-md text-[#4CC9FE] px-3 py-1 rounded-full border border-white/10 shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#4CC9FE]" />
                      <span>{item.metrics.score}</span>
                    </span>
                  </div>

                  {/* Savings Badge */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-bold border border-stone-200/80 shadow-md">
                      <span className="text-emerald-700">{item.metrics.savings}</span>
                      <span className="text-stone-500 font-medium text-[11px]">{item.metrics.output}</span>
                    </div>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#27213D] tracking-tight mb-1 group-hover:text-[#0284c7] transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="text-xs font-semibold text-[#4CC9FE] mb-3">
                    {item.brand}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-normal mb-4">
                    {item.desc}
                  </p>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-[11px] text-stone-600 font-medium">
                    <span className="font-bold text-[#27213D]">Mitra:</span> {item.collaborators}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0">
                <Link
                  href="/showcase"
                  className="w-full py-2.5 rounded-xl bg-stone-50 hover:bg-[#27213D] text-[#27213D] hover:text-white border border-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <span>Lihat Dokumentasi Lengkap</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom CTA Link */}
        <div className="mt-12 text-center">
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#27213D] hover:text-[#4CC9FE] transition-colors"
          >
            <span>Jelajahi Puluhan Portofolio Kolaborasi Lainnya di Showcase</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
