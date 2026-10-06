/**
 * Find (and optionally delete) junk test notifications whose link points to a
 * non-existent resource (e.g. /collaborations/test).
 * Usage: npx tsx scripts/cleanup-test-notifications.ts [--delete]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UUID = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

async function main() {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string; title: string; link: string | null }>>(
    `SELECT id, title, link FROM notifications
     WHERE link ~ '^/(collaborations|projects|opportunities|dashboard/bookings|directory)/'
       AND link !~ $1`,
    `^/(collaborations|projects|opportunities|dashboard/bookings|directory)/${UUID}`
  );
  console.log(`Found ${rows.length} notification(s) with invalid links:`);
  rows.forEach((r) => console.log(`  ${r.id}  ${r.link}  "${r.title}"`));

  if (process.argv.includes("--delete") && rows.length) {
    const n = await prisma.$executeRawUnsafe(
      `DELETE FROM notifications WHERE id = ANY($1::uuid[])`,
      rows.map((r) => r.id)
    );
    console.log(`Deleted ${n} row(s).`);
  }
}

main().finally(() => prisma.$disconnect());
