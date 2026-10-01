import { prisma } from "@/infrastructure/database/prisma";

export interface SubmitFeedbackInput {
  actorId: string;
  collaborationId?: string;
  opportunityId?: string;
  relevanceScore?: number;
  feasibilityScore?: number;
  noveltyScore?: number;
  usefulnessScore?: number;
  comments?: string;
}

export async function submitFeedback(input: SubmitFeedbackInput) {
  if (!input.collaborationId && !input.opportunityId) {
    throw new Error("Feedback must be linked to either a Collaboration or an Opportunity");
  }

  return prisma.feedback.create({
    data: {
      actorId: input.actorId,
      collaborationId: input.collaborationId,
      opportunityId: input.opportunityId,
      relevanceScore: input.relevanceScore,
      feasibilityScore: input.feasibilityScore,
      noveltyScore: input.noveltyScore,
      usefulnessScore: input.usefulnessScore,
      comments: input.comments,
    }
  });
}

export async function getFeedbackForActor(actorId: string) {
  return prisma.feedback.findMany({
    where: { actorId },
    include: {
      collaboration: true,
      opportunity: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getFeedbackForCollaboration(collaborationId: string) {
  return prisma.feedback.findMany({
    where: { collaborationId },
    include: { actor: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteFeedback(id: string, actorId: string) {
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) throw new Error("Feedback not found");
  if (feedback.actorId !== actorId) throw new Error("Unauthorized to delete this feedback");

  return prisma.feedback.delete({ where: { id } });
}
