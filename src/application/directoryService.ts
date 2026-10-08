import { prisma } from "@/infrastructure/database/prisma";
import { ActorType } from "@prisma/client";

export interface DirectoryFilterParams {
  search?: string;
  actorType?: string;
  sector?: string;
  location?: string;
  style?: string;
  compensation?: string;
  sortBy?: string;
}

export async function getDirectoryActors(params: DirectoryFilterParams = {}) {
  const { search, actorType, sector, location, style, compensation, sortBy } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const andConditions: any[] = [
    { status: { not: "ARCHIVED" } },
    {
      NOT: [
        { sector: { contains: "Administrator", mode: "insensitive" } },
        { sector: { contains: "Admin", mode: "insensitive" } },
      ],
    },
  ];

  if (actorType && actorType !== "ALL") {
    if (actorType === "BRAND" || actorType === "MSME") {
      andConditions.push({
        OR: [
          { actorType: ActorType.BRAND },
          { sector: { contains: "brand", mode: "insensitive" } },
          { sector: { contains: "label", mode: "insensitive" } },
          { sector: { contains: "umkm", mode: "insensitive" } },
        ],
      });
    } else if (actorType === "STUDIO") {
      andConditions.push({
        OR: [
          { actorType: ActorType.STUDIO },
          { sector: { contains: "studio", mode: "insensitive" } },
        ],
      });
    } else if (actorType === "INDIVIDUAL") {
      andConditions.push({
        actorType: ActorType.INDIVIDUAL,
        NOT: [
          { sector: { contains: "studio", mode: "insensitive" } },
          { sector: { contains: "brand", mode: "insensitive" } },
          { sector: { contains: "label", mode: "insensitive" } },
        ],
      });
    } else if (actorType === "COLLECTIVE") {
      andConditions.push({
        actorType: ActorType.COLLECTIVE,
      });
    } else {
      andConditions.push({
        actorType: actorType as ActorType,
      });
    }
  }

  if (sector && sector !== "ALL") {
    const sLower = sector.toLowerCase();
    if (sLower.includes("mua") || sLower.includes("stylist") || sLower.includes("makeup")) {
      andConditions.push({
        OR: [
          { sector: { contains: "MUA", mode: "insensitive" } },
          { sector: { contains: "Stylist", mode: "insensitive" } },
          { sector: { contains: "Makeup", mode: "insensitive" } },
          { sector: { contains: "Tata Rias", mode: "insensitive" } },
        ],
      });
    } else if (sLower.includes("brand") || sLower.includes("umkm") || sLower.includes("label")) {
      andConditions.push({
        OR: [
          { sector: { contains: "Brand", mode: "insensitive" } },
          { sector: { contains: "UMKM", mode: "insensitive" } },
          { sector: { contains: "Label", mode: "insensitive" } },
          { actorType: ActorType.BRAND },
        ],
      });
    } else if (sLower.includes("design") || sLower.includes("desain")) {
      andConditions.push({
        OR: [
          { sector: { contains: "Designer", mode: "insensitive" } },
          { sector: { contains: "Desain", mode: "insensitive" } },
          { sector: { contains: "Fashion Designer", mode: "insensitive" } },
        ],
      });
    } else if (sLower.includes("photo") || sLower.includes("foto")) {
      andConditions.push({
        OR: [
          { sector: { contains: "Photographer", mode: "insensitive" } },
          { sector: { contains: "Fotografi", mode: "insensitive" } },
          { sector: { contains: "Fotografer", mode: "insensitive" } },
          { sector: { contains: "Foto", mode: "insensitive" } },
        ],
      });
    } else if (sLower.includes("video")) {
      andConditions.push({
        OR: [
          { sector: { contains: "Videographer", mode: "insensitive" } },
          { sector: { contains: "Videografi", mode: "insensitive" } },
          { sector: { contains: "Video", mode: "insensitive" } },
        ],
      });
    } else if (sLower.includes("director") || sLower.includes("pengarah")) {
      andConditions.push({
        OR: [
          { sector: { contains: "Creative Director", mode: "insensitive" } },
          { sector: { contains: "Director", mode: "insensitive" } },
          { sector: { contains: "Pengarah Kreatif", mode: "insensitive" } },
        ],
      });
    } else if (sLower.includes("model") || sLower.includes("talent")) {
      andConditions.push({
        OR: [
          { sector: { contains: "Model", mode: "insensitive" } },
          { sector: { contains: "Talent", mode: "insensitive" } },
        ],
      });
    } else if (sLower.includes("studio") || sLower.includes("venue")) {
      andConditions.push({
        OR: [
          { sector: { contains: "Studio", mode: "insensitive" } },
          { sector: { contains: "Venue", mode: "insensitive" } },
          { actorType: ActorType.STUDIO },
        ],
      });
    } else {
      andConditions.push({
        sector: { contains: sector, mode: "insensitive" },
      });
    }
  }

  if (location && location !== "ALL") {
    andConditions.push({
      OR: [
        { location: { contains: location, mode: "insensitive" } },
        { location: { contains: "Seluruh Indonesia", mode: "insensitive" } },
        { location: { contains: "Nasional", mode: "insensitive" } },
        { location: { contains: "Travel Ready", mode: "insensitive" } },
        { description: { contains: "luar kota", mode: "insensitive" } },
      ],
    });
  }

  if (style && style !== "ALL") {
    andConditions.push({
      aestheticStyles: { has: style },
    });
  }

  if (compensation && compensation !== "ALL") {
    const cUpper = compensation.toUpperCase();
    if (cUpper === "PAID") {
      andConditions.push({
        OR: [
          { compensationModels: { has: "PAID" } },
          { compensationModels: { has: "Paid" } },
          { compensationModels: { has: "Commercial" } },
        ],
      });
    } else if (cUpper === "REVENUE_SHARE") {
      andConditions.push({
        OR: [
          { compensationModels: { has: "REVENUE_SHARE" } },
          { compensationModels: { has: "Bagi Hasil" } },
          { compensationModels: { has: "Revenue Share" } },
        ],
      });
    } else {
      andConditions.push({
        compensationModels: { has: compensation },
      });
    }
  }

  if (search && search.trim() !== "") {
    const term = search.trim();
    andConditions.push({
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { sector: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        {
          assets: {
            some: {
              name: { contains: term, mode: "insensitive" },
              status: "ACTIVE",
            },
          },
        },
      ],
    });
  }

  const whereClause = { AND: andConditions };

  const actors = await prisma.actor.findMany({
    where: whereClause,
    include: {
      owner: {
        select: {
          displayName: true,
          avatarUrl: true,
          email: true,
        },
      },
      assets: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          category: true,
          subtype: true,
          roles: true,
          attributes: true,
        },
      },
      goals: {
        where: { status: "ACTIVE" },
        take: 3,
        select: { id: true, title: true, category: true },
      },
      needs: {
        where: { status: "ACTIVE" },
        take: 3,
        select: { id: true, title: true, category: true },
      },
      _count: {
        select: {
          assets: { where: { status: "ACTIVE" } },
          goals: { where: { status: "ACTIVE" } },
          needs: { where: { status: "ACTIVE" } },
          opportunityParticipations: true,
          collaborationParticipations: true,
        },
      },
    },
    orderBy: sortBy === "name" ? [{ name: "asc" }] : [{ createdAt: "desc" }],
  });

  return actors;
}

