import type { Validity } from '../judgment/contracts'
import type { LuckScopeState } from '../judgment/core/luckScope'
import type { MoneyOutcomeFact, RelationshipOutcomeFact } from '../outcome'

export type EventScope = 'natal' | 'daewoon' | 'sewoon' | 'month' | 'day'
export type TimedEventScope = Exclude<EventScope, 'natal' | 'day'>
export type EventDomain = 'contract' | 'business_start' | 'business_expansion' | 'business_adjustment' | 'business_restructure'
export type EventEvidenceFunction = 'supports' | 'blocks' | 'delays' | 'destabilizes' | 'protects' | 'activates' | 'binds'
export type EventProvenanceClass = 'SOURCE_EXPLICIT' | 'SOURCE_INFERENCE' | 'FILUNE_APPROVED_OVERRIDE' | 'SOURCE_CONFLICT' | 'DEFERRED'
export type EventEvidenceType =
  | 'document_support' | 'document_obstruction' | 'institutional_instability' | 'support_function_stopped'
  | 'binding' | 'contract_trouble'
  | 'business_activity_support' | 'business_result_support' | 'business_start_support'
  | 'business_expansion_support' | 'business_adjustment_need' | 'business_restructure_trigger'
  | 'business_execution_obstruction'

export interface EventEvidenceFact {
  readonly id: string
  readonly eventDomain: EventDomain
  readonly evidenceType: EventEvidenceType
  readonly functionType: EventEvidenceFunction
  readonly direction: 'favorable' | 'unfavorable' | 'deferred'
  readonly scope: EventScope
  /** Scope where the structural path first originated. */
  readonly originScope: EventScope
  readonly scopeId: string
  readonly parentScopeId: string | null
  readonly scopeGanZhi?: string
  readonly parentScopeGanZhi?: string
  readonly period?: Validity
  readonly certainty: 'confirmed' | 'contextual' | 'conditional' | 'deferred'
  readonly provenanceClass: EventProvenanceClass
  readonly currentLifecycle: 'active' | 'reduced' | 'inactive' | 'stopped' | 'deferred' | 'expired'
  readonly currentlyEffective: boolean
  readonly temporalStatus: 'baseline' | 'current' | 'future' | 'expired'
  readonly sourcePathId: string
  readonly sourceJudgmentIds: readonly string[]
  readonly sourceRelationIds: readonly string[]
  readonly sourceRoleIds: readonly string[]
  /** PatternContext IDs identify LuckManifestedYongShen, which SG-097 keeps outside natal RoleHistory. */
  readonly sourcePatternContextIds: readonly string[]
  readonly sourceOutcomeIds: readonly string[]
  readonly sourceLuckEffectIds: readonly string[]
  readonly sourceContextKeys: readonly string[]
  readonly provenance: readonly string[]
}

export type EventTimingType =
  | 'contract_favorable' | 'contract_delay' | 'contract_process_trouble' | 'contract_termination_or_restructure'
  | 'business_start_favorable' | 'business_start_delay'
  | 'business_expansion_favorable' | 'business_adjustment' | 'business_restructure'

export type EventTimingDirection = 'favorable' | 'delay' | 'trouble' | 'adjustment' | 'restructure' | 'disruption'

/** Semantic event assertion in a named Judgment scope, independent of Gregorian dates. */
export type EventTimingDecision = {
  readonly id: string
  readonly eventType: EventTimingType
  readonly direction: EventTimingDirection
  /** Scope where the supporting structural path originated. */
  readonly originScope: EventScope
  /** Scope in which this event direction is asserted. */
  readonly scope: TimedEventScope
  readonly scopeId: string
  readonly parentScopeId: string | null
  readonly scopeGanZhi?: string
  readonly parentScopeGanZhi?: string
  readonly certainty: 'confirmed' | 'contextual'
  readonly provenanceClass: EventProvenanceClass
  readonly currentLifecycle: 'active' | 'reduced'
  /** Effective within this source/Judgment scope; not a statement about today's calendar. */
  readonly currentlyEffective: boolean
  readonly sourceEvidenceIds: readonly string[]
  readonly sourceJudgmentIds: readonly string[]
  readonly sourceRelationIds: readonly string[]
  readonly sourceRoleIds: readonly string[]
  readonly sourcePatternContextIds: readonly string[]
  readonly sourceOutcomeIds: readonly string[]
  readonly sourceLuckEffectIds: readonly string[]
  readonly provenance: readonly string[]
}

export type EventTimingFact = {
  readonly id: string
  readonly decisionId: string
  readonly eventType: EventTimingType
  readonly direction: EventTimingDirection
  /** Scope in which the event interval was established; chapter placement never changes it. */
  readonly originScope: EventScope
  readonly scope: TimedEventScope
  readonly scopeId: string
  readonly scopeGanZhi?: string
  readonly parentScopeGanZhi?: string
  readonly period: Validity
  readonly certainty: 'confirmed' | 'contextual'
  readonly provenanceClass: EventProvenanceClass
  readonly currentLifecycle: 'active' | 'reduced' | 'expired'
  readonly temporalStatus: 'current' | 'future' | 'expired'
  readonly currentlyEffective: boolean
  readonly sourceEvidenceIds: readonly string[]
  readonly sourceJudgmentIds: readonly string[]
  readonly sourceRelationIds: readonly string[]
  readonly sourceRoleIds: readonly string[]
  readonly sourcePatternContextIds: readonly string[]
  readonly sourceOutcomeIds: readonly string[]
  readonly sourceLuckEffectIds: readonly string[]
  readonly provenance: readonly string[]
}

export interface EvaluatedEventScope {
  readonly snapshot: LuckScopeState
  /** The reference instant at which this snapshot was evaluated. */
  readonly evaluatedAt?: string
  readonly parentSnapshot?: LuckScopeState
  /** Optional source-transcribed scope identity for source-only snapshots. */
  readonly scopeGanZhi?: string
  readonly parentScopeGanZhi?: string
}

/** Reads explicit customer context only. These booleans map to Master 15 §6A keys. */
export type EventKnownFacts = Readonly<Record<string, string | number | boolean>>

export interface EventEvidenceInput {
  readonly scopes: readonly EvaluatedEventScope[]
  readonly moneyOutcomes?: readonly MoneyOutcomeFact[]
  readonly relationshipOutcomes?: readonly RelationshipOutcomeFact[]
  readonly knownFacts?: EventKnownFacts
  readonly referenceTime?: string
  /** Source snapshots are evaluated within their named Luck scope, without calendar projection. */
  readonly evaluationMode?: 'calendar' | 'source_snapshot'
}

export type EventTimingProjection = {
  readonly decisionId: string
  readonly status: 'projected' | 'not_projectable'
  readonly factId?: string
  readonly reason?: 'missing_scope' | 'scope_mismatch' | 'missing_calendar_interval' | 'unknown_calendar_state'
}

export interface EventTimingResult {
  readonly evidence: readonly EventEvidenceFact[]
  readonly decisions: readonly EventTimingDecision[]
  readonly facts: readonly EventTimingFact[]
  readonly projections: readonly EventTimingProjection[]
  readonly gaps: readonly ('JUDGMENT_FACT_GAP' | 'ENGINE_GAP' | 'SOURCE_GAP' | 'FIXTURE_GAP')[]
}
