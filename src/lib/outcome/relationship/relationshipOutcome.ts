import type { TenGod } from '../../dayRelationships'
import type { CalculatedChart } from '../../canonical/types'
import type { LuckScopeState } from '../../judgment/core/luckScope'
import { luckPeriodStatus } from '../../judgment/core/luckValidity'
import { recordId, sortedUnique } from '../../judgment/producers/shared'
import type { OutcomeFact } from '../types'

type RelationKind = 'six_combination' | 'clash' | 'three' | 'half'
type Significator = 'partner' | 'child' | 'father' | 'mother'
type Meaning =
  | { semanticType: 'relationship_palace_context'; branch: string }
  | { semanticType: 'relationship_significator'; significator: Significator; tenGod: TenGod;
      currentFunction: 'operating' | 'reduced' | 'inactive' | 'deferred' | 'runtime_available';
      structuralFunctions: readonly { roleId: string; state: string; function: string }[] }
  | { semanticType: 'relationship_palace_relation'; relationKind: RelationKind }
  | { semanticType: 'relationship_contact_signal' | 'relationship_change_signal'; relationKind: RelationKind;
      possibleInterpretations: readonly ('contact' | 'change')[] }
  | { semanticType: 'relationship_formation'; relationKind: 'six_combination' | 'three';
      result: 'opportunity_to_form_close_relationship' }
  | { semanticType: 'relationship_pressure'; result: 'close_relationship_can_face_strain' }

export type RelationshipOutcomeFact = OutcomeFact & { readonly domain: 'relationship' } & Readonly<Meaning>
export type EvaluatedRelationshipScope = { readonly snapshot: LuckScopeState; readonly evaluatedAt: string }

const scopes = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' } as const

function significators(tenGod: TenGod, gender: CalculatedChart['birthInput']['gender']): Significator[] {
  switch (tenGod) {
    case '正財': case '偏財': return gender === '男性' ? ['father', 'partner'] : ['father']
    case '印綬': case '偏印': return ['mother']
    case '正官': case '偏官': return gender === '女性' ? ['partner'] : []
    case '食神': case '傷官': return gender === '女性' ? ['child'] : []
    default: return []
  }
}

function fact(snapshot: LuckScopeState, scope: OutcomeFact['scope'], temporalStatus: OutcomeFact['temporalStatus'],
  meaning: Meaning, participants: readonly string[], options: {
    lifecycle?: OutcomeFact['lifecycle']
    certainty: OutcomeFact['certainty']
    relationId?: string
    roleIds?: readonly string[]
    effectIds?: readonly string[]
    mappingEvidence?: readonly string[]
  }): RelationshipOutcomeFact {
  const { lifecycle = 'active', certainty, relationId, roleIds = [], effectIds = [] } = options
  const identity = meaning.semanticType === 'relationship_significator' ? meaning.significator : ''
  return {
    ...meaning,
    id: recordId('relationship', [meaning.semanticType, scope, snapshot.id, relationId ?? participants[0], identity]),
    domain: 'relationship', scope, scopeId: snapshot.id,
    ...(scope !== 'natal' && { period: snapshot.validity }),
    certainty, lifecycle, temporalStatus,
    currentlyEffective: (temporalStatus === 'baseline' || temporalStatus === 'current')
      && (lifecycle === 'active' || lifecycle === 'reduced'),
    sourceJudgmentIds: [snapshot.id], sourceRelationIds: relationId ? [relationId] : [],
    sourceRoleIds: sortedUnique(roleIds), sourceLuckEffectIds: sortedUnique(effectIds),
    sourceParticipantIds: sortedUnique(participants),
    provenance: options.mappingEvidence ?? (scope === 'natal' ? ['OUT-REL-01', 'A:I-15', ...(relationId ? ['Master03:B-003'] : [])]
      : ['OUT-REL-02', 'A:I-22', 'A:OP-R01', 'A:OP-R03', 'B:W-87', 'B:W-88', ...(meaning.semanticType === 'relationship_palace_relation' ? ['C:C-7-2'] : [])]),
  }
}

