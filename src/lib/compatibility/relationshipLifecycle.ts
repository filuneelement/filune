import { createEventTimingDecision, projectEventTimingDecisions } from '../eventTiming/eventTiming'
import type { EvaluatedEventScope, EventEvidenceFact, EventTimingDecision, TimedEventScope } from '../eventTiming/types'
import { luckPeriodStatus } from '../judgment/core/luckValidity'
import type { LuckScopeState } from '../judgment/core/luckScope'
import { recordId, sortedUnique } from '../judgment/producers/shared'
import type { RelationshipOutcomeFact } from '../outcome/relationship/relationshipOutcome'
import type { CurrentResourceOutputExpression } from '../reading/personalityResourceOutput'
import type { DirectionalCompatibilityResult } from './structuralPolicy'
import type { PersonalityInteractionFact } from './personalityInteraction'

const scopes = { greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' } as const
type Gender = '女性' | '男性' | undefined
type Kind = Extract<EventTimingDecision['eventType'], `relationship_${string}` | `marriage_${string}`>
const directions = {
  relationship_formation: 'opportunity', relationship_change: 'change', marriage_opportunity: 'opportunity',
  marriage_favorable: 'favorable', marriage_caution: 'caution', relationship_strain: 'strain',
  relationship_relief: 'relief', relationship_breakdown_risk: 'risk',
} as const satisfies Record<Kind, EventTimingDecision['direction']>
const source = 'src/docs/source/primary/07-사주풀이예시.md'
const authority = 'Master16:RelationshipLifecycle'
const controlPathKey = (relation: Relation) => recordId('relationship-control-path',
  [relation.target.id, relation.source.tenGod])

export interface RelationshipLifecycleInput {
  readonly personId: string
  readonly gender: Gender
  readonly natal: LuckScopeState
  readonly scopes: readonly EvaluatedEventScope[]
  readonly outcomes: readonly RelationshipOutcomeFact[]
  readonly expressions?: readonly CurrentResourceOutputExpression[]
  readonly referenceTime?: string
  readonly evaluationMode?: 'calendar' | 'source_snapshot'
}

type EvidenceType = Extract<EventEvidenceFact['evidenceType'], 'spouse_palace_contact' | 'spouse_palace_change'
  | 'partner_activation' | 'food_god_activation' | 'day_master_combine' | 'relationship_support'
  | 'relationship_damage' | 'communication_change'
  | 'spouse_relationship_axis' | 'spouse_event_activation' | 'spouse_palace_disruption'>
type Relation = LuckScopeState['stemFacts'][number] | LuckScopeState['patternFacts'][number]

function partner(gender: Gender, tenGod: Relation['source']['tenGod']) {
  return gender === '女性' ? tenGod === '正官' || tenGod === '偏官'
    : gender === '男性' && (tenGod === '正財' || tenGod === '偏財')
}

function structuralPaths(snapshot: LuckScopeState) {
  return [...snapshot.stemFacts, ...snapshot.patternFacts].flatMap(relation => {
    const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
    if (!actual || actual.function !== 'operating') return []
    if (relation.action === 'coexist') {
      if (!actual.runtimeEvidence.every(item => item.state === 'active') || actual.runtimeEvidence.length !== 2) return []
    } else if (!actual.structuralEffect?.currentlyEffective) return []
    return [{ relation, actual }]
  })
}

export function buildIndividualRelationshipTimeline(input: RelationshipLifecycleInput) {
  const { personId, natal, outcomes, gender } = input
  if (!personId || natal.scope !== 'natal') throw new TypeError('Expected person and natal Judgment')
  const natalPool = new Map(natal.formationBranchPool.map(item => [item.id, item.branch]))
  const natalStems = new Map(natal.stemFacts.flatMap(item => [item.source, item.target]).map(item => [item.id, item.stem]))
  const palace = outcomes.find(fact => fact.scopeId === natal.id && fact.certainty === 'confirmed'
    && fact.semanticType === 'relationship_palace_context')
  const palaceId = palace?.sourceParticipantIds[0]
  const activePartners = outcomes.filter(fact => fact.scopeId === natal.id && fact.semanticType === 'relationship_significator'
    && fact.significator === 'partner' && fact.certainty === 'confirmed' && fact.currentlyEffective
    && fact.lifecycle === 'active' && fact.currentFunction === 'operating'
    && fact.sourceParticipantIds.some(id => natal.runtime.some(state => state.entityId === id && state.state === 'active')))
  const breakdownPaths: Array<{ id: string; kind: 'BREAKDOWN-A' | 'BREAKDOWN-B'; scopeId: string;
    certainty: 'confirmed'; sourceEvidenceIds: readonly string[] }> = []
  const evidence = new Map<string, EventEvidenceFact>()
  const decisions = new Map<string, EventTimingDecision>()
  const highRiskDecisionIds = new Set<string>()
  const gaps = new Set<string>()
  const deferred = new Set<string>()
  if (!palaceId || !natalPool.has(palaceId)) gaps.add('natal_spouse_palace')
  const damageByScope = new Map<string, Array<{ key: string; evidence: EventEvidenceFact }>>()
  const scopesById = new Map(input.scopes.map(entry => [entry.snapshot.id, entry]))
  const baseline = natal.stemFacts.filter(relation => {
    if (relation.action !== 'control' || !partner(gender, relation.target.tenGod)) return false
    const actual = natal.actualFunctions.find(item => item.relationFactId === relation.id)
    if (actual?.direction !== 'unfavorable') return false
    if (actual.policyId === 'OFF-03' && actual.structuralEffect?.blockedBy?.kind === 'active_protection') return true
    return actual.function === 'operating' && actual.structuralEffect?.currentlyEffective
      && (actual.byeongCandidate || outcomes.some(fact => fact.scopeId === natal.id && fact.certainty === 'confirmed'
        && fact.semanticType === 'relationship_pressure' && fact.sourceRelationIds.includes(relation.id)))
  })

  for (const { snapshot, evaluatedAt, scopeGanZhi, parentScopeGanZhi } of [...scopesById.values()]
    .sort((a, b) => Object.keys(scopes).indexOf(a.snapshot.scope) - Object.keys(scopes).indexOf(b.snapshot.scope)
      || a.snapshot.id.localeCompare(b.snapshot.id))) {
    if (snapshot.scope === 'natal' || snapshot.scope === 'dailyLuck' || snapshot.patternContext.scope !== snapshot.scope) continue
    const at = evaluatedAt ?? input.referenceTime
    if (input.evaluationMode !== 'source_snapshot' && (!at || luckPeriodStatus(snapshot.validity, at) !== 'effective')) continue
    const pool = new Map(snapshot.formationBranchPool.map(item => [item.id, item]))
    if ([...pool.values()].filter(item => item.scope === 'natal').length !== natalPool.size
      || [...natalPool].some(([id, branch]) => pool.get(id)?.branch !== branch || pool.get(id)?.scope !== 'natal')
      || snapshot.stemFacts.some(item => [item.source, item.target].some(stem =>
        stem.scope === 'natal' && natalStems.has(stem.id) && natalStems.get(stem.id) !== stem.stem))) continue
    const scope: TimedEventScope = scopes[snapshot.scope]
    const make = (type: EvidenceType, path: string, refs: {
      relations?: readonly string[]; outcomes?: readonly string[]; effects?: readonly string[]
      roles?: readonly string[]; judgment?: readonly string[]; provenance?: readonly string[]; reduced?: boolean; inheritedFrom?: TimedEventScope
    } = {}, origin = snapshot): EventEvidenceFact => {
      const id = recordId('relationship-timing-evidence', [personId, origin.id, type, path])
      const item: EventEvidenceFact = {
        id, eventDomain: 'relationship', evidenceType: type, functionType: type === 'relationship_damage' ? 'destabilizes' : 'activates',
        direction: type === 'relationship_damage' ? 'unfavorable' : type === 'relationship_support' ? 'favorable' : 'neutral',
        scope: origin.scope === 'natal' ? 'natal' : scope, originScope: refs.inheritedFrom ?? (origin.scope === 'natal' ? 'natal' : scope),
        scopeId: origin.id, parentScopeId: origin.parentScopeId,
        ...(origin.scope !== 'natal' && { scopeGanZhi, parentScopeGanZhi, period: origin.validity }), certainty: 'confirmed', provenanceClass: 'SOURCE_EXPLICIT',
        currentLifecycle: refs.reduced ? 'reduced' : 'active', currentlyEffective: true, temporalStatus: origin.scope === 'natal' ? 'baseline' : 'current', sourcePathId: path,
        sourceJudgmentIds: sortedUnique([origin.id, ...(refs.judgment ?? [])]), sourceRelationIds: sortedUnique(refs.relations ?? []),
        sourceRoleIds: sortedUnique(refs.roles ?? []), sourcePatternContextIds: [origin.patternContext.id],
        sourceOutcomeIds: sortedUnique(refs.outcomes ?? []), sourceLuckEffectIds: sortedUnique(refs.effects ?? []),
        sourceContextKeys: [], provenance: sortedUnique([authority, ...(refs.provenance ?? [])]),
      }
      evidence.set(id, item)
      return item
    }
    const emit = (kind: Kind, witnesses: readonly EventEvidenceFact[]) => {
      if (!witnesses.length) return undefined
      const anchor = witnesses[0]
      const decision = createEventTimingDecision(kind, directions[kind], anchor, witnesses)
      decisions.set(decision.id, decision)
      return decision
    }
    const observed = outcomes.filter(fact => fact.scopeId === snapshot.id && fact.lifecycle === 'active')
    const contacts = [...snapshot.branchFacts.filter(item => item.kind === 'six_combination' || item.kind === 'clash'),
      ...snapshot.formationFacts.filter(item => item.kind === 'half' || item.kind === 'three')].filter(item =>
      item.participants.includes(palaceId ?? '') && item.participants.some(id => pool.get(id)?.scope === snapshot.scope))
    const natalBranchCombination = [...snapshot.branchFacts.filter(item => item.kind === 'six_combination'),
      ...snapshot.formationFacts.filter(item => item.kind === 'half' || item.kind === 'three')]
      .find(item => item.participants.some(id => pool.get(id)?.scope === 'natal')
        && item.participants.some(id => pool.get(id)?.scope === snapshot.scope))
    const incoming = (item: Relation['source']) => item.scope === snapshot.scope
    const paths = snapshot.runtimeStatus === 'resolved' ? structuralPaths(snapshot) : []
    const opportunity: EventEvidenceFact[] = []
    const disruptions: EventEvidenceFact[] = []
    const pathBRef = 'Master16:BREAKDOWN-B'
    for (const contact of contacts) {
      const observedContact = observed.filter(item => item.sourceRelationIds.includes(contact.id))
      const blocked = outcomes.some(item => item.scopeId === snapshot.id && item.sourceRelationIds.includes(contact.id)
        && item.lifecycle !== 'active')
      if (blocked) continue
      const clash = contact.kind === 'clash'
      const item = make(clash ? 'spouse_palace_change' : 'spouse_palace_contact', contact.id, {
        relations: [contact.id], outcomes: observedContact.map(fact => fact.id),
        provenance: [`${source}#L202-L205`, 'Master03:BranchRelations'],
      })
      if (clash) {
        emit('relationship_change', [item])
        disruptions.push(make('spouse_palace_disruption', contact.id, {
          relations: [contact.id], outcomes: observedContact.map(fact => fact.id),
          provenance: [pathBRef, 'Master03:BranchRelations'],
        }))
      } else opportunity.push(item)
    }

    const activations = snapshot.runtimeStatus === 'resolved' ? snapshot.stemFacts.flatMap(relation => {
      if (relation.action === 'combine') return []
      const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
      const effect = actual?.structuralEffect
      if (!effect?.currentlyEffective || effect.blockedBy
        || (actual?.function !== 'operating' && actual?.function !== 'reduced')) return []
      const participants = relation.action === 'generate' ? [relation.source, relation.target] : [relation.source]
      return participants.flatMap(actor => {
        if (actor.dayMaster || actor.scope === 'natal' || !partner(gender, actor.tenGod)
          || !snapshot.runtime.some(state => state.entityId === actor.id && state.state !== 'stopped')) return []
        let inheritedFrom: TimedEventScope | undefined
        const judgment: string[] = []
        const relations = [relation.id]
        if (!incoming(actor)) {
          if (!effect.inherited || effect.originScope !== actor.scope || actor.scope === 'dailyLuck') return []
          let parentId = snapshot.parentScopeId
          const visited = new Set<string>()
          while (parentId && !visited.has(parentId)) {
            visited.add(parentId)
            const parent = scopesById.get(parentId)?.snapshot
            if (!parent) return []
            if (parent.scope === actor.scope) {
              if (parent.patternContext.scope !== parent.scope
                || (input.evaluationMode !== 'source_snapshot' && (!at || luckPeriodStatus(parent.validity, at) !== 'effective'))
                || !parent.stemFacts.some(item => item.id === effect.relationOriginFactId
                  && (item.source.id === actor.id || item.target.id === actor.id))) return []
              judgment.push(parent.id)
              relations.push(effect.relationOriginFactId)
              inheritedFrom = scopes[actor.scope]
              break
            }
            parentId = parent.parentScopeId
          }
          if (!inheritedFrom) return []
        }
        return [make('spouse_event_activation', recordId('spouse-event-actor', [actor.id, relation.id]), {
          judgment, relations, inheritedFrom, reduced: actual.function === 'reduced',
          provenance: [pathBRef, `${source}#L3274`],
        })]
      })
    }) : []
    const axis = palace && palaceId && natalPool.has(palaceId) && activePartners.length
      ? make('spouse_relationship_axis', palaceId, {
        outcomes: [palace.id, ...activePartners.map(fact => fact.id)], roles: activePartners.flatMap(fact => fact.sourceRoleIds),
        provenance: [pathBRef],
      }, natal) : undefined

    const combinations = snapshot.combinationEffects.filter(effect => effect.originScopeId === snapshot.id
      && effect.currentlyEffective && !effect.expired)
    for (const { relation, actual } of paths) {
      const actor = [relation.source, relation.target].find(item => incoming(item) && !item.dayMaster
        && (item.id === relation.source.id || relation.action === 'generate'))
      if (!actor || relation.action === 'coexist' || relation.action === 'combine') continue
      const femaleFood = gender === '女性' && actor.tenGod === '食神'
      if (!femaleFood && !partner(gender, actor.tenGod)) continue
      const root = snapshot.rootStates.find(item => item.entityId === actor.id)
      const supported = root?.state === 'present' || root?.state === 'strengthened'
      if (!supported && actual.direction === 'deferred') {
        deferred.add(recordId('relationship-timing-deferred', [snapshot.id, 'incoming_function', actor.id]))
        continue
      }
      const natalCombination = combinations.find(effect => snapshot.combinationHistory.some(entry =>
        entry.relation.id === effect.sourceRelationFactId
        && [entry.relation.source, entry.relation.target].some(item => item.id === actor.id)
        && [entry.relation.source, entry.relation.target].some(item => item.scope === 'natal')))
      if (femaleFood && (!contacts.length || !supported)
        || gender === '男性' && !natalCombination && !natalBranchCombination) continue
      opportunity.push(make(femaleFood ? 'food_god_activation' : 'partner_activation', relation.id, {
        relations: [relation.id, ...(natalCombination ? [natalCombination.sourceRelationFactId] : []),
          ...(gender === '男性' && natalBranchCombination ? [natalBranchCombination.id] : [])],
        judgment: root ? [...root.factIds, ...root.formationIds] : [], provenance: [`${source}#L202-L207`],
      }))
    }
    const dayMasterSignals = snapshot.stemFacts.filter(relation => relation.action === 'combine' && [relation.source, relation.target].some(item => item.dayMaster)
      && [relation.source, relation.target].some(item => incoming(item)
        && snapshot.runtime.some(state => state.entityId === item.id && state.state === 'active')))
    for (const relation of dayMasterSignals) {
      opportunity.push(make('day_master_combine', relation.id, { relations: [relation.id], provenance: [`${source}#L208`] }))
    }
    emit('relationship_formation', opportunity)
    emit('marriage_opportunity', opportunity)

    const previous = scopesById.get(snapshot.parentScopeId ?? '')?.snapshot ?? (snapshot.parentScopeId === natal.id ? natal : undefined)
    const support: EventEvidenceFact[] = []
    const damage: Array<{ key: string; evidence: EventEvidenceFact }> = []
    for (const { relation, actual } of paths) {
      const participants = [relation.source, relation.target]
      const protectedPartner = actual.policyId === 'OFF-02' && snapshot.stemFacts.find(attack =>
        actual.conditionEvidence?.includes(attack.id) && attack.source.id === relation.target.id
        && partner(gender, attack.target.tenGod))
      if (!partner(gender, relation.target.tenGod) && !protectedPartner) continue
      const priorPath = previous?.stemFacts.find(item => item.source.id === relation.source.id
        && item.target.id === relation.target.id && item.action === relation.action)
      const priorFunction = previous?.actualFunctions.find(item => item.relationFactId === priorPath?.id)
      const block = priorFunction?.structuralEffect?.blockedBy
      const stoppedProtector = block?.kind === 'active_protection' && snapshot.combinationHistory.find(entry =>
        entry.participants.includes(block.protectorId)
        && combinations.some(effect => effect.sourceRelationFactId === entry.relation.id && effect.effect === 'stopped'))
      const reactivated = Boolean(block && actual.structuralEffect?.currentlyEffective)
      if (!participants.some(incoming) && !reactivated) continue
      const refs = { relations: [relation.id, ...(priorPath && reactivated ? [priorPath.id] : []),
        ...(stoppedProtector ? [stoppedProtector.relation.id] : [])],
        judgment: reactivated && previous ? [previous.id] : [],
        provenance: [...(actual.ruleId ? [actual.ruleId] : []), ...(actual.conditionEvidence ?? [])] }
      if (actual.direction === 'favorable' && (relation.action === 'generate' || protectedPartner)) {
        support.push(make('relationship_support', relation.id, protectedPartner
          ? { ...refs, relations: [...refs.relations, protectedPartner.id] } : refs))
      }
      const activeMix = gender === '女性' && relation.action === 'coexist'
        && (actual.policyId === 'OFF-05' || actual.policyId === 'KILL-06')
      const extendsActivatedOfficerPath = actual.policyId === 'OFF-03' && participants.some(incoming)
        && (damageByScope.get(snapshot.parentScopeId ?? '') ?? []).some(item => item.key === controlPathKey(relation))
      if (activeMix || actual.direction === 'unfavorable'
        && (actual.byeongCandidate || actual.policyId === 'OFF-03' && stoppedProtector || extendsActivatedOfficerPath)) {
        const key = relation.action === 'control' && partner(gender, relation.target.tenGod)
          ? controlPathKey(relation) : relation.id
        damage.push({ key, evidence: make('relationship_damage', relation.id, refs) })
      }
    }
    for (const fact of observed.filter(item => item.semanticType === 'relationship_pressure' && item.certainty === 'confirmed')) {
      const path = snapshot.stemFacts.find(relation => fact.sourceRelationIds.includes(relation.id)
        && partner(gender, relation.target.tenGod))
      damage.push({ key: path ? controlPathKey(path) : fact.id, evidence: make('relationship_damage', fact.id, {
        outcomes: [fact.id], relations: fact.sourceRelationIds, roles: fact.sourceRoleIds, effects: fact.sourceLuckEffectIds,
      }) })
    }
    for (const effect of combinations.filter(item => item.effect === 'stopped')) {
      const relation = snapshot.combinationHistory.find(item => item.relation.id === effect.sourceRelationFactId)?.relation
      if (!relation) continue
      for (const target of [relation.source, relation.target].filter(item => item.scope === 'natal' && partner(gender, item.tenGod))) {
        if (!previous || !structuralPaths(previous).some(path => path.actual.direction === 'favorable'
          && [path.relation.source.id, path.relation.target.id].includes(target.id))) {
          deferred.add(recordId('relationship-timing-deferred', [snapshot.id, 'stopped_partner_function', target.id]))
          continue
        }
        damage.push({ key: recordId('stopped-partner', [target.id]), evidence: make('relationship_damage', recordId('stopped-partner', [relation.id, target.id]),
          { relations: [relation.id], judgment: [previous.id] }) })
      }
    }
    if (opportunity.length) {
      emit('marriage_favorable', support.length ? [...opportunity, ...support] : [])
      emit('marriage_caution', damage.length ? [...opportunity, ...damage.map(item => item.evidence)] : [])
      if (!support.length && !damage.length) deferred.add(recordId('relationship-timing-deferred', [snapshot.id, 'marriage_quality']))
    }

    if (!gender) deferred.add(recordId('relationship-timing-deferred', [snapshot.id, 'partner_significator']))
    const expression = input.expressions?.find(item => item.scopeId === snapshot.id && item.scope === snapshot.scope
      && item.certainty === 'confirmed' && at && Date.parse(item.evaluatedAt) === Date.parse(at))
    if (expression?.effect) {
      const item = make('communication_change', expression.id, { judgment: expression.sourceJudgmentFactIds,
        provenance: [expression.id, ...expression.sourcePersonalityFactIds, ...expression.provenance] })
      emit(expression.effect === 'current_expression_relief' ? 'relationship_relief' : 'relationship_strain', [item])
    }
    emit('relationship_strain', damage.map(item => item.evidence))

    const continuousLongPath = (key: string) => {
      const path: EventEvidenceFact[] = []
      let parent = previous
      while (parent && parent.scope !== 'natal') {
        const matches = (damageByScope.get(parent.id) ?? []).filter(item => item.key === key)
        if (!matches.length) return []
        path.push(...matches.map(item => item.evidence))
        if (parent.scope === 'greatLuck') return path
        parent = scopesById.get(parent.parentScopeId ?? '')?.snapshot
      }
      return []
    }
    const scopePaths: Array<{ id: string; witnesses: readonly EventEvidenceFact[]; high: boolean }> = []
    const registerPath = (kind: 'BREAKDOWN-A' | 'BREAKDOWN-B', key: string, witnesses: readonly EventEvidenceFact[], high = false) => {
      const id = recordId('relationship-breakdown-path', [personId, snapshot.id, kind, key])
      breakdownPaths.push({ id, kind, scopeId: snapshot.id, certainty: 'confirmed',
        sourceEvidenceIds: sortedUnique(witnesses.map(item => item.id)) })
      scopePaths.push({ id, witnesses, high })
    }
    const emitRisk = (matched: typeof scopePaths) => {
      const witnesses = [...new Map(matched.flatMap(path => path.witnesses).map(item => [item.id, item])).values()]
      const risk = emit('relationship_breakdown_risk', witnesses)
      if (!risk) return
      decisions.set(risk.id, { ...risk, breakdownPathIds: sortedUnique(matched.map(path => path.id)) })
      if (matched.some(path => path.high)) highRiskDecisionIds.add(risk.id)
    }
    damageByScope.set(snapshot.id, damage)
    for (const key of sortedUnique(damage.map(item => item.key))) {
      const natalPaths = baseline.filter(relation => controlPathKey(relation) === key)
      if (!natalPaths.length) continue
      const currentPath = damage.filter(item => item.key === key).map(item => item.evidence)
      const origin = natalPaths.map(relation => make('relationship_damage', relation.id, { relations: [relation.id] }, natal))
      const linkedParent = continuousLongPath(key)
      registerPath('BREAKDOWN-A', key, [...currentPath, ...origin, ...linkedParent], linkedParent.length > 0)
    }
    const pathB = axis && activations.length > 0 && disruptions.length > 0
    if (pathB) {
      registerPath('BREAKDOWN-B', axis.sourcePathId, [...disruptions, ...activations, axis])
      emitRisk(scopePaths)
    } else {
      for (const path of scopePaths) emitRisk([path])
    }
    if (disruptions.length && !pathB && !damage.length) {
      deferred.add(recordId('relationship-timing-deferred', [snapshot.id, 'clash_without_function_damage']))
    }
    if (snapshot.runtimeStatus !== 'resolved') gaps.add('resolved_relationship_function')
    if (contacts.some(item => item.kind === 'clash') && input.evaluationMode === 'source_snapshot'
      && !scopePaths.length) {
      gaps.add('linked_natal_vulnerability_and_current_relationship_damage')
    }
  }

  const ordered = [...decisions.values()].sort((a, b) => a.id.localeCompare(b.id))
  const projected = projectEventTimingDecisions(ordered, input.scopes, input.evaluationMode === 'source_snapshot' ? undefined : input.referenceTime)
  return { personId, evidence: [...evidence.values()].sort((a, b) => a.id.localeCompare(b.id)), decisions: ordered,
    ...projected, breakdownPaths, highRiskDecisionIds: [...highRiskDecisionIds].sort(), gaps: [...gaps].sort(), deferred: [...deferred].sort() }
}

function bounds(period: LuckScopeState['validity']): readonly [number, number] | undefined {
  if (period.from.kind !== 'exact' || period.to.kind !== 'exact') return undefined
  const start = Date.parse(period.from.instant)
  const end = Date.parse(period.to.instant)
  return start < end ? [start, end] : undefined
}

function intersection(left: readonly [number, number], right: readonly [number, number]) {
  const start = Math.max(left[0], right[0])
  const end = Math.min(left[1], right[1])
  return start < end ? [start, end] as const : undefined
}

export function buildPairRelationshipTimeline(first: RelationshipLifecycleInput, second: RelationshipLifecycleInput, baseline: {
  readonly structural: readonly DirectionalCompatibilityResult[]
  readonly personality?: readonly PersonalityInteractionFact[]
}) {
  if (first.personId === second.personId) throw new TypeError('Relationship timeline requires distinct people')
  const inputs = [first, second].sort((a, b) => a.personId.localeCompare(b.personId))
  const people = inputs.map(buildIndividualRelationshipTimeline)
  const [a, b] = people
  const opportunities = people.map(person => person.facts.flatMap(fact => {
    const period = bounds(fact.period)
    return fact.eventType === 'marriage_opportunity' && period ? [{ fact, period }] : []
  }))
  const windows = opportunities[0].flatMap(left => opportunities[1].flatMap(right => {
    const period = intersection(left.period, right.period)
    if (!period) return []
    return [{ id: recordId('mutual-marriage-window', [a.personId, b.personId, left.fact.id, right.fact.id]),
      kind: 'mutual_marriage_window' as const, certainty: 'confirmed' as const,
      personIds: [a.personId, b.personId], from: new Date(period[0]).toISOString(), to: new Date(period[1]).toISOString(),
      sourceFactIds: [left.fact.id, right.fact.id] }]
  }))
  const oneSidedWindows = people.flatMap((person, index) => opportunities[index].flatMap(({ fact, period }) => {
    const competing = opportunities[1 - index].flatMap(other => {
      const overlap = intersection(period, other.period)
      return overlap ? [overlap] : []
    })
    const boundaries = [...new Set([...period, ...competing.flat()])].sort((left, right) => left - right)
    return boundaries.slice(0, -1).flatMap((start, i) => {
      const end = boundaries[i + 1]
      if (competing.some(overlap => start >= overlap[0] && end <= overlap[1])) return []
      const from = new Date(start).toISOString()
      const to = new Date(end).toISOString()
      return [{ id: recordId('one-sided-marriage-window', [person.personId, fact.id, from, to]),
        kind: 'one_sided_marriage_window' as const, certainty: 'confirmed' as const,
        personId: person.personId, from, to, sourceFactIds: [fact.id] }]
    })
  }))
  const communicationWindows = (baseline.personality ?? []).flatMap(fact => {
    if (fact.interactionType !== 'communication_relief' && fact.interactionType !== 'communication_friction_strengthened') return []
    const matching = fact.scopes.map(ref => {
      const input = inputs.find(item => item.personId === ref.personId)
      if (!input || input.evaluationMode === 'source_snapshot') return undefined
      const expression = input.expressions?.find(item => item.id === ref.expressionId && item.scopeId === ref.scopeId)
      const evaluated = input.scopes.find(item => item.snapshot.id === ref.scopeId && item.snapshot.scope === ref.scope
        && (item.snapshot.scope === 'greatLuck' || item.snapshot.scope === 'yearlyLuck' || item.snapshot.scope === 'monthlyLuck'))
      const at = evaluated?.evaluatedAt ?? input.referenceTime
      return expression?.certainty === 'confirmed' && evaluated && at
        && Date.parse(expression.evaluatedAt) === Date.parse(at) && luckPeriodStatus(evaluated.snapshot.validity, at) === 'effective'
        ? bounds(evaluated.snapshot.validity) : undefined
    })
    if (!matching[0] || (fact.direction === 'mutual' && !matching[1])) return []
    const period = matching[1] ? intersection(matching[0], matching[1]) : matching[0]
    if (!period) return []
    return [{ id: recordId('relationship-communication-window', [fact.id]),
      kind: fact.interactionType === 'communication_relief' ? 'relationship_relief' as const : 'relationship_strain' as const,
      certainty: 'confirmed' as const, personIds: fact.personIds, from: new Date(period[0]).toISOString(),
      to: new Date(period[1]).toISOString(), sourceFactIds: [fact.id] }]
  })
  return { people, windows, oneSidedWindows, communicationWindows, baseline }
}
