import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking and initializing direct_messages table...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS direct_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
      recipient_actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      message_type VARCHAR(50) DEFAULT 'TEXT',
      metadata JSONB DEFAULT '{}'::jsonb,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_actor_id);
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_actor_id);
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_direct_messages_pair ON direct_messages(sender_actor_id, recipient_actor_id);
  `);

  console.log("direct_messages table and indexes are ready!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
