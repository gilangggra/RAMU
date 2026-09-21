import { prisma } from "@/infrastructure/database/prisma";

export interface ShowcaseFilterParams {
  search?: string;
  category?: string;
}

export interface ShowcaseItem {
  id: string; // The asset ID
  title: string;
  category: string;
  imageUrl: string;
  actor: {
    id: string;
    name: string;
    sector: string;
    initials: string;
    avatarBg: string;
  };
}

// Helper to determine background colors based on sector
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

// Fallback high-quality Unsplash images for the masonry grid
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
  const { search, category } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    status: "ACTIVE",
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

  // Fetch assets with their actors
  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          sector: true,
          actorType: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const showcaseItems: ShowcaseItem[] = [];

  // Map database assets to visual showcase items
  assets.forEach((asset, index) => {
    // Determine category based on Asset type or Actor sector
    let displayCategory = "Karya Kreatif";
    if (asset.actor.sector.toLowerCase().includes("fotogra") || asset.actor.sector.toLowerCase().includes("visual")) displayCategory = "Fotografi & Video";
    else if (asset.actor.sector.toLowerCase().includes("desain")) displayCategory = "Desain Visual";
    else if (asset.actor.sector.toLowerCase().includes("fashion") || asset.actor.actorType === "INDIVIDUAL") displayCategory = "Fashion Styling";
    else if (asset.actor.actorType === "STUDIO") displayCategory = "Studio & Ruang";

    // Apply category filter if specified
    if (category && category !== "ALL" && displayCategory !== category) {
      return; // Skip this item
    }

    // Extract image from attributes
    let imageUrl = null;
    if (asset.attributes) {
      const attrs = asset.attributes as any;
      if (attrs.brand_gallery && attrs.brand_gallery.length > 0) imageUrl = attrs.brand_gallery[0];
      else if (attrs.styling_gallery && attrs.styling_gallery.length > 0) imageUrl = attrs.styling_gallery[0];
      else if (attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) imageUrl = attrs.comp_card.images[0];
    }

    // Fallback to random beautiful images to ensure a stunning masonry grid
    if (!imageUrl) {
      imageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    }

    // Calculate initials
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
      actor: {
        id: asset.actor.id,
        name: asset.actor.name,
        sector: asset.actor.sector,
        initials,
        avatarBg: getAvatarBg(asset.actor.sector)
      }
    });
  });

  // Duplicate items slightly if there are too few to make the masonry grid look full and beautiful
  if (showcaseItems.length > 0 && showcaseItems.length < 8) {
     const extraItems = showcaseItems.map((item, idx) => ({
       ...item,
       id: item.id + "-copy-" + idx,
       imageUrl: FALLBACK_IMAGES[(idx + 4) % FALLBACK_IMAGES.length]
     }));
     return [...showcaseItems, ...extraItems];
  }

  return showcaseItems;
}
