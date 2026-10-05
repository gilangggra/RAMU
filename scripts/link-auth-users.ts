import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const actorMap: Record<string, { authId: string; email: string }> = {
    "00000000-0000-0000-0000-000000000001": {
      authId: "c386284c-0517-4f46-81f4-91eb27123aed",
      email: "brand@ramu.id",
    },
    "00000000-0000-0000-0000-000000000002": {
      authId: "c361fd95-862e-4249-9537-7e2d13aa3dbc",
      email: "designer@ramu.id",
    },
    "00000000-0000-0000-0000-000000000004": {
      authId: "4678d3cd-7735-42d0-9af1-bb4312cc1a00",
      email: "photographer@ramu.id",
    },
    "00000000-0000-0000-0000-000000000005": {
      authId: "cf53cf8d-67c7-4562-bf38-d06ebfe89d0f",
      email: "model@ramu.id",
    },
    "00000000-0000-0000-0000-000000000006": {
      authId: "c3955fc9-793c-465f-b99c-c46cbdeaf4a0",
      email: "mua@ramu.id",
    },
    "00000000-0000-0000-0000-000000000007": {
      authId: "22f350bb-416f-4c42-987f-dc88d78021c9",
      email: "studio@ramu.id",
    },
  };

  for (const [actorId, { authId, email }] of Object.entries(actorMap)) {
    // 1. Ensure profile exists with id = authId
    await prisma.$executeRawUnsafe(
      `INSERT INTO profiles (id, email, display_name, created_at, updated_at)
       VALUES ('${authId}'::uuid, '${email}', '${email.split("@")[0]}', NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET email = '${email}';`
    );

    // 2. Point actor directly to authId
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE actors SET owner_user_id = '${authId}'::uuid WHERE id = '${actorId}'::uuid;`
    );
    console.log(`Linked actor ${actorId} (${email}) -> auth user ${authId}: ${updated}`);
  }

  // Check bernadya
  const bernadyaProfile = await prisma.profile.findFirst({
    where: { email: { equals: "bernadya@gmail.com", mode: "insensitive" } },
  });
  console.log("Bernadya admin profile:", bernadyaProfile?.id, bernadyaProfile?.email);
  const bernadyaActor = await prisma.actor.findFirst({ where: { name: "bernadya" } });
  console.log("Bernadya actor ownerUserId:", bernadyaActor?.ownerUserId);
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
