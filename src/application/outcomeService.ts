import { prisma } from '@/infrastructure/database/prisma';
import {
  OutcomeType,
  CollaborationStatus,
  ProjectBriefStatus,
  Prisma,
} from '@prisma/client';

export interface OutcomeMetrics {
  unitsProduced?: number | null;
  revenueAmount?: string | null;
  audienceReached?: string | null;
  evidenceUrl?: string | null;
  galleryUrls?: string[] | null;
  notes?: string | null;
}

export interface RecordOutcomeInput {
  collaborationId: string;
  actorId: string;
  title: string;
  description: string;
  outcomeType: OutcomeType;
  metrics?: OutcomeMetrics;
}

export interface SubmitFeedbackInput {
  actorId: string;
  collaborationId?: string | null;
  opportunityId?: string | null;
  relevanceScore?: number | null;
  feasibilityScore?: number | null;
  noveltyScore?: number | null;
  usefulnessScore?: number | null;
  comments?: string | null;
}

export async function validateCollaborationParticipant(
  collaborationId: string,
  actorId: string
): Promise<boolean> {
  const count = await prisma.collaborationParticipant.count({
    where: {
      collaborationId,
      actorId,
    },
  });
  return count > 0;
}

export async function recordOutcome(input: RecordOutcomeInput) {
  const isParticipant = await validateCollaborationParticipant(
    input.collaborationId,
    input.actorId
  );

  if (!isParticipant) {
    throw new Error('Hanya partisipan kolaborasi yang diizinkan mencatat luaran proyek.');
  }

  const collab = await prisma.collaboration.findUnique({
    where: { id: input.collaborationId },
    select: { status: true },
  });
  if (!collab) throw new Error('Kolaborasi tidak ditemukan.');
  if (collab.status === CollaborationStatus.CANCELLED) {
    throw new Error('Kolaborasi yang telah dibatalkan tidak dapat mencatat luaran.');
  }

  const sanitizedMetrics: OutcomeMetrics = {
    unitsProduced: input.metrics?.unitsProduced ? Number(input.metrics.unitsProduced) : null,
    revenueAmount: input.metrics?.revenueAmount?.trim() || null,
    audienceReached: input.metrics?.audienceReached?.trim() || null,
    evidenceUrl: input.metrics?.evidenceUrl?.trim() || null,
    galleryUrls: Array.isArray(input.metrics?.galleryUrls) ? input.metrics.galleryUrls.filter(Boolean) : null,
    notes: input.metrics?.notes?.trim() || null,
  };

  const outcome = await prisma.outcome.create({
    data: {
      collaborationId: input.collaborationId,
      title: input.title.trim(),
      description: input.description.trim(),
      outcomeType: input.outcomeType,
      metrics: sanitizedMetrics as unknown as Prisma.InputJsonValue,
    },
  });

  return outcome;
}

