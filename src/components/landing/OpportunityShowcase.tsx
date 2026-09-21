import React from "react";
import Link from "next/link";
import {
  Layers,
  Briefcase,
  Gem,
  Shirt,
  Camera,
  Building2,
  Palette,
  PenTool,
  Smartphone,
  ArrowRight,
} from "lucide-react";

export function OpportunityShowcase() {
  const opportunities = [
    {
      id: "opp_capsule_01",
      title: "Autumn/Winter Editorial Campaign",
      pattern: "Editorial Fashion Campaign",
      badge: "● Potensial Tinggi (94%)",
      badgeClass: "bg-[#EDFAF5] text-[#134e40] border-[#BFE9DD]",
      bgVisualClass: "from-[#F7C8D0]/30 via-[#FFF7ED] to-[#FFD45A]/25",
      roles: [
        { role: "Fashion Designer", asset: "Koleksi Kapsul 12 Looks" },
        { role: "Fotografer Editorial", asset: "Analog 35mm & Medium Format" },
        { role: "Fashion Stylist", asset: "Kurasi Wardrobe & Aksesori" },
      ],
      desc: "Menyatukan label busana dengan fotografer editorial analog dan penata gaya untuk kampanye lookbook majalah dan rilis digital.",
      synergyPoints: ["Moodboard Selaras", "Hak Cipta Jelas", "Kredit Publikasi"],
      visualType: "shoot",
    },
    {
      id: "opp_shoot_02",
      title: "Commercial Daylight Studio Shoot",
      pattern: "E-Commerce & Lookbook Production",
      badge: "● Keselarasan Optimal (96%)",
      badgeClass: "bg-[#F4F0FF] text-[#3e2794] border-[#D9D2FF]",
      bgVisualClass: "from-[#D9D2FF]/30 via-[#FFFDFC] to-[#C9DDF8]/30",
      roles: [
        { role: "Label Streetwear", asset: "Koleksi 24 SKU Musim Panas" },
        { role: "Daylight Studio", asset: "Loft 120m² & Lighting Profoto" },
        { role: "Model & MUA", asset: "Karakter Visual & Editorial Glow" },
      ],
      desc: "Produksi katalog e-commerce dan konten video gerak dalam satu hari dengan integrasi fasilitas studio lengkap dan talenta profesional.",
      synergyPoints: ["Efisiensi Waktu", "Alat Studio Lengkap", "Deliverables Terstruktur"],
      visualType: "heritage",
    },
    {
      id: "opp_collection_03",
      title: "Haute Couture Fashion Film",
      pattern: "Visual Arts & Runway Showcase",
      badge: "● Terverifikasi Layak (89%)",
      badgeClass: "bg-[#FFF3EB] text-[#85390c] border-[#F9D8C4]",
      bgVisualClass: "from-[#BFE9DD]/30 via-[#FFFDFC] to-[#F9D8C4]/35",
      roles: [
        { role: "Atelier Busana", asset: "Koleksi Gaun Eksklusif" },
        { role: "Creative Director", asset: "Arahan Sinematik & Storyboard" },
        { role: "Videografer Film", asset: "Kamera Sinema 4K & Sound Scoring" },
      ],
      desc: "Menciptakan karya film pendek mode (fashion film) untuk aktivasi peluncuran koleksi dan submisi kurasi internasional.",
      synergyPoints: ["Portofolio Global", "Kurasi Artistik", "Bagi Hasil Adil"],
      visualType: "craft",
    },
  ];

  return (
    <section
      id="opportunities"
      className="py-24 md:py-32 relative bg-[#FFFDFC]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-center justify-center gap-2 mb-8 select-none" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold uppercase tracking-wider text-[#27213D] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
              <span>Portofolio Kampanye • Formula Tim Produksi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#27213D] tracking-tight">
              Peluang nyata dari tim produksi fashion yang saling melengkapi.
            </h2>
            <p className="text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed">
              Jelajahi cetak biru kolaborasi konkret yang diramu oleh Engine RAMU
              berdasarkan ketersediaan alat, gaya visual, dan kapasitas studio nyata.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-sm font-bold text-[#27213D] shadow-xs transition-all hover:shadow hover:-translate-y-0.5 shrink-0 self-start md:self-end group"
          >
            <span>Lihat Semua Peluang</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-[32px] bg-white border border-stone-200/70 p-7 sm:p-8 shadow-[0_8px_30px_rgba(39,33,61,0.04)] hover:shadow-[0_20px_48px_rgba(39,33,61,0.09)] transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-full h-44 rounded-2xl bg-gradient-to-br ${opp.bgVisualClass} border border-stone-100 p-5 flex flex-col justify-between relative overflow-hidden mb-6`}
                >
                  <div className="absolute top-2 right-2 w-24 h-24 rounded-full bg-white/40 blur-xl pointer-events-none" />

                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 text-[#27213D] shadow-xs">
                      {opp.pattern}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${opp.badgeClass}`}
                    >
                      {opp.badge}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center justify-center gap-3 py-2">
                    {opp.visualType === "heritage" && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Layers className="w-5 h-5 text-[#8B5CF6]" />
                        </div>
                        <span className="text-[#27213D] font-bold text-sm">+</span>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Briefcase className="w-5 h-5 text-[#F97316]" />
                        </div>
                        <span className="text-[#27213D] font-bold text-sm">+</span>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Gem className="w-5 h-5 text-[#10B981]" />
                        </div>
                      </div>
                    )}

                    {opp.visualType === "shoot" && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Shirt className="w-5 h-5 text-[#8B5CF6]" />
                        </div>
                        <span className="text-[#27213D] font-bold text-sm">+</span>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Camera className="w-5 h-5 text-[#0EA5E9]" />
                        </div>
                        <span className="text-[#27213D] font-bold text-sm">+</span>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Building2 className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                      </div>
                    )}

                    {opp.visualType === "craft" && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Palette className="w-5 h-5 text-[#10B981]" />
                        </div>
                        <span className="text-[#27213D] font-bold text-sm">+</span>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <PenTool className="w-5 h-5 text-[#EC4899]" />
                        </div>
                        <span className="text-[#27213D] font-bold text-sm">+</span>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#27213D]">
                          <Smartphone className="w-5 h-5 text-[#6366F1]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[11px] font-semibold text-[#716B7E]">
                    <span>3 Aktor Komplementer</span>
                    <span className="text-[#134e40] font-bold">Siap Dibentuk</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#27213D] tracking-tight group-hover:text-[#422006] transition-colors">
                    {opp.title}
                  </h3>
                  <p className="text-sm text-[#716B7E] leading-relaxed">
                    {opp.desc}
                  </p>
                </div>

                <div className="mt-5 pt-5 border-t border-stone-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#716B7E]">
                    Peran Kolaboratif
                  </div>
                  <div className="space-y-1.5">
                    {opp.roles.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-stone-50 border border-stone-100"
                      >
                        <span className="font-semibold text-[#27213D]">
                          {r.role}
                        </span>
                        <span className="text-[11px] text-[#716B7E]">
                          {r.asset}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {opp.synergyPoints.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-medium px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#27213D] border border-[#F9D8C4]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/opportunities`}
                  className="w-9 h-9 rounded-full bg-[#FFB800] hover:bg-[#FFA800] flex items-center justify-center text-[#1E1B2E] font-bold text-xs shadow-xs group-hover:scale-110 transition-transform shrink-0"
                  aria-label="Lihat Detail Peluang"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
