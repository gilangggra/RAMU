import { prisma } from "../src/infrastructure/database/prisma";
import { ActorType, AssetCategory, AssetRole } from "@prisma/client";
import { generateAndSaveOpportunities } from "../src/application/opportunityService";

async function main() {
  console.log("=== MIGRATING DATABASE STRICTLY TO 5 OFFICIAL RAMU ROLES ===");

  // 1. Update any actors with "Fashion Designer" or "designer"
  const actors = await prisma.actor.findMany();
  for (const actor of actors) {
    const s = (actor.sector || "").toLowerCase();
    if (s.includes("design") || s.includes("desain") || s.includes("perancang") || s.includes("atelier")) {
      console.log(`Updating actor "${actor.name}" (${actor.id}) from "${actor.sector}" to "Fashion Brand/UMKM"...`);
      await prisma.actor.update({
        where: { id: actor.id },
        data: {
          sector: "Fashion Brand/UMKM",
          actorType: ActorType.BRAND,
        },
      });
    }
  }

  // 2. Update any assets mentioning "Sisa Kain" or "Deadstock"
  const sisaAssets = await prisma.asset.findMany({
    where: {
      OR: [
        { name: { contains: "sisa kain", mode: "insensitive" } },
        { name: { contains: "deadstock", mode: "insensitive" } },
        { subtype: { contains: "deadstock", mode: "insensitive" } },
      ],
    },
  });

  for (const asset of sisaAssets) {
    console.log(`Updating asset "${asset.name}" (${asset.id}) to "Koleksi Sampel Busana Ready-to-Wear"...`);
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        category: AssetCategory.WARDROBE_PROP,
        subtype: "Sampel Busana Koleksi",
        name: "Koleksi Sampel Busana Ready-to-Wear (15 Looks)",
        description: "Sampel busana lengkap siap fitting untuk pemotretan katalog editorial dan kampanye komersial.",
        roles: [AssetRole.INPUT, AssetRole.COMPONENT, AssetRole.CREATIVE_ELEMENT],
        attributes: {
          sample_sizes: "S, M, L",
          total_looks: 15,
          starting_rate: "Sesuai Brief",
        },
      },
    });
  }

  // 3. Clear existing generated opportunities to re-compute with clean 5 roles
  console.log("Refreshing AI Opportunities across active actors...");
  const activeActors = await prisma.actor.findMany({
    where: { status: "ACTIVE" },
  });

  for (const a of activeActors) {
    try {
      await generateAndSaveOpportunities({ focusActorId: a.id });
      console.log(`Generated fresh opportunities for ${a.name}`);
    } catch (err) {
      console.error(`Failed generating for ${a.name}:`, err);
    }
  }

  console.log("=== MIGRATION COMPLETE! ALL DATA ALIGNED TO 5 OFFICIAL ROLES ===");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
