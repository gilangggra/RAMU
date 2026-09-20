import { prisma } from '@/infrastructure/database/prisma';
import {
  runOpportunityPipeline,
  EngineActor,
  EngineOpportunity,
  OPPORTUNITY_PATTERNS,
} from '@/engine';
import {
  OpportunityStatus,
  FeasibilityStatus,
  FreshnessStatus,
  PatternStatus,
  ComplementarityRelationship,
  EvaluationStatus,
  ConstraintSeverity,
  Prisma,
} from '@prisma/client';

export async function seedOpportunityPatterns(): Promise<void> {
  for (const p of OPPORTUNITY_PATTERNS) {
    await prisma.opportunityPattern.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description,
        category: p.category,
        version: p.version,
        requiredRoles: p.requiredRoles as unknown as Prisma.InputJsonValue,
        optionalRoles: p.optionalRoles as unknown as Prisma.InputJsonValue,
        expectedOutputs: p.expectedOutputs as unknown as Prisma.InputJsonValue,
        status: PatternStatus.ACTIVE,
      },
      create: {
        code: p.code,
        name: p.name,
        description: p.description,
        category: p.category,
        version: p.version,
        requiredRoles: p.requiredRoles as unknown as Prisma.InputJsonValue,
        optionalRoles: p.optionalRoles as unknown as Prisma.InputJsonValue,
        expectedOutputs: p.expectedOutputs as unknown as Prisma.InputJsonValue,
        status: PatternStatus.ACTIVE,
      },
    });
  }
}

