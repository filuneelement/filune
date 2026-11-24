import type { LuckScopeState } from '../judgment/core/luckScope'
import type { ActualStructuralFunction } from '../judgment/core/policies'
import type { StemRelationFact } from '../judgment/core/types'
import type { MoneyOutcomeFact, RelationshipOutcomeFact } from '../outcome'
import type { ReadingScope } from './types'
import { bounds, compare, uniqueIds } from './semanticUnit'

export type StructuralExplanationOutcome = MoneyOutcomeFact | RelationshipOutcomeFact
export type StructuralExplanationDomain = 'money' | 'relationship'
export type StructuralCausePathRole = 'primary' | 'supporting' | 'competing'

export interface StructuralFunctionalChange {
  readonly id: string
  readonly actorId: string | null
  readonly relationId: string
  readonly relation: string
  readonly targetId: string | null
  readonly participantIds: readonly string[]
  readonly actorTenGod?: string
  readonly targetTenGod?: string
  readonly actualEffect: ActualStructuralFunction['function'] | 'not_evaluated'
  readonly direction: ActualStructuralFunction['direction']
  readonly policyId: string | null
  readonly roleStateIds: readonly string[]
  readonly effectIds: readonly string[]
  readonly protectionRefs: readonly string[]
  readonly damageRefs: readonly string[]
  readonly provenanceIds: readonly string[]
}

export interface StructuralCausePath {
  readonly id: string
  readonly role: StructuralCausePathRole
  readonly relationIds: readonly string[]
  readonly participantIds: readonly string[]
  readonly functionalChangeIds: readonly string[]
  readonly sourceIds: readonly string[]
}

export interface StructuralExplanationUnit {
  readonly id: string
  readonly outcomeFactId: string
  readonly domain: StructuralExplanationDomain
  readonly target: { readonly id: string; readonly referent: string }
  readonly direction: 'favorable' | 'unfavorable' | 'unknown'
  readonly certainty: StructuralExplanationOutcome['certainty']
  readonly primaryCauseRefs: readonly string[]
  readonly unresolvedCauseRefs: readonly string[]
  readonly supportingCauseRefs: readonly string[]
  readonly competingCauseRefs: readonly string[]
  readonly causePaths: readonly StructuralCausePath[]
  readonly functionalChanges: readonly StructuralFunctionalChange[]
  readonly palaceAttribution?: { readonly referent: 'partner'; readonly palaceEntityId: string; readonly sourceIds: readonly string[] }
  readonly experiencedProcess?: { readonly result: string; readonly sourceIds: readonly string[] }
  readonly recommendedDirection?: { readonly value: string; readonly sourceIds: readonly string[] }
  readonly scope: ReadingScope
  readonly scopeId: string
  readonly period?: StructuralExplanationOutcome['period']
  readonly provenanceIds: readonly string[]
}

const sourceDirection = (fact: StructuralExplanationOutcome): StructuralExplanationUnit['direction'] => {
  if ('direction' in fact) return fact.direction === 'deferred' ? 'unknown' : fact.direction
  if (fact.semanticType === 'relationship_formation') return 'favorable'
  if (fact.semanticType === 'relationship_pressure') return 'unfavorable'
  return 'unknown'
}

const relationRecords = (snapshot: LuckScopeState) => [
  ...snapshot.stemFacts,
  ...snapshot.patternFacts.filter((item): item is StemRelationFact => item.action !== 'coexist'),
] as const

function resolveSnapshot(outcome: StructuralExplanationOutcome, snapshots: readonly LuckScopeState[]) {
  return snapshots.find(snapshot => snapshot.id === outcome.scopeId
    && outcome.sourceJudgmentIds.includes(snapshot.id))
}

