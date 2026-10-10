import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Users, Sparkles, Building2, Layers } from "lucide-react";

export function OpportunityShowcase() {
  const opportunities = [
    {
      id: "opp_capsule_01",
      title: "Autumn/Winter Editorial Lookbook",
      pattern: "Editorial Fashion",
      compensation: "Barter Portofolio & Kredit",
      slotsOpen: "1 Slot Tersedia",
      roles: [
        { role: "Fashion Brand", asset: "Koleksi Kapsul 12 Looks Baru", filled: true },
        { role: "Fotografer Analog", asset: "Kamera 35mm & Medium Format", filled: true },
        { role: "Fashion Stylist", asset: "Kurasi Aksesori & Wardrobe", filled: false },
      ],
      desc: "Menyatukan label busana independen dengan fotografer analog dan penata gaya untuk kampanye majalah digital dan katalog cetak.",
      synergyPoints: ["Moodboard Selaras", "Hak Cipta Jelas", "Kredit Publikasi"],
    },
    {
      id: "opp_shoot_02",
      title: "Commercial Daylight E-Commerce Shoot",
      pattern: "Komersial & E-Commerce",
      compensation: "Bagi Hasil Penjualan (Revenue Share)",
      slotsOpen: "1 Slot Tersedia",
      roles: [
        { role: "Label Streetwear", asset: "Koleksi 24 SKU Musim Panas", filled: true },
        { role: "Daylight Studio", asset: "Loft 120m² & Lighting Profoto", filled: true },
        { role: "Model Editorial", asset: "Karakter Visual & Editorial Glow", filled: false },
      ],
      desc: "Produksi katalog e-commerce dan video reels dalam 1 hari dengan integrasi fasilitas studio lengkap dan talenta profesional.",
      synergyPoints: ["Efisiensi 1 Hari", "Alat Studio Lengkap", "Deliverables Terstruktur"],
    },
    {
      id: "opp_collection_03",
      title: "Haute Couture Fashion Film & Teaser",
      pattern: "Karya Seni Sinematik",
      compensation: "Co-Branding & Submisi Festival",
      slotsOpen: "Semua Terisi (Arsip)",
      roles: [
        { role: "Atelier Busana", asset: "Koleksi Gaun Eksklusif 6 Looks", filled: true },
        { role: "Creative Director", asset: "Arahan Sinematik & Storyboard", filled: true },
        { role: "Videografer Sinema", asset: "Kamera Sinema 4K & Sound Scoring", filled: true },
      ],
      desc: "Menciptakan karya film pendek mode (fashion film) untuk aktivasi peluncuran koleksi dan submisi kurasi karya visual internasional.",
      synergyPoints: ["Portofolio Global", "Kurasi Artistik", "Bagi Hasil Adil"],
    },
  ];

  return (
    <section id="opportunities" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
                Peluang Kolaborasi Terbuka
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1E1B2E] tracking-tight leading-[1.15]">
              Struktur proyek produksi dari <br className="hidden sm:block" />
              <span className="font-serif italic font-normal text-amber-700/90">
                sumber daya yang saling melengkapi.
              </span>
            </h2>

            <p className="mt-4 text-base text-stone-600 font-normal leading-relaxed">
              Lihat bagaimana pelaku kreatif lain menyusun tim kolaborasi produksi tanpa modal miliaran rupiah.
            </p>
          </div>

          <Link
            href="/projects"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md shrink-0"
          >
            <span>Jelajahi Semua Proyek</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-300" />
          </Link>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-stone-50/70 border border-stone-200/80 rounded-3xl p-7 flex flex-col justify-between hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                {/* Meta Top Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-white px-2.5 py-1 rounded-lg border border-stone-200/60 shadow-2xs">
                    {opp.pattern}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                    opp.slotsOpen.includes("Tersedia")
                      ? "text-emerald-800 bg-emerald-100/70"
                      : "text-stone-500 bg-stone-200/70"
                  }`}>
                    {opp.slotsOpen}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight mb-2 group-hover:text-amber-700 transition-colors">
                  {opp.title}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed font-normal mb-6">
                  {opp.desc}
                </p>

                {/* Team Composition Tracker */}
                <div className="space-y-3 p-4 rounded-2xl bg-white border border-stone-200/60 mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-100 flex items-center justify-between">
                    <span>Komposisi Tim</span>
                    <span>Status Slot</span>
                  </div>
                  
                  {opp.roles.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1E1B2E]">{r.role}</span>
                        <span className="text-[11px] text-stone-500 font-light">{r.asset}</span>
                      </div>
                      <div>
                        {r.filled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Terisi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md animate-pulse">
                            Dicari
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-stone-200/60">
                <div className="text-[10px] uppercase font-bold text-stone-400 mb-2">
                  Model Kerjasama: <strong className="text-stone-700 font-semibold">{opp.compensation}</strong>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {opp.synergyPoints.map((point, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-stone-200/60 text-stone-700 rounded-md"
                    >
                      {point}
                    </span>
                  ))}
                </div>

                <Link
                  href="/projects"
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-[#1E1B2E] text-[#1E1B2E] hover:text-white border border-stone-300 text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <span>Lihat Kebutuhan Proyek</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
