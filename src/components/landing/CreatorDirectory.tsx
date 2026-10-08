import React from "react";
import Link from "next/link";
import { ArrowRight, Camera, Palette, Users, Video, Building, Star } from "lucide-react";

const categories = [
  {
    id: "cat-fashion-designer",
    label: "Fashion Designer",
    icon: Palette,
    count: "84 kreator",
    accent: "#3e8363",
    href: "/directory?sector=Fashion%20Designer",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "cat-photographer",
    label: "Fotografer Editorial",
    icon: Camera,
    count: "121 kreator",
    accent: "#FFD45A",
    href: "/directory?sector=Photographer",
    img: "https://images.unsplash.com/photo-1567721913486-6585f069b3e8?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "cat-model",
    label: "Model Profesional",
    icon: Users,
    count: "97 kreator",
    accent: "#D9D2FF",
    href: "/directory?sector=Model",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "cat-videographer",
    label: "Videografer",
    icon: Video,
    count: "63 kreator",
    accent: "#F7C8D0",
    href: "/directory?sector=Videographer",
    img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "cat-studio",
    label: "Studio & Venue",
    icon: Building,
    count: "39 ruang",
    accent: "#BFE9DD",
    href: "/directory?actorType=STUDIO",
    img: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "cat-creative-dir",
    label: "Creative Director",
    icon: Star,
    count: "28 kreator",
    accent: "#C9DDF8",
    href: "/directory?sector=Creative%20Director",
    img: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?q=80&w=500&auto=format&fit=crop",
  },
];

export function CreatorDirectory() {
  return (
    <section id="creator-directory" className="py-24 md:py-36 bg-[#FFFDFC] relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-14">
          <div>
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-[#3e8363]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3e8363]">
                Direktori Terverifikasi
              </span>
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-light text-[#1E1B2E] tracking-tight leading-[1.05]">
              Semua peran dalam{" "}
              <em className="font-serif not-italic text-stone-400">satu ekosistem.</em>
            </h2>
          </div>

          <Link
            href="/directory"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1E1B2E] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#3e8363] transition-all shrink-0"
          >
            <span>Buka Direktori</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isBig = i === 0 || i === 4;
            return (
              <Link
                key={cat.id}
                id={cat.id}
                href={cat.href}
                className={`group relative rounded-[24px] overflow-hidden bg-white border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/60 transition-all duration-500 flex flex-col ${
                  isBig ? "row-span-2" : "row-span-1"
                }`}
                style={{ minHeight: isBig ? "360px" : "170px" }}
              >

                <img
                  src={cat.img}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />

                <div className="relative z-10 p-5 flex flex-col h-full">

                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: cat.accent + "30", border: `1px solid ${cat.accent}50` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: cat.accent }} />
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.accent }}
                    />
                  </div>

                  <div className="mt-auto">
                    <div
                      className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: cat.accent }}
                    >
                      {cat.count}
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-white tracking-tight leading-snug">
                      {cat.label}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-300">Jelajahi</span>
                      <ArrowRight className="w-3 h-3 text-stone-300" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
