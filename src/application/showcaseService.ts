import { prisma } from "@/infrastructure/database/prisma";

export interface ShowcaseFilterParams {
  search?: string;
  category?: string;
  scope?: "all" | "mine";
  currentActorId?: string;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  mediaType?: "IMAGE" | "VIDEO";
  videoUrl?: string | null;
  videoSource?: "DIRECT_UPLOAD" | "YOUTUBE" | "VIMEO" | "EXTERNAL" | null;
  aspectRatio?: string | null;
  isOwner?: boolean;
  isCoCreditor?: boolean;
  tearSheet?: any;
  availableActors?: { id: string; name: string; sector: string; location: string | null }[];
  actor: {
    id: string;
    name: string;
    sector: string;
    location: string | null;
    description?: string | null;
    experienceLevel?: string | null;
    aestheticStyles: string[];
    compensationModels: string[];
    initials: string;
    avatarBg: string;
  };
}

function getAvatarBg(sector: string) {
  if (sector.toLowerCase().includes("fotografi") || sector.toLowerCase().includes("visual")) {
    return "from-amber-400 to-[#E66A48]";
  }
  if (sector.toLowerCase().includes("desain")) {
    return "from-purple-500 to-indigo-600";
  }
  if (sector.toLowerCase().includes("f&b") || sector.toLowerCase().includes("kopi")) {
    return "from-amber-500 to-yellow-600";
  }
  if (sector.toLowerCase().includes("fashion")) {
    return "from-emerald-500 to-teal-600";
  }
  return "from-stone-500 to-stone-700";
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"
];

export async function getShowcaseAssets(params: ShowcaseFilterParams = {}): Promise<ShowcaseItem[]> {
  const { search, category, scope, currentActorId } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    status: "ACTIVE",
    category: "PORTFOLIO_WORK",
    actor: {
      status: { not: "ARCHIVED" }
    }
  };

  if (search && search.trim() !== "") {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { actor: { name: { contains: search, mode: "insensitive" } } }
    ];
  }

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          sector: true,
          location: true,
          description: true,
          experienceLevel: true,
          aestheticStyles: true,
          compensationModels: true,
          actorType: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const allActors = await prisma.actor.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: {
      id: true,
      name: true,
      sector: true,
      location: true,
    },
    take: 50,
  });

  const showcaseItems: ShowcaseItem[] = [];

  assets.forEach((asset, index) => {

    const attrs = (asset.attributes as any) || {};
    const tearSheet = attrs.tear_sheet || null;

    const isOwner = currentActorId ? asset.actorId === currentActorId : false;
    const isCoCreditor = currentActorId && tearSheet?.credits
      ? tearSheet.credits.some((c: any) => c.actorId === currentActorId)
      : false;

    if (scope === "mine") {
      if (!isOwner && !isCoCreditor) {
        return;
      }
    }

    let displayCategory = asset.subtype || "Lainnya";

    if (category && category !== "ALL" && displayCategory !== category) {
      return;
    }

    let imageUrl = null;
    if (attrs.image_url) imageUrl = attrs.image_url;
    else if (attrs.brand_gallery && attrs.brand_gallery.length > 0) imageUrl = attrs.brand_gallery[0];
    else if (attrs.styling_gallery && attrs.styling_gallery.length > 0) imageUrl = attrs.styling_gallery[0];
    else if (attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) imageUrl = attrs.comp_card.images[0];

    const mediaType: "IMAGE" | "VIDEO" = attrs.media_type || (attrs.video_url ? "VIDEO" : "IMAGE");
    const videoUrl: string | null = attrs.video_url || null;
    const videoSource = attrs.video_source || (videoUrl ? "EXTERNAL" : null);
    const aspectRatio = attrs.aspect_ratio || "16:9";

    if (!imageUrl) {
      imageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    }

    const initials = asset.actor.name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    showcaseItems.push({
      id: asset.id,
      title: asset.name,
      category: displayCategory,
      imageUrl,
      mediaType,
      videoUrl,
      videoSource,
      aspectRatio,
      isOwner,
      isCoCreditor,
      tearSheet,
      availableActors: allActors,
      actor: {
        id: asset.actor.id,
        name: asset.actor.name,
        sector: asset.actor.sector,
        location: asset.actor.location,
        description: asset.actor.description,
        experienceLevel: asset.actor.experienceLevel,
        aestheticStyles: asset.actor.aestheticStyles || [],
        compensationModels: asset.actor.compensationModels || [],
        initials,
        avatarBg: getAvatarBg(asset.actor.sector)
      }
    });
  });

  return showcaseItems;
}

export async function getActorShowcaseCount(actorId: string): Promise<number> {
  if (!actorId) return 0;

  try {
    const assets = await prisma.asset.findMany({
      where: {
        status: "ACTIVE",
        category: "PORTFOLIO_WORK",
        actor: { status: { not: "ARCHIVED" } }
      },
      select: {
        id: true,
        actorId: true,
        attributes: true,
      }
    });

    let count = 0;
    assets.forEach((asset) => {
      if (asset.actorId === actorId) {
        count++;
      } else if (asset.attributes) {
        const attrs = asset.attributes as any;
        if (attrs.tear_sheet?.credits?.some((c: any) => c.actorId === actorId)) {
          count++;
        }
      }
    });

    return count;
  } catch (error) {
    console.error("Error getting actor showcase count:", error);
    return 0;
  }
}
