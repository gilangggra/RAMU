import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const oldActorId = "5d757e14-4b60-413d-b2bc-1cfce503864d";
  const oldUserId = "4e3d1ae8-511e-4f4b-9f79-ee247c6ff5aa";

  // Reassign any project briefs or relations if any
  await prisma.projectBrief.updateMany({
    where: { creatorActorId: oldActorId },
    data: { creatorActorId: "00000000-0000-0000-0000-000000000001" },
  });

  // Delete old actor
  await prisma.actor.delete({
    where: { id: oldActorId },
  });
  console.log(`Deleted old duplicate actor ${oldActorId}`);

  // Delete old profile
  await prisma.profile.deleteMany({
    where: { id: oldUserId },
  });
  console.log(`Deleted old profile ${oldUserId}`);

  // Verify final count
  const remaining = await prisma.actor.findMany({
    select: { id: true, name: true, sector: true, ownerUserId: true, contactEmail: true },
  });
  console.log(`\nRemaining actors count: ${remaining.length}`);
  remaining.forEach((a) => console.log(`- [${a.sector}] ${a.name} (ID: ${a.id}, Owner: ${a.ownerUserId})`));
}

main().finally(() => prisma.$disconnect());