function toFunctionalChange(snapshot: LuckScopeState, relation: StemRelationFact,
  actual: ActualStructuralFunction): StructuralFunctionalChange {
  const ids = new Set([relation.id, ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? [])])
  const roles = snapshot.roleEngine.currentRoles.filter(role => role.pathRefs.some(ref => ids.has(ref)))
  const historyIds = snapshot.roleEngine.roleHistory.filter(role => roles.some(current => current.roleId === role.roleId))
    .map(role => role.roleId)
  const effects = snapshot.luckEffectStates.filter(state => state.event.evidenceRefs.some(ref => ids.has(ref)))
    .map(state => state.event.id)
  const protectedRefs = actual.structuralEffect?.blockedBy?.kind === 'active_protection'
    ? actual.structuralEffect.blockedBy.evidenceRefs : []
  const damageRefs = snapshot.policyRoles.byeong.filter(role => role.relationFactIds.includes(relation.id))
    .flatMap(role => [role.id, ...role.relationFactIds])
  const provenanceIds = uniqueIds([relation.id, actual.relationFactId, actual.patternContextId,
    ...(actual.ruleId ? [actual.ruleId] : []), ...(actual.conditionEvidence ?? []),
    ...(actual.resolutionEvidence ?? []), ...historyIds, ...effects, ...protectedRefs, ...damageRefs])
  return {
    id: `structural-function:${JSON.stringify([snapshot.id, relation.id, actual.policyId, actual.function])}`,
    actorId: relation.source.id, relationId: relation.id, relation: relation.action,
    targetId: relation.target.id, participantIds: uniqueIds([relation.source.id, relation.target.id]),
    actorTenGod: relation.source.tenGod, targetTenGod: relation.target.tenGod,
    actualEffect: actual.function, direction: actual.direction, policyId: actual.policyId,
    roleStateIds: uniqueIds(historyIds), effectIds: uniqueIds(effects),
    protectionRefs: uniqueIds(protectedRefs), damageRefs: uniqueIds(damageRefs), provenanceIds,
  }
}

function branchFunctionalChanges(snapshot: LuckScopeState, relationIds: readonly string[], outcome: StructuralExplanationOutcome) {
  return snapshot.branchFacts.filter(relation => relationIds.includes(relation.id)).map(relation => {
    const participants = uniqueIds(relation.participants)
    const effects = snapshot.luckEffectStates.filter(state => state.event.sourceRelationFactId === relation.id)
      .map(state => state.event.id)
    const provenanceIds = uniqueIds([relation.id, ...participants, ...effects, ...outcome.provenance])
    return {
      id: `structural-function:${JSON.stringify([snapshot.id, relation.id, outcome.lifecycle])}`,
      actorId: null, relationId: relation.id, relation: relation.kind, targetId: null,
      participantIds: participants, actualEffect: 'not_evaluated' as const, direction: 'deferred' as const,
      policyId: null, roleStateIds: [], effectIds: uniqueIds(effects), protectionRefs: [], damageRefs: [], provenanceIds,
    }
  })
}

function connectedRelationIds(primaryIds: readonly string[], records: readonly StemRelationFact[]) {
  const selected = new Set(primaryIds)
  const participants = new Set(records.filter(item => selected.has(item.id)).flatMap(item => [item.source.id, item.target.id]))
  let changed = true
  while (changed) {
    changed = false
    for (const relation of records) {
      if (!selected.has(relation.id) && (participants.has(relation.source.id) || participants.has(relation.target.id))) {
        selected.add(relation.id)
        participants.add(relation.source.id)
        participants.add(relation.target.id)
        changed = true
      }
    }
  }
  return { relationIds: [...selected].sort(compare), participantIds: [...participants].sort(compare) }
}

