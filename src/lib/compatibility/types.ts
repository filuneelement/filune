import type { HiddenStemRole } from '../hiddenStemRoleTable'
import type { LuckScopeState, JudgmentCoreInput } from '../judgment/core/luckScope'
import type { StemRuntime } from '../judgment/core/types'

export interface CompatibilityPerson {
  readonly id: string
  /** Natal chart entities as supplied to Judgment, with their existing IDs. */
  readonly chart: Readonly<JudgmentCoreInput['natal']>
  readonly judgment: LuckScopeState
}

export type CompatibilityPosition = 'year' | 'month' | 'day' | 'hour'

export interface CrossParticipant {
  readonly personId: string
  readonly judgmentId: string
  readonly entityId: string
  readonly position: CompatibilityPosition
  readonly value: string
}

interface CrossFact {
  readonly id: string
  readonly sourceFactIds: readonly string[]
  /** Authority references. Participant records retain owner-qualified source identities. */
  readonly provenance: readonly string[]
}

export type CrossDirection = {
  readonly source: CrossParticipant
  readonly target: CrossParticipant
}

export interface CrossStemInteractionFact extends CrossFact {
  readonly action: 'generate' | 'control' | 'combine'
  /** Combination participant order is canonical and has no directional meaning. */
  readonly participants: readonly [CrossParticipant, CrossParticipant]
  readonly direction?: CrossDirection
  /** Per-interaction effects within Compatibility only. Other observations can coexist. */
  readonly compatibilityRuntimeEffects: readonly (CrossDirection & {
    readonly state: Extract<StemRuntime, 'weakened' | 'stopped'>
  })[]
}

export interface CrossBranchInteractionFact extends CrossFact {
  readonly relationType: 'six_combination' | 'clash' | 'punishment' | 'break' | 'harm'
    | 'three_partial_without_center' | 'three' | 'half' | 'season' | 'three_punishment'
  readonly participants: readonly CrossParticipant[]
  readonly formation: boolean
  readonly strengthensElement: boolean
  readonly elementStem?: string
  readonly spousePalacePair: boolean
}

export interface CrossRootSupportFact extends CrossFact {
  readonly provider: CrossParticipant
  readonly receiver: CrossParticipant
  readonly hiddenStem: string
  readonly hiddenStemLevel: HiddenStemRole
  readonly rootPriority: 'main' | 'secondary'
  readonly rootType: 'same_element_hidden_stem'
}

type ExistingRole = LuckScopeState['roleEngine']['roleHistory'][number]
type CurrentRole = LuckScopeState['roleEngine']['currentRoles'][number]

/** A verified contribution to one personal Judgment path, in Compatibility only. */
export interface CrossPathEvidence {
  readonly pathId: string
  readonly patternContextId: string
  readonly sourceEntityId: string
  readonly targetEntityId: string
  readonly policyId: string
  readonly classification: 'required' | 'harmful'
  readonly critical: boolean
  readonly before: 'operating' | 'reduced' | 'inactive'
  readonly change: 'blocked' | 'weakened' | 'supported' | 'activated'
  readonly contribution: 'stopped' | 'weakened' | 'generated' | 'root_supported'
  readonly sourceFactIds: readonly string[]
}

export interface CrossRoleInteractionFact extends CrossFact, CrossDirection {
  readonly sourceInteractionId: string
  readonly action: 'generate' | 'control' | 'combine' | 'root_support'
  readonly interactionType: 'role_contact' | 'relief_candidate' | 'damage_candidate'
    | 'support_candidate' | 'harmful_activation_candidate' | 'path_contact'
  readonly targetRoleId?: string
  readonly targetRole?: ExistingRole['role']
  readonly targetByeongId?: string
  readonly currentState?: CurrentRole['currentState']
  readonly currentFunction?: CurrentRole['currentFunction']
  readonly targetPathIds: readonly string[]
  readonly pathEvidence?: readonly CrossPathEvidence[]
}

export interface CompatibilityFacts {
  readonly stemInteractions: readonly CrossStemInteractionFact[]
  readonly branchInteractions: readonly CrossBranchInteractionFact[]
  readonly rootSupport: readonly CrossRootSupportFact[]
  readonly roleInteractions: readonly CrossRoleInteractionFact[]
  readonly diagnostics: readonly {
    readonly personId: string
    readonly code: 'HOUR_UNAVAILABLE'
    readonly unavailableParts: readonly ('stem' | 'branch')[]
  }[]
}
