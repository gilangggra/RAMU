import { PrismaClient } from "@prisma/client";
import { generateAndSaveOpportunities } from "../src/application/opportunityService";
import { initiateCollaborationFromOpportunity } from "../src/application/collaborationService";

const prisma = new PrismaClient();

async function audit() {
  console.log("=== COMPREHENSIVE FLOW AUDIT ===");

  // 1. ACTORS & ROLES
  const actors = await prisma.actor.findMany({
    select: { id: true, name: true, sector: true, ownerUserId: true },
  });
  console.log(`\n1. Actors in DB: ${actors.length}`);
  actors.forEach((a) => console.log(`   - [${a.sector}] ${a.name} (ID: ${a.id})`));

  // 2. ASSETS PER ACTOR
  const assetsCount = await prisma.asset.count({ where: { status: "ACTIVE" } });
  console.log(`\n2. Active Assets/Resources: ${assetsCount}`);

  // 3. PROJECT BRIEFS
  const briefs = await prisma.projectBrief.findMany({
    include: { creatorActor: true, neededRoles: true },
  });
  console.log(`\n3. Project Briefs: ${briefs.length}`);
  briefs.forEach((b) => console.log(`   - "${b.title}" by ${b.creatorActor.name} (${b.neededRoles.length} roles needed)`));

  // 4. RUN COMPATIBILITY ENGINE
  const brandActor = actors.find((a) => a.sector.includes("Brand") || a.sector.includes("UMKM"));
  if (brandActor) {
    console.log(`\n4. Running Deterministic Compatibility Engine for ${brandActor.name}...`);
    try {
      const res = await generateAndSaveOpportunities({ focusActorId: brandActor.id });
      console.log(`   ✓ Engine result: Generated/Updated ${res.count} compatible matches!`);
    } catch (err: any) {
      console.error(`   ✗ Engine error:`, err.message);
    }
  }

  // 5. FETCH OPPORTUNITIES
  const allOpps = await prisma.opportunity.findMany({
    include: {
      participants: { include: { actor: true } },
      scores: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });
  console.log(`\n5. Total Opportunities in DB: ${allOpps.length}`);
  allOpps.slice(0, 5).forEach((o) => {
    console.log(`   - [${o.id.slice(0, 8)}] "${o.title}"`);
    console.log(`     Participants (${o.participants.length}):`, o.participants.map((p) => `${p.actor.name} (${p.actorId})`).join(", "));
  });

  const oppsForBrand = allOpps.filter((o) => o.participants.some((p) => p.actorId === brandActor?.id));
  console.log(`   Matches containing Brand (${brandActor?.name} - ${brandActor?.id}): ${oppsForBrand.length}`);

  // 6. COLLABORATION WORKSPACES
  const collabCount = await prisma.collaboration.count();
  console.log(`\n6. Collaboration Workspaces in DB: ${collabCount}`);

  // 7. CHECK TEST INITIATION IF NEEDED
  if (oppsForBrand.length > 0 && collabCount === 0) {
    console.log(`\n7. Testing workspace creation from first match...`);
    const initRes = await initiateCollaborationFromOpportunity(
      oppsForBrand[0].id,
      brandActor!.id
    );
    console.log(`   ✓ Workspace created! ID: ${initRes.collaborationId}`);
  }

  console.log("\n=== AUDIT COMPLETE ===");
}

audit()
  .catch((e) => {
    console.error("Audit failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
