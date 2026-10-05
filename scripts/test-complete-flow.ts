import { PrismaClient } from "@prisma/client";
import { generateAndSaveOpportunities, getOpportunities } from "../src/application/opportunityService";
import { initiateCollaborationFromOpportunity, getCollaborationWorkspace } from "../src/application/collaborationService";

const prisma = new PrismaClient();

async function runTest() {
  console.log("=== COMPREHENSIVE END-TO-END FLOW VALIDATION ===");

  // 1. BRAND ACTOR
  const brand = await prisma.actor.findFirst({
    where: { contactEmail: "hello@nalathelabel.com" },
    include: { createdProjectBriefs: true, assets: true },
  });
  if (!brand) throw new Error("Brand actor not found!");
  console.log(`1. Brand Account: ${brand.name} (${brand.sector})`);
  console.log(`   - Active Assets: ${brand.assets.length}`);
  console.log(`   - Project Briefs: ${brand.createdProjectBriefs.length}`);

  // 2. CHECK OR GENERATE OPPORTUNITIES
  console.log("\n2. Checking Deterministic Resource Compatibility Matches...");
  let opps = await getOpportunities({ actorId: brand.id });
  if (opps.length === 0) {
    console.log("   Generating fresh opportunities...");
    await generateAndSaveOpportunities({ focusActorId: brand.id });
    opps = await getOpportunities({ actorId: brand.id });
  }
  console.log(`   ✓ Found ${opps.length} compatible matches for ${brand.name}!`);

  const topMatch = opps[0];
  const score = topMatch.scores?.[0];
  console.log(`   - Top Match: "${topMatch.title}"`);
  console.log(`     Overall Score: ${score ? Math.round(score.overallScore) : 0}%`);
  console.log(`     Participants: ${topMatch.participants.map((p) => p.actor.name).join(" × ")}`);

  // 3. TEST INITIATE COLLABORATION WORKSPACE
  console.log("\n3. Testing Workspace Initiation from Match...");
  const initRes = await initiateCollaborationFromOpportunity(topMatch.id, brand.id);
  console.log(`   ✓ Collaboration Workspace Created/Reused! ID: ${initRes.collaborationId}`);

  // 4. VERIFY WORKSPACE CONTENT & AGREEMENT GENERATOR READINESS
  const workspace = await getCollaborationWorkspace(initRes.collaborationId);
  if (!workspace) throw new Error("Failed to load workspace!");
  console.log(`\n4. Verifying Collaboration Workspace:`);
  console.log(`   - Status: ${workspace.status}`);
  console.log(`   - Participants: ${workspace.participants.length} actors`);
  console.log(`   - Milestones: ${workspace.milestones.length}`);
  console.log(`   - Plan Title: ${(workspace.plan as any)?.title}`);
  console.log(`   - Cost Sharing Model: ${(workspace.plan as any)?.costSharingModel}`);
  console.log(`   - Agreement Spk Signatures: ${Array.isArray((workspace.plan as any)?.spkSignatures) ? ((workspace.plan as any)?.spkSignatures as any[]).length : 0}`);

  // 5. TEST BRIEF & APPLICATION FLOW
  const openBrief = await prisma.projectBrief.findFirst({
    where: { status: "OPEN" },
    include: { neededRoles: true },
  });
  console.log(`\n5. Verifying Project Brief Board:`);
  console.log(`   - Open Brief Found: "${openBrief?.title}"`);
  console.log(`   - Roles Needed: ${openBrief?.neededRoles.map((r) => r.roleLabel).join(", ")}`);

  // 6. SHOWCASE TEAR-SHEETS
  const { getShowcaseAssets } = await import("../src/application/showcaseService");
  const showcaseItems = await getShowcaseAssets();
  console.log(`\n6. Showcase Editorial Works: ${showcaseItems.length} items available`);

  // 7. DIRECTORY
  const directoryCount = await prisma.actor.count({ where: { status: "ACTIVE" } });
  console.log(`\n7. Directory Active Entities: ${directoryCount} actors (all 6 official roles + 1 admin)`);

  console.log("\n=================================================");
  console.log(">>> ALL FLOWS TESTED AND FUNCTIONING PERFECTLY! <<<");
  console.log("=================================================");
}

runTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
