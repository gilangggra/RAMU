import {
  EngineActor,
  EngineAsset,
  EngineOpportunity,
  EngineParticipantAssignment,
  EngineAssetUsage,
  PairwiseComplementarity,
} from './types';
import { OPPORTUNITY_PATTERNS } from './patterns/library';
import { evaluatePairwiseComplementarity } from './complementarity/detector';
import { evaluateOpportunityFeasibility } from './constraints/evaluator';
import { calculateOpportunityScore } from './scoring/scorer';
import { generateOpportunityExplanation } from './explanation/generator';

export interface RunEngineOptions {
  focusActorId?: string;
  maxTotalOpportunities?: number;
  maxPerPattern?: number;
}

export function runOpportunityPipeline(
  actors: EngineActor[],
  options?: RunEngineOptions
): EngineOpportunity[] {
  const maxTotal = options?.maxTotalOpportunities ?? 10;
  const maxPerPattern = options?.maxPerPattern ?? 3;
  const focusActorId = options?.focusActorId;

  const validActors = actors.filter((actor) => {
    if (!actor.id || !actor.name) return false;
    return actor.assets.length > 0 || actor.goals.length > 0 || actor.needs.length > 0;
  });

  if (validActors.length < 2) {
    return [];
  }

  const normalizedActors: EngineActor[] = validActors.map((actor) => ({
    ...actor,
    assets: actor.assets.map((asset) => ({
      ...asset,
      category: asset.category.toUpperCase().trim(),
      roles: asset.roles.map((r) => r.toUpperCase().trim()),
    })),
  }));

  const candidatePool = normalizedActors;

  const pairwiseMap = new Map<string, PairwiseComplementarity[]>();

  for (let i = 0; i < candidatePool.length; i++) {
    for (let j = i + 1; j < candidatePool.length; j++) {
      const a = candidatePool[i];
      const b = candidatePool[j];
      const comps = evaluatePairwiseComplementarity(a, b);
      const keyAB = `${a.id}:${b.id}`;
      const keyBA = `${b.id}:${a.id}`;
      pairwiseMap.set(keyAB, comps);
      pairwiseMap.set(keyBA, comps);
    }
  }

  function getPairwise(idA: string, idB: string): PairwiseComplementarity[] {
    return pairwiseMap.get(`${idA}:${idB}`) || [];
  }

  const candidateOpportunities: EngineOpportunity[] = [];
  const deduplicationSet = new Set<string>();

  for (const pattern of OPPORTUNITY_PATTERNS) {
    let countForPattern = 0;

    const combinations = generateActorCombinations(
      candidatePool,
      pattern.minParticipants,
      pattern.maxParticipants,
      focusActorId
    );

    for (const group of combinations) {
      if (countForPattern >= maxPerPattern) break;

      const groupComplementarities: PairwiseComplementarity[] = [];
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const comps = getPairwise(group[i].id, group[j].id);
          groupComplementarities.push(...comps);
        }
      }

      const assignedParticipants: EngineParticipantAssignment[] = [];
      const assignedAssets: EngineAssetUsage[] = [];
      const assignedActorIds = new Set<string>();

      let canSatisfyRequiredRoles = true;

      for (const requiredRole of pattern.requiredRoles) {
        let assigned = false;

        for (const actor of group) {

          const matchingAsset = actor.assets.find((as) => {
            const catMatches = requiredRole.acceptedCategories.includes(as.category);
            const roleMatches =
              !requiredRole.acceptedRoles ||
              requiredRole.acceptedRoles.length === 0 ||
              as.roles.some((r) => requiredRole.acceptedRoles?.includes(r));
            return catMatches && roleMatches;
          });

          if (matchingAsset) {
            assignedParticipants.push({
              actorId: actor.id,
              actorName: actor.name,
              roleCode: requiredRole.code,
              roleLabel: requiredRole.label,
              contribution: `Menyediakan ${matchingAsset.name} sebagai ${requiredRole.label.toLowerCase()}`,
              assetIds: [matchingAsset.id],
            });

            assignedAssets.push({
              assetId: matchingAsset.id,
              actorId: actor.id,
              name: matchingAsset.name,
              category: matchingAsset.category,
              roleCode: requiredRole.code,
              contribution: requiredRole.label,
            });

            assignedActorIds.add(actor.id);
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          canSatisfyRequiredRoles = false;
        }
      }

      if (!canSatisfyRequiredRoles && pattern.code !== 'FASHION_CAPSULE') {
        continue;
      }

      for (const actor of group) {
        if (!assignedActorIds.has(actor.id)) {

          let assignedOptional = false;
          for (const optRole of pattern.optionalRoles) {
            const optAsset = actor.assets.find((as) =>
              optRole.acceptedCategories.includes(as.category)
            );
            if (optAsset) {
              assignedParticipants.push({
                actorId: actor.id,
                actorName: actor.name,
                roleCode: optRole.code,
                roleLabel: optRole.label,
                contribution: `Menyediakan ${optAsset.name} untuk ${optRole.label.toLowerCase()}`,
                assetIds: [optAsset.id],
              });

              assignedAssets.push({
                assetId: optAsset.id,
                actorId: actor.id,
                name: optAsset.name,
                category: optAsset.category,
                roleCode: optRole.code,
                contribution: optRole.label,
              });

              assignedActorIds.add(actor.id);
              assignedOptional = true;
              break;
            }
          }

          if (!assignedOptional) {

            const firstAsset = actor.assets[0];
            assignedParticipants.push({
              actorId: actor.id,
              actorName: actor.name,
              roleCode: 'COLLABORATOR',
              roleLabel: 'Mitra Kolaborator',
              contribution: firstAsset ? `Menyumbangkan ${firstAsset.name}` : 'Mendukung koordinasi kolaborasi',
              assetIds: firstAsset ? [firstAsset.id] : [],
            });
            if (firstAsset) {
              assignedAssets.push({
                assetId: firstAsset.id,
                actorId: actor.id,
                name: firstAsset.name,
                category: firstAsset.category,
                roleCode: 'COLLABORATOR',
                contribution: 'Aset Kolaborasi',
              });
            }
          }
        }
      }

      const uniqueParticipants = deduplicateParticipants(assignedParticipants);

      const titleContext = {
        actors: group,
        assets: assignedAssets.map((a) => {
          const raw = group.flatMap((act) => act.assets).find((as) => as.id === a.assetId);
          return raw || { id: a.assetId, actorId: a.actorId, name: a.name, category: a.category, roles: [] };
        }),
        patternName: pattern.name,
      };

      const title = pattern.generateTitle(titleContext);
      const description = pattern.generateDescription(titleContext);

      const goalsSupported: string[] = [];
      const goalTitles: string[] = [];
      for (const act of group) {
        for (const g of act.goals) {
          if (pattern.preferredGoals.includes(g.category) || g.priority >= 4) {
            goalsSupported.push(g.id);
            goalTitles.push(`${act.name}: ${g.title}`);
          }
        }
      }

      const needsAddressed: string[] = [];
      const needTitles: string[] = [];
      for (const comp of groupComplementarities) {
        if (comp.relationshipType === 'DIRECT_NEED_MATCH') {
          for (const act of group) {
            for (const n of act.needs) {
              if (!needsAddressed.includes(n.id)) {
                needsAddressed.push(n.id);
                needTitles.push(`${act.name}: ${n.title}`);
              }
            }
          }
        }
      }

      const feasibility = evaluateOpportunityFeasibility(pattern, group, uniqueParticipants);

      const explanation = generateOpportunityExplanation({
        pattern,
        title,
        participants: uniqueParticipants,
        assetsUsed: assignedAssets,
        complementarities: groupComplementarities,
        feasibility,
        goalsSupportedTitles: goalTitles,
        needsAddressedTitles: needTitles,
      });

      const sortedActorIds = group.map((a) => a.id).sort().join(':');
      const deduplicationKey = `${pattern.code}_${sortedActorIds}`;

      if (deduplicationSet.has(deduplicationKey)) {
        continue;
      }
      deduplicationSet.add(deduplicationKey);

      const score = calculateOpportunityScore({
        pattern,
        actors: group,
        participants: uniqueParticipants,
        assetsUsed: assignedAssets,
        complementarities: groupComplementarities,
        feasibility,
        goalsSupported,
        needsAddressed,
      });

      candidateOpportunities.push({
        patternCode: pattern.code,
        patternName: pattern.name,
        patternVersion: pattern.version,
        title,
        description,
        participants: uniqueParticipants,
        assets: assignedAssets,
        goalsSupported,
        needsAddressed,
        targetMarket: {
          audience: 'Urban Fashion Enthusiasts & Editorial Audiences',
          segment: 'Pasar Fashion & Visual Editorial Kontemporer',
        },
        expectedOutputs: pattern.expectedOutputs,
        feasibility,
        score,
        explanation,
        deduplicationKey,
      });

      countForPattern++;
    }
  }

  candidateOpportunities.sort((a, b) => b.score.displayScore - a.score.displayScore);

  return candidateOpportunities.slice(0, maxTotal);
}

