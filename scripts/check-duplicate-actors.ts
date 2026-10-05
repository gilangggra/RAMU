import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const allActors = await prisma.actor.findMany({
    select: { id: true, name: true, sector: true, ownerUserId: true, contactEmail: true },
  });
  console.log("ALL ACTORS (" + allActors.length + "):");
  allActors.forEach((a) => {
    console.log(`- ID: ${a.id} | Name: ${a.name} | Sector: ${a.sector} | Owner: ${a.ownerUserId} | Contact: ${a.contactEmail}`);
  });
}

main().finally(() => prisma.$disconnect());
