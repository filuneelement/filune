import type { HiddenStemRole, TenGod } from '../dayRelationships'
import type { EarthlyBranch, HeavenlyStem, TwelveStage } from '../twelveStages'

/** The knowledge schema names the existing 印綬 identity 正印. */
export type PersonalityTenGod = Exclude<TenGod, '印綬'> | '正印'

export const TEN_GOD_TO_PERSONALITY_ID = {
  比肩: '比肩',
  劫財: '劫財',
  食神: '食神',
  傷官: '傷官',
  偏財: '偏財',
  正財: '正財',
  偏官: '偏官',
  正官: '正官',
  偏印: '偏印',
  印綬: '正印',
} as const satisfies Record<TenGod, PersonalityTenGod>

type PersonalityConfidence = 'source_explicit' | 'source_synthesis' | 'filune_interpretation'

export interface PersonalityEvidence<Field extends string = string> {
  sourceType: 'day_stem' | 'ten_god' | 'position' | 'day_pillar'
  sourceId: string
  sourceRef?: string
  corroboratingRefs?: string[]
  fields: Field[]
  confidence?: PersonalityConfidence
  note?: string
}

export interface PersonalityCondition {
  context: string
}

export interface PersonalityTraitVariant {
  id: string
  trait: string
  expressionType: 'core' | 'positive' | 'shadow' | 'excess' | 'deficiency' | 'contextual' | 'traditional' | 'modern'
  condition?: PersonalityCondition[]
  sourceRef: string
  confidence: PersonalityConfidence
}

export interface DayStemTraits {
  coreNature: string[]
  coreDrive: string[]
  strengths: string[]
  shadowTraits: string[]
  decisionStyle: string[]
  socialExpression: string[]
  innerExpression: string[]
  stressResponse: string[]
  growthDirection: string[]
}

export interface DayStemPersonalityProfile extends DayStemTraits {
  stem: HeavenlyStem
  evidenceNotes: PersonalityEvidence<keyof DayStemTraits>[]
}

export interface TenGodTraits {
  coreDrive: string[]
  coreStrengths: string[]
  ordinaryExpression: string[]
  productiveExpression: string[]
  excessiveExpression: string[]
  deficientExpression: string[]
  socialExpression: string[]
  innerExpression: string[]
  workStyle: string[]
  relationshipStyle: string[]
  decisionStyle: string[]
  stressResponse: string[]
  cautionPatterns: string[]
}

export interface TenGodPersonalityProfile extends TenGodTraits {
  tenGod: PersonalityTenGod
  traitVariants: PersonalityTraitVariant[]
  evidenceNotes: PersonalityEvidence<keyof TenGodTraits>[]
}

export type PersonalityPosition = 'stem' | 'branch' | 'month_branch' | 'day_branch' | 'hour_branch' | 'year_branch'

export interface PositionExpressionRule {
  positionType: PersonalityPosition
  expressionDomain: string[]
  interpretationRules: string[]
  evidenceNotes: PersonalityEvidence<'expressionDomain' | 'interpretationRules'>[]
}

export type DayPillar = `${HeavenlyStem}${EarthlyBranch}`

export interface DayPillarConflict {
  sourceA: string
  sourceB: string
  tension: string
  possibleExpression: string[]
}

/** Audit and provenance metadata. Excluded claims are outside personality interpretation. */
export interface ExcludedPersonalityClaim {
  exclusionReason:
    | 'relationship_prediction'
    | 'gender_determinism'
    | 'wealth_prediction'
    | 'career_prediction'
    | 'health_prediction'
    | 'compatibility_prediction'
    | 'non_personality_claim'
  sourceTextSummary: string
  sourceRef: string
}

export interface DayPillarTraits {
  branchNature: string[]
  corePersonality: string[]
  decisionStyle: string[]
  interpersonalStyle: string[]
  strengths: string[]
  shadowPatterns: string[]
  internalConflict: DayPillarConflict[]
  expressionPattern: string[]
  growthDirection: string[]
}

export type DayPillarEvidenceField = keyof DayPillarTraits | 'dayBranchTenGod' | 'twelveLifeStage'

export interface DayPillarProfile extends DayPillarTraits {
  pillar: DayPillar
  dayStem: HeavenlyStem
  dayBranch: EarthlyBranch
  dayBranchTenGod: PersonalityTenGod
  twelveLifeStage: TwelveStage
  excludedClaims: ExcludedPersonalityClaim[]
  evidenceNotes: PersonalityEvidence<DayPillarEvidenceField>[]
}

