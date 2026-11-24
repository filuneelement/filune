import type { HealthOutcomeFact, MoneyOutcomeFact, RelationshipOutcomeFact } from '../../outcome'
import type { OutcomeFact } from '../../outcome/types'
import type { ReadingAssembly } from '../types'
import { evaluateOutcomePublicationEligibility, type PublicationConditionEvidence } from '../publicationEligibility'
import { compare, uniqueIds } from '../semanticUnit'
import type { CustomerEvidenceContext, CustomerEvidenceGap, CustomerEvidenceOutcome } from './types'

type EvidenceOutcome = MoneyOutcomeFact | RelationshipOutcomeFact | HealthOutcomeFact

const publicationReason = (fact: OutcomeFact, hasAssemblyUnit: boolean, hasCustomerUnit: boolean,
  condition?: PublicationConditionEvidence) => {
  if (hasCustomerUnit) return 'published'
  if (hasAssemblyUnit) return 'plan_mapping_unavailable'
  const decision = evaluateOutcomePublicationEligibility(fact, condition)
  return decision.publishable ? 'outside_current_scope' : decision.reason
}

export function buildCustomerEvidenceContext(assembly: ReadingAssembly,
  supplied: readonly EvidenceOutcome[] = [], publishedOutcomeIds: ReadonlySet<string> = new Set()): CustomerEvidenceContext {
  const outcomes = new Map<string, EvidenceOutcome>()
  for (const fact of [
    ...(assembly.productScope === 'premium' ? assembly.temporalMoneyOutcomes ?? [] : []),
    ...(assembly.productScope === 'premium' ? assembly.temporalRelationshipOutcomes ?? [] : []),
    ...(assembly.productScope === 'premium' ? assembly.temporalHealthOutcomes ?? [] : []),
    ...(assembly.productScope === 'premium' ? supplied : []),
  ]) outcomes.set(fact.id, fact)

  const explanationByOutcome = new Map<string, string[]>()
  for (const unit of assembly.structuralExplanationUnits) {
    const ids = explanationByOutcome.get(unit.outcomeFactId) ?? []
    ids.push(unit.id)
    explanationByOutcome.set(unit.outcomeFactId, ids)
  }
  const ineligible = [...outcomes.values()].filter(fact =>
    !publishedOutcomeIds.has(fact.id))
    .sort((a, b) => compare(a.id, b.id))
  const outcomeEvidence: CustomerEvidenceOutcome[] = ineligible.map(fact => {
    const explanationUnitIds = uniqueIds(explanationByOutcome.get(fact.id))
    const hasAssemblyUnit = assembly.semanticUnits.some(unit => unit.meaningRef.kind === 'outcome_fact' && unit.meaningRef.recordId === fact.id)
    return {
      outcomeFactId: fact.id, domain: fact.domain, semanticType: fact.semanticType,
      lifecycle: fact.lifecycle, temporalStatus: fact.temporalStatus, currentlyEffective: fact.currentlyEffective,
      certainty: fact.certainty, scope: fact.scope, scopeId: fact.scopeId, ...(fact.period && { period: fact.period }),
      sourceJudgmentIds: fact.sourceJudgmentIds, sourceRelationIds: fact.sourceRelationIds,
      sourceRoleIds: fact.sourceRoleIds, sourceLuckEffectIds: fact.sourceLuckEffectIds,
      sourceParticipantIds: fact.sourceParticipantIds, provenance: fact.provenance,
      publicationEvidenceIds: assembly.publicationConditions?.[fact.id]?.evidenceIds ?? [],
      explanationUnitIds, publicationReason: publicationReason(fact, hasAssemblyUnit, false, assembly.publicationConditions?.[fact.id]),
    }
  })
  const explanationUnitIds = uniqueIds(outcomeEvidence.flatMap(item => item.explanationUnitIds))
  const explanationSet = new Set(explanationUnitIds)
  const explanationUnits = assembly.structuralExplanationUnits.filter(unit => explanationSet.has(unit.id))
    .sort((a, b) => compare(a.id, b.id))
  const deferredOutcomeIds = uniqueIds(outcomeEvidence.filter(item => item.lifecycle === 'deferred' || item.certainty === 'deferred')
    .map(item => item.outcomeFactId))
  const inactiveOutcomeIds = uniqueIds(outcomeEvidence.filter(item => item.lifecycle === 'inactive').map(item => item.outcomeFactId))
  const stoppedOutcomeIds = uniqueIds(outcomeEvidence.filter(item => item.lifecycle === 'stopped').map(item => item.outcomeFactId))
  const expiredOutcomeIds = uniqueIds(outcomeEvidence.filter(item => item.temporalStatus === 'expired').map(item => item.outcomeFactId))
  const ineffectiveOutcomeIds = uniqueIds(outcomeEvidence.filter(item => !item.currentlyEffective).map(item => item.outcomeFactId))
  const unresolvedCauseRefs = uniqueIds(explanationUnits.flatMap(unit => unit.unresolvedCauseRefs))
  const publicationGaps: CustomerEvidenceGap[] = outcomeEvidence.map(item => ({
    id: `publication-ineligible:${JSON.stringify([item.outcomeFactId, item.publicationReason])}`,
    classification: item.publicationReason === 'plan_mapping_unavailable' ? 'ENGINE_GAP' : 'PUBLICATION_INELIGIBLE',
    outcomeIds: [item.outcomeFactId], reason: item.publicationReason,
  }))
  const existingGaps: CustomerEvidenceGap[] = assembly.gaps.map(gap => ({
    id: gap.id,
    classification: gap.type === 'source_gap' ? 'SOURCE_GAP'
      : gap.type === 'renderer_gap' ? 'RENDERER_GAP' : 'ENGINE_GAP',
    outcomeIds: [], sourceGapId: gap.id, reason: gap.description,
  }))
  const gaps = [...existingGaps, ...publicationGaps].sort((a, b) => compare(a.id, b.id))
  const gapIds = uniqueIds(gaps.map(gap => gap.id))
  const id = `customer-evidence-context:${JSON.stringify([
    uniqueIds(outcomeEvidence.map(item => item.outcomeFactId)), explanationUnitIds, gapIds,
  ])}`
  return { id, explanationUnitIds, deferredOutcomeIds, inactiveOutcomeIds, stoppedOutcomeIds,
    expiredOutcomeIds, ineffectiveOutcomeIds, unresolvedCauseRefs, gapIds, outcomes: outcomeEvidence,
    explanationUnits, gaps }
}
