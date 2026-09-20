import { PrismaClient } from "@prisma/client";
import { runOpportunityPipeline, EngineActor, OPPORTUNITY_PATTERNS } from "../src/engine";

const prisma = new PrismaClient();

async function main() {
  const dbActors = await prisma.actor.findMany({
    where: { status: "ACTIVE" },
    include: {
      assets: { where: { status: "ACTIVE" } },
      goals: { where: { status: "ACTIVE" } },
      needs: { where: { status: "ACTIVE" } },
      constraints: true,
    },
  });

  console.log("Total dbActors:", dbActors.length);
  for (const a of dbActors) {
    console.log(`- ${a.name}: ${a.assets.length} assets, ${a.goals.length} goals`);
    for (const as of a.assets) {
      console.log(`    Asset: ${as.name} | category: ${as.category} | roles: ${as.roles.join(",")}`);
    }
  }

  const engineActors: EngineActor[] = dbActors.map((a) => ({
    id: a.id,
    name: a.name,
    sector: a.sector,
    location: a.location,
    actorType: a.actorType,
    assets: a.assets.map((as) => ({
      id: as.id,
      actorId: as.actorId,
      category: as.category,
      subtype: as.subtype,
      name: as.name,
      description: as.description,
      roles: as.roles,
      attributes: (as.attributes as Record<string, unknown>) || {},
      confidenceLevel: as.confidenceLevel,
      sourceType: as.sourceType,
    })),
    goals: a.goals.map((g) => ({
      id: g.id,
      actorId: g.actorId,
      category: g.category,
      title: g.title,
      description: g.description,
      priority: g.priority,
    })),
    needs: a.needs.map((n) => ({
      id: n.id,
      actorId: n.actorId,
      category: n.category,
      title: n.title,
      description: n.description,
      priority: n.priority,
    })),
    constraints: a.constraints.map((c) => ({
      id: c.id,
      actorId: c.actorId,
      type: c.type,
      value: (c.value as any) ?? "",
      unit: c.unit,
      operator: c.operator,
      severity: c.severity,
      negotiability: c.negotiability,
      notes: c.notes,
    })),
  }));

  const res = runOpportunityPipeline(engineActors);
  console.log("runOpportunityPipeline result count:", res.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
