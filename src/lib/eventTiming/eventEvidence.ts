import type { LuckScopeState } from '../judgment/core/luckScope'
import type { ActualStructuralFunction } from '../judgment/core/policies'
import type { StemRelationFact } from '../judgment/core/types'
import type { MoneyOutcomeFact } from '../outcome'
import { luckPeriodStatus } from '../judgment/core/luckValidity'
import type { EventEvidenceFact, EventEvidenceInput, EventEvidenceType, EventDomain, EventScope, EventProvenanceClass, EvaluatedEventScope } from './types'

const scopeNames: Readonly<Record<LuckScopeState['scope'], EventScope>> = {
  natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month', dailyLuck: 'day',
}
const live = (fn: string | undefined) => fn === 'operating' || fn === 'reduced'
const resource = (god: string) => god === '偏印' || god === '印綬'
const output = (god: string) => god === '食神' || god === '傷官'
const wealth = (god: string) => god === '正財' || god === '偏財'
const sort = (values: readonly string[]) => [...new Set(values.filter(Boolean))].sort()
const hash = (value: unknown) => JSON.stringify(value)
const known = (input: EventEvidenceInput, key: string) => input.knownFacts?.[key] === true
const mapClass = (status: string): EventProvenanceClass => status === 'CONFLICT' ? 'SOURCE_CONFLICT'
  : status === 'DEFERRED' ? 'DEFERRED' : status as EventProvenanceClass

function temporal(scope: EventScope, period: EvaluatedEventScope['snapshot']['validity'], referenceTime: string | undefined,
  mode: EventEvidenceInput['evaluationMode'] = 'calendar') {
  if (scope === 'natal') return { temporalStatus: 'baseline' as const, effective: true }
  // A source snapshot asserts the named scope's internal state. It intentionally says
  // nothing about whether that historical/relative scope overlaps today's calendar.
  if (mode === 'source_snapshot') return { temporalStatus: 'current' as const, effective: true }
  const status = luckPeriodStatus(period, referenceTime)
  return status === 'effective' ? { temporalStatus: 'current' as const, effective: true }
    : status === 'future' ? { temporalStatus: 'future' as const, effective: false }
      : { temporalStatus: 'expired' as const, effective: false }
}
function scopeIdentity(item: EvaluatedEventScope) {
  if (item.scopeGanZhi) return item.scopeGanZhi
  const snapshot = item.snapshot
  const participants = [...snapshot.stemFacts, ...snapshot.patternFacts]
    .flatMap(fact => [fact.source, fact.target])
  const stem = [...new Set(participants.filter(person => person.scope === snapshot.scope && person.position === 'luck')
    .map(person => person.stem))]
  const branches = [...new Set(snapshot.formationBranchPool.filter(person => person.scope === snapshot.scope)
    .map(person => person.branch))]
  return stem.length === 1 && branches.length === 1 ? `${stem[0]}${branches[0]}` : undefined
}
const intervalStart = (item: EvaluatedEventScope) => item.snapshot.validity.from.kind === 'exact'
  ? item.snapshot.validity.from.instant : item.snapshot.validity.from.kind === 'range'
    ? item.snapshot.validity.from.earliest : ''

