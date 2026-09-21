import React from "react";
import Link from "next/link";
import { ActorType } from "@prisma/client";
import {
  Building2,
  User,
  Sparkles,
  MapPin,
  ArrowRight,
  Package,
  Target,
  Search,
  ExternalLink,
  BadgeCheck,
  ImageIcon
} from "lucide-react";

export interface DirectoryActorItem {
  id: string;
  name: string;
  actorType: ActorType;
  sector: string;
  description?: string | null;
  location?: string | null;
  assets: Array<{
    id: string;
    name: string;
    category: string;
    subtype: string;
    roles: string[];
    attributes?: any;
  }>;
  goals: Array<{
    id: string;
    title: string;
    category: string;
  }>;
  needs: Array<{
    id: string;
    title: string;
    category: string;
  }>;
  _count: {
    assets: number;
    goals: number;
    needs: number;
    opportunityParticipations: number;
    collaborationParticipations: number;
  };
}

interface ActorCardProps {
  actor: DirectoryActorItem;
}

export function ActorCard({ actor }: ActorCardProps) {
  // Initials for avatar
  const initials = actor.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const typeConfig: Record<
    string,
    { label: string; icon: React.ReactNode; bg: string; text: string; border: string; avatarBg: string }
  > = {
    STUDIO: {
      label: "Studio Foto & Visual",
      icon: <Building2 className="w-3 h-3" />,
      bg: "bg-[#FFF7ED]",
      text: "text-[#E66A48]",
      border: "border-[#F9D8C4]",
      avatarBg: "from-amber-400 to-[#E66A48] text-white",
    },
    INDIVIDUAL: {
      label: "Talenta Kreatif",
      icon: <User className="w-3 h-3" />,
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      avatarBg: "from-purple-500 to-indigo-600 text-white",
    },
    MSME: {
      label: "Brand & Kriya Fesyen",
      icon: <Sparkles className="w-3 h-3" />,
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      avatarBg: "from-amber-500 to-yellow-600 text-white",
    },
    AGENCY: {
      label: "Agensi Produksi",
      icon: <Building2 className="w-3 h-3" />,
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
      avatarBg: "from-sky-500 to-blue-600 text-white",
    },
    COMMUNITY: {
      label: "Komunitas Kreatif",
      icon: <User className="w-3 h-3" />,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      avatarBg: "from-emerald-500 to-teal-600 text-white",
    },
  };

  const config = typeConfig[actor.actorType] || {
    label: actor.actorType,
    icon: <Sparkles className="w-3 h-3" />,
    bg: "bg-stone-50",
    text: "text-stone-700",
    border: "border-stone-200",
    avatarBg: "from-stone-500 to-stone-700 text-white",
  };

  // Determine Verified Status (Dummy logic: if they have assets and participate in collaborations)
  const isVerified = actor._count.assets > 0;

  // Extract a preview image from assets if available
  let previewImage = null;
  for (const asset of actor.assets) {
    if (asset.attributes) {
      const attrs = asset.attributes as any;
      if (attrs.brand_gallery && attrs.brand_gallery.length > 0) previewImage = attrs.brand_gallery[0];
      else if (attrs.styling_gallery && attrs.styling_gallery.length > 0) previewImage = attrs.styling_gallery[0];
      else if (attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) previewImage = attrs.comp_card.images[0];
    }
    if (previewImage) break;
  }
  
  // Fallback beautiful images based on sector
  if (!previewImage) {
    if (actor.sector.includes("Fashion")) previewImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
    else if (actor.sector.includes("Kopi") || actor.sector.includes("F&B")) previewImage = "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop";
    else previewImage = "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800&auto=format&fit=crop";
  }

  return (
    <div className="group relative p-6 sm:p-7 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] hover:shadow-[0_20px_40px_rgba(39,33,61,0.12)] hover:border-[#E66A48]/50 transition-all duration-500 flex flex-col justify-between overflow-hidden">
      
      {/* Interactive Hover Preview Background */}
      <div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          style={{ backgroundImage: `url(${previewImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#27213D] via-[#27213D]/90 to-[#27213D]/60" />
      </div>

      <div className="space-y-4 relative z-10 transition-colors duration-500 group-hover:text-white">
        {/* Header: Avatar, Type Badge & Location */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.avatarBg} flex items-center justify-center font-black text-sm shadow-sm shrink-0`}
            >
              {initials}
            </div>
            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}
              >
                {config.icon}
                <span>{config.label}</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#27213D] group-hover:text-white transition-colors leading-snug mt-1 flex items-center gap-1.5">
                {actor.name}
                {isVerified && (
                  <BadgeCheck className="w-4 h-4 text-[#E66A48] shrink-0" title="Verified RAMU" />
                )}
              </h2>
            </div>
          </div>
        </div>

        {/* Sector and Location Details */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-500 font-medium">
          <span className="text-[#27213D] font-semibold">{actor.sector}</span>
          {actor.location && (
            <span className="flex items-center gap-1 text-stone-400">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>{actor.location}</span>
            </span>
          )}
        </div>

        {/* Bio / Description */}
        {actor.description ? (
          <p className="text-xs text-[#716B7E] group-hover:text-stone-300 line-clamp-2 leading-relaxed transition-colors">
            {actor.description}
          </p>
        ) : (
          <p className="text-xs text-stone-400 group-hover:text-stone-400/70 italic transition-colors">
            Belum menambahkan ringkasan bio profil.
          </p>
        )}

        {/* Featured Assets & Capabilities */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100 group-hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-400 group-hover:text-stone-300 uppercase tracking-wider text-[10px] flex items-center gap-1 transition-colors">
              <Package className="w-3 h-3 text-amber-500 group-hover:text-amber-400" />
              Aset & Kapabilitas ({actor._count.assets})
            </span>
            {actor._count.assets > 3 && (
              <span className="text-[10px] text-stone-400 group-hover:text-stone-400 font-semibold transition-colors">
                +{actor._count.assets - 3} lainnya
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {actor.assets.length > 0 ? (
              actor.assets.slice(0, 3).map((asset) => (
                <span
                  key={asset.id}
                  className="px-2.5 py-1 rounded-xl bg-stone-50 group-hover:bg-white/10 border border-stone-200/80 group-hover:border-white/20 text-[11px] font-semibold text-[#27213D] group-hover:text-white truncate max-w-full transition-colors"
                  title={asset.name}
                >
                  {asset.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-stone-400 group-hover:text-stone-500 italic transition-colors">Belum ada aset terdaftar</span>
            )}
          </div>
        </div>

        {/* Active Needs / Goals Hook */}
        {actor.needs.length > 0 ? (
          <div className="p-3 rounded-2xl bg-[#FFF7ED]/60 border border-[#F9D8C4]/60 text-xs text-[#E66A48] space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E66A48]/80">
              <Search className="w-3 h-3" />
              <span>Kebutuhan Terbuka:</span>
            </div>
            <p className="text-[11px] font-medium text-[#27213D] truncate">
              {actor.needs[0].title}
            </p>
          </div>
        ) : actor.goals.length > 0 ? (
          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/60 text-xs text-purple-700 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
              <Target className="w-3 h-3" />
              <span>Target Kolaborasi:</span>
            </div>
            <p className="text-[11px] font-medium text-[#27213D] truncate">
              {actor.goals[0].title}
            </p>
          </div>
        ) : null}
      </div>

      {/* Footer Actions */}
      <div className="pt-5 mt-4 border-t border-stone-100 group-hover:border-white/20 flex items-center justify-between gap-3 relative z-10 transition-colors duration-500">
        <Link
          href={`/directory/${actor.id}`}
          className="text-xs font-bold text-[#27213D] group-hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>Detail Profil & Aset</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          {previewImage && (
             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[10px] font-bold text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20">
               <ImageIcon className="w-3 h-3" /> Preview
             </div>
          )}
          <Link
            href={`/projects/new?partnerId=${actor.id}&partnerName=${encodeURIComponent(actor.name)}`}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFF7ED] group-hover:bg-[#E66A48] border border-[#F9D8C4] group-hover:border-[#E66A48]/80 text-[#E66A48] group-hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
          >
            <span>Ajak Kolaborasi</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
