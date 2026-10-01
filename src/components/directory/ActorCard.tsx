"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ActorType } from "@prisma/client";
import { ArrowUpRight, MapPin, Zap } from "lucide-react";

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

  let previewImage = null;

  for (const asset of actor.assets) {
    if (asset.category === "EQUIPMENT") continue;
    if (actor.actorType !== "STUDIO" && asset.category === "STUDIO_SPACE") continue;

    if (asset.attributes) {
      const attrs = asset.attributes as any;
      if (asset.category === "PORTFOLIO_WORK" && attrs.image_url) {
        previewImage = attrs.image_url;
        break;
      }
      if (attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) {
        previewImage = attrs.comp_card.images[0];
        break;
      }
      if (attrs.brand_gallery && attrs.brand_gallery.length > 0) {
        previewImage = attrs.brand_gallery[0];
        break;
      }
      if (attrs.styling_gallery && attrs.styling_gallery.length > 0) {
        previewImage = attrs.styling_gallery[0];
        break;
      }
      if (actor.actorType === "STUDIO" && attrs.image_url) {
        previewImage = attrs.image_url;
        break;
      }
    }
  }

  if (!previewImage && actor.owner?.avatarUrl) {
    previewImage = actor.owner.avatarUrl;
  }

  if (!previewImage) {
    if (actor.actorType === "STUDIO") {
      previewImage = "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd08?q=80&w=800&auto=format&fit=crop";
    } else if (actor.sector.includes("Fashion")) {
      previewImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
    } else if (actor.sector.includes("Kopi") || actor.sector.includes("F&B")) {
      previewImage = "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop";
    } else {
      previewImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
    }
  }

  const sectorLower = actor.sector.toLowerCase();
  const isIndividualSector =
    sectorLower.includes("photographer") ||
    sectorLower.includes("fotografi") ||
    sectorLower.includes("model") ||
    sectorLower.includes("talent") ||
    sectorLower.includes("mua") ||
    sectorLower.includes("makeup") ||
    sectorLower.includes("hair") ||
    sectorLower.includes("stylist") ||
    sectorLower.includes("wardrobe") ||
    sectorLower.includes("video") ||
    sectorLower.includes("film") ||
    sectorLower.includes("cinema") ||
    sectorLower.includes("designer") ||
    sectorLower.includes("desain");

  const isStudio = !isIndividualSector && (actor.actorType === "STUDIO" || sectorLower.includes("studio"));

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

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-[#1E1B2E] shadow-xs">
            {isStudio ? "Studio Foto" : actor.actorType === "BRAND" || (actor.actorType as string) === "MSME" ? "Brand" : "Kreator"}
          </div>

          {hasScore ? (
            <div
              className={`px-2.5 py-1 ${scoreBg} backdrop-blur-md text-[9px] font-extrabold ${scoreText} flex items-center gap-1 shadow-xs`}
            >
              <Zap className="w-2.5 h-2.5" />
              <span>{complementarityScore}%</span>
              <span className="opacity-80">{scoreLabel}</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 shadow-xs rounded-none">
              <span className="w-1.5 h-1.5 bg-white animate-pulse" />
              <span>Siap Kerja</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-full py-2 bg-white text-[#1E1B2E] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md">
            <span>Lihat Portofolio & Sewa</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-none overflow-hidden bg-stone-100 border border-stone-200/80 shrink-0">
              {actor.owner?.avatarUrl ? (
                <img
                  src={actor.owner.avatarUrl}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center font-bold text-[9px] text-[#27213D] bg-gradient-to-br from-[#FFE9DE] to-[#F3EDFF]">
                  {actor.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-[#1E1B2E] tracking-tight group-hover:text-stone-600 transition-colors truncate">
              {actor.name}
            </h2>
          </div>
          {actor.location && (
            <span className="text-[10px] font-medium text-stone-400 shrink-0 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {actor.location.split(",")[0]}
            </span>
          )}
        </div>

        <div className="text-[11px] font-light text-stone-500 truncate pl-8">
          {actor.sector}
        </div>

        <div className="pt-2 mt-1 border-t border-stone-100 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Estimasi Tarif</span>
            <span className="font-semibold text-[#1E1B2E] tracking-tight">{startingRate}</span>
          </div>
          {hasScore && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">Relevansi Untukmu</span>
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
