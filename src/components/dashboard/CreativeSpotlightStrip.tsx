import React from "react";
import Link from "next/link";
import { ArrowUpRight, Camera, Sparkles, Layers, ShieldCheck, ArrowRight, Eye } from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

export interface CreativeCampaignItem {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  category: string;
  collaborators: {
    name: string;
    role: string;
    avatarUrl?: string | null;
  }[];
  outcomes: {
    lookCount: number;
    savingsPct: number;
    spkVerified: boolean;
  };
  link: string;
}

const FEATURED_CAMPAIGNS: CreativeCampaignItem[] = [
  {
    id: "campaign-1",
    title: "Lookbook Kampanye Kapsul Silk Organza & Linen",
    subtitle: "Kolaborasi produksi lookbook komersial 15-look menggabungkan brand fashion, studio daylight, fotografer, dan muse.",
    coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    category: "Lookbook Kampanye Fesyen",
    collaborators: [
      { name: "Atelier Nara", role: "Brand & Label Busana" },
      { name: "Studio Imaji", role: "Studio Cyclorama" },
      { name: "Lensa Kreatif", role: "Fotografer & Lighting" },
      { name: "Go Young Jung", role: "Talenta Muse" },
    ],
    outcomes: {
      lookCount: 15,
      savingsPct: 45,
      spkVerified: true,
    },
    link: "/showcase",
  },
  {
    id: "campaign-2",
    title: "Editorial Katalog Musim Gugur Minimalis",
    subtitle: "Pemotretan katalog busana musim gugur ready-to-wear dengan studio daylight dan pencahayaan Profoto.",
    coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    category: "Editorial Lookbook",
    collaborators: [
      { name: "Nala The Label", role: "Brand UMKM" },
      { name: "Studio Imaji", role: "Fasilitas Studio" },
      { name: "Glow & Form", role: "MUA & Styling" },
    ],
    outcomes: {
      lookCount: 12,
      savingsPct: 40,
      spkVerified: true,
    },
    link: "/showcase",
  },
];

export function CreativeSpotlightStrip() {
  return (
    <div className="rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] overflow-hidden">
      {/* SECTION HEADER */}
      <div className="px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/80 bg-white/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/95 border border-white/80 text-[#0284c7] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#0f172a] tracking-tight">
                Panggung Kolaborasi &amp; Lookbook Terbitan Komunitas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/70">
                Karya Nyata Ekosistem
              </span>
            </div>
            <p className="text-xs text-[#475569] font-normal mt-0.5">
              Contoh nyata sinergi brand fashion, fotografer, studio, stylist, dan muse yang terwujud di RAMU melalui SPK resmi.
            </p>
          </div>
        </div>

        <Link
          href="/showcase"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] text-xs font-semibold border border-white/80 transition-all shrink-0 shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Jelajahi Galeri Lookbook</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* FEATURED CAMPAIGNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/80">
        {FEATURED_CAMPAIGNS.map((campaign) => (
          <div key={campaign.id} className="p-5 sm:p-6 flex flex-col justify-between gap-5 group hover:bg-white/40 transition-colors">
            <div className="space-y-4">
              {/* IMAGE SHOWCASE HERO */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-white/80 group-hover:border-white transition-all shadow-xs">
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-sm text-slate-900 shadow-xs">
                    {campaign.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-white" />
                    SPK Terverifikasi
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                  <h3 className="font-bold text-sm sm:text-base leading-snug drop-shadow-xs">
                    {campaign.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-200 drop-shadow-xs">
                    <span>{campaign.outcomes.lookCount} Looks Dihasilkan</span>
                    <span>•</span>
                    <span>Efisiensi {campaign.outcomes.savingsPct}% Biaya</span>
                  </div>
                </div>
              </div>

              {/* COLLABORATOR CREW PILLS (The Creative Equation) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Tim Produksi Komplementer:
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {campaign.collaborators.length} Mitra Saling Melengkapi
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {campaign.collaborators.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-slate-800 border border-slate-200/90 shadow-2xs"
                    >
                      <ActorAvatar name={c.name} className="w-3.5 h-3.5 rounded-full" textClassName="text-[7px]" />
                      <span>
                        <strong>{c.name}</strong> <span className="text-slate-400">({c.role})</span>
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Penyelarasan inventaris studio &amp; sampel busana
              </span>
              <Link
                href={campaign.link}
                className="inline-flex items-center gap-1 font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline"
              >
                <span>Lihat Tear-Sheet Lengkap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