function currentRoleIds(snapshot: LuckScopeState, pathIds: readonly string[]) {
  return sort(snapshot.roleEngine.currentRoles.filter(role => role.pathRefs.some(ref => pathIds.includes(ref)))
    .map(role => role.roleId))
}
function roleForTenGod(snapshot: LuckScopeState, relation: StemRelationFact, predicate: (god: string) => boolean,
  allowedKinds?: readonly string[]) {
  const participantIds = [relation.source, relation.target].filter(person => predicate(person.tenGod)).map(person => person.id)
  return snapshot.roleEngine.currentRoles.filter(role => participantIds.includes(
    snapshot.roleEngine.roleHistory.find(history => history.roleId === role.roleId)?.entityId ?? '')
    && (!allowedKinds || allowedKinds.includes(snapshot.roleEngine.roleHistory.find(history => history.roleId === role.roleId)?.role ?? ''))
    && role.currentFunction !== 'inactive' && role.currentFunction !== 'deferred'
    && role.currentState !== 'stopped' && role.currentState !== 'inactive'
    && role.pathRefs.includes(relation.id)).map(role => role.roleId).sort()
}
function manifestedYongShenLinks(snapshot: LuckScopeState, relation: StemRelationFact,
  predicate: (god: string) => boolean) {
  const participants = [relation.source, relation.target].filter(person => predicate(person.tenGod))
  return participants.filter(person => snapshot.patternContext.effectiveManifestedYongShen.some(item => item.entityId === person.id)
    && !snapshot.combinationEffects.some(effect => effect.effect === 'stopped' && effect.currentlyEffective && !effect.expired
      && (effect.sourceRelationFactId === relation.id || (effect.participants.includes(relation.source.id)
        && effect.participants.includes(relation.target.id))) && effect.participants.includes(person.id)))
    .map(() => snapshot.patternContext.id)
}
function stoppedRoleLinks(snapshot: LuckScopeState, relation: StemRelationFact, predicate: (god: string) => boolean,
  allowedKinds: readonly string[] = ['YongShen', 'SangShen']) {
  const participants = [relation.source, relation.target].filter(person => predicate(person.tenGod))
  const linkedStoppedCombination = relation.action === 'combine' && snapshot.combinationEffects.some(effect =>
    (effect.sourceRelationFactId === relation.id || (effect.participants.includes(relation.source.id)
      && effect.participants.includes(relation.target.id))) && effect.effect === 'stopped'
    && effect.currentlyEffective && !effect.expired
    && participants.some(person => effect.participants.includes(person.id)))
  const roleIds = snapshot.roleEngine.currentRoles.filter(role => {
    const history = snapshot.roleEngine.roleHistory.find(item => item.roleId === role.roleId)
    return participants.some(person => person.id === history?.entityId)
      && allowedKinds.includes(history?.role ?? '')
      && ['stopped', 'inactive'].includes(role.currentState)
      && (role.pathRefs.includes(relation.id) || linkedStoppedCombination)
  }).map(role => role.roleId)
  // SG-097 keeps a Luck-manifested YongShen separate from natal RoleHistory.
  // Its current manifestation is still a valid participant when this exact,
  // currently effective combination stops its source-linked function.
  const stoppedLuckManifestation = linkedStoppedCombination && participants.some(person =>
    person.position === 'luck' && snapshot.patternContext.manifestationHistory.some(manifestation =>
      manifestation.entityId === person.id && manifestation.manifestationScope !== 'natal'))
  const relationIds = snapshot.combinationEffects.filter(effect => effect.effect === 'stopped' && effect.currentlyEffective
    && !effect.expired && effect.participants.includes(relation.source.id) && effect.participants.includes(relation.target.id))
    .map(effect => effect.sourceRelationFactId)
  return { roleIds: sort(roleIds), patternContextIds: stoppedLuckManifestation ? [snapshot.patternContext.id] : [],
    relationIds: sort(relationIds),
    stopped: roleIds.length > 0 || stoppedLuckManifestation }
}

type Candidate = {
  eventDomain: EventDomain; evidenceType: EventEvidenceType; functionType: EventEvidenceFact['functionType']
  relation: StemRelationFact; actual: ActualStructuralFunction; provenanceClass: EventProvenanceClass; contextKey: string
  directionOverride?: EventEvidenceFact['direction']; stoppedAssertion?: boolean
  outcomeIds?: readonly string[]; relatedRelationIds?: readonly string[]; roleIds?: readonly string[]
  patternContextIds?: readonly string[]
}