export async function generateAndSaveOpportunities(options?: {
  focusActorId?: string;
}): Promise<{ count: number; opportunities: EngineOpportunity[] }> {
  await seedOpportunityPatterns();

  const dbActors = await prisma.actor.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      assets: {
        where: { status: 'ACTIVE' },
      },
      goals: {
        where: { status: 'ACTIVE' },
      },
      needs: {
        where: { status: 'ACTIVE' },
      },
      constraints: true,
    },
  });

  if (dbActors.length < 2) {
    return { count: 0, opportunities: [] };
  }

  const engineActors: EngineActor[] = dbActors.map((a) => ({
    id: a.id,
    name: a.name,
    sector: a.sector,
    location: a.location,
    actorType: a.actorType,
    assets: a.assets.map((as) => ({
      id: as.id,
      actorId: as.actorId,
      category: as.category,
      subtype: as.subtype,
      name: as.name,
      description: as.description,
      roles: as.roles,
      attributes: (as.attributes as Record<string, unknown>) || {},
      confidenceLevel: as.confidenceLevel,
      sourceType: as.sourceType,
    })),
    goals: a.goals.map((g) => ({
      id: g.id,
      actorId: g.actorId,
      category: g.category,
      title: g.title,
      description: g.description,
      priority: g.priority,
    })),
    needs: a.needs.map((n) => ({
      id: n.id,
      actorId: n.actorId,
      relatedGoalId: n.relatedGoalId,
      category: n.category,
      title: n.title,
      description: n.description,
      priority: n.priority,
    })),
    constraints: a.constraints.map((c) => ({
      id: c.id,
      actorId: c.actorId,
      type: c.type,
      value: c.value as Record<string, unknown> | string | number,
      unit: c.unit,
      operator: c.operator,
      severity: c.severity,
      negotiability: c.negotiability,
      notes: c.notes,
    })),
  }));

  const engineResults = runOpportunityPipeline(engineActors, {
    focusActorId: options?.focusActorId,
    maxTotalOpportunities: 12,
    maxPerPattern: 3,
  });

  for (const opp of engineResults) {
    const dbPattern = await prisma.opportunityPattern.findUnique({
      where: { code: opp.patternCode },
    });

    const feasibilityStatus = opp.feasibility.status as FeasibilityStatus;

    const existing = await prisma.opportunity.findFirst({
      where: {
        patternCode: opp.patternCode,
        title: opp.title,
      },
    });

    const oppData = {
      createdByActorId: options?.focusActorId || opp.participants[0]?.actorId || null,
      patternId: dbPattern?.id || null,
      patternCode: opp.patternCode,
      patternVersion: opp.patternVersion,
      title: opp.title,
      description: opp.description,
      targetMarket: opp.targetMarket as unknown as Prisma.InputJsonValue,
      expectedOutputs: opp.expectedOutputs as unknown as Prisma.InputJsonValue,
      status: OpportunityStatus.GENERATED,
      feasibilityStatus,
      freshnessStatus: FreshnessStatus.CURRENT,
      explanation: opp.explanation as unknown as Prisma.InputJsonValue,
      inputSnapshot: {
        participantIds: opp.participants.map((p) => p.actorId),
        assetIds: opp.assets.map((a) => a.assetId),
      } as unknown as Prisma.InputJsonValue,
      resultSnapshot: {
        displayScore: opp.score.displayScore,
        baseScore: opp.score.baseScore,
      } as unknown as Prisma.InputJsonValue,
    };

    let opportunityId: string;

    if (existing) {
      opportunityId = existing.id;
      await prisma.opportunity.update({
        where: { id: existing.id },
        data: oppData,
      });

      await prisma.opportunityParticipant.deleteMany({ where: { opportunityId } });
      await prisma.opportunityAsset.deleteMany({ where: { opportunityId } });
      await prisma.opportunityGoal.deleteMany({ where: { opportunityId } });
      await prisma.opportunityNeed.deleteMany({ where: { opportunityId } });
      await prisma.opportunityScore.deleteMany({ where: { opportunityId } });
      await prisma.constraintEvaluation.deleteMany({ where: { opportunityId } });
    } else {
      const created = await prisma.opportunity.create({
        data: oppData,
      });
      opportunityId = created.id;
    }

    const seenParticipants = new Set<string>();
    for (const p of opp.participants) {
      if (seenParticipants.has(p.actorId)) continue;
      seenParticipants.add(p.actorId);
      await prisma.opportunityParticipant.create({
        data: {
          opportunityId,
          actorId: p.actorId,
          roleCode: p.roleCode,
          roleLabel: p.roleLabel,
          contribution: p.contribution,
          status: 'CONFIRMED',
        },
      }).catch(() => {});
    }

    const seenAssets = new Set<string>();
    for (const a of opp.assets) {
      if (seenAssets.has(a.assetId)) continue;
      seenAssets.add(a.assetId);
      await prisma.opportunityAsset.create({
        data: {
          opportunityId,
          assetId: a.assetId,
          roleCode: a.roleCode,
          contribution: a.contribution,
        },
      }).catch(() => {});
    }

    for (const gid of opp.goalsSupported) {
      await prisma.opportunityGoal.create({
        data: {
          opportunityId,
          goalId: gid,
        },
      }).catch(() => {});
    }

    for (const nid of opp.needsAddressed) {
      await prisma.opportunityNeed.create({
        data: {
          opportunityId,
          needId: nid,
        },
      }).catch(() => {});
    }

    await prisma.opportunityScore.create({
      data: {
        opportunityId,
        complementarityScore: opp.score.complementarity,
        goalAlignmentScore: opp.score.goalAlignment,
        needCoverageScore: opp.score.needCoverage,
        assetUtilizationScore: opp.score.assetUtilization,
        feasibilityScore: opp.score.feasibility,
        actionabilityScore: opp.score.actionability,
        overallScore: opp.score.displayScore,
        scoreExplanation: opp.score.explanation as unknown as Prisma.InputJsonValue,
      },
    });

    for (const warn of opp.feasibility.warnings) {
      await prisma.constraintEvaluation.create({
        data: {
          opportunityId,
          status: EvaluationStatus.WARNING,
          severity: ConstraintSeverity.SOFT,
          reason: warn,
          affectedActors: opp.participants.map((p) => p.actorId) as unknown as Prisma.InputJsonValue,
          possibleResolution: 'Dapat diselaraskan melalui kesepakatan logistik atau timeline awal.',
        },
      });
    }

    for (const note of opp.feasibility.notes) {
      await prisma.constraintEvaluation.create({
        data: {
          opportunityId,
          status: EvaluationStatus.PASSED,
          severity: ConstraintSeverity.SOFT,
          reason: note,
          affectedActors: opp.participants.map((p) => p.actorId) as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }

  return {
    count: engineResults.length,
    opportunities: engineResults,
  };
}

export async function getOpportunities(filter?: {
  actorId?: string;
  feasibility?: string;
}) {
  const where: Prisma.OpportunityWhereInput = {};

  if (filter?.feasibility && filter.feasibility !== 'ALL') {
    where.feasibilityStatus = filter.feasibility as FeasibilityStatus;
  }

  if (filter?.actorId) {
    where.participants = {
      some: {
        actorId: filter.actorId,
      },
    };
  }

  const list = await prisma.opportunity.findMany({
    where,
    include: {
      pattern: true,
      participants: {
        include: {
          actor: true,
        },
      },
      assets: {
        include: {
          asset: true,
        },
      },
      scores: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      constraintEvaluations: true,
      goals: {
        include: { goal: true },
      },
      needs: {
        include: { need: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return list;
}

export async function getOpportunityById(id: string) {
  return prisma.opportunity.findUnique({
    where: { id },
    include: {
      pattern: true,
      participants: {
        include: {
          actor: {
            include: {
              assets: true,
              goals: true,
              needs: true,
            },
          },
        },
      },
      assets: {
        include: {
          asset: true,
        },
      },
      scores: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      constraintEvaluations: true,
      goals: {
        include: { goal: true },
      },
      needs: {
        include: { need: true },
      },
      feedbacks: {
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
