"use client";

import React from "react";
import { Quote, Sparkles, TrendingUp, ShieldCheck, Star } from "lucide-react";

export function CollaborationStories() {
  const testimonials = [
    {
      title: "Kampanye Lookbook Kapsul 12 Looks",
      brand: "Maison Senja x Studio Loft Menteng",
      quote:
        "Sebelumnya kami harus menyewa studio seharga jutaan per jam dan mencari kru satu per satu secara acak. Melalui RAMU, kami dipasangkan dengan studio yang sedang idle dan fotografer analog yang butuh portofolio komersial. Biaya terpangkas 65% dengan hasil visual luar biasa.",
      author: "Adinda Putri",
      role: "Founder & Creative Lead, Maison Senja",
      savings: "Hemat Rp 16.500.000",
      stats: "30 Looks • 1 Hari Produksi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      rating: 5,
    },
    {
      title: "Katalog E-Commerce & Video Reels 24 SKU",
      brand: "Urban Thread x Fotografer Komersial",
      quote:
        "Sebagai fotografer yang memiliki kamera sinema FX3 dan lighting lengkap, sering kali gear saya hanya tersimpan di lemari saat hari kerja. RAMU mempertemukan saya dengan brand lokal yang butuh katalog cepat. Sistem SPK otomatisnya membuat pembagian hak pakai dan royalti sangat transparan.",
      author: "Rendra Kusuma",
      role: "Commercial Photographer & Videographer",
      savings: "Aktivasi Gear Idle 100%",
      stats: "24 SKU Selesai • 100% Hak Cipta Jelas",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      rating: 5,
    },
    {
      title: "Fashion Film Kurasi Internasional",
      brand: "Wastra Tenun Atelier x Creative Director",
      quote:
        "Kolaborasi ini bukan sekadar barter biasa, melainkan simbiosis mutualisme nyata. Kami mengkontribusikan gaun tenun handmade bernilai tinggi, sementara mitra kami mengkontribusikan kamera cinema dan sound design. Karya kami sukses menembus kurasi pameran visual.",
      author: "Tara Dewanto",
      role: "Head of Design, Atelier Wastra",
      savings: "Efisiensi 58% Anggaran",
      stats: "Fashion Film 4K • Tembus Kurasi",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white relative border-b border-stone-200/60 overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -left-20 w-[450px] h-[450px] bg-[#4CC9FE]/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#D9D2FF]/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 text-[#0284c7] mb-4 shadow-2xs">
            <Quote className="w-3.5 h-3.5 text-[#4CC9FE] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#27213D]">
              Testimoni Kolaborator
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#27213D] tracking-tight leading-[1.12]">
            Dengar langsung pengalaman riil <br className="hidden sm:block" />
            dari <span className="text-[#4CC9FE]">pelaku industri di RAMU.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed">
            Brand mode, fotografer, dan pemilik studio membuktikan bagaimana efisiensi biaya dan aktivasi aset idle mengubah jalannya bisnis mereka.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F5] rounded-[28px] border border-stone-200/80 p-7 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1 transition-all duration-300 relative group"
            >
              <div>
                {/* Metric Badges */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
                    {item.savings}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#27213D] tracking-tight mb-1">
                  {item.title}
                </h3>
                
                <div className="text-xs text-[#0284c7] font-semibold mb-4">
                  {item.brand}
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-5 border-t border-stone-200/60 flex items-center gap-3.5">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#27213D]">
                    {item.author}
                  </div>
                  <div className="text-[11px] text-[#716B7E] font-medium leading-tight">
                    {item.role}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Kolaborasi Terverifikasi</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
