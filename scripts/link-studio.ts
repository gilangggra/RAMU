import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const studioAuthId = "22f350bb-416f-4c42-987f-dc88d78021c9";
  const studioEmail = "studio@ramu.id";

  // Ensure studio profile exists
  await prisma.$executeRawUnsafe(
    `INSERT INTO profiles (id, email, display_name, created_at, updated_at)
     VALUES ('${studioAuthId}'::uuid, '${studioEmail}', 'Studio Imaji & Co.', NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET email = '${studioEmail}';`
  );

  // Find studio actor by sector or name
  const studioActor = await prisma.actor.findFirst({
    where: {
      OR: [
        { sector: "Studio" },
        { name: { contains: "Imaji", mode: "insensitive" } },
      ],
    },
  });

  if (studioActor) {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE actors SET owner_user_id = '${studioAuthId}'::uuid WHERE id = '${studioActor.id}'::uuid;`
    );
    console.log(`Updated Studio actor ${studioActor.name} (${studioActor.id}) -> auth ${studioAuthId}: ${updated}`);
  } else {
    console.log("No studio actor found!");
  }

  // Print all 7 actors and their ownerUserIds
  const allActors = await prisma.actor.findMany({
    select: { id: true, name: true, sector: true, ownerUserId: true, contactEmail: true },
  });
  console.log("\nAll Current Actors:", allActors);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