export type NatalPersonalityPosition =
  | 'year_stem' | 'month_stem' | 'day_stem' | 'hour_stem'
  | 'year_branch' | 'month_branch' | 'day_branch' | 'hour_branch'

export type PersonalityTraitType =
  | 'core' | 'strength' | 'shadow' | 'decision' | 'social' | 'inner'
  | 'interpersonal' | 'work' | 'stress' | 'growth' | 'internal_conflict' | 'expression'

export interface PersonalityFact {
  id: string
  sourceType: PersonalityEvidence['sourceType']
  trait: string
  traitType: PersonalityTraitType
  sourcePosition?: NatalPersonalityPosition
  tenGod?: PersonalityTenGod
  dayPillar?: DayPillar
  occurrenceIds: string[]
  provenanceIds: string[]
  status: 'active' | 'contextual' | 'deferred'
}

export interface NatalTenGodOccurrence {
  id: string
  tenGod: PersonalityTenGod
  canonicalTenGod: TenGod
  position: Exclude<NatalPersonalityPosition, 'day_stem'>
  stem: string
  sourcePath: string
  hiddenStemRole?: HiddenStemRole
}

export type TenGodProminence = 'low' | 'present' | 'prominent' | 'very_prominent'

export interface TenGodProminenceEvidence {
  tenGod: PersonalityTenGod
  type: 'stem_manifested' | 'month_branch' | 'branch_basis' | 'rooted' | 'formation_supported'
    | 'repeated' | 'runtime_active' | 'structurally_operating'
  sourceIds: string[]
}

export type ProminenceResolution =
  | { status: 'confirmed'; level: TenGodProminence; evidence: TenGodProminenceEvidence[] }
  | { status: 'deferred'; reason: 'no_grade_criteria'; evidence: TenGodProminenceEvidence[] }

export interface TenGodPersonalityState {
  tenGod: PersonalityTenGod
  occurrence: 'absent' | 'present' | 'undetermined'
  occurrenceIds: string[]
  prominence: ProminenceResolution
  activeTraitFactIds: string[]
  contextualTraitFactIds: string[]
}

export interface PositionExpression {
  position: NatalTenGodOccurrence['position']
  expressionMode: 'outward' | 'innate' | 'inner' | 'decision' | 'private' | 'supporting_context'
  ruleIds: PersonalityPosition[]
  expressionDomain: string[]
  interpretationRules: string[]
  provenanceIds: string[]
  factIds: string[]
}

export interface DayPillarPersonalityModifier {
  pillar: DayPillar
  dayBranchTenGod: PersonalityTenGod
  factIds: string[]
  conflictIds: string[]
}

export interface PersonalityConflict {
  id: string
  factIds: string[]
  conflictType: 'outward_vs_inner' | 'fast_vs_cautious' | 'independent_vs_relational'
    | 'stable_vs_change' | 'direct_vs_indirect' | 'source_explicit' | 'other'
    | 'structural_role_tension' | 'conditional_role_shift' | 'natal_vs_current' | 'temporary_expression_tension'
  resolution: 'coexist' | 'context_split' | 'deferred'
  explanationEvidence: string[]
}

export interface PersonalityDimensionSummary {
  dimension: 'outwardExpression' | 'innerDecision' | 'workStyle' | 'interpersonal' | 'stressPattern' | 'strengths' | 'shadowPatterns'
  confirmedFactIds: string[]
  contextualFactIds: string[]
  conflictingFactIds: string[]
}

export interface PersonalityProvenance {
  id: string
  sourceType: PersonalityEvidence['sourceType']
  profileId: string
  field: string
  sourceRefs: string[]
}

export interface NatalPersonalityResult {
  dayStem: HeavenlyStem
  dayPillar: DayPillar
  facts: PersonalityFact[]
  occurrences: NatalTenGodOccurrence[]
  tenGodStates: TenGodPersonalityState[]
  positionExpressions: PositionExpression[]
  dayPillarModifier: DayPillarPersonalityModifier
  conflicts: PersonalityConflict[]
  summaryDimensions: PersonalityDimensionSummary[]
  provenanceIds: string[]
  provenance: PersonalityProvenance[]
  structuralRoleModifiers: StructuralRolePersonalityModifier[]
  roleConflicts: StructuralRolePersonalityConflict[]
  structuralRoleDiagnostics: StructuralRolePersonalityDiagnostic[]
  unavailablePositions: NatalTenGodOccurrence['position'][]
}

