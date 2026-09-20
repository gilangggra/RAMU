import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany();
  console.log("Profiles count:", profiles.length);
  for (const p of profiles) {
    console.log(`- Profile: ${p.id} | email: ${p.email} | name: ${p.displayName}`);
  }

  const actors = await prisma.actor.findMany();
  console.log("Actors count:", actors.length);
  for (const a of actors) {
    console.log(`- Actor: ${a.id} | name: ${a.name} | ownerUserId: ${a.ownerUserId}`);
  }

  const collabs = await prisma.collaboration.findMany({
    include: {
      participants: { include: { actor: true } },
      outcomes: true,
      feedbacks: true,
    },
  });
  console.log("Collaborations count:", collabs.length);
  for (const c of collabs) {
    console.log(`- [${c.id}] ${c.title} (${c.status})`);
    console.log(`  Participants: ${c.participants.map((p) => p.actor.name).join(", ")}`);
    console.log(`  Outcomes: ${c.outcomes.length}, Feedbacks: ${c.feedbacks.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
