"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ActorType } from "@prisma/client";
import {
  ArrowUpRight,
  MapPin,
  Zap,
  Play,
  Camera,
  User,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

export interface DirectoryActorItem {
  id: string;
  name: string;
  actorType: ActorType;
  sector: string;
  description?: string | null;
  location?: string | null;
  owner?: {
    displayName?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  } | null;
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
  complementarityScore?: number;
}

export function ActorCard({ actor, complementarityScore }: ActorCardProps) {
  const [imageError, setImageError] = useState(false);

  // Sector detection
  const sectorLower = actor.sector?.toLowerCase() || "";
  const isBrand =
    actor.actorType === "BRAND" ||
    (actor.actorType as string) === "MSME" ||
    actor.actorType === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("umkm");

  const isStudio = !isBrand && (actor.actorType === "STUDIO" || sectorLower.includes("studio"));

  const isModelOrTalent =
    !isBrand &&
    !isStudio &&
    (sectorLower.includes("model") ||
      sectorLower.includes("talent") ||
      sectorLower.includes("muse") ||
      sectorLower.includes("aktor") ||
      sectorLower.includes("aktris"));

  // Determine smart preview image and label
  let previewImage: string | null = null;
  let previewType: "PORTFOLIO" | "VIDEO" | "COMP_CARD" | "AVATAR" | "STUDIO" | "STOCK" = "STOCK";
  let previewBadgeLabel = "";

  // 1. Explicit featured cover check
  for (const asset of actor.assets) {
    if (asset.attributes && typeof asset.attributes === "object") {
      const attrs = asset.attributes as any;
      if (attrs.is_featured_cover || attrs.is_cover) {
        const isVid = attrs.media_type === "VIDEO" || Boolean(attrs.video_url);
        if (isVid && (attrs.thumbnail_url || attrs.poster_url || attrs.image_url)) {
          previewImage = attrs.thumbnail_url || attrs.poster_url || attrs.image_url;
          previewType = "VIDEO";
          previewBadgeLabel = "Video Showreel";
          break;
        } else if (attrs.image_url) {
          previewImage = attrs.image_url;
          previewType = "PORTFOLIO";
          previewBadgeLabel = "Karya Unggulan";
          break;
        }
      }
    }
  }

  // 2. Context-aware prioritization by profession
  if (!previewImage) {
    if (isModelOrTalent) {
      for (const asset of actor.assets) {
        if (asset.attributes) {
          const attrs = asset.attributes as any;
          if (attrs.comp_card?.images && attrs.comp_card.images.length > 0) {
            previewImage = attrs.comp_card.images[0];
            previewType = "COMP_CARD";
            previewBadgeLabel = "Comp Card Model";
            break;
          }
        }
      }

      if (!previewImage && actor.owner?.avatarUrl) {
        previewImage = actor.owner.avatarUrl;
        previewType = "AVATAR";
        previewBadgeLabel = "Headshot Resmi";
      }

      if (!previewImage) {
        for (const asset of actor.assets) {
          if (asset.attributes) {
            const attrs = asset.attributes as any;
            if (asset.category === "PORTFOLIO_WORK" && (attrs.image_url || attrs.thumbnail_url)) {
              previewImage = attrs.image_url || attrs.thumbnail_url;
              previewType = attrs.media_type === "VIDEO" ? "VIDEO" : "PORTFOLIO";
              previewBadgeLabel = previewType === "VIDEO" ? "Video Reel" : "Portofolio";
              break;
            }
          }
        }
      }
    } else if (isStudio) {
      for (const asset of actor.assets) {
        if (asset.category === "STUDIO_SPACE" && asset.attributes) {
          const attrs = asset.attributes as any;
          if (attrs.image_url) {
            previewImage = attrs.image_url;
            previewType = "STUDIO";
            previewBadgeLabel = "Studio Space";
            break;
          }
        }
      }

      if (!previewImage) {
        for (const asset of actor.assets) {
          if (asset.attributes) {
            const attrs = asset.attributes as any;
            if (attrs.image_url) {
              previewImage = attrs.image_url;
              previewType = "STUDIO";
              previewBadgeLabel = "Area Studio";
              break;
            }
          }
        }
      }

      if (!previewImage && actor.owner?.avatarUrl) {
        previewImage = actor.owner.avatarUrl;
        previewType = "AVATAR";
        previewBadgeLabel = "Profil Studio";
      }
    } else {
      for (const asset of actor.assets) {
        if (asset.category === "EQUIPMENT") continue;
        if (asset.category === "STUDIO_SPACE") continue;

        if (asset.attributes) {
          const attrs = asset.attributes as any;
          const isVid = attrs.media_type === "VIDEO" || Boolean(attrs.video_url);

          if (asset.category === "PORTFOLIO_WORK") {
            if (isVid && (attrs.thumbnail_url || attrs.poster_url || attrs.image_url)) {
              previewImage = attrs.thumbnail_url || attrs.poster_url || attrs.image_url;
              previewType = "VIDEO";
              previewBadgeLabel = "Video Showreel";
              break;
            } else if (attrs.image_url) {
              previewImage = attrs.image_url;
              previewType = "PORTFOLIO";
              previewBadgeLabel = "Karya Portofolio";
              break;
            }
          }

          if (attrs.styling_gallery && attrs.styling_gallery.length > 0) {
            previewImage = attrs.styling_gallery[0];
            previewType = "PORTFOLIO";
            previewBadgeLabel = "Lookbook Koleksi";
            break;
          }

          if (attrs.brand_gallery && attrs.brand_gallery.length > 0) {
            previewImage = attrs.brand_gallery[0];
            previewType = "PORTFOLIO";
            previewBadgeLabel = "Katalog Brand";
            break;
          }
        }
      }

      if (!previewImage && actor.owner?.avatarUrl) {
        previewImage = actor.owner.avatarUrl;
        previewType = "AVATAR";
        previewBadgeLabel = "Foto Profil Resmi";
      }
    }
  }

  // 3. Fallback
  if (!previewImage) {
    previewType = "STOCK";
    if (isStudio) {
      previewImage =
        "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd08?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Studio";
    } else if (actor.sector.includes("Fashion") || isModelOrTalent) {
      previewImage =
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Editorial";
    } else if (actor.sector.includes("Kopi") || actor.sector.includes("F&B")) {
      previewImage =
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Komersial";
    } else {
      previewImage =
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Kreator";
    }
  }

  let startingRate = "Mulai Rp 1,5 Jt / sesi";
  if (isStudio) {
    startingRate = "Mulai Rp 200rb / jam";
  } else if (sectorLower.includes("model") || sectorLower.includes("talent")) {
    startingRate = "Mulai Rp 1,0 Jt / sesi";
  } else if (
    sectorLower.includes("mua") ||
    sectorLower.includes("makeup") ||
    sectorLower.includes("hair")
  ) {
    startingRate = "Mulai Rp 800rb / sesi";
  } else if (sectorLower.includes("stylist") || sectorLower.includes("wardrobe")) {
    startingRate = "Mulai Rp 1,2 Jt / sesi";
  } else if (
    sectorLower.includes("video") ||
    sectorLower.includes("film") ||
    sectorLower.includes("cinema")
  ) {
    startingRate = "Mulai Rp 1,8 Jt / video";
  } else if (sectorLower.includes("designer") || sectorLower.includes("desain")) {
    startingRate = "Mulai Rp 2,5 Jt / koleksi";
  } else if (sectorLower.includes("fotografi") || sectorLower.includes("photographer")) {
    startingRate = "Mulai Rp 1,5 Jt / sesi";
  } else if (actor.actorType === "BRAND" || (actor.actorType as string) === "MSME") {
    startingRate = "Katalog & Produksi";
  }

  const customServiceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes &&
        typeof a.attributes === "object" &&
        ("service_packages" in (a.attributes as any) || "starting_rate" in (a.attributes as any)))
  );
  if (customServiceAsset?.attributes && typeof customServiceAsset.attributes === "object") {
    const customRate = (customServiceAsset.attributes as any).starting_rate;
    if (customRate) startingRate = customRate;
  }

  const brandCollabAsset = isBrand
    ? actor.assets.find(
        (a) =>
          a.attributes && typeof a.attributes === "object" && "collab_types" in (a.attributes as any)
      )
    : null;
  const brandCollabTypes: string[] = Array.isArray(
    (brandCollabAsset?.attributes as any)?.collab_types
  )
    ? (brandCollabAsset?.attributes as any).collab_types
    : [];
  const brandCollabLabel =
    brandCollabTypes.length > 0
      ? `${brandCollabTypes.length} Skema Kerjasama`
      : "Terbuka Kolaborasi";

  const initials = actor.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const hasScore = complementarityScore !== undefined && complementarityScore > 0;

  return (
    <Link
      href={`/directory/${actor.id}`}
      className="group w-full rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none"
    >
      {/* 1. MEDIA PREVIEW CONTAINER */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-100 mb-3">
        {!imageError && previewImage ? (
          <img
            src={previewImage}
            alt={actor.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center">
            <span className="text-3xl font-bold text-slate-300 mb-1">{initials}</span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase truncate max-w-full">
              {actor.name}
            </span>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 z-20 pointer-events-none">
          {/* Entity Type Pill */}
          <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold text-white tracking-wide border border-white/10 shadow-2xs">
            {isStudio ? "Studio Foto" : isBrand ? "Brand Fashion" : "Kreator"}
          </span>

          {/* Complementarity Score or Status Badge */}
          {hasScore ? (
            <span
              title={`Kecocokan AI ${complementarityScore}% dengan kebutuhan & brief aktif Anda`}
              className="px-2 py-0.5 rounded-md bg-emerald-50/95 backdrop-blur-md text-emerald-800 border border-emerald-200/70 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
            >
              <Zap className="w-2.5 h-2.5 text-emerald-600" />
              <span>{complementarityScore}% Cocok</span>
            </span>
          ) : isBrand ? (
            <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/70 text-[10px] font-semibold flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Buka Kolaborasi</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/70 text-[10px] font-semibold flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Siap Kerja</span>
            </span>
          )}
        </div>

        {/* Floating Bottom Left: Preview Badge */}
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none transition-opacity duration-200 group-hover:opacity-0">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9.5px] font-medium tracking-wide border border-white/10 flex items-center gap-1">
            {previewType === "VIDEO" ? (
              <>
                <Play className="w-2.5 h-2.5 fill-white text-white" />
                <span>{previewBadgeLabel || "Video Showreel"}</span>
              </>
            ) : previewType === "COMP_CARD" ? (
              <>
                <Sparkles className="w-2.5 h-2.5 text-slate-300" />
                <span>{previewBadgeLabel || "Comp Card"}</span>
              </>
            ) : previewType === "AVATAR" ? (
              <>
                <User className="w-2.5 h-2.5 text-slate-300" />
                <span>{previewBadgeLabel || "Foto Profil"}</span>
              </>
            ) : previewType === "STUDIO" ? (
              <>
                <Building2 className="w-2.5 h-2.5 text-slate-300" />
                <span>{previewBadgeLabel || "Area Studio"}</span>
              </>
            ) : (
              <>
                <Camera className="w-2.5 h-2.5 text-slate-300" />
                <span>{previewBadgeLabel || "Karya Unggulan"}</span>
              </>
            )}
          </span>
        </div>

        {/* Hover Action Pill */}
        <div className="absolute inset-x-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex justify-center">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-semibold shadow-md flex items-center gap-1.5 border border-white/10">
            <span>
              {isBrand
                ? "Ajukan Kolaborasi"
                : isStudio
                ? "Lihat Studio & Sewa"
                : "Lihat Profil & Sewa"}
            </span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </div>

      {/* 2. CREATOR METADATA BODY */}
      <div className="space-y-2 pt-1 px-0.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <ActorAvatar
              name={actor.name}
              avatarUrl={actor.owner?.avatarUrl}
              className="w-7 h-7 rounded-full border border-slate-200/80 shrink-0 shadow-2xs"
              textClassName="text-[10px]"
            />
            <div className="min-w-0">
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-1 group-hover:text-slate-700 transition-colors">
                {actor.name}
              </h3>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {actor.sector}
              </p>
            </div>
          </div>
          {actor.location && (
            <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-0.5 self-start mt-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {actor.location.split(",")[0]}
            </span>
          )}
        </div>

        {/* Bottom Specs & Rate Strip */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          {isBrand ? (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Peluang Kolaborasi
              </span>
              <span className="font-semibold text-slate-800 tracking-tight">
                {brandCollabLabel}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Estimasi Tarif
              </span>
              <span className="font-semibold text-slate-900 tracking-tight font-mono text-[11px]">
                {startingRate}
              </span>
            </div>
          )}

          {hasScore && (
            <div
              className="flex items-center justify-between pt-0.5"
              title="Kecocokan aset talenta dengan brief atau kebutuhan proyek aktif Anda"
            >
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Kecocokan Brief
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${complementarityScore}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 font-mono">
                  {complementarityScore}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