function supportedPalaceAttribution(fact: RelationshipOutcomeFact, snapshot: LuckScopeState,
  changes: readonly StructuralFunctionalChange[]) {
  if (fact.semanticType !== 'relationship_formation'
    || !fact.provenance.includes('A:I-22') || !fact.provenance.includes('A:OP-R03')) return undefined
  const favorablePathIds = new Set(changes.filter(change => change.participantIds.some(id => fact.sourceParticipantIds.includes(id))
    && change.direction === 'favorable' && ['operating', 'reduced'].includes(change.actualEffect)
    && change.provenanceIds.some(id => id.startsWith('structural-role:'))).flatMap(change => [change.relationId, ...change.provenanceIds]))
  // Actual StructuralFunction records are also accepted when the product projector's
  // role history is linked through source IDs on the same participant path.
  const participantPath = [...snapshot.stemFacts, ...snapshot.patternFacts].filter(relation =>
    fact.sourceParticipantIds.includes(relation.source.id) || fact.sourceParticipantIds.includes(relation.target.id))
    .filter(relation => {
      const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
      return actual && actual.direction === 'favorable' && ['operating', 'reduced'].includes(actual.function)
        && actual.structuralEffect?.currentlyEffective
    })
  participantPath.forEach(relation => {
    favorablePathIds.add(relation.id)
    const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
    if (actual?.ruleId) favorablePathIds.add(actual.ruleId)
    if (actual?.policyId) favorablePathIds.add(actual.policyId)
    snapshot.roleEngine.currentRoles.filter(role => role.pathRefs.includes(relation.id)
      && ['operating', 'favorable'].includes(role.currentFunction) && ['active', 'weakened'].includes(role.currentState))
      .forEach(role => favorablePathIds.add(role.roleId))
  })
  if (!participantPath.length || !favorablePathIds.size) return undefined
  const palace = snapshot.formationBranchPool.find(item => fact.sourceParticipantIds.includes(item.id)
    && item.scope === 'natal' && snapshot.branchFacts.some(relation => relation.participants.includes(item.id)
      && fact.sourceRelationIds.includes(relation.id)))
  return palace ? {
    referent: 'partner' as const, palaceEntityId: palace.id,
    sourceIds: uniqueIds([fact.id, ...fact.sourceParticipantIds, ...fact.sourceRelationIds,
      ...fact.provenance.filter(id => id === 'A:I-22' || id === 'A:OP-R03'), ...favorablePathIds]),
  } : undefined
}

