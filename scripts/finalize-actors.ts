import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // 1. Delete Studio Demo actor and its profile
  await prisma.$executeRawUnsafe(
    `DELETE FROM actors WHERE id = 'e37fc87e-7619-4df2-8bc0-a8409600e28c'::uuid;`
  );
  await prisma.$executeRawUnsafe(
    `DELETE FROM profiles WHERE email = 'studiodemo@ramu.id';`
  );
  console.log("Removed Studio Demo.");

  // 2. Fix MUA and Designer mappings
  // Atelier Nara (Fashion Designer) -> designer@ramu.id (c361fd95-862e-4249-9537-7e2d13aa3dbc)
  await prisma.$executeRawUnsafe(
    `UPDATE actors SET owner_user_id = 'c361fd95-862e-4249-9537-7e2d13aa3dbc'::uuid WHERE sector = 'Fashion Designer';`
  );
  // Glow & Form Artistry (MUA/Stylist) -> mua@ramu.id (c3955fc9-793c-465f-b99c-c46cbdeaf4a0)
  await prisma.$executeRawUnsafe(
    `UPDATE actors SET owner_user_id = 'c3955fc9-793c-465f-b99c-c46cbdeaf4a0'::uuid WHERE sector = 'MUA/Stylist';`
  );

  // 3. Print final list of actors
  const finalActors = await prisma.actor.findMany({
    select: {
      id: true,
      name: true,
      sector: true,
      owner: { select: { email: true, id: true } },
    },
    orderBy: { sector: "asc" },
  });

  console.log("\nFINAL 7 ACCOUNTS (1 ADMIN + 6 ROLES):");
  finalActors.forEach((a, i) => {
    console.log(`${i + 1}. [${a.sector}] ${a.name} -> Email: ${a.owner?.email} (User ID: ${a.owner?.id})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
