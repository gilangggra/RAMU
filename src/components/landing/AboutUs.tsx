"use client";

import React from "react";
import { Users2, Sparkles, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AboutUs() {
  const teamMembers = [
    {
      name: "Gilang Ramadan",
      role: "Founder & Lead Architect",
      focus: "Deterministic Engine & Platform Strategy",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      badge: "Inisiator",
    },
    {
      name: "Sarah Anindita",
      role: "Co-Founder & Creative Director",
      focus: "Fashion Curation & Brand Partnerships",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
      badge: "Ekosistem",
    },
    {
      name: "Dimas Wicaksono",
      role: "Head of Legal & IP Strategy",
      focus: "Smart SPK & Creative Rights Governance",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      badge: "Proteksi Legal",
    },
    {
      name: "Nabila Maharani",
      role: "Head of Community & Production",
      focus: "Studio Matching & Collaborative Operations",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
      badge: "Komunitas",
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FAF8F5] relative border-b border-stone-200/60 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#4CC9FE]/10 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 text-[#0284c7] mb-4 shadow-2xs">
            <Users2 className="w-3.5 h-3.5 text-[#4CC9FE] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#27213D]">
              Tentang Kami &amp; Tim Inisiator
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#27213D] tracking-tight leading-[1.12]">
            Dilahirkan dari keresahan nyata, <br className="hidden sm:block" />
            dibangun untuk <span className="text-[#4CC9FE]">kreator masa depan.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed">
            RAMU dirintis oleh praktisi industri kreatif, desainer produk digital, dan ahli hukum hak cipta yang percaya bahwa kolaborasi sejati tercipta ketika sumber daya yang saling melengkapi dipertemukan secara adil dan terstruktur.
          </p>
        </div>

        {/* Team Grid (Super short & elegant as per Winning Formula) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[28px] border border-stone-200/80 p-5 sm:p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div>
                {/* Team Portrait */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-stone-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[#27213D]/90 backdrop-blur-md text-[#4CC9FE] px-2 py-0.5 rounded-full border border-white/10">
                      {member.badge}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#27213D] tracking-tight mb-1">
                  {member.name}
                </h3>
                
                <div className="text-[11px] sm:text-xs font-semibold text-[#0284c7] mb-2 leading-tight">
                  {member.role}
                </div>

                <p className="text-[11px] text-stone-500 font-normal leading-snug">
                  {member.focus}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Values Strip */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4CC9FE]/15 text-[#4CC9FE] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-[#4CC9FE]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#27213D]">
                Nilai Utama Kami: Saling Melengkapi, Bukan Saling Menyaingi
              </div>
              <div className="text-[11px] text-[#716B7E]">
                Setiap studio, kamera, dan sampel busana memiliki nilai ekonomi saat dipertemukan dengan mitra yang tepat.
              </div>
            </div>
          </div>

          <Link
            href="/register"
            className="text-xs font-bold text-[#0284c7] hover:text-[#27213D] flex items-center gap-1.5 transition-colors shrink-0 group/link"
          >
            <span>Bergabung Bersama Kami</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