export type StructuralPersonalityRole = 'yongshen' | 'sangshen' | 'byeong' | 'gueung'
export type StructuralRuntime = 'active' | 'weakened' | 'stopped'
export type StructuralCurrentFunction = 'operating' | 'reduced' | 'inactive' | 'deferred' | 'favorable'
export type StructuralCurrentState = StructuralRuntime | 'inactive' | 'conditional' | 'protective_standby' | 'deferred'
type RelationAction = 'generate' | 'control' | 'combine' | 'coexist'

export interface NatalStructuralActor {
  entityId: string
  position: NatalTenGodOccurrence['position'] | 'day_stem'
  stem: string
  tenGod: TenGod
  hiddenStemRole?: HiddenStemRole
}

export interface NatalStructuralRoleHistory {
  roleId: string
  role: StructuralPersonalityRole
  actorId: string
  pathRefs: readonly string[]
  conditional?: true
  protectiveStandbyEligible?: true
  protectedEntityId?: string
  damageId?: string
  targetByeongId?: string
}

export interface NatalStructuralRoleCurrent {
  roleId: string
  currentState: StructuralCurrentState
  currentFunction: StructuralCurrentFunction
  pathRefs: readonly string[]
}

export interface NatalStructuralPath {
  id: string
  sourceEntityId: string
  targetEntityId: string
  action: RelationAction
  actual?: {
    ref: string
    function: Exclude<StructuralCurrentFunction, 'favorable'>
    direction: string
    policyId: string | null
    evidenceIds: readonly string[]
  }
}

export interface NatalStructuralDamagePath {
  id: string
  sourceEntityId: string
  targetEntityId: string
  action: Exclude<RelationAction, 'coexist'>
  damagedFunction: string
  structuralConsequence: string
  relationFactIds: readonly string[]
  evidenceIds: readonly string[]
  currentState: 'active' | 'weakened' | 'inactive'
}

export interface NatalStructuralReading {
  scope: 'natal'
  scopeId: string
  actors: readonly NatalStructuralActor[]
  roleHistory: readonly NatalStructuralRoleHistory[]
  currentRoles: readonly NatalStructuralRoleCurrent[]
  runtime: readonly { entityId: string; state: StructuralRuntime }[]
  paths: readonly NatalStructuralPath[]
  damagePaths: readonly NatalStructuralDamagePath[]
  manifestedYongShen: readonly { entityId: string; patternContextId: string }[]
}

export interface StructuralRolePersonalityModifier {
  id: string
  sourceRole: StructuralPersonalityRole
  sourceRoleId: string
  sourceEntityId: string
  sourceScopeId: string
  sourceFactIds: string[]
  historyPathRefs: string[]
  currentPathRefs: string[]
  actualFunctionRefs: string[]
  targetPersonalityFactIds: string[]
  protectedEntityId?: string
  targetByeongId?: string
  damagePath?: {
    id: string
    sourceEntityId: string
    targetEntityId: string
    action: NatalStructuralDamagePath['action']
    damagedFunction: string
    structuralConsequence: string
    currentState: NatalStructuralDamagePath['currentState']
  }
  operation: 'supports_expression' | 'channels_expression' | 'restrains_expression'
    | 'distorts_expression' | 'protects_expression' | 'resolves_tension' | 'contextualizes'
  status: 'confirmed' | 'reduced' | 'inactive' | 'deferred' | 'contextual'
  currentState: StructuralCurrentState
  currentFunction: StructuralCurrentFunction
  runtimeState?: StructuralRuntime
  roleContext: 'assigned' | 'conditional_byeong' | 'protective_standby'
  provenanceIds: string[]
}

export interface StructuralRolePersonalityDiagnostic {
  sourceRoleId: string
  sourceEntityId: string
  code: 'ROLE_PERSONALITY_LINK_MISMATCH' | 'NO_PERSONALITY_TRAIT_TARGET'
    | 'ROLE_ACTOR_UNAVAILABLE' | 'ROLE_PATH_UNCONFIRMED'
}

export interface StructuralRolePersonalityConflict extends PersonalityConflict {
  conflictType: 'structural_role_tension' | 'conditional_role_shift'
  modifierIds: string[]
}
