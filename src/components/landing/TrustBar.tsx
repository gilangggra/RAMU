import React from "react";
import { ShieldCheck, Sparkles, Layers, Zap, Users2, Building2 } from "lucide-react";

export function TrustBar() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "SPK & Hak Cipta Terproteksi",
      desc: "Kesepakatan legal digital otomatis",
    },
    {
      icon: Zap,
      title: "Deterministic Engine",
      desc: "Kecocokan aset 4 pilar objektif",
    },
    {
      icon: Layers,
      title: "Aktivasi Kapasitas Idle",
      desc: "Studio & gear berdaya guna",
    },
    {
      icon: Users2,
      title: "Ekosistem Terkurasi",
      desc: "Brand, kreator, dan studio terverifikasi",
    },
  ];

  return (
    <section className="border-y border-stone-200/70 bg-[#FAF8F5]/80 backdrop-blur-sm py-8 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 group p-2 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center shrink-0 text-[#1E1B2E] group-hover:bg-[#1E1B2E] group-hover:text-amber-300 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E1B2E] tracking-tight">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-stone-500 font-light leading-snug">
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