function generateActorCombinations(
  actors: EngineActor[],
  min: number,
  max: number,
  focusActorId?: string
): EngineActor[][] {
  const result: EngineActor[][] = [];

  const focusActor = focusActorId ? actors.find((a) => a.id === focusActorId) : undefined;
  const pool = focusActor ? actors.filter((a) => a.id !== focusActorId) : actors;

  for (let k = min; k <= Math.min(max, actors.length); k++) {
    if (focusActor) {

      const otherCombos = kCombinations(pool, k - 1);
      for (const c of otherCombos) {
        result.push([focusActor, ...c]);
      }
    } else {
      const combos = kCombinations(pool, k);
      result.push(...combos);
    }
  }

  return result;
}

function kCombinations<T>(array: T[], k: number): T[][] {
  if (k <= 0) return [[]];
  if (k > array.length) return [];
  if (k === array.length) return [array];

  const result: T[][] = [];

  function recurse(start: number, current: T[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      current.push(array[i]);
      recurse(i + 1, current);
      current.pop();
    }
  }

  recurse(0, []);
  return result;
}

function deduplicateParticipants(
  participants: EngineParticipantAssignment[]
): EngineParticipantAssignment[] {
  const map = new Map<string, EngineParticipantAssignment>();
  for (const p of participants) {
    if (!map.has(p.actorId)) {
      map.set(p.actorId, p);
    } else {

      const existing = map.get(p.actorId)!;
      for (const aid of p.assetIds) {
        if (!existing.assetIds.includes(aid)) {
          existing.assetIds.push(aid);
        }
      }
    }
  }
  return Array.from(map.values());
}
