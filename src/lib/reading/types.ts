import type { CalculatedChart } from '../canonical/types'
import type { Validity } from '../judgment/contracts'
import type { LuckScopeState } from '../judgment/core/luckScope'
import type { ActualStructuralFunction } from '../judgment/core/policies'
import type { runInternalReading } from '../judgment/pipeline/internalReading'
import type { CurrentPersonalityResult, PersonalityPeriod, PersonalityScope } from '../personality/current/types'
import type { NatalPersonalityResult } from '../personality/types'

export type ReadingScope = PersonalityScope
export type ChapterId =
  | 'F-01' | 'F-02' | 'F-03' | 'F-04' | 'F-LINK'
  | 'CH-01' | 'CH-02' | 'CH-03' | 'CH-04' | 'CH-05' | 'CH-06' | 'CH-07'
  | 'CH-08' | 'CH-09' | 'CH-10' | 'CH-11' | 'CH-Q'
export type ProductScope = 'free' | 'premium'
type InternalReading = ReturnType<typeof runInternalReading>
export type ReadingMonthSnapshot = Extract<InternalReading['luck'], { monthlyWindow: unknown }>['monthlyWindow'][number]
export type ReadingJudgmentResult = Omit<InternalReading, 'luck'> & {
  readonly luck: InternalReading['luck'] & { readonly monthlyWindow?: readonly ReadingMonthSnapshot[] }
}

export interface CustomerContext {
  readonly name?: string
  readonly question?: string
  readonly knownFacts?: Readonly<Record<string, string | number | boolean>>
}

export interface ReadingAssemblyInput {
  readonly canonical?: Readonly<CalculatedChart>
  readonly judgment?: Readonly<ReadingJudgmentResult>
  readonly personality?: Readonly<NatalPersonalityResult | CurrentPersonalityResult>
  readonly luckScopes?: readonly LuckScopeState[]
  /** Additional snapshots already evaluated at their own in-period reference instants. */
  readonly evaluatedLuckScopes?: readonly { readonly snapshot: LuckScopeState; readonly evaluatedAt: string }[]
  /** Required for external scope snapshots when a canonical reference instant is unavailable. */
  readonly referenceTime?: string
  readonly customerContext?: CustomerContext
  readonly productScope: ProductScope
}

export type ReadingTopic = 'birth' | 'structure' | 'personality' | 'strength' | 'challenge' | 'daewoon' | 'year' | 'month'
export type ReadingCertainty = 'confirmed' | 'contextual' | 'conditional' | 'provisional' | 'deferred'
  | 'unknown' | 'unsupported' | 'not-applicable' | 'rejected'
export type ChapterReadiness = 'ready' | 'partial' | 'source_gap' | 'engine_gap' | 'outcome_not_implemented'
export type RepetitionRole = 'conclusion' | 'evidence' | 'condition' | 'timing' | 'application' | 'context'
export type SelectionKind = 'core_structure' | 'strength' | 'challenge' | 'remember' | 'best_month' | 'worst_month'

export interface ReadingAssemblyGap {
  readonly id: string
  readonly chapterId: ChapterId
  readonly type: 'source_gap' | 'engine_gap' | 'outcome_layer_not_implemented' | 'selection_rule_missing' | 'renderer_gap'
  readonly description: string
  readonly blocking: boolean
  readonly provenance: readonly string[]
}

export interface ReadingProvenance {
  readonly sourceFactIds: readonly string[]
  readonly sourceRoleIds: readonly string[]
  readonly sourceEffectIds: readonly string[]
  readonly sourcePersonalityFactIds: readonly string[]
  readonly sourceConflictIds: readonly string[]
  readonly evidenceIds: readonly string[]
}

export interface ReadingMeaningRef {
  readonly producer: 'canonical' | 'judgment' | 'personality'
  readonly kind: 'canonical_value' | 'pattern' | 'relation' | 'structural_function' | 'role_assignment' | 'role_function'
    | 'scope_snapshot' | 'monthly_snapshot' | 'luck_effect' | 'personality_fact' | 'personality_conflict'
    | 'personality_modifier' | 'current_personality_fact'
  readonly recordId: string
  readonly scopeId?: string
}

export interface ReadingSemanticUnit extends ReadingProvenance {
  readonly id: string
  readonly semanticKey: string
  readonly topic: ReadingTopic
  readonly scope: ReadingScope
  readonly certainty: ReadingCertainty
  readonly sourceStatus: string
  readonly status: 'ready' | 'partial' | 'deferred'
  readonly meaningRef: ReadingMeaningRef
  readonly firstOccurrenceChapterId: ChapterId
  readonly allowedChapterIds: readonly ChapterId[]
  readonly period?: Readonly<Validity | PersonalityPeriod>
  readonly direction?: ActualStructuralFunction['direction']
  readonly directionEvidence?: ActualStructuralFunction['evidenceStatus']
  readonly currentFunction?: string
  readonly lifecycle?: string
  readonly effectProjections?: readonly {
    readonly scope: ReadingScope
    readonly scopeId: string
    readonly inherited: boolean
  }[]
  readonly month?: Readonly<{
    startInstant: string
    endInstant: string
    pillar: string
    parentSewoonId: string | null
    snapshotId: string | null
    patternContextId?: string
    runtimeStateIds: readonly string[]
    roleFunctionIds: readonly string[]
    stageStatus: Readonly<ReadingMonthSnapshot['stageStatus']>
  }>
}

export interface ReadingPlacement {
  readonly unitId: string
  readonly role: RepetitionRole
  readonly visibility: 'available' | 'candidate'
  readonly contextIds: readonly string[]
}

export interface ReadingSelection {
  readonly kind: SelectionKind
  readonly selectionStatus: 'deferred'
  readonly candidateUnitIds: readonly string[]
  readonly selectedUnitIds: readonly []
}

export interface ReadingChapterAssembly {
  readonly id: ChapterId
  readonly readiness: ChapterReadiness
  readonly placements: readonly ReadingPlacement[]
  readonly availableUnitIds: readonly string[]
  readonly selections: readonly ReadingSelection[]
  readonly gaps: readonly ReadingAssemblyGap[]
  readonly navigationChapterIds?: readonly ChapterId[]
  readonly customerRenderable: false
}

export interface ReadingAssembly {
  readonly version: '1'
  readonly productScope: ProductScope
  readonly source: { readonly canonical: boolean; readonly judgment: boolean; readonly personality: boolean }
  readonly referenceTime?: string
  readonly chapters: readonly ReadingChapterAssembly[]
  readonly semanticUnits: readonly ReadingSemanticUnit[]
  readonly gaps: readonly ReadingAssemblyGap[]
  readonly engineScopes: readonly ReadingScope[]
  readonly historyEffectIds: readonly string[]
  readonly assemblyReady: true
  readonly customerRenderable: false
}
