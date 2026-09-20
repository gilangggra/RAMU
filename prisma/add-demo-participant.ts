import { PrismaClient, ParticipantCollaborationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const collab = await prisma.collaboration.findFirst({
    where: { status: "COMPLETED" },
    include: { participants: true },
  });

  if (!collab) {
    console.log("No completed collaboration found");
    return;
  }

  const studioDemoActor = await prisma.actor.findFirst({
    where: { name: "Studio Demo" },
  });

  if (studioDemoActor) {
    const existing = collab.participants.find((p) => p.actorId === studioDemoActor.id);
    if (!existing) {
      await prisma.collaborationParticipant.create({
        data: {
          collaborationId: collab.id,
          actorId: studioDemoActor.id,
          roleCode: "CO_CREATOR",
          status: ParticipantCollaborationStatus.ACTIVE,
        },
      });
      console.log(`✓ Added Studio Demo to collaboration ${collab.id}`);
    } else {
      console.log("Studio Demo already in collaboration");
    }
  }

  // Also make sure all actors owned by demo users can see the collaboration if needed
  console.log("Collaboration ID:", collab.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
