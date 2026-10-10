import React from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ShieldCheck, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
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
    subtitle: "Kolaborasi produksi visual komersial 15-look menggabungkan brand busana, studio daylight, fotografer, dan muse.",
    coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    category: "Kampanye Fesyen",
    collaborators: [
      { name: "Atelier Nara", role: "Brand Busana" },
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
    subtitle: "Pemotretan katalog busana musim gugur ready-to-wear dengan integrasi fasilitas studio dan MUA terkurasi.",
    coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    category: "Editorial Lookbook",
    collaborators: [
      { name: "Nala The Label", role: "Brand UMKM" },
      { name: "Studio Imaji", role: "Fasilitas Studio" },
      { name: "Lensa Kreatif", role: "Fotografer Katalog" },
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
    <div className="rounded-[24px] bg-white/95 border border-stone-200/80 shadow-xs overflow-hidden">
      {/* SECTION HEADER */}
      <div className="px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 bg-[#FAF8F5]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/95 border border-white/80 text-[#0284c7] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-[#0f172a] tracking-tight">
                Panggung Kolaborasi &amp; Lookbook Terbitan Komunitas
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/70">
                Karya Nyata Ekosistem
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
              Contoh nyata sinergi brand fashion, fotografer, studio, dan muse yang terwujud di RAMU melalui SPK resmi.
            </p>
          </div>
        </div>

        <Link
          href="/showcase"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white hover:text-[#0284c7] text-[#0f172a] text-xs font-semibold border border-white/80 transition-all shrink-0 shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Jelajahi Galeri Lookbook</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* FEATURED CAMPAIGNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100/90">
        {FEATURED_CAMPAIGNS.map((campaign) => (
          <div
            key={campaign.id}
            className="p-5 sm:p-6 flex flex-col justify-between gap-4 group hover:bg-white/40 transition-colors"
          >
            <div className="space-y-3.5">
              {/* IMAGE SHOWCASE HERO */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-white/80 group-hover:border-white transition-all shadow-xs">
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/25" />

                {/* TOP BADGES */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white border border-white/20 shadow-xs">
                    {campaign.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-white" />
                    SPK Terverifikasi
                  </span>
                </div>

                {/* FLOATING OUTCOME METRICS */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-slate-900 border border-white/80 shadow-xs">
                    {campaign.outcomes.lookCount} Looks Dihasilkan
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#4CC9FE] text-slate-950 shadow-xs">
                    Hemat {campaign.outcomes.savingsPct}% Biaya
                  </span>
                </div>
              </div>

              {/* TITLE & DESCRIPTION */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug line-clamp-1">
                  {campaign.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                  {campaign.subtitle}
                </p>
              </div>

              {/* COLLABORATOR CREW PILLS (The Creative Equation - 2x2 Grid) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Tim Produksi Komplementer:
                  </span>
                  {/* Overlapping Avatars Stack */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {campaign.collaborators.map((c, i) => (
                        <div key={i} className="ring-2 ring-white rounded-full">
                          <ActorAvatar
                            name={c.name}
                            avatarUrl={c.avatarUrl}
                            className="w-4 h-4 rounded-full"
                            textClassName="text-[7px] font-bold"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-slate-400 text-[10px] font-medium">
                      {campaign.collaborators.length} Mitra
                    </span>
                  </div>
                </div>

                {/* Balanced 2x2 Micro-Grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  {campaign.collaborators.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-1.5 px-2 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/70 transition-colors min-w-0"
                    >
                      <ActorAvatar
                        name={c.name}
                        avatarUrl={c.avatarUrl}
                        className="w-4.5 h-4.5 rounded-full shrink-0 shadow-2xs"
                        textClassName="text-[8px] font-bold"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                          {c.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 min-w-0 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Sinergi Aset &amp; Hak Cipta SPK</span>
              </div>
              <Link
                href={campaign.link}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] shrink-0 group/link"
              >
                <span>Buka Lookbook</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
