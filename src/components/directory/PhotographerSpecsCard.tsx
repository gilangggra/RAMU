"use client";

import React, { useState } from "react";
import {
  Camera,
  Aperture,
  Video,
  MonitorPlay,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Maximize2,
  X,
  Layers,
  Sliders,
  Eye,
} from "lucide-react";

export interface PortfolioGalleryItem {
  title: string;
  url: string;
  role: string;
  client: string;
  caption?: string;
}

export interface GearShowcaseItem {
  id?: string;
  name: string;
  category: string;
  specs: string;
  tag?: string;
  condition?: string;
  imageUrl: string;
}

export interface PhotographerAttributes {
  primary_camera?: string;
  secondary_camera?: string;
  lenses?: string[];
  lighting_gear?: string[];
  drone_aerial?: boolean;
  video_format?: string;
  editing_software?: string[];
  specialties?: string[];
  delivery_time_days?: number;
  rate_starting_at?: string;
  gear_showcase?: GearShowcaseItem[];
  portfolio_gallery?: PortfolioGalleryItem[];
}

interface PhotographerSpecsCardProps {
  attributes: PhotographerAttributes;
  actorName: string;
  actorAssets?: Array<{
    id: string;
    name: string;
    category: string;
    subtype: string;
    description?: string | null;
    attributes?: Record<string, unknown> | null;
  }>;
}

// Curated default high-end gear proof items
const DEFAULT_GEAR_SHOWCASE: GearShowcaseItem[] = [
  {
    id: "gear-cam-1",
    name: "Sony Alpha A7R V (61MP Full-Frame)",
    category: "Kamera Utama",
    specs: "Sensor 61MP Exmor R BSI CMOS • 8K 24p / 4K 60p 10-bit 4:2:2 • AI Autofocus Real-Time Tracking • Dual Slot CFexpress Type-A",
    tag: "Primary Body",
    condition: "Kondisi Prima (Mint 10/10) • Sensor Cleaned",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gear-lens-1",
    name: "Sony FE 24-70mm f/2.8 GM II",
    category: "Lensa Zoom Unggulan",
    specs: "Aperture f/2.8 Constant • Elemen XA (Extreme Aspherical) • Nano AR Coating II • Linear XD Motor • Filter 82mm",
    tag: "Workhorse Zoom",
    condition: "Optik Bersih Bebas Jamur • Kalibrasi Presisi",
    imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gear-lens-2",
    name: "Sony FE 85mm f/1.4 GM (Portrait Prime)",
    category: "Lensa Prime Portrait",
    specs: "Aperture f/1.4 Ultra-Fast • 11-Blade Circular Bokeh • ED Glass Element • Ideal untuk Foto Fashion & Beauty Editorial",
    tag: "Editorial Character",
    condition: "Creamy Bokeh • Resolusi Sudut-ke-Sudut Maksimal",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gear-lens-3",
    name: "Sony FE 90mm f/2.8 Macro G OSS",
    category: "Lensa Makro & Detail",
    specs: "Rasio Perbesaran 1:1 True Macro • Optical SteadyShot • Resolusi Ekstrem untuk Tekstur Kain Wastra & Detail Perhiasan",
    tag: "Macro Specialist",
    condition: "Fokus Internal • Direct Drive SSM",
    imageUrl: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gear-light-1",
    name: "Godox AD600 Pro TTL Strobe Kit (x2)",
    category: "Lighting & Modifiers",
    specs: "Daya 600Ws • High-Speed Sync 1/8000s • Bowens Mount • 120cm Octabox Grid & Stripbox 35x160cm • Heavy C-Stand Kupo",
    tag: "Studio Strobe",
    condition: "Wireless Trigger XPro-S • Baterai Lithium 360 Full Flash",
    imageUrl: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gear-tether-1",
    name: "Tethering Station & Capture One Pro",
    category: "Digital Workstation",
    specs: "Apple MacBook Pro M3 Max • EIZO ColorEdge 27\" Calibrated Display • TetherPro High-Visibility USB-C • Capture One Pro Live Feed",
    tag: "Live Client Preview",
    condition: "Kalibrasi Warna Delta-E < 1 • Real-Time Grading On-Set",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
  },
];

