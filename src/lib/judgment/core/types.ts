import type { TenGod, HiddenStemRole } from '../../dayRelationships'
import type { RoleStateContract, Validity } from '../contracts'

export type Scope = 'natal' | 'greatLuck' | 'yearlyLuck' | 'monthlyLuck' | 'dailyLuck'
export type EvidenceStatus = 'SOURCE_EXPLICIT' | 'SOURCE_INFERENCE' | 'FILUNE_APPROVED_OVERRIDE' | 'CONFLICT' | 'DEFERRED'
export type StemRuntime = 'active' | 'weakened' | 'stopped'
export type ScopeRootFact = {
  id: string
  stemEntityId: string
  branchEntityId: string
  hiddenStem: string
  sourceClass: HiddenStemRole
}
export type RootState = 'absent' | 'present' | 'strengthened' | 'weakened'
export type BranchPattern = TenGod | '羊刃'
export type PatternMode = 'proper' | 'transformed' | 'combined' | 'month_command_unusable' | 'special_peer_pattern'
export type MonthHiddenStemCandidate = { stem: string; tenGod: TenGod; sourceClass: HiddenStemRole }
export type ManifestationHistory = MonthHiddenStemCandidate & {
  entityId: string
  manifestationScope: Scope
  originPeriod?: Validity
  monthCommandRoot: true
}
export type EffectiveManifestedYongShen = ManifestationHistory & { effectiveness: Exclude<StemRuntime, 'stopped'> }
export type YongShenRelation = {
  stems: readonly [string, string]
  participantIds: readonly [string, string]
  relationQuality: 'favorable_harmony' | 'unfavorable_conflict' | 'mixed' | 'deferred'
  currentFunction: 'operating' | 'reduced' | 'inactive' | 'deferred'
  relationFactIds: readonly string[]
}
type PatternBasis = {
  id: string
  scope: Scope
  branchPattern: BranchPattern | null
  monthHiddenStemCandidates: readonly MonthHiddenStemCandidate[]
  manifestationHistory: readonly ManifestationHistory[]
  heavenlyPatterns: readonly TenGod[]
  patternMode: PatternMode | null
  yongShenRelations: readonly YongShenRelation[]
}
export type ProvisionalPatternContext = PatternBasis & { phase: 'provisional' }
export type FinalPatternContext = PatternBasis & {
  phase: 'final'
  effectiveManifestedYongShen: readonly EffectiveManifestedYongShen[]
}
export type RelationAction = 'generate' | 'control' | 'combine' | 'protect' | 'drain' | 'formation_strengthen'
export type StemParticipant = {
  id: string
  stem: string
  scope: Scope
  position: 'year' | 'month' | 'time' | 'day' | 'luck'
  tenGod: TenGod
  dayMaster: boolean
}
export type StemRelationFact = {
  id: string
  action: Extract<RelationAction, 'generate' | 'control' | 'combine'>
  source: StemParticipant
  target: StemParticipant
}
export type FormulaFact = {
  id: string
  formulaType: 'FoodGodControlsKilling' | 'HurtingOfficerControlsKilling' | 'HurtingOfficerCombinesKilling' | 'ResourceExcessUsesWealth'
  relationFactIds: readonly string[]
  patternContextId: string
  validity: Validity
}
export type ConditionalByeong = {
  kind: 'can_generate_future_killing'
  sourceEntityId: string
  supportingRelationFactId: string
  requiresHarmfulKilling?: true
  triggerPolicyId?: 'FOOD-03' | 'PEER-05'
  status: 'conditional'
}
export type RoleHistory = RoleStateContract
export type RoleCurrentState = {
  roleHistoryRef: string
  currentState: StemRuntime | 'deferred'
  currentFunction: 'operating' | 'reduced' | 'inactive' | 'deferred'
  functionRefs?: readonly string[]
}

export type RoleFunctionBasis = {
  roleHistoryRef: string
  sourceEntityId: string
  targetEntityId: string
  action: 'generate' | 'control'
  relievesByeongRoleRef?: string
  evidenceIds: readonly string[]
}
export type CapacityEvidence = { state: string; evidenceIds: readonly string[] }
export type LuckEffectType =
  | 'manifests_yongshen' | 'changes_pattern_mode'
  | 'activates_byeong' | 'strengthens_byeong' | 'weakens_byeong' | 'relieves_byeong'
  | 'attacks_yongshen' | 'protects_yongshen'
  | 'activates_sangshen_function' | 'weakens_sangshen'
  | 'changes_root_state' | 'changes_capacity' | 'changes_formation'
export type LuckEffect = {
  effectType: LuckEffectType
  scope: Exclude<Scope, 'natal'>
  sourceLuckEntityId: string
  subjectId: string
  evidenceRefs: readonly string[]
}

export type LuckEffectEvent = LuckEffect & {
  id: string
  originScope: LuckEffect['scope']
  originScopeId: string
  originPeriod: Validity
  /** Comparable outcome at emission, using participant identity rather than scoped fact IDs. */
  outcome: string | null
  combinationKey?: string
  requiredPath?: string
  requiresManifestation?: true
  sourceRelationFactId?: string
  sourceFormulaFactId?: string
}

export type LuckEffectState = {
  event: LuckEffectEvent
  originScope: LuckEffectEvent['originScope']
  originScopeId: string
  originPeriod: Validity
  inherited: boolean
  currentlyEffective: boolean
  expired: boolean
}
