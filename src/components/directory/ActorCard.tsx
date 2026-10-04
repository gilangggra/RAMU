"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ActorType } from "@prisma/client";
import { ArrowUpRight, MapPin, Zap, Play, Camera, User, Sparkles, Building2 } from "lucide-react";

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

  const isIndividualSector = !isBrand && !isStudio;

  // Determine smart preview image and label
  let previewImage: string | null = null;
  let previewType: "PORTFOLIO" | "VIDEO" | "COMP_CARD" | "AVATAR" | "STUDIO" | "STOCK" = "STOCK";
  let previewBadgeLabel = "";

  // 1. Explicit featured cover check (if marked by user)
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
      // Models & Talents: Comp Card or Headshot is primary
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

      // If no comp card, prioritize official profile headshot (avatar)
      if (!previewImage && actor.owner?.avatarUrl) {
        previewImage = actor.owner.avatarUrl;
        previewType = "AVATAR";
        previewBadgeLabel = "Headshot Resmi";
      }

      // Fallback to portfolio work
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
      // Studio: Studio space image is primary
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
      // Creative professionals (Photographers, Videographers, Stylists, HMUA, Designers, Brands):
      // Portfolio work / video showcase is primary
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

      // If no portfolio work uploaded yet, fallback to real profile avatar
      if (!previewImage && actor.owner?.avatarUrl) {
        previewImage = actor.owner.avatarUrl;
        previewType = "AVATAR";
        previewBadgeLabel = "Foto Profil Resmi";
      }
    }
  }

  // 3. Fallback: Only if NEITHER portfolio NOR profile avatar exists
  if (!previewImage) {
    previewType = "STOCK";
    if (isStudio) {
      previewImage = "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd08?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Studio";
    } else if (actor.sector.includes("Fashion") || isModelOrTalent) {
      previewImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Editorial";
    } else if (actor.sector.includes("Kopi") || actor.sector.includes("F&B")) {
      previewImage = "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Komersial";
    } else {
      previewImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
      previewBadgeLabel = "Kreator";
    }
  }

  let startingRate = "Mulai Rp 1,5 Jt / sesi";
  if (isStudio) {
    startingRate = "Mulai Rp 200rb / jam";
  } else if (sectorLower.includes("model") || sectorLower.includes("talent")) {
    startingRate = "Mulai Rp 1,0 Jt / sesi";
  } else if (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair")) {
    startingRate = "Mulai Rp 800rb / sesi";
  } else if (sectorLower.includes("stylist") || sectorLower.includes("wardrobe")) {
    startingRate = "Mulai Rp 1,2 Jt / sesi";
  } else if (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema")) {
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
      (a.attributes && typeof a.attributes === "object" && ("service_packages" in (a.attributes as any) || "starting_rate" in (a.attributes as any)))
  );
  if (customServiceAsset?.attributes && typeof customServiceAsset.attributes === "object") {
    const customRate = (customServiceAsset.attributes as any).starting_rate;
    if (customRate) startingRate = customRate;
  }

  const brandCollabAsset = isBrand
    ? actor.assets.find(
        (a) => a.attributes && typeof a.attributes === "object" && "collab_types" in (a.attributes as any)
      )
    : null;
  const brandCollabTypes: string[] = Array.isArray((brandCollabAsset?.attributes as any)?.collab_types)
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
  const scoreLabel =
    !hasScore ? null
    : complementarityScore! >= 80 ? "Sangat Cocok"
    : complementarityScore! >= 50 ? "Cocok"
    : "Ada Kecocokan";
  const scoreBg =
    complementarityScore! >= 80
      ? "bg-emerald-500/90"
      : complementarityScore! >= 50
      ? "bg-amber-400/95"
      : "bg-sky-500/90";
  const scoreText = complementarityScore! >= 80 ? "text-white" : "text-stone-950";

  return (
    <Link
      href={`/directory/${actor.id}`}
      className="group flex flex-col gap-3 cursor-pointer bg-white p-3 border border-stone-200/80 hover:border-[#1E1B2E] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        {!imageError && previewImage ? (
          <img
            src={previewImage}
            alt={actor.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-6 text-center">
            <span className="font-serif italic text-4xl text-stone-300 mb-2">{initials}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{actor.name}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className={`px-2.5 py-1 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider shadow-xs ${
            isBrand ? "bg-[#1E1B2E] text-amber-400" : "bg-white/95 text-[#1E1B2E]"
          }`}>
            {isStudio ? "Studio Foto" : isBrand ? "Brand Fashion" : "Kreator"}
          </div>

          {hasScore ? (
            <div
              title={`Kecocokan AI ${complementarityScore}% dengan kebutuhan & brief aktif Anda`}
              className={`px-2.5 py-1 ${scoreBg} backdrop-blur-md text-[9px] font-extrabold ${scoreText} flex items-center gap-1 shadow-xs`}
            >
              <Zap className="w-2.5 h-2.5" />
              <span>{complementarityScore}% Cocok</span>
            </div>
          ) : isBrand ? (
            <div className="px-2 py-0.5 bg-amber-500/95 backdrop-blur-md text-[9px] font-bold text-stone-950 flex items-center gap-1 shadow-xs rounded-none">
              <span className="w-1.5 h-1.5 bg-stone-950 animate-pulse" />
              <span>Buka Kolaborasi</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 shadow-xs rounded-none">
              <span className="w-1.5 h-1.5 bg-white animate-pulse" />
              <span>Siap Kerja</span>
            </div>
          )}
        </div>

        {/* BOTTOM LEFT: CONTEXTUAL PREVIEW BADGE */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/65 backdrop-blur-md text-white text-[9.5px] font-semibold tracking-wider border border-white/15 transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
          {previewType === "VIDEO" ? (
            <>
              <Play className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{previewBadgeLabel || "Video Showreel"}</span>
            </>
          ) : previewType === "COMP_CARD" ? (
            <>
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>{previewBadgeLabel || "Comp Card"}</span>
            </>
          ) : previewType === "AVATAR" ? (
            <>
              <User className="w-2.5 h-2.5 text-sky-300" />
              <span>{previewBadgeLabel || "Foto Profil Resmi"}</span>
            </>
          ) : previewType === "STUDIO" ? (
            <>
              <Building2 className="w-2.5 h-2.5 text-stone-300" />
              <span>{previewBadgeLabel || "Area Studio"}</span>
            </>
          ) : (
            <>
              <Camera className="w-2.5 h-2.5 text-stone-300" />
              <span>{previewBadgeLabel || "Karya Portofolio"}</span>
            </>
          )}
        </div>

        {/* HOVER CALL TO ACTION */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-full py-2 bg-white text-[#1E1B2E] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md">
            <span>
              {isBrand
                ? "Ajukan Usulan Kolaborasi"
                : isStudio
                ? "Lihat Studio & Sewa"
                : "Lihat Portofolio & Sewa"}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* CREATOR IDENTITY & META */}
      <div className="flex flex-col gap-2 pt-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-bold text-[#1E1B2E] tracking-tight group-hover:text-stone-700 transition-colors truncate">
              {actor.name}
            </h2>
            {actor.location && (
              <span className="text-[10px] font-medium text-stone-400 shrink-0 flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-2.5 h-2.5" />
                {actor.location.split(",")[0]}
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-stone-500 truncate mt-0.5">
            {actor.sector}
          </p>
        </div>

        <div className="pt-2 mt-0.5 border-t border-stone-100 space-y-1.5">
          {isBrand ? (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Peluang Kolaborasi</span>
              <span className="font-semibold text-stone-900 tracking-tight">{brandCollabLabel}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Estimasi Tarif</span>
              <span className="font-semibold text-[#1E1B2E] tracking-tight">{startingRate}</span>
            </div>
          )}
          {hasScore && (
            <div className="flex items-center justify-between" title="Kecocokan aset talenta dengan brief atau kebutuhan proyek aktif Anda">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Kecocokan Brief</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      complementarityScore! >= 80
                        ? "bg-emerald-500"
                        : complementarityScore! >= 50
                        ? "bg-amber-400"
                        : "bg-sky-400"
                    }`}
                    style={{ width: `${complementarityScore}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-extrabold ${
                    complementarityScore! >= 80
                      ? "text-emerald-600"
                      : complementarityScore! >= 50
                      ? "text-amber-600"
                      : "text-sky-600"
                  }`}
                >
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