export function PhotographerSpecsCard({ attributes, actorName, actorAssets }: PhotographerSpecsCardProps) {
  const portfolioGallery = attributes.portfolio_gallery || [];
  
  // Extract custom equipment/gear registered directly by the actor in their assets
  const registeredGearItems: GearShowcaseItem[] = (actorAssets || [])
    .filter((a) => {
      // Strictly ignore artworks and portfolio items
      if (a.category === "PORTFOLIO_WORK") return false;
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      return (
        a.category === "EQUIPMENT" ||
        a.subtype.toLowerCase().includes("kamera") ||
        a.subtype.toLowerCase().includes("lensa") ||
        a.subtype.toLowerCase().includes("lighting") ||
        Boolean(attrs?.gear_specs)
      );
    })
    .map((a) => {
      const attrs = (a.attributes && typeof a.attributes === "object") ? (a.attributes as Record<string, unknown>) : null;
      let photo = (attrs?.image_url as string) || (attrs?.photo_url as string) || null;
      if (!photo) {
        if (a.name.toLowerCase().includes("lensa") || a.subtype.toLowerCase().includes("lensa")) {
          photo = "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=80";
        } else if (a.name.toLowerCase().includes("light") || a.subtype.toLowerCase().includes("light")) {
          photo = "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?auto=format&fit=crop&w=1000&q=80";
        } else {
          photo = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80";
        }
      }

      return {
        id: a.id,
        name: a.name,
        category: a.subtype || "Peralatan Produksi",
        specs: (attrs?.gear_specs as string) || a.description || "Peralatan operasional terdaftar di ekosistem RAMU",
        tag: "Terdaftar di Profil",
        condition: (attrs?.condition as string) || "Siap On-Set",
        imageUrl: photo,
      };
    });

  // Combine user-registered gear with base gear showcase
  const baseGear = (attributes.gear_showcase && attributes.gear_showcase.length > 0)
    ? attributes.gear_showcase
    : DEFAULT_GEAR_SHOWCASE;

  const gearShowcase = [
    ...registeredGearItems,
    ...baseGear.filter((bg) => !registeredGearItems.some((rg) => rg.name.toLowerCase() === bg.name.toLowerCase())),
  ];

  const [selectedGear, setSelectedGear] = useState<GearShowcaseItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const categories = ["ALL", ...Array.from(new Set(gearShowcase.map((g) => g.category)))];

  const filteredGear = filterCategory === "ALL"
    ? gearShowcase
    : gearShowcase.filter((g) => g.category === filterCategory);

  return (
    <div className="space-y-10">
      {/* 1. Header Overview & Rate Card */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <Camera className="w-3.5 h-3.5" />
              <span>Technical &amp; Production Gear Proof</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E1B2E] tracking-tight">
              Peralatan Produksi &amp; Bukti Fisik Kamera {actorName}
            </h2>
            <p className="text-xs text-stone-500">
              Seluruh optik kamera dan tata lampu di bawah ini telah terverifikasi fisik dan siap dipakai untuk produksi editorial maupun komersial.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {attributes.rate_starting_at && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <MonitorPlay className="w-4 h-4 text-emerald-600" />
                <span>Tarif: {attributes.rate_starting_at}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-stone-100 text-stone-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Hardware On-Set Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/70 space-y-2">
            <div className="flex items-center gap-2 text-stone-500">
              <Aperture className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Kamera Utama</span>
            </div>
            <div className="text-sm font-black text-[#1E1B2E] leading-snug">
              {attributes.primary_camera || "Sony Alpha A7R V (61MP Full-Frame)"}
            </div>
            <div className="text-[11px] text-stone-500">
              Backup: {attributes.secondary_camera || "Sony Alpha A7 IV (33MP)"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/70 space-y-2">
            <div className="flex items-center gap-2 text-stone-500">
              <Camera className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Lensa G-Master</span>
            </div>
            <div className="text-sm font-black text-[#1E1B2E] leading-snug">
              {(attributes.lenses && attributes.lenses.length) ? `${attributes.lenses.length} Lensa Prime & Zoom` : "3 Lensa Prime & Zoom"}
            </div>
            <div className="text-[11px] text-stone-500 truncate">
              {(attributes.lenses || ["24-70mm GM II", "85mm f/1.4 GM"]).slice(0, 2).join(", ")}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/70 space-y-2">
            <div className="flex items-center gap-2 text-stone-500">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Lighting Studio</span>
            </div>
            <div className="text-sm font-black text-[#1E1B2E] leading-snug">
              600Ws High-Speed Sync
            </div>
            <div className="text-[11px] text-stone-500 truncate">
              {(attributes.lighting_gear || ["2x Godox AD600 Pro", "Octabox 120cm"]).slice(0, 1).join("")}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/70 space-y-2">
            <div className="flex items-center gap-2 text-stone-500">
              <Video className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Format Video &amp; Drone</span>
            </div>
            <div className="text-sm font-black text-[#1E1B2E] leading-snug">
              {attributes.video_format || "4K 60fps 10-bit 4:2:2"}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>S-Log3 / S-Cinetone Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMINENT SECTION: VISUAL GEAR PROOF GALLERY */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Galeri Bukti Fisik Peralatan</span>
            </div>
            <h3 className="text-xl font-black text-[#1E1B2E] tracking-tight">
              Koleksi Kamera, Lensa Optik &amp; Tata Cahaya On-Set
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Klik pada kartu peralatan untuk memeriksa foto close-up detail dan spesifikasi teknisnya.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterCategory === cat
                    ? "bg-[#1E1B2E] text-white shadow-xs"
                    : "text-stone-600 hover:text-[#1E1B2E] hover:bg-stone-200/60"
                }`}
              >
                {cat === "ALL" ? "Semua Peralatan" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gear Grid with Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGear.map((gear) => (
            <div
              key={gear.id || gear.name}
              onClick={() => setSelectedGear(gear)}
              className="group relative rounded-3xl bg-stone-50 border border-stone-200/80 overflow-hidden hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Gear Photo */}
              <div className="relative aspect-[4/3] w-full bg-stone-200 overflow-hidden">
                <img
                  src={gear.imageUrl}
                  alt={gear.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Badges on Image */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                    {gear.category}
                  </span>
                  {gear.tag && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[9px] font-black uppercase tracking-wider self-start">
                      {gear.tag}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-bold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Klik untuk periksa detail fisik</span>
                  </span>
                </div>
              </div>

              {/* Gear Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                <div>
                  <h4 className="text-base font-black text-[#1E1B2E] group-hover:text-amber-600 transition-colors leading-snug">
                    {gear.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {gear.specs}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hardware Ready</span>
                  </span>
                  {gear.condition && (
                    <span className="text-stone-400 font-medium truncate max-w-[150px]">
                      {gear.condition.split("•")[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Video Showreel & BTS Section */}
      <section className="p-7 sm:p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xl font-black text-[#1E1B2E] tracking-tight">
              Video Showreel &amp; Behind The Scenes
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            Dokumentasi Alur Kerja On-Set
          </span>
        </div>
        
        <div className="w-full aspect-video rounded-3xl bg-stone-900 overflow-hidden relative group cursor-pointer border border-stone-200/50 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80"
            alt="Behind the scenes on set"
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-[#1E1B2E] ml-1" />
            </div>
            <div className="text-center">
              <span className="text-sm font-extrabold text-white drop-shadow-md block">
                Putar Showreel &amp; BTS Sesi Pemotretan
              </span>
              <span className="text-[11px] text-stone-300">
                01:45 • Resolusi 4K Cinema • Color Graded
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Portfolio Gallery Section */}
      {portfolioGallery.length > 0 && (
        <section className="p-7 sm:p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-xl font-black text-[#1E1B2E] tracking-tight">
                Galeri Karya Hasil Produksi ({portfolioGallery.length})
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              Output Nyata Bersama Klien &amp; Brand
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioGallery.map((item, idx) => (
              <div
                key={idx}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-stone-100 border border-stone-200/80 aspect-[4/3] shadow-xs hover:shadow-xl transition-all"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300 space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-wide">
                      <CheckCircle2 className="w-3 h-3 text-blue-300" />
                      <span>{item.client}</span>
                    </div>
                    <h4 className="text-base font-extrabold text-white leading-tight">{item.title}</h4>
                    <p className="text-xs text-stone-300 font-medium">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal for Gear Inspection */}
      {selectedGear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedGear(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#1E1B2E] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedGear(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] w-full bg-black/90">
              <img
                src={selectedGear.imageUrl}
                alt={selectedGear.name}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-lg bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider">
                  {selectedGear.category}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black">{selectedGear.name}</h3>
                {selectedGear.condition && (
                  <p className="text-xs text-amber-400 font-semibold mt-1">
                    {selectedGear.condition}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  Spesifikasi Teknis &amp; Kalibrasi
                </span>
                <p className="text-sm text-stone-200 leading-relaxed">
                  {selectedGear.specs}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tersedia untuk Booking &amp; Sesi Pemotretan</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedGear(null)}
                  className="px-4 py-2 rounded-xl bg-white text-stone-950 font-bold text-xs hover:bg-stone-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Portfolio Image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 p-4 text-center text-white space-y-1">
              <h3 className="text-lg font-bold">{selectedImage.title}</h3>
              {selectedImage.caption && (
                <p className="text-xs text-stone-300 max-w-2xl mx-auto leading-relaxed">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
