import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function OpportunityShowcase() {
  const opportunities = [
    {
      id: "opp_capsule_01",
      title: "Autumn/Winter Editorial Campaign",
      pattern: "Editorial Fashion",
      roles: [
        { role: "Fashion Designer", asset: "Koleksi Kapsul 12 Looks" },
        { role: "Fotografer Editorial", asset: "Analog 35mm & Medium Format" },
        { role: "Fashion Stylist", asset: "Kurasi Wardrobe & Aksesori" },
      ],
      desc: "Menyatukan label busana dengan fotografer editorial analog dan penata gaya untuk kampanye lookbook majalah dan rilis digital.",
      synergyPoints: ["Moodboard Selaras", "Hak Cipta Jelas", "Kredit Publikasi"],
    },
    {
      id: "opp_shoot_02",
      title: "Commercial Daylight Studio Shoot",
      pattern: "E-Commerce",
      roles: [
        { role: "Label Streetwear", asset: "Koleksi 24 SKU Musim Panas" },
        { role: "Daylight Studio", asset: "Loft 120m² & Lighting Profoto" },
        { role: "Model & MUA", asset: "Karakter Visual & Editorial Glow" },
      ],
      desc: "Produksi katalog e-commerce dan konten video gerak dalam satu hari dengan integrasi fasilitas studio lengkap dan talenta profesional.",
      synergyPoints: ["Efisiensi Waktu", "Alat Studio Lengkap", "Deliverables Terstruktur"],
    },
    {
      id: "opp_collection_03",
      title: "Haute Couture Fashion Film",
      pattern: "Visual Arts",
      roles: [
        { role: "Atelier Busana", asset: "Koleksi Gaun Eksklusif" },
        { role: "Creative Director", asset: "Arahan Sinematik & Storyboard" },
        { role: "Videografer Film", asset: "Kamera Sinema 4K & Sound Scoring" },
      ],
      desc: "Menciptakan karya film pendek mode (fashion film) untuk aktivasi peluncuran koleksi dan submisi kurasi internasional.",
      synergyPoints: ["Portofolio Global", "Kurasi Artistik", "Bagi Hasil Adil"],
    },
  ];

  return (
    <section id="opportunities" className="py-24 md:py-32 bg-stone-50 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-3">
               <span className="w-8 h-px bg-stone-300"></span>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                 Blueprint Kolaborasi
               </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E1B2E] tracking-tight leading-[1.1]">
              Peluang kampanye dari <br className="hidden md:block"/> tim produksi yang <span className="font-serif italic text-stone-500">melengkapi.</span>
            </h2>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-stone-200 text-xs font-semibold uppercase tracking-widest text-[#1E1B2E] hover:bg-stone-200 transition-colors shrink-0 group"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white border border-stone-200 rounded-[24px] p-8 flex flex-col justify-between group hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    {opp.pattern}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-stone-800" />
                </div>

                <h3 className="text-2xl font-light text-[#1E1B2E] tracking-tight mb-4 group-hover:text-stone-500 transition-colors">
                  {opp.title}
                </h3>
                
                <p className="text-sm text-stone-500 leading-relaxed font-light mb-8">
                  {opp.desc}
                </p>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-2 border-b border-stone-100">
                    Komposisi Tim
                  </div>
                  <div className="space-y-3">
                    {opp.roles.map((r, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-[#1E1B2E]">
                          {r.role}
                        </span>
                        <span className="text-xs text-stone-500 font-light">
                          {r.asset}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-stone-100 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {opp.synergyPoints.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] uppercase tracking-wider font-semibold px-2 py-1 bg-stone-100 text-stone-600"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
