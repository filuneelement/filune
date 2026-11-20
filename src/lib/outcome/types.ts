import type { Validity } from '../judgment/contracts'

export interface OutcomeFact {
  readonly id: string
  readonly domain: 'work' | 'money' | 'relationship' | 'health'
  readonly semanticType: string
  readonly scope: 'natal' | 'daewoon' | 'sewoon' | 'month'
  readonly scopeId: string
  readonly period?: Validity
  readonly certainty: 'confirmed' | 'contextual' | 'conditional' | 'deferred'
  readonly lifecycle: 'active' | 'reduced' | 'stopped' | 'inactive' | 'deferred'
  readonly temporalStatus: 'baseline' | 'current' | 'future' | 'expired'
  readonly currentlyEffective: boolean
  readonly sourceJudgmentIds: readonly string[]
  readonly sourceRelationIds: readonly string[]
  readonly sourceRoleIds: readonly string[]
  readonly sourceLuckEffectIds: readonly string[]
  readonly sourceParticipantIds: readonly string[]
  readonly provenance: readonly string[]
}