/** Projects existing outcome and Judgment IDs; it does not evaluate or alter either engine. */
export function buildStructuralExplanationUnits(
  outcomes: readonly StructuralExplanationOutcome[], snapshots: readonly LuckScopeState[],
): readonly StructuralExplanationUnit[] {
  const units: StructuralExplanationUnit[] = []
  for (const outcome of [...outcomes].sort((a, b) => compare(a.id, b.id))) {
    const snapshot = resolveSnapshot(outcome, snapshots)
    const records = snapshot ? relationRecords(snapshot) : []
    const branchRecords = snapshot?.branchFacts ?? []
    const primaryIds = uniqueIds(outcome.sourceRelationIds)
    const unresolvedCauseRefs = primaryIds.filter(id =>
      !records.some(relation => relation.id === id) && !branchRecords.some(relation => relation.id === id))
    const connected = connectedRelationIds(primaryIds.filter(id => records.some(relation => relation.id === id)), records)
    const actualById = new Map(snapshot?.actualFunctions.map(actual => [actual.relationFactId, actual]) ?? [])
    const stemChanges = snapshot ? records.filter(relation => connected.relationIds.includes(relation.id))
      .flatMap(relation => {
        const actual = actualById.get(relation.id)
        return actual ? [toFunctionalChange(snapshot, relation, actual)] : []
      }).sort((a, b) => compare(a.id, b.id)) : []
    let changes = [...stemChanges, ...(snapshot ? branchFunctionalChanges(snapshot,
      primaryIds.filter(id => branchRecords.some(relation => relation.id === id)), outcome) : [])]
      .sort((a, b) => compare(a.id, b.id))
    if (snapshot && 'semanticType' in outcome && outcome.semanticType === 'relationship_formation') {
      const qualifying = records.filter(relation => outcome.sourceParticipantIds.includes(relation.source.id)
        || outcome.sourceParticipantIds.includes(relation.target.id)).flatMap(relation => {
        const actual = actualById.get(relation.id)
        return actual?.structuralEffect?.currentlyEffective && actual.direction === 'favorable'
          && ['operating', 'reduced'].includes(actual.function) ? [toFunctionalChange(snapshot, relation, actual)] : []
      })
      changes = [...new Map([...changes, ...qualifying].map(change => [change.id, change])).values()]
        .sort((a, b) => compare(a.id, b.id))
    }
    const primaryDirection = sourceDirection(outcome)
    const supporting = changes.filter(change => !primaryIds.includes(change.relationId)
      && change.direction === primaryDirection).map(change => change.relationId)
    const competing = changes.filter(change => !primaryIds.includes(change.relationId)
      && change.direction !== primaryDirection && change.direction !== 'deferred').map(change => change.relationId)
    const pathIds = uniqueIds([...primaryIds, ...supporting, ...competing])
    const causePaths = pathIds.map(relationId => {
      const change = changes.find(item => item.relationId === relationId)
      const role: StructuralCausePathRole = primaryIds.includes(relationId) ? 'primary'
        : competing.includes(relationId) ? 'competing' : 'supporting'
      const refs = uniqueIds([relationId, ...(change?.provenanceIds ?? [])])
      return { id: `cause-path:${JSON.stringify([outcome.id, role, relationId])}`, role,
        relationIds: [relationId], participantIds: change?.participantIds ?? [],
        functionalChangeIds: change ? [change.id] : [], sourceIds: refs }
    }).sort((a, b) => compare(a.role, b.role) || compare(a.id, b.id))
    const palaceAttribution = snapshot && 'semanticType' in outcome && outcome.domain === 'relationship'
      ? supportedPalaceAttribution(outcome as RelationshipOutcomeFact, snapshot, changes) : undefined
    const targetId = 'wealthEntityId' in outcome ? outcome.wealthEntityId : 'close_relationship'
    const targetReferent = outcome.domain === 'money' ? 'money' : 'close_relationship'
    const direction = primaryDirection
    const processType = 'semanticType' in outcome ? String(outcome.semanticType) : ''
    const experiencedProcess = processType === 'relationship_pressure' || processType === 'money_related_problem'
      ? { result: 'result' in outcome ? String(outcome.result) : processType,
        sourceIds: uniqueIds([outcome.id, ...outcome.sourceJudgmentIds, ...outcome.sourceRelationIds, ...outcome.provenance]) }
      : undefined
    const provenanceIds = uniqueIds([outcome.id, ...outcome.sourceJudgmentIds, ...outcome.sourceRelationIds,
      ...outcome.sourceRoleIds, ...outcome.sourceLuckEffectIds, ...outcome.sourceParticipantIds,
      ...outcome.provenance, ...changes.flatMap(item => item.provenanceIds),
      ...(palaceAttribution?.sourceIds ?? [])])
    units.push({
      id: `explanation:${JSON.stringify([outcome.id, outcome.domain, outcome.scopeId, outcome.period?.periodId ?? null])}`,
      outcomeFactId: outcome.id, domain: 'wealthEntityId' in outcome ? 'money' : 'relationship', target: { id: targetId, referent: targetReferent },
      direction, certainty: outcome.certainty, primaryCauseRefs: primaryIds,
      unresolvedCauseRefs,
      supportingCauseRefs: uniqueIds(supporting), competingCauseRefs: uniqueIds(competing),
      causePaths, functionalChanges: changes,
      ...(palaceAttribution && { palaceAttribution }),
      ...(experiencedProcess && { experiencedProcess }),
      scope: outcome.scope, scopeId: outcome.scopeId, ...(outcome.period && { period: outcome.period }), provenanceIds,
    })
  }
  const dedup = new Map<string, StructuralExplanationUnit>()
  for (const unit of units) {
    const key = JSON.stringify([unit.outcomeFactId, unit.target.id, unit.primaryCauseRefs,
      unit.scope, bounds(unit.period)])
    const previous = dedup.get(key)
    if (previous && JSON.stringify(previous) !== JSON.stringify(unit)) throw new TypeError(`Conflicting StructuralExplanationUnit: ${unit.id}`)
    dedup.set(key, unit)
  }
  return [...dedup.values()].sort((a, b) => compare(a.id, b.id))
}