function natalFacts(chart: Readonly<CalculatedChart>, snapshot: LuckScopeState, palaceId: string,
  branch: string): RelationshipOutcomeFact[] {
  const results = [fact(snapshot, 'natal', 'baseline', { semanticType: 'relationship_palace_context', branch },
    [palaceId], { certainty: 'confirmed' })]
  for (const position of ['year', 'month', 'time'] as const) {
    if (chart.chart.pillars[position].status !== 'confirmed') continue
    const relation = chart.chart.basicRelations[position]
    if (relation.status !== 'confirmed') continue
    const entityId = recordId('entity', [`/chart/pillars/${position}/value/ganZhi`, 'stem'])
    if (!snapshot.directEntityIds.includes(entityId)) continue
    const { stemTenGod } = relation.value
    const runtime = snapshot.runtime.find(item => item.entityId === entityId)?.state
    const roles = snapshot.roleEngine.currentRoles.filter(role =>
      snapshot.roleEngine.roleHistory.some(history => history.roleId === role.roleId && history.entityId === entityId))
    // Structural role functions remain scoped to their own roles. A stem's runtime alone
    // establishes availability, without asserting that a particular role is operating.
    const lifecycle = runtime === 'stopped' ? 'stopped' : runtime === 'weakened' ? 'reduced'
      : runtime === 'active' ? 'active' : 'deferred'
    const currentFunction = lifecycle === 'stopped' ? 'inactive' : lifecycle === 'active'
      ? roles.some(role => role.currentState === 'active' && role.currentFunction === 'operating')
        ? 'operating' : 'runtime_available'
      : lifecycle
    const structuralFunctions = roles.map(role => ({ roleId: role.roleId, state: role.currentState,
      function: role.currentFunction })).sort((a, b) => a.roleId < b.roleId ? -1 : a.roleId > b.roleId ? 1 : 0)
    for (const significator of significators(stemTenGod, chart.birthInput.gender)) {
      results.push(fact(snapshot, 'natal', 'baseline',
        { semanticType: 'relationship_significator', significator, tenGod: stemTenGod, currentFunction, structuralFunctions },
        [entityId], { lifecycle, certainty: lifecycle === 'reduced' ? 'contextual' : 'confirmed',
          roleIds: roles.map(role => role.roleId) }))
    }
  }
  return results
}