export async function getDirectoryActorById(id: string) {
  const actor = await prisma.actor.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          displayName: true,
          avatarUrl: true,
          email: true,
        },
      },
      assets: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      goals: {
        where: { status: "ACTIVE" },
        orderBy: { priority: "desc" },
      },
      needs: {
        where: { status: "ACTIVE" },
        orderBy: { priority: "desc" },
      },
      constraints: {
        orderBy: { severity: "desc" },
      },
      opportunityParticipations: {
        take: 4,
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              patternCode: true,
              feasibilityStatus: true,
              scores: {
                take: 1,
                orderBy: { createdAt: "desc" },
                select: { overallScore: true },
              },
            },
          },
        },
      },
      feedbacks: {
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          collaboration: {
            select: { title: true },
          },
          opportunity: {
            select: { title: true },
          },
        },
      },
      collaborationParticipations: {
        orderBy: { joinedAt: "desc" },
        take: 6,
        include: {
          collaboration: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              startedAt: true,
              completedAt: true,
              outcomes: true,
              participants: {
                include: {
                  actor: { select: { id: true, name: true, sector: true } },
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          assets: { where: { status: "ACTIVE" } },
          goals: { where: { status: "ACTIVE" } },
          needs: { where: { status: "ACTIVE" } },
          feedbacks: true,
          collaborationParticipations: true,
        },
      },
    },
  });

  if (
    actor &&
    (actor.sector?.toLowerCase().includes("administrator") ||
      actor.sector?.toLowerCase().includes("admin"))
  ) {
    return null;
  }

  return actor;
}
