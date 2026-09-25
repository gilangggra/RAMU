import {
  EngineActor,
  OpportunityPatternDef,
  EngineParticipantAssignment,
  EngineAssetUsage,
  PairwiseComplementarity,
  FeasibilityEvaluation,
  OpportunityScoreBreakdown,
} from '../types';

export function calculateOpportunityScore(params: {
  pattern: OpportunityPatternDef;
  actors: EngineActor[];
  participants: EngineParticipantAssignment[];
  assetsUsed: EngineAssetUsage[];
  complementarities: PairwiseComplementarity[];
  feasibility: FeasibilityEvaluation;
  goalsSupported: string[];
  needsAddressed: string[];
}): OpportunityScoreBreakdown {
  const {
    pattern,
    actors,
    participants,
    assetsUsed,
    complementarities,
    feasibility,
    goalsSupported,
    needsAddressed,
  } = params;

  let cScore = 2.0;
  if (complementarities.length > 0) {
    const avg =
      complementarities.reduce((sum, c) => sum + c.numericStrength, 0) /
      complementarities.length;
    const directMatches = complementarities.filter((c) => c.relationshipType === 'DIRECT_NEED_MATCH').length;
    const bonus = directMatches > 0 ? 0.3 : 0;
    cScore = Math.min(4.0, Math.max(0.5, avg + bonus));
  }

  let fScore = 2.0;
  switch (feasibility.status) {
    case 'FEASIBLE':
      fScore = 4.0;
      if (feasibility.warnings.length > 0) fScore -= 0.3 * Math.min(feasibility.warnings.length, 2);
      break;
    case 'PROMISING':
      fScore = 3.1;
      break;
    case 'PARTIAL':
      fScore = 1.8;
      break;
    case 'BLOCKED':
      fScore = 0.5;
      break;
    default:
      fScore = 1.5;
  }

  let gScore = 1.5;
  const actorGoalMatches = actors.filter((actor) =>
    actor.goals.some((g) => pattern.preferredGoals.includes(g.category))
  ).length;

  if (actorGoalMatches >= actors.length && actors.length > 1) {
    gScore = 4.0;
  } else if (actorGoalMatches > 0) {
    gScore = 2.8 + (actorGoalMatches / actors.length) * 1.0;
  }

  let nScore = 1.8;
  if (needsAddressed.length >= 2) {
    nScore = 4.0;
  } else if (needsAddressed.length === 1) {
    nScore = 3.2;
  } else {
    nScore = 2.0;
  }

  let xScore = 3.2;
  const allRolesAssigned = pattern.requiredRoles.every((r) =>
    participants.some((p) => p.roleCode === r.code)
  );
  if (allRolesAssigned && participants.every((p) => p.contribution && p.contribution.length > 10)) {
    xScore = 3.9;
  }

  let aScore = 2.5;
  const totalRelevantAssets = actors.reduce(
    (count, a) =>
      count +
      a.assets.filter(
        (as) =>
          as.category === 'PORTFOLIO_WORK' ||
          as.category === 'WARDROBE_PROP' ||
          as.category === 'SKILL_TALENT'
      ).length,
    0
  );
  if (totalRelevantAssets > 0) {
    const ratio = Math.min(1.0, assetsUsed.length / Math.max(1, totalRelevantAssets));
    aScore = Math.min(4.0, Math.max(1.0, ratio * 4.0 + 1.0));
  }

  const baseScore = Number(
    (
      cScore * 0.25 +
      fScore * 0.20 +
      gScore * 0.15 +
      nScore * 0.15 +
      xScore * 0.15 +
      aScore * 0.10
    ).toFixed(2)
  );

  const displayScore = Math.min(100, Math.max(10, Math.round((baseScore / 4.0) * 100)));

  return {
    complementarity: Number(cScore.toFixed(1)),
    feasibility: Number(fScore.toFixed(1)),
    goalAlignment: Number(gScore.toFixed(1)),
    needCoverage: Number(nScore.toFixed(1)),
    actionability: Number(xScore.toFixed(1)),
    assetUtilization: Number(aScore.toFixed(1)),
    baseScore,
    displayScore,
    explanation: {
      summary: `Peluang ini meraih skor kecocokan ${displayScore}/100 didukung oleh kekuatan komplementaritas aset (${cScore.toFixed(1)}/4) dan keselarasan tujuan kolaborator (${gScore.toFixed(1)}/4).`,
      dimensionDetails: {
        Komplementaritas: `${Math.round((cScore / 4) * 100)}% — Kekuatan perpaduan aset & kapabilitas`,
        Kelayakan: `${Math.round((fScore / 4) * 100)}% — Kesiapan peran dan minimnya hambatan batasan`,
        'Keselarasan Tujuan': `${Math.round((gScore / 4) * 100)}% — Dukungan terhadap target pertumbuhan tiap partisipan`,
        'Kebutuhan Terpenuhi': `${Math.round((nScore / 4) * 100)}% — Menyelesaikan kebutuhan langsung aktor`,
        'Aksi Nyata': `${Math.round((xScore / 4) * 100)}% — Kejelasan output dan pembagian kontribusi`,
        'Pemanfaatan Aset': `${Math.round((aScore / 4) * 100)}% — Optimalisasi aset kreatif yang dimiliki`,
      },
    },
  };
}