export async function completeCollaboration(collaborationId: string, actorId: string) {
  const isParticipant = await validateCollaborationParticipant(collaborationId, actorId);
  if (!isParticipant) {
    throw new Error('Hanya partisipan kolaborasi yang berhak menandai proyek selesai.');
  }

  const collab = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    select: { status: true },
  });
  if (!collab) throw new Error('Kolaborasi tidak ditemukan.');
  if (collab.status === CollaborationStatus.CANCELLED) {
    throw new Error('Kolaborasi yang telah dibatalkan tidak dapat diselesaikan.');
  }

  const updated = await prisma.collaboration.update({
    where: { id: collaborationId },
    data: {
      status: CollaborationStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  // 1. Sinkronisasi ProjectBrief: Tutup ProjectBrief yang menjadi asal kolaborasi ini
  try {
    await prisma.projectBrief.updateMany({
      where: { collaborationId },
      data: {
        status: ProjectBriefStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Error closing associated project brief:", err);
  }

  // 2. Sinkronisasi BookingRequest: Perbarui pesanan yang terhubung menjadi COMPLETED
  try {
    const relatedBookings = await prisma.bookingRequest.findMany({
      where: {
        details: {
          path: ["collaborationId"],
          equals: collaborationId,
        },
      },
    });

    for (const b of relatedBookings) {
      await prisma.bookingRequest.update({
        where: { id: b.id },
        data: { status: "COMPLETED" },
      });
    }
  } catch (err) {
    console.error("Error updating related bookings to COMPLETED:", err);
  }

  return updated;
}

export async function submitCollaborationFeedback(input: SubmitFeedbackInput) {
  if (!input.collaborationId) {
    throw new Error('ID kolaborasi wajib disertakan.');
  }

  const isParticipant = await validateCollaborationParticipant(
    input.collaborationId,
    input.actorId
  );

  if (!isParticipant) {
    throw new Error('Hanya partisipan kolaborasi yang dapat memberikan evaluasi.');
  }

  const existingFeedback = await prisma.feedback.findFirst({
    where: {
      collaborationId: input.collaborationId,
      actorId: input.actorId,
    },
  });

  if (existingFeedback) {
    return prisma.feedback.update({
      where: { id: existingFeedback.id },
      data: {
        relevanceScore: input.relevanceScore ? Math.min(5, Math.max(1, Math.round(input.relevanceScore))) : null,
        feasibilityScore: input.feasibilityScore ? Math.min(5, Math.max(1, Math.round(input.feasibilityScore))) : null,
        noveltyScore: input.noveltyScore ? Math.min(5, Math.max(1, Math.round(input.noveltyScore))) : null,
        usefulnessScore: input.usefulnessScore ? Math.min(5, Math.max(1, Math.round(input.usefulnessScore))) : null,
        comments: input.comments?.trim() || null,
      },
      include: {
        actor: true,
      },
    });
  }

  const feedback = await prisma.feedback.create({
    data: {
      collaborationId: input.collaborationId,
      actorId: input.actorId,
      relevanceScore: input.relevanceScore ? Math.min(5, Math.max(1, Math.round(input.relevanceScore))) : null,
      feasibilityScore: input.feasibilityScore ? Math.min(5, Math.max(1, Math.round(input.feasibilityScore))) : null,
      noveltyScore: input.noveltyScore ? Math.min(5, Math.max(1, Math.round(input.noveltyScore))) : null,
      usefulnessScore: input.usefulnessScore ? Math.min(5, Math.max(1, Math.round(input.usefulnessScore))) : null,
      comments: input.comments?.trim() || null,
    },
    include: {
      actor: true,
    },
  });

  return feedback;
}

export async function submitOpportunityFeedback(input: SubmitFeedbackInput) {
  if (!input.opportunityId) {
    throw new Error('ID peluang wajib disertakan.');
  }

  const opp = await prisma.opportunity.findUnique({
    where: { id: input.opportunityId },
    include: { participants: true },
  });
  if (!opp) {
    throw new Error('Peluang tidak ditemukan.');
  }

  const isParticipant =
    opp.createdByActorId === input.actorId ||
    opp.participants.some((p) => p.actorId === input.actorId);

  if (!isParticipant) {
    throw new Error('Hanya kreator yang terlibat dalam peluang ini yang dapat memberikan feedback.');
  }

  const existingFeedback = await prisma.feedback.findFirst({
    where: {
      opportunityId: input.opportunityId,
      actorId: input.actorId,
    },
  });

  if (existingFeedback) {
    return prisma.feedback.update({
      where: { id: existingFeedback.id },
      data: {
        relevanceScore: input.relevanceScore ? Math.min(5, Math.max(1, Math.round(input.relevanceScore))) : null,
        feasibilityScore: input.feasibilityScore ? Math.min(5, Math.max(1, Math.round(input.feasibilityScore))) : null,
        noveltyScore: input.noveltyScore ? Math.min(5, Math.max(1, Math.round(input.noveltyScore))) : null,
        usefulnessScore: input.usefulnessScore ? Math.min(5, Math.max(1, Math.round(input.usefulnessScore))) : null,
        comments: input.comments?.trim() || null,
      },
      include: {
        actor: true,
      },
    });
  }

  const feedback = await prisma.feedback.create({
    data: {
      opportunityId: input.opportunityId,
      actorId: input.actorId,
      relevanceScore: input.relevanceScore ? Math.min(5, Math.max(1, Math.round(input.relevanceScore))) : null,
      feasibilityScore: input.feasibilityScore ? Math.min(5, Math.max(1, Math.round(input.feasibilityScore))) : null,
      noveltyScore: input.noveltyScore ? Math.min(5, Math.max(1, Math.round(input.noveltyScore))) : null,
      usefulnessScore: input.usefulnessScore ? Math.min(5, Math.max(1, Math.round(input.usefulnessScore))) : null,
      comments: input.comments?.trim() || null,
    },
    include: {
      actor: true,
    },
  });

  return feedback;
}

export async function getGlobalLearningSignals() {
  const [
    totalOpportunities,
    totalCollaborations,
    completedCollaborations,
    allOutcomes,
    allFeedbacks,
    patterns,
  ] = await Promise.all([
    prisma.opportunity.count(),
    prisma.collaboration.count(),
    prisma.collaboration.count({ where: { status: CollaborationStatus.COMPLETED } }),
    prisma.outcome.findMany({
      include: {
        collaboration: {
          include: {
            plan: {
              include: {
                opportunity: true,
              },
            },
            participants: {
              include: {
                actor: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feedback.findMany({
      include: {
        actor: true,
        collaboration: {
          include: {
            plan: {
              include: {
                opportunity: true,
              },
            },
          },
        },
        opportunity: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.opportunityPattern.findMany({
      where: { status: 'ACTIVE' },
    }),
  ]);

  let totalRelevance = 0;
  let totalFeasibility = 0;
  let totalNovelty = 0;
  let totalUsefulness = 0;
  let validFeedbackCount = 0;

  for (const f of allFeedbacks) {
    if (f.relevanceScore || f.feasibilityScore || f.noveltyScore || f.usefulnessScore) {
      totalRelevance += f.relevanceScore || 0;
      totalFeasibility += f.feasibilityScore || 0;
      totalNovelty += f.noveltyScore || 0;
      totalUsefulness += f.usefulnessScore || 0;
      validFeedbackCount++;
    }
  }

  const averageScores = {
    relevance: validFeedbackCount > 0 ? Number((totalRelevance / validFeedbackCount).toFixed(1)) : 0,
    feasibility: validFeedbackCount > 0 ? Number((totalFeasibility / validFeedbackCount).toFixed(1)) : 0,
    novelty: validFeedbackCount > 0 ? Number((totalNovelty / validFeedbackCount).toFixed(1)) : 0,
    usefulness: validFeedbackCount > 0 ? Number((totalUsefulness / validFeedbackCount).toFixed(1)) : 0,
    overall: validFeedbackCount > 0
      ? Number(
          (
            (totalRelevance + totalFeasibility + totalNovelty + totalUsefulness) /
            (validFeedbackCount * 4)
          ).toFixed(1)
        )
      : 0,
    count: validFeedbackCount,
  };

  let totalUnitsProduced = 0;
  const recordedOutcomesWithMetrics = allOutcomes.filter((o) => {
    const m = (o.metrics as OutcomeMetrics) || {};
    if (m.unitsProduced) totalUnitsProduced += m.unitsProduced;
    return true;
  });

  const patternPerformance = patterns.map((p) => {
    const matchingOutcomes = allOutcomes.filter(
      (o) => o.collaboration?.plan?.opportunity?.patternCode === p.code
    );

    const matchingFeedbacks = allFeedbacks.filter(
      (f) => f.opportunity?.patternCode === p.code || f.collaboration?.plan?.opportunity?.patternCode === p.code
    );

    let patternScoreSum = 0;
    let patternScoreCount = 0;
    for (const f of matchingFeedbacks) {
      const avg =
        ((f.relevanceScore || 0) +
          (f.feasibilityScore || 0) +
          (f.noveltyScore || 0) +
          (f.usefulnessScore || 0)) /
        4;
      if (avg > 0) {
        patternScoreSum += avg;
        patternScoreCount++;
      }
    }

    return {
      code: p.code,
      name: p.name,
      category: p.category,
      outcomeCount: matchingOutcomes.length,
      feedbackCount: patternScoreCount,
      averageSatisfaction:
        patternScoreCount > 0 ? Number((patternScoreSum / patternScoreCount).toFixed(1)) : 0,
    };
  });

  return {
    conversionFunnel: {
      opportunities: totalOpportunities,
      collaborations: totalCollaborations,
      completedCollaborations,
      outcomesAchieved: allOutcomes.length,
      conversionRate:
        totalOpportunities > 0
          ? Math.round((totalCollaborations / totalOpportunities) * 100)
          : 0,
      completionRate:
        totalCollaborations > 0
          ? Math.round((completedCollaborations / totalCollaborations) * 100)
          : 0,
    },
    averageScores,
    ecosystemMetrics: {
      totalUnitsProduced,
      totalOutcomes: allOutcomes.length,
    },
    patternPerformance,
    recentOutcomes: allOutcomes.slice(0, 10),
    recentFeedbacks: allFeedbacks.slice(0, 10),
  };
}

export interface BlindReviewStatus {
  isRevealed: boolean;
  daysRemaining: number;
  bothSubmitted: boolean;
  feedbackCount: number;
  totalParticipants: number;
}

/**
 * Protokol Ulasan Dua Arah Tertutup (Double-Blind Review Protocol)
 * Ulasan dirahasiakan sampai kedua belah pihak mengisi ulasan, atau otomatis dibuka setelah 14 hari kerja.
 */
export async function checkCollaborationBlindReviewStatus(collaborationId: string): Promise<BlindReviewStatus> {
  const participants = await prisma.collaborationParticipant.findMany({
    where: { collaborationId, status: "ACTIVE" },
  });
  const feedbacks = await prisma.feedback.findMany({
    where: { collaborationId },
  });

  const feedbackCount = feedbacks.length;
  const totalParticipants = participants.length;
  const bothSubmitted = totalParticipants > 0 && feedbackCount >= totalParticipants;

  let oldestDate = new Date();
  if (feedbacks.length > 0) {
    oldestDate = feedbacks.reduce((min, f) => (f.createdAt < min ? f.createdAt : min), feedbacks[0].createdAt);
  }
  const ageInDays = Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = ageInDays >= 14;

  const isRevealed = bothSubmitted || isExpired;
  const daysRemaining = Math.max(0, 14 - ageInDays);

  return {
    isRevealed,
    daysRemaining,
    bothSubmitted,
    feedbackCount,
    totalParticipants,
  };
}
