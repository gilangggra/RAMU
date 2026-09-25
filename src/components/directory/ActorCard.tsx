import React from "react";
import Link from "next/link";
import { ActorType } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";

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
  // Extract a preview image from assets if available
  let previewImage = null;
  for (const asset of actor.assets) {
    if (asset.attributes) {
      const attrs = asset.attributes as any;
      if (attrs.brand_gallery && attrs.brand_gallery.length > 0) previewImage = attrs.brand_gallery[0];
      else if (attrs.styling_gallery && attrs.styling_gallery.length > 0) previewImage = attrs.styling_gallery[0];
      else if (attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) previewImage = attrs.comp_card.images[0];
      else if (attrs.image_url) previewImage = attrs.image_url;
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
    <Link 
      href={`/directory/${actor.id}`}
      className="group flex flex-col gap-4 cursor-pointer"
    >
      {/* Visual Cover */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        <img
          src={previewImage}
          alt={`Portfolio preview for ${actor.name}`}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        
        {/* Top Tag */}
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-[#1E1B2E]">
            {actor.actorType}
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-full text-[#1E1B2E]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Clean Typography Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-medium text-[#1E1B2E] tracking-tight group-hover:text-stone-500 transition-colors truncate">
            {actor.name}
          </h2>
          {actor.location && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 shrink-0">
              {actor.location}
            </span>
          )}
        </div>
        
        <div className="text-[11px] font-medium text-stone-500 tracking-wide truncate">
          {actor.sector}
        </div>
      </div>
    </Link>
  );
}
