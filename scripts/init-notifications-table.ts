import { prisma } from "../src/infrastructure/database/prisma";

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'INFO',
        link TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_notifications_actor_read ON notifications(actor_id, is_read);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
    `);
    console.log("SUCCESS: notifications table created or already exists!");
    const count = await prisma.$queryRawUnsafe("SELECT count(*) FROM notifications");
    console.log("Count result:", count);
  } catch (e) {
    console.error("Migration error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
