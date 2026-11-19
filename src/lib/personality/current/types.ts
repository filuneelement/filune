import type { TenGod } from '../../dayRelationships'
import type {
  NatalPersonalityResult, PersonalityConflict, PersonalityFact, PersonalityProvenance, StructuralCurrentFunction,
  StructuralCurrentState, StructuralRolePersonalityModifier, StructuralRuntime,
} from '../types'

export type PersonalityScope = 'natal' | 'daewoon' | 'sewoon' | 'month' | 'day'
export type LuckPersonalityScope = Exclude<PersonalityScope, 'natal'>
export type PersonalityPeriod = { periodId: string; start: string; end: string }

export interface LuckPersonalityOccurrence {
  entityId: string
  stem: string
  tenGod: TenGod
  mode: 'outward' | 'inner'
  sourceIds: readonly string[]
}

export interface CurrentStructuralRoleState {
  roleId: string
  currentState: StructuralCurrentState
  currentFunction: StructuralCurrentFunction
  runtimeState?: StructuralRuntime
  pathRefs: readonly string[]
  actualFunctionRefs: readonly string[]
  /** The evaluated conditional trigger must be linked to this role's own basis. */
  activeTriggerRef?: string
  activeTriggerFunction?: 'operating' | 'reduced'
  damageState?: NonNullable<StructuralRolePersonalityModifier['damagePath']>['currentState']
}

export interface PersonalityStructuralEffect {
  id: string
  effectType: string
  subjectId: string
  sourceEntityId: string
  originScope: LuckPersonalityScope
  originScopeId?: string
  originPeriod?: PersonalityPeriod
  currentlyEffective: boolean
  expired: boolean
  sourceIds: readonly string[]
}

export interface PersonalityStructuralScope {
  id: string
  scope: PersonalityScope
  parentScopeId: string | null
  period?: PersonalityPeriod
  currentlyEffective: boolean
  occurrences: readonly LuckPersonalityOccurrence[]
  roles: readonly CurrentStructuralRoleState[]
  effects: readonly PersonalityStructuralEffect[]
}

export interface CurrentPersonalityOrigin {
  originScope: LuckPersonalityScope
  originScopeId: string
  originPeriod: PersonalityPeriod
  originEffectId: string
  inherited: boolean
  sourceLuckFactIds: string[]
}

export interface CurrentPersonalityFact {
  personalityFactId: string
  origin: 'natal' | 'luck'
  originScope: PersonalityScope
  expressionMode?: 'outward' | 'inner'
  state: 'baseline' | 'active' | 'contextual' | 'reduced' | 'inactive' | 'deferred'
  currentlyEffective: boolean
  origins: CurrentPersonalityOrigin[]
  sourceStructuralEffectIds: string[]
}

export interface PersonalityScopeExpression {
  scope: PersonalityScope
  scopeId: string
  period?: PersonalityPeriod
  inheritedFactIds: string[]
  temporaryFactIds: string[]
  roleModifierIds: string[]
  roleModifierStates: {
    modifierId: string
    status: StructuralRolePersonalityModifier['status']
    currentFunction: StructuralCurrentFunction
    sourceStructuralEffectIds: string[]
  }[]
  conflictIds: string[]
  inheritedEffectIds: string[]
  currentlyEffective: boolean
}

export interface PersonalityEffectHistory {
  id: string
  type: 'temporary_ten_god_expression' | 'role_modifier_change' | 'conflict_activation' | 'structural_context'
  originScope: LuckPersonalityScope
  originPeriod?: PersonalityPeriod
  originScopeId?: string
  currentlyEffective: boolean
  expired: boolean
  inherited: boolean
  sourceIds: string[]
  factIds: string[]
  structuralEffectType?: string
}

export interface CurrentPersonalityResult {
  natal: NatalPersonalityResult
  requestedScope: PersonalityScope
  evaluationScope: PersonalityScope
  evaluationScopeId: string
  scopeExpressions: PersonalityScopeExpression[]
  currentFacts: CurrentPersonalityFact[]
  temporaryFacts: PersonalityFact[]
  structuralRoleModifiers: StructuralRolePersonalityModifier[]
  conflicts: PersonalityConflict[]
  effectHistory: PersonalityEffectHistory[]
  provenanceIds: string[]
  provenance: PersonalityProvenance[]
}
