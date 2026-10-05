import { prisma } from "../src/infrastructure/database/prisma";
import { ActorType } from "@prisma/client";

async function main() {
  console.log("Migrating all actors strictly to the 6 allowed roles...");

  const actors = await prisma.actor.findMany();
  for (const actor of actors) {
    const s = (actor.sector || "").toLowerCase();
    const t = actor.actorType;
    let newSector = "Photographer";
    let newActorType: ActorType = ActorType.INDIVIDUAL;

    if (
      t === ActorType.BRAND ||
      s.includes("brand") ||
      s.includes("label") ||
      s.includes("umkm") ||
      actor.name.toLowerCase().includes("nala")
    ) {
      newSector = "Fashion Brand/UMKM";
      newActorType = ActorType.BRAND;
    } else if (
      actor.name.toLowerCase().includes("studio imaji") ||
      (t === ActorType.STUDIO && (s.includes("ruang") || s.includes("venue") || actor.name.toLowerCase().includes("studio")))
    ) {
      newSector = "Studio";
      newActorType = ActorType.STUDIO;
    } else if (
      s.includes("model") ||
      s.includes("talent") ||
      s.includes("peraga") ||
      actor.name.toLowerCase().includes("young") ||
      actor.name.toLowerCase().includes("ganteng") ||
      actor.name.toLowerCase().includes("aa") ||
      actor.name.toLowerCase().includes("asu")
    ) {
      newSector = "Model";
      newActorType = ActorType.INDIVIDUAL;
    } else if (
      s.includes("mua") ||
      s.includes("makeup") ||
      s.includes("hair") ||
      s.includes("stylist") ||
      s.includes("wardrobe") ||
      actor.name.toLowerCase().includes("glow") ||
      actor.name.toLowerCase().includes("cinta") ||
      actor.name.toLowerCase().includes("masa")
    ) {
      newSector = "MUA/Stylist";
      newActorType = ActorType.INDIVIDUAL;
    } else if (
      s.includes("foto") ||
      s.includes("photo") ||
      s.includes("lensa") ||
      actor.name.toLowerCase().includes("lensa") ||
      actor.name.toLowerCase().includes("creative 99") ||
      actor.name.toLowerCase().includes("atelier test")
    ) {
      newSector = "Photographer";
      newActorType = ActorType.INDIVIDUAL;
    } else if (
      s.includes("designer") ||
      s.includes("desain") ||
      s.includes("perancang") ||
      s.includes("admin") ||
      s.includes("demo")
    ) {
      newSector = "Fashion Designer";
      newActorType = ActorType.INDIVIDUAL;
    } else {
      newSector = "Photographer";
      newActorType = ActorType.INDIVIDUAL;
    }

    await prisma.actor.update({
      where: { id: actor.id },
      data: {
        sector: newSector,
        actorType: newActorType,
      },
    });
    console.log(`Updated "${actor.name}" -> Sector: "${newSector}", Type: ${newActorType}`);
  }

  console.log("Migration complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
