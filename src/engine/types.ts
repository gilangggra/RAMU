export type EngineConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type EngineSourceType = 'SELF_REPORTED' | 'VERIFIED' | 'INFERRED';

export type EngineConstraintSeverity = 'HARD' | 'SOFT' | 'UNKNOWN';
export type EngineConstraintOperator = 'LTE' | 'GTE' | 'EQ' | 'BETWEEN' | 'IN' | 'NOT_IN';
export type EngineNegotiability = 'FIXED' | 'NEGOTIABLE' | 'FLEXIBLE';

export type EngineFeasibilityStatus = 'FEASIBLE' | 'PROMISING' | 'PARTIAL' | 'BLOCKED' | 'UNKNOWN';

export type EngineComplementarityRelationship =
  | 'DIRECT_NEED_MATCH'
  | 'CAPABILITY_GAP'
  | 'PRODUCT_COMBINATION'
  | 'RESOURCE_COMBINATION'
  | 'EDITORIAL_PUBLICATION'
  | 'PRODUCTION_CHAIN'
  | 'CREATIVE_COMBINATION'
  | 'CULTURAL_COMBINATION'
  | 'REDUNDANT'
  | 'INCOMPATIBLE';

export type EngineComplementarityStrength = 'STRONG' | 'MEDIUM' | 'WEAK' | 'NONE' | 'UNKNOWN';

export interface EngineAsset {
  id: string;
  actorId: string;
  category: string;
  subtype?: string | null;
  name: string;
  description?: string | null;
  roles: string[];
  attributes?: Record<string, unknown>;
  confidenceLevel?: EngineConfidenceLevel;
  sourceType?: EngineSourceType;
}

export interface EngineGoal {
  id: string;
  actorId: string;
  category: string;
  title: string;
  description?: string | null;
  priority: number;
}

export interface EngineNeed {
  id: string;
  actorId: string;
  relatedGoalId?: string | null;
  category: string;
  title: string;
  description?: string | null;
  priority: number;
}

export interface EngineConstraint {
  id: string;
  actorId: string;
  type: string;
  value: Record<string, unknown> | string | number;
  unit?: string | null;
  operator?: EngineConstraintOperator | null;
  severity: EngineConstraintSeverity;
  negotiability?: EngineNegotiability;
  notes?: string | null;
}

export interface EngineActor {
  id: string;
  name: string;
  sector: string;
  location?: string | null;
  actorType: string;
  assets: EngineAsset[];
  goals: EngineGoal[];
  needs: EngineNeed[];
  constraints: EngineConstraint[];
}

export interface PatternRoleDef {
  code: string;
  label: string;
  required: boolean;
  minCount: number;
  maxCount?: number;
  acceptedCategories: string[];
  acceptedRoles?: string[];
}

export interface PatternRuleDef {
  ruleType: string;
  ruleConfig: Record<string, unknown>;
  priority: number;
}

export interface TitleContext {
  actors: EngineActor[];
  assets: EngineAsset[];
  patternName: string;
}

export interface OpportunityPatternDef {
  code: string;
  name: string;
  description: string;
  category: string;
  version: number;
  minParticipants: number;
  maxParticipants: number;
  requiredRoles: PatternRoleDef[];
  optionalRoles: PatternRoleDef[];
  expectedOutputs: string[];
  allowedRelationships: EngineComplementarityRelationship[];
  preferredGoals: string[];
  generateTitle: (ctx: TitleContext) => string;
  generateDescription: (ctx: TitleContext) => string;
}

export interface PairwiseComplementarity {
  sourceActorId: string;
  targetActorId: string;
  sourceAssetId?: string;
  targetAssetId?: string;
  relationshipType: EngineComplementarityRelationship;
  strength: EngineComplementarityStrength;
  reasons: string[];
  numericStrength: number;
}

export interface FeasibilityEvaluation {
  status: EngineFeasibilityStatus;
  passed: boolean;
  hardFailures: string[];
  warnings: string[];
  missingRoles: string[];
  unknowns: string[];
  notes: string[];
}

export interface OpportunityScoreBreakdown {
  complementarity: number;
  feasibility: number;
  goalAlignment: number;
  needCoverage: number;
  actionability: number;
  assetUtilization: number;
  baseScore: number;
  displayScore: number;
  explanation: {
    summary: string;
    dimensionDetails: Record<string, string>;
  };
}

export interface OpportunityExplanationDef {
  summary: string;
  why: string[];
  who: {
    actorId: string;
    actorName: string;
    role: string;
    contribution: string;
    assets: string[];
  }[];
  what: string;
  how: string[];
  can: {
    feasibilityStatus: EngineFeasibilityStatus;
    notes: string[];
  };
}

export interface EngineParticipantAssignment {
  actorId: string;
  actorName: string;
  roleCode: string;
  roleLabel: string;
  contribution: string;
  assetIds: string[];
}

export interface EngineAssetUsage {
  assetId: string;
  actorId: string;
  name: string;
  category: string;
  roleCode: string;
  contribution: string;
}

export interface EngineOpportunity {
  id?: string;
  patternCode: string;
  patternName: string;
  patternVersion: number;
  title: string;
  description: string;
  participants: EngineParticipantAssignment[];
  assets: EngineAssetUsage[];
  goalsSupported: string[];
  needsAddressed: string[];
  targetMarket: {
    audience: string;
    segment: string;
  };
  expectedOutputs: string[];
  feasibility: FeasibilityEvaluation;
  score: OpportunityScoreBreakdown;
  explanation: OpportunityExplanationDef;
  deduplicationKey: string;
}