function palaceRelations(snapshot: LuckScopeState, palaceId: string, scope: OutcomeFact['scope'],
  temporalStatus: OutcomeFact['temporalStatus'], evaluatedAt: string,
  gender: CalculatedChart['birthInput']['gender']): RelationshipOutcomeFact[] {
  const pool = new Map(snapshot.formationBranchPool.map(participant => [participant.id, participant]))
  // Inactive stage placeholders carry the parent's evaluated pattern context.
  if (snapshot.patternContext.scope !== snapshot.scope || pool.get(palaceId)?.scope !== 'natal') return []
  const contacts = [
    ...snapshot.branchFacts.filter(relation => relation.kind === 'six_combination' || relation.kind === 'clash'),
    ...snapshot.formationFacts.filter(relation => relation.kind === 'three' || relation.kind === 'half'),
  ]
  return contacts.flatMap(relation => {
    if (!relation.participants.includes(palaceId)
      || !relation.participants.every(id => pool.has(id))
      || !relation.participants.some(id => id !== palaceId && pool.get(id)?.scope === snapshot.scope)) return []
    const direct = snapshot.directEntityIds
    if ('elementStem' in relation ? relation.participants.some(id => pool.get(id)?.scope === 'dailyLuck')
      : !relation.participants.every(id => direct.includes(id))) return []
    const relationKind = relation.kind as RelationKind
    const actual = snapshot.actualFunctions.filter(item => item.relationFactId === relation.id)
    const effects = snapshot.luckEffectStates.filter(item => !item.inherited && item.originScopeId === snapshot.id
      && item.event.sourceRelationFactId === relation.id)
    const stopped = relation.participants.some(id => snapshot.runtime.some(item => item.entityId === id && item.state === 'stopped'))
    const inactive = actual.length > 0 && actual.every(item => item.function === 'inactive')
    const unavailableEffect = effects.length > 0 && effects.every(item => !item.currentlyEffective || item.expired
      || luckPeriodStatus(item.originPeriod, evaluatedAt) !== 'effective')
    const deferred = actual.some(item => item.evidenceStatus === 'DEFERRED' || item.evidenceStatus === 'CONFLICT')
      || actual.length > 0 && actual.every(item => item.function === 'inactive' || item.function === 'deferred')
    const reduced = actual.some(item => item.function === 'reduced')
      || relation.participants.some(id => snapshot.runtime.some(item => item.entityId === id && item.state === 'weakened'))
    const lifecycle = stopped ? 'stopped' : inactive || unavailableEffect ? 'inactive' : deferred ? 'deferred' : reduced ? 'reduced' : 'active'
    const meaning: Meaning = scope === 'natal' || relationKind === 'half' ? { semanticType: 'relationship_palace_relation', relationKind }
      : relationKind === 'clash'
        ? { semanticType: 'relationship_change_signal', relationKind, possibleInterpretations: ['change'] }
        : { semanticType: 'relationship_contact_signal', relationKind, possibleInterpretations: ['contact', 'change'] }
    const signal = fact(snapshot, scope, temporalStatus, meaning, relation.participants, {
      relationId: relation.id, lifecycle,
      certainty: lifecycle === 'deferred' ? 'deferred' : meaning.semanticType === 'relationship_palace_relation' ? 'contextual' : 'conditional',
      effectIds: effects.map(item => item.event.id),
    })
    if (scope === 'natal' || lifecycle !== 'active' || snapshot.runtimeStatus !== 'resolved'
      || (relationKind !== 'six_combination' && relationKind !== 'three')) return [signal]
    // A I-22 and P8 combine the palace relation with the applicable incoming stem.
    const stem = snapshot.stemFacts.flatMap(item => [item.source, item.target]).find(item =>
      item.scope === snapshot.scope && snapshot.runtime.some(state => state.entityId === item.id && state.state === 'active')
      && (significators(item.tenGod, gender).includes('partner')
        || (gender === '女性' && item.tenGod === '食神')))
    if (!stem) return [signal]
    return [signal, fact(snapshot, scope, temporalStatus, {
      semanticType: 'relationship_formation', relationKind, result: 'opportunity_to_form_close_relationship',
    }, [...relation.participants, stem.id], {
      relationId: relation.id, certainty: 'confirmed', effectIds: signal.sourceLuckEffectIds,
      mappingEvidence: ['A:I-22', 'A:OP-R03', '07:L202-L207', 'B:W-88'],
    })]
  })
}