function candidatesForScope(input: EventEvidenceInput, item: EvaluatedEventScope): Candidate[] {
  const snapshot = item.snapshot
  const scope = scopeNames[snapshot.scope]
  if (scope === 'natal' || scope === 'day' || snapshot.scope !== snapshot.patternContext.scope
    || snapshot.runtimeStatus !== 'resolved') return []
  const relations = [...snapshot.stemFacts, ...snapshot.patternFacts]
    .filter((relation): relation is StemRelationFact => relation.action !== 'coexist')
    .sort((a, b) => a.id.localeCompare(b.id))
  const actualById = new Map(snapshot.actualFunctions.map(actual => [actual.relationFactId, actual]))
  const functions = (relation: StemRelationFact) => actualById.get(relation.id)
  const moneyByRel = new Map<string, MoneyOutcomeFact[]>([])
  for (const fact of input.moneyOutcomes ?? []) for (const relationId of fact.sourceRelationIds) {
    moneyByRel.set(relationId, [...(moneyByRel.get(relationId) ?? []), fact])
  }
  const result: Candidate[] = []
  const bindingCandidates: Candidate[] = []
  const roleLinked = (relationId: string) => currentRoleIds(snapshot, [relationId]).length > 0
  for (const relation of relations) {
    const actual = functions(relation)
    if (!actual) continue
    const activePath = actual.structuralEffect?.currentlyEffective === true && live(actual.function)
      && ![relation.source.id, relation.target.id].some(id => snapshot.runtime.some(state => state.entityId === id && state.state === 'stopped'))
    const stoppedLinks = stoppedRoleLinks(snapshot, relation, resource)
    const stoppedSupport = known(input, 'event.contract.process') && stoppedLinks.stopped
    if (!activePath && !stoppedSupport) continue
    const people = [relation.source, relation.target]
    const hasResource = people.some(participant => resource(participant.tenGod))
    const hasOfficer = people.some(participant => participant.tenGod === '正官' || participant.tenGod === '偏官')
    const hasOutput = people.some(participant => output(participant.tenGod))
    const role = roleLinked(relation.id)
    const money = (moneyByRel.get(relation.id) ?? []).filter(fact => fact.currentlyEffective
      && (fact.semanticType === 'money_acquisition' || fact.semanticType === 'money_related_problem'
        || fact.semanticType === 'money_loss_or_division' || fact.semanticType === 'money_retention'))
    const outcomeIds = sort(money.map(fact => fact.id))
    const scoped = temporal(scope, snapshot.validity, item.evaluatedAt, input.evaluationMode)
    if (scoped.temporalStatus !== 'current') continue
    const classForPath = mapClass(actual.evidenceStatus)
    if ((!stoppedSupport && classForPath === 'DEFERRED') || classForPath === 'SOURCE_CONFLICT') continue

    // These are linked-path mappings, never TenGod-presence shortcuts.
    if (known(input, 'event.contract.process') && hasResource
      && (roleForTenGod(snapshot, relation, resource, ['YongShen', 'SangShen']).length > 0
        || manifestedYongShenLinks(snapshot, relation, resource).length > 0)
      && actual.direction === 'favorable'
      && (relation.action === 'generate' || relation.action === 'control')) {
      result.push({ eventDomain: 'contract', evidenceType: 'document_support', functionType: 'supports', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.contract.process',
        patternContextIds: manifestedYongShenLinks(snapshot, relation, resource) })
    }
    if (activePath && known(input, 'event.contract.process') && hasResource && hasOutput && relation.action === 'control'
      && actual.direction === 'unfavorable' && roleForTenGod(snapshot, relation, output, ['YongShen', 'SangShen']).length > 0) {
      result.push({ eventDomain: 'contract', evidenceType: 'document_obstruction', functionType: 'blocks', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.contract.process' })
    }
    if (stoppedSupport && known(input, 'event.contract.process') && hasResource) {
      result.push({ eventDomain: 'contract', evidenceType: 'support_function_stopped', functionType: 'blocks', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.contract.process', directionOverride: 'unfavorable', stoppedAssertion: true,
        roleIds: stoppedLinks.roleIds, patternContextIds: stoppedLinks.patternContextIds,
        relatedRelationIds: stoppedLinks.relationIds })
    }
    if (activePath && known(input, 'event.contract.process') && hasOfficer && actual.direction === 'unfavorable'
      && roleForTenGod(snapshot, relation, god => god === '正官' || god === '偏官').length > 0
      && (relation.action === 'control' || relation.action === 'combine')) {
      result.push({ eventDomain: 'contract', evidenceType: 'institutional_instability', functionType: 'destabilizes', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.contract.process' })
    }
    if (activePath && known(input, 'event.contract.process') && relation.action === 'combine' && role
      && actual.direction === 'favorable') {
      bindingCandidates.push({ eventDomain: 'contract', evidenceType: 'binding', functionType: 'binds', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.contract.process' })
    }
    if (activePath && known(input, 'event.contract.process') && ((hasResource && roleForTenGod(snapshot, relation, resource).length > 0)
      || (hasOfficer && roleForTenGod(snapshot, relation, god => god === '正官' || god === '偏官').length > 0))
      && actual.direction === 'unfavorable' && (relation.action === 'control' || relation.action === 'combine')) {
      result.push({ eventDomain: 'contract', evidenceType: 'contract_trouble', functionType: 'blocks', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.contract.process' })
    }

    const businessContext = known(input, 'event.business.startGoal') || known(input, 'event.business.operating')
      || known(input, 'event.business.adjustment') || known(input, 'event.business.restructure')
    const validOutputToWealth = relation.action === 'generate' && output(relation.source.tenGod) && wealth(relation.target.tenGod)
      && (actual.direction === 'favorable' || actual.direction === 'favorable_auxiliary') && role && outcomeIds.length > 0
    if (activePath && businessContext && validOutputToWealth) {
      result.push({ eventDomain: 'business_start', evidenceType: 'business_activity_support', functionType: 'supports', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: known(input, 'event.business.startGoal') ? 'event.business.startGoal' : 'event.business.operating',
        outcomeIds })
      result.push({ eventDomain: 'business_start', evidenceType: 'business_result_support', functionType: 'supports', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: known(input, 'event.business.startGoal') ? 'event.business.startGoal' : 'event.business.operating',
        outcomeIds })
      if (known(input, 'event.business.startGoal')) result.push({ eventDomain: 'business_start', evidenceType: 'business_start_support',
        functionType: 'activates', relation, actual, provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.business.startGoal', outcomeIds })
      if (known(input, 'event.business.operating')) result.push({ eventDomain: 'business_expansion', evidenceType: 'business_expansion_support',
        functionType: 'supports', relation, actual, provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.business.operating', outcomeIds })
    }
    if (activePath && businessContext && hasOutput && actual.direction === 'unfavorable' && role
      && (relation.action === 'control' || relation.action === 'combine')) {
      result.push({ eventDomain: 'business_start', evidenceType: 'business_execution_obstruction', functionType: 'delays', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: known(input, 'event.business.startGoal') ? 'event.business.startGoal' : 'event.business.operating' })
    }
    if (activePath && known(input, 'event.business.adjustment') && hasOutput && actual.direction === 'unfavorable' && role
      && (relation.action === 'control' || relation.action === 'combine')) {
      result.push({ eventDomain: 'business_adjustment', evidenceType: 'business_adjustment_need', functionType: 'blocks', relation, actual,
        provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.business.adjustment' })
    }
    if (activePath && known(input, 'event.business.restructure') && hasOutput && role && actual.direction !== 'deferred') {
      const participants = new Set(people.map(person => person.id))
      const relatedBranches = new Set(snapshot.rootFacts.filter(root => participants.has(root.stemEntityId)).map(root => root.branchEntityId))
      const clash = [...snapshot.branchFacts].sort((a, b) => a.id.localeCompare(b.id))
        .find(fact => fact.kind === 'clash' && fact.participants.some(id => relatedBranches.has(id)))
      const damagedTarget = clash && snapshot.rootStates.some(root => participants.has(root.entityId) && root.state === 'weakened'
        && snapshot.rootFacts.some(fact => fact.stemEntityId === root.entityId && clash.participants.includes(fact.branchEntityId)))
      if (clash && damagedTarget) result.push({ eventDomain: 'business_restructure', evidenceType: 'business_restructure_trigger',
        functionType: 'activates', relation, actual, provenanceClass: 'SOURCE_INFERENCE', contextKey: 'event.business.restructure',
        relatedRelationIds: [clash.id] })
    }
  }
  for (const binding of bindingCandidates) {
    const participants = [binding.relation.source.id, binding.relation.target.id]
    const supporting = result.some(candidate => candidate.eventDomain === 'contract' && candidate.evidenceType === 'document_support'
      && candidate.relation.id !== binding.relation.id
      && [candidate.relation.source.id, candidate.relation.target.id].some(id => participants.includes(id)))
    if (supporting) result.push(binding)
  }
  return result
}

export function buildEventEvidence(input: EventEvidenceInput): readonly EventEvidenceFact[] {
  const snapshots = [...input.scopes].sort((a, b) => intervalStart(a).localeCompare(intervalStart(b))
    || a.snapshot.id.localeCompare(b.snapshot.id))
  const facts: EventEvidenceFact[] = []
  const bySnapshotId = new Map(snapshots.map(item => [item.snapshot.id, item]))
  for (const item of snapshots) {
    const snapshot = item.snapshot
    const scope = scopeNames[snapshot.scope]
    if (scope === 'day') continue
    const status = temporal(scope, snapshot.validity, item.evaluatedAt, input.evaluationMode)
    const parent = item.parentSnapshot ? undefined : snapshot.parentScopeId ? bySnapshotId.get(snapshot.parentScopeId) : undefined
    const scopeGanZhi = scopeIdentity(item)
    const parentScopeGanZhi = item.parentScopeGanZhi ?? (item.parentSnapshot
      ? scopeIdentity({ snapshot: item.parentSnapshot, evaluatedAt: item.evaluatedAt })
      : parent && scopeIdentity(parent))
    for (const candidate of candidatesForScope(input, item)) {
      const relation = candidate.relation
      const sourceRelations = sort([relation.id, ...(candidate.relatedRelationIds ?? [])])
      const sourceRoles = sort([...currentRoleIds(snapshot, sourceRelations), ...(candidate.roleIds ?? [])])
      const outcomes = sort(candidate.outcomeIds ?? [])
      const effectIds = sort(snapshot.luckEffectStates.filter(effect => effect.currentlyEffective && !effect.expired
        && (effect.event.sourceRelationFactId === relation.id || effect.event.evidenceRefs.some(ref => sourceRelations.includes(ref))))
        .map(effect => effect.event.id))
      const participants = relation.action === 'combine' ? [relation.source.id, relation.target.id].sort()
        : [relation.source.id, relation.target.id]
      const path = JSON.stringify([relation.action, ...participants])
      const originScope = scopeNames[candidate.actual.structuralEffect?.originScope ?? snapshot.scope]
      const provenance = sort([candidate.provenanceClass, `master15:${candidate.evidenceType}`, ...sourceRelations,
        ...sourceRoles, ...outcomes, ...effectIds])
      facts.push({
        id: `event-evidence:${hash([candidate.eventDomain, candidate.evidenceType, path, originScope, snapshot.id])}`,
        eventDomain: candidate.eventDomain, evidenceType: candidate.evidenceType, functionType: candidate.functionType,
        direction: candidate.directionOverride ?? (candidate.actual.direction === 'favorable' || candidate.actual.direction === 'favorable_auxiliary' ? 'favorable'
          : candidate.actual.direction === 'unfavorable' ? 'unfavorable' : 'deferred'),
        scope, originScope, scopeId: snapshot.id, parentScopeId: snapshot.parentScopeId ?? null,
        ...(scopeGanZhi && { scopeGanZhi }), ...(parentScopeGanZhi && { parentScopeGanZhi }),
        period: scope === 'natal' ? undefined : snapshot.validity,
        certainty: candidate.actual.function === 'reduced' ? 'contextual' : 'confirmed',
        provenanceClass: candidate.provenanceClass, currentLifecycle: candidate.stoppedAssertion ? 'stopped'
          : candidate.actual.function === 'reduced' ? 'reduced' : 'active',
        currentlyEffective: status.effective && (candidate.stoppedAssertion || candidate.actual.structuralEffect?.currentlyEffective === true),
        temporalStatus: status.temporalStatus, sourcePathId: path,
        sourceJudgmentIds: [snapshot.id], sourceRelationIds: sourceRelations, sourceRoleIds: sourceRoles,
        sourceOutcomeIds: outcomes, sourceLuckEffectIds: effectIds,
        sourcePatternContextIds: sort(candidate.patternContextIds ?? []), sourceContextKeys: [candidate.contextKey], provenance,
      })
    }
  }
  const deduped = new Map<string, EventEvidenceFact>()
  for (const fact of facts.sort((a, b) => a.id.localeCompare(b.id))) deduped.set(fact.id, fact)
  return [...deduped.values()]
}
