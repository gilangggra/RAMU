import React from "react";
import Link from "next/link";
import { ArrowRight, Camera, Sparkles, Users, Video, Building, Wand2 } from "lucide-react";

const categories = [
  {
    id: "cat-fashion-brand",
    label: "Fashion Brand & UMKM",
    subtitle: "Koleksi Pakaian & Sampel Look",
    icon: Building,
    count: "84+ Brand",
    tag: "Aset Busana",
    href: "/directory?sector=Fashion%20Brand/UMKM",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-photographer",
    label: "Fotografer Editorial",
    subtitle: "Analog 35mm, Digital & Komersial",
    icon: Camera,
    count: "120+ Fotografer",
    tag: "Kamera & Lighting",
    href: "/directory?sector=Photographer",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-studio",
    label: "Daylight Studio & Venue",
    subtitle: "Loft Alami, Cyclorama & Ruang Rias",
    icon: Building,
    count: "42+ Studio",
    tag: "Kapasitas Idle",
    href: "/directory?actorType=STUDIO",
    img: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-model",
    label: "Model Profesional",
    subtitle: "Editorial, Komersial & Runway",
    icon: Users,
    count: "95+ Model",
    tag: "Talenta & Karakter",
    href: "/directory?sector=Model",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-stylist",
    label: "Fashion Stylist & MUA",
    subtitle: "Kurasi Wardrobe & Tata Rias Editorial",
    icon: Wand2,
    count: "64+ Stylist/MUA",
    tag: "Keahlian Spesifik",
    href: "/directory?sector=Fashion%20Stylist",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-videographer",
    label: "Videografer & Sinema",
    subtitle: "Fashion Film 4K & Konten Kampanye",
    icon: Video,
    count: "58+ Kreator",
    tag: "Gear Sinematik",
    href: "/directory?sector=Videographer",
    img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop",
  },
];

export function CreatorDirectory() {
  return (
    <section id="creator-directory" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
                Direktori Komprehensif
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1E1B2E] tracking-tight leading-[1.1]">
              Semua peran &amp; aset dalam <br />
              <span className="font-serif italic font-normal text-amber-700/90">satu ekosistem terpadu.</span>
            </h2>
          </div>

          <Link
            href="/directory"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md shrink-0"
          >
            <span>Buka Direktori Lengkap</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-300" />
          </Link>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                id={cat.id}
                href={cat.href}
                className="group relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-200/50 shadow-sm hover:shadow-2xl hover:shadow-stone-900/15 transition-all duration-500 flex flex-col justify-end min-h-[300px]"
              >
                {/* Background Image with Zoom Effect */}
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-700"
                  loading="lazy"
                />

                {/* Dark Vignette Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent group-hover:from-stone-950/95 transition-all duration-300" />

                {/* Card Content */}
                <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {cat.tag}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-300/30">
                      {cat.count}
                    </span>
                  </div>

                  {/* Bottom Titles */}
                  <div className="mt-auto pt-12">
                    <div className="flex items-center gap-2 mb-1.5 text-stone-300 text-xs font-light">
                      <Icon className="w-3.5 h-3.5 text-amber-300" />
                      <span>{cat.subtitle}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                      {cat.label}
                    </h3>
                    
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 uppercase tracking-wider opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      <span>Jelajahi Profil</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
