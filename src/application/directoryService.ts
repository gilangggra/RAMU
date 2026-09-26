import { prisma } from "@/infrastructure/database/prisma";
import { ActorType } from "@prisma/client";

export interface DirectoryFilterParams {
  search?: string;
  actorType?: string;
  sector?: string;
  location?: string;
}

export async function getDirectoryActors(params: DirectoryFilterParams = {}) {
  const { search, actorType, sector, location } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    status: { not: "ARCHIVED" },
  };

  if (actorType && actorType !== "ALL") {
    whereClause.actorType = actorType as ActorType;
  }

  if (sector && sector !== "ALL") {
    whereClause.sector = { contains: sector, mode: "insensitive" };
  }

  if (location && location !== "ALL") {
    whereClause.location = { contains: location, mode: "insensitive" };
  }

  if (search && search.trim() !== "") {
    const term = search.trim();
    whereClause.OR = [
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
    ];
  }

  const actors = await prisma.actor.findMany({
    where: whereClause,
    include: {
      assets: {
        where: { status: "ACTIVE" },
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
    orderBy: [{ createdAt: "desc" }],
  });

  return actors;
}

export async function getDirectoryActorById(id: string) {
  return prisma.actor.findUnique({
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
}
