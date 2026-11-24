import type { OutcomeFact } from '../outcome/types'
import { uniqueIds } from './semanticUnit'

export type PublicationConditionEvidence = Readonly<{
  triggerConfirmed: boolean
  evidenceIds: readonly string[]
}>

export type OutcomePublicationDecision =
  | { readonly publishable: true; readonly qualification: 'confirmed' | 'contextual' | 'reduced' | 'conditional'; readonly evidenceIds: readonly string[] }
  | { readonly publishable: false; readonly classification: 'PUBLICATION_INELIGIBLE'; readonly reason:
      'expired_history' | 'stopped' | 'inactive' | 'deferred' | 'currently_ineffective' | 'conditional_trigger_missing' }

/** Shared publication boundary for OutcomeFacts. It does not evaluate a Judgment. */
export function evaluateOutcomePublicationEligibility(
  fact: Pick<OutcomeFact, 'certainty' | 'lifecycle' | 'temporalStatus' | 'currentlyEffective'>,
  condition?: PublicationConditionEvidence,
): OutcomePublicationDecision {
  if (fact.temporalStatus === 'expired') return { publishable: false, classification: 'PUBLICATION_INELIGIBLE', reason: 'expired_history' }
  if (fact.lifecycle === 'stopped') return { publishable: false, classification: 'PUBLICATION_INELIGIBLE', reason: 'stopped' }
  if (fact.lifecycle === 'inactive') return { publishable: false, classification: 'PUBLICATION_INELIGIBLE', reason: 'inactive' }
  if (fact.lifecycle === 'deferred' || fact.certainty === 'deferred') {
    return { publishable: false, classification: 'PUBLICATION_INELIGIBLE', reason: 'deferred' }
  }
  if (!fact.currentlyEffective) {
    return { publishable: false, classification: 'PUBLICATION_INELIGIBLE', reason: 'currently_ineffective' }
  }
  if (fact.certainty === 'conditional') {
    if (!condition?.triggerConfirmed || !condition.evidenceIds.length) {
      return { publishable: false, classification: 'PUBLICATION_INELIGIBLE', reason: 'conditional_trigger_missing' }
    }
    return { publishable: true, qualification: 'conditional', evidenceIds: uniqueIds(condition.evidenceIds) }
  }
  if (fact.lifecycle !== 'active' && fact.lifecycle !== 'reduced') {
    return { publishable: false, classification: 'PUBLICATION_INELIGIBLE', reason: 'currently_ineffective' }
  }
  const qualification = fact.lifecycle === 'reduced' ? 'reduced'
    : fact.certainty === 'contextual' ? 'contextual' : 'confirmed'
  return { publishable: true, qualification, evidenceIds: [] }
}