function pressure(snapshot: LuckScopeState, scope: OutcomeFact['scope'], temporalStatus: OutcomeFact['temporalStatus'],
  gender: CalculatedChart['birthInput']['gender']): RelationshipOutcomeFact[] {
  if (gender !== '女性' || snapshot.runtimeStatus !== 'resolved' || snapshot.patternContext.scope !== snapshot.scope) return []
  return snapshot.stemFacts.flatMap(relation => {
    if (relation.action !== 'control' || relation.source.tenGod !== '傷官' || relation.target.tenGod !== '正官'
      || (relation.source.scope !== snapshot.scope && relation.target.scope !== snapshot.scope)) return []
    const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
    if (actual?.policyId !== 'OFF-03' || actual.direction !== 'unfavorable'
      || !actual.byeongCandidate || [relation.source.id, relation.target.id].some(id =>
        !snapshot.runtime.some(item => item.entityId === id && item.state !== 'stopped'))
      || !actual.structuralEffect?.currentlyEffective || !['operating', 'reduced'].includes(actual.function)
      || !snapshot.policyRoles.byeong.some(item => item.policyId === 'OFF-03' && item.currentState !== 'inactive'
        && item.relationFactIds.includes(relation.id))) return []
    const reduced = actual.function === 'reduced'
    return [fact(snapshot, scope, temporalStatus, {
      semanticType: 'relationship_pressure', result: 'close_relationship_can_face_strain',
    }, [relation.source.id, relation.target.id], {
      relationId: relation.id, certainty: reduced ? 'contextual' : 'confirmed', lifecycle: reduced ? 'reduced' : 'active',
      mappingEvidence: ['A:I-15', 'A:OP-R03', '07:L762-L765', ...(actual.ruleId ? [actual.ruleId] : [])],
    })]
  })
}

export function buildRelationshipOutcome(input: {
  readonly canonical: Readonly<CalculatedChart>
  readonly natal: LuckScopeState
  readonly luck?: readonly EvaluatedRelationshipScope[]
}): readonly RelationshipOutcomeFact[] {
  const { canonical, natal, luck = [] } = input
  const day = canonical.chart.pillars.day
  if (day.status !== 'confirmed' || natal.scope !== 'natal') return []
  const palaceId = recordId('entity', ['/chart/pillars/day/value/ganZhi', 'branch'])
  if (!natal.formationBranchPool.some(item => item.id === palaceId && item.scope === 'natal' && item.branch === day.value.branch)) return []

  const results = new Map<string, RelationshipOutcomeFact>()
  const add = (facts: readonly RelationshipOutcomeFact[]) => {
    for (const item of facts) {
      const previous = results.get(item.id)
      if (previous && JSON.stringify(previous) !== JSON.stringify(item)) {
        throw new TypeError(`Conflicting Relationship OutcomeFact: ${item.id}`)
      }
      results.set(item.id, item)
    }
  }
  const now = canonical.context.referenceTime
  add(natalFacts(canonical, natal, palaceId, day.value.branch))
  const gender = canonical.birthInput.gender
  add(palaceRelations(natal, palaceId, 'natal', 'baseline', now, gender))
  add(pressure(natal, 'natal', 'baseline', gender))
  const natalBranches = new Map(natal.formationBranchPool.filter(item => item.scope === 'natal')
    .map(item => [item.id, item.branch]))
  const natalStems = new Map((['year', 'month', 'day', 'time'] as const).flatMap(position => {
    const pillar = canonical.chart.pillars[position]
    return pillar.status === 'confirmed'
      ? [[recordId('entity', [`/chart/pillars/${position}/value/ganZhi`, 'stem']), pillar.value.stem] as const] : []
  }))
  for (const { snapshot, evaluatedAt } of luck) {
    if (snapshot.scope === 'natal' || snapshot.scope === 'dailyLuck'
      || luckPeriodStatus(snapshot.validity, evaluatedAt) !== 'effective') continue
    const branchPool = snapshot.formationBranchPool.filter(item => item.scope === 'natal')
    if (branchPool.length !== natalBranches.size || branchPool.some(item => natalBranches.get(item.id) !== item.branch)) continue
    if (snapshot.stemFacts.some(({ source, target }) => [source, target].some(participant =>
      participant.scope === 'natal' && natalStems.get(participant.id) !== participant.stem))) continue
    const status = luckPeriodStatus(snapshot.validity, now)
    if (status === 'unknown') continue
    const scope = scopes[snapshot.scope]
    const temporalStatus = status === 'effective' ? 'current' : status
    add(palaceRelations(snapshot, palaceId, scope, temporalStatus, evaluatedAt, gender))
    add(pressure(snapshot, scope, temporalStatus, gender))
  }
  return [...results.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}
