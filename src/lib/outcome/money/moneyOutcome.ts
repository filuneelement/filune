import type { LuckScopeState } from '../../judgment/core/luckScope'
import { luckPeriodStatus } from '../../judgment/core/luckValidity'
import type { OutcomeFact } from '../types'

type Meaning =
  | { semanticType: 'money_acquisition'; result: 'can_earn' }
  | { semanticType: 'money_generation_method'; result: 'skill_and_output' | 'ingenuity_and_expression' }
  | { semanticType: 'money_retention'; result: 'harder_to_retain' | 'retention_supported_by_protection' | 'unresolved' }
  | { semanticType: 'money_loss_or_division'; result: 'wealth_can_be_divided_or_flow_out' }
  | { semanticType: 'money_related_problem'; result: 'wealth_path_can_bring_difficulty' }
  | { semanticType: 'money_duration'; result: 'harder_to_sustain_accumulation' }

export type MoneyOutcomeFact = OutcomeFact & Meaning & {
  readonly conditionId: string
  readonly originRelationId: string
  readonly wealthEntityId: string
  readonly direction: 'favorable' | 'unfavorable' | 'deferred'
}

export type EvaluatedMoneyScope = { readonly snapshot: LuckScopeState; readonly evaluatedAt: string }
const scopes = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' } as const
const earningPolicies = new Set(['FOOD-01', 'FOOD-04', 'WEALTH-01', 'HO-01', 'PEER-03', 'ROB-04'])
const divisionPolicies = new Set(['WEALTH-05', 'PEER-06', 'ROB-03'])
const harmfulFeedPolicies = new Set(['KILL-05', 'WEALTH-06', 'PEER-05', 'ROB-05-harmful'])
const isWealth = (god: string) => god === '正財' || god === '偏財'
const live = (fn: string) => fn === 'operating' || fn === 'reduced'
const unique = (ids: readonly string[]) => [...new Set(ids)].sort()

function project(snapshot: LuckScopeState, temporalStatus: OutcomeFact['temporalStatus'], parent?: LuckScopeState) {
  if (snapshot.scope === 'dailyLuck' || snapshot.scope !== snapshot.patternContext.scope
    || snapshot.runtimeStatus !== 'resolved') return []
  const scope = scopes[snapshot.scope]
  const relations = [...snapshot.stemFacts, ...snapshot.patternFacts]
  const relationIds = new Set(relations.map(relation => relation.id))
  const actualById = new Map(snapshot.actualFunctions.map(actual => [actual.relationFactId, actual]))
  const runtime = new Map(snapshot.runtime.map(item => [item.entityId, item.state]))
  const facts: MoneyOutcomeFact[] = []

  for (const relation of relations) {
    const { id, source, target, action } = relation
    const actual = actualById.get(id)
    const effect = actual?.structuralEffect
    if (!effect?.currentlyEffective || !actual || !live(actual.function)
      || actual.patternContextId !== snapshot.patternContext.id || actual.direction === 'deferred'
      || [source.id, target.id].some(entity => !runtime.has(entity) || runtime.get(entity) === 'stopped')) continue

    const policy = actual.policyId ?? ''
    const damage = snapshot.policyRoles.byeong.filter(item => item.policyId === policy
      && item.sourceEntityId === source.id && item.targetEntityId === target.id
      && item.action === action && item.relationFactIds.includes(id))
    const harmful = actual.byeongCandidate && damage.some(item => item.currentState !== 'inactive')
      && damage.every(item => item.currentState !== 'inactive')
    const earning = action === 'generate' && isWealth(target.tenGod) && earningPolicies.has(policy)
      && (source.tenGod === '食神' || source.tenGod === '傷官')
      && (actual.direction === 'favorable' || actual.direction === 'favorable_auxiliary')
    const division = action === 'control' && isWealth(target.tenGod) && divisionPolicies.has(policy) && harmful
    const protection = action === 'control' && isWealth(target.tenGod) && divisionPolicies.has(policy)
      && !actual.byeongCandidate && actual.function === 'reduced'
      ? (actual.resolutionEvidence ?? []).filter(ref => relationIds.has(ref)) : []
    const conditional = snapshot.conditionalByeong.find(item => item.triggerRelationFactId === id
      && item.currentState === 'active' && item.requiresHarmfulKilling && live(item.currentFunction))
    const attack = action === 'generate' && isWealth(source.tenGod) && target.tenGod === '偏官'
      && (harmful && harmfulFeedPolicies.has(policy) && actual.conditionEvidence?.length || conditional)
      ? relations.find(item => item.action === 'control' && item.source.id === target.id && item.target.dayMaster
        && actualById.get(item.id)?.structuralEffect?.currentlyEffective) : undefined
    if (!earning && !division && !protection.length && !attack) continue

    const elders = parent?.actualFunctions.find(item => item.structuralEffect?.relationOriginFactId === effect.relationOriginFactId)
    const protectorIds = division && !effect.inherited && effect.originScope === snapshot.scope
      && elders?.function === 'reduced' && !elders.byeongCandidate
      ? parent?.stemFacts.filter(item => elders.resolutionEvidence?.includes(item.id))
        .flatMap(item => [item.source.id, item.target.id]).filter(entity => entity !== source.id && entity !== target.id) ?? [] : []
    const localCombinations = snapshot.combinationEffects.filter(item => !item.inherited && item.originScopeId === snapshot.id
      && item.currentlyEffective && !item.expired)
    const reactivation = localCombinations.filter(item => item.effect === 'stopped'
      && item.participants.some(entity => protectorIds.includes(entity))).map(item => item.sourceRelationFactId)
    const attenuation = actual.function === 'reduced' && !effect.inherited && effect.originScope === snapshot.scope
      ? localCombinations.filter(item => item.effect === 'weakened'
        && item.participants.some(entity => entity === source.id || entity === target.id)).map(item => item.sourceRelationFactId)
      : []
    const refs = unique([id, ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? []),
      ...damage.flatMap(item => item.relationFactIds), ...(attack ? [attack.id] : []),
      ...(conditional && attack ? [conditional.supportingRelationFactId] : []), ...reactivation, ...attenuation])
    const subjects = new Set([...damage.map(item => item.id), ...(conditional ? [conditional.sourceEntityId] : [])])
    const effects = snapshot.luckEffectStates.filter(state => state.currentlyEffective && !state.expired
      && subjects.has(state.event.subjectId) && state.event.evidenceRefs.includes(id))
    const scoped = scope !== 'natal'
    const localProtection = protection.some(ref => relations.some(item => item.id === ref
      && (item.source.scope === snapshot.scope || item.target.scope === snapshot.scope)))
    const localPath = source.scope === snapshot.scope || target.scope === snapshot.scope || localProtection
      || reactivation.length > 0 || attenuation.length > 0
      || effects.some(state => !state.inherited && state.originScopeId === snapshot.id)
    const capacity = snapshot.capacity
    const constrained = earning && ['正財', '偏財'].some(god => god === snapshot.patternContext.branchPattern)
      && capacity?.state === 'wealth_capacity_insufficient' && capacity.evidenceIds.length > 0
    const capacityEffects = constrained ? snapshot.luckEffectStates.filter(state => state.currentlyEffective && !state.expired
      && !state.inherited && state.originScopeId === snapshot.id && state.event.effectType === 'changes_capacity'
      && capacity.evidenceIds.some(ref => state.event.evidenceRefs.includes(ref))) : []
    if (scoped && !localPath && !capacityEffects.length) continue

    const roleIds = snapshot.roleEngine.currentRoles.filter(role => role.pathRefs.some(ref => refs.includes(ref))
      && role.currentState !== 'inactive' && role.currentState !== 'stopped'
      && snapshot.roleEngine.roleHistory.some(item => item.roleId === role.roleId)).map(role => role.roleId)
    const reduced = actual.function === 'reduced' || damage.some(item => item.currentState === 'weakened')
      || (attack && (conditional?.currentFunction === 'reduced' || actualById.get(attack.id)?.function === 'reduced'))
    const conditionId = 'money-condition:' + JSON.stringify([action, source.id, target.id])
    const add = (meaning: Meaning, direction: MoneyOutcomeFact['direction'], provenance: string[],
      { deferred = false, capacityBased = false } = {}) => {
      facts.push({
        ...meaning, id: 'money:' + JSON.stringify([meaning.semanticType, snapshot.id, conditionId]),
        domain: 'money', scope, scopeId: snapshot.id, ...(scoped && { period: snapshot.validity }),
        conditionId, originRelationId: effect.relationOriginFactId, wealthEntityId: attack ? source.id : target.id,
        direction, certainty: deferred ? 'deferred' : reduced ? 'contextual' : 'confirmed',
        lifecycle: deferred ? 'deferred' : reduced ? 'reduced' : 'active', temporalStatus,
        currentlyEffective: !deferred && (temporalStatus === 'baseline' || temporalStatus === 'current'),
        sourceJudgmentIds: [snapshot.id], sourceRelationIds: refs.filter(ref => relationIds.has(ref)),
        sourceRoleIds: unique(roleIds), sourceLuckEffectIds: unique([
          ...effects.map(state => state.event.id), ...(capacityBased ? capacityEffects.map(state => state.event.id) : []),
        ]),
        sourceParticipantIds: unique([source.id, target.id, ...(attack ? [attack.target.id] : [])]),
        provenance: unique([...provenance, ...(actual.ruleId ? [actual.ruleId] : []), ...refs,
          effect.relationOriginFactId, snapshot.patternContext.id]),
      })
    }

    if (earning && (!scoped || localPath)) {
      const food = source.tenGod === '食神'
      const provenance = ['OUT-MONEY-01', food ? '07:L1256' : '07:L764,L984']
      add({ semanticType: 'money_acquisition', result: 'can_earn' }, 'favorable', provenance)
      add({ semanticType: 'money_generation_method', result: food ? 'skill_and_output' : 'ingenuity_and_expression' }, 'favorable', provenance)
      if (!constrained) add({ semanticType: 'money_retention', result: 'unresolved' }, 'deferred', ['OUT-MONEY-02'], { deferred: true })
    }
    if (constrained) {
      const provenance = ['OUT-MONEY-02', '07:L140-L144,L1117', ...capacity.evidenceIds]
      add({ semanticType: 'money_retention', result: 'harder_to_retain' }, 'unfavorable', provenance, { capacityBased: true })
      add({ semanticType: 'money_duration', result: 'harder_to_sustain_accumulation' }, 'unfavorable', provenance, { capacityBased: true })
    }
    if (division) {
      const provenance = ['OUT-MONEY-04', '07:L140-L144,L1250-L1251']
      add({ semanticType: 'money_loss_or_division', result: 'wealth_can_be_divided_or_flow_out' }, 'unfavorable', provenance)
      add({ semanticType: 'money_retention', result: 'harder_to_retain' }, 'unfavorable', provenance)
    }
    if (protection.length) add({ semanticType: 'money_retention', result: 'retention_supported_by_protection' },
      'favorable', ['OUT-MONEY-02', '07:L1067,L2322'])
    if (attack) add({ semanticType: 'money_related_problem', result: 'wealth_path_can_bring_difficulty' },
      'unfavorable', ['OUT-MONEY-04', '07:L162,L1262,L1273'])
  }
  const resolved = new Set(facts.filter(fact => fact.semanticType === 'money_retention' && fact.certainty !== 'deferred')
    .map(fact => fact.wealthEntityId))
  return facts.filter(fact => fact.certainty !== 'deferred' || !resolved.has(fact.wealthEntityId))
}

export function buildMoneyOutcome({ natal, referenceTime, luck = [] }: {
  readonly natal: LuckScopeState
  readonly referenceTime: string
  readonly luck?: readonly EvaluatedMoneyScope[]
}): readonly MoneyOutcomeFact[] {
  if (natal.scope !== 'natal') return []
  const snapshots = new Map([natal, ...luck.map(({ snapshot }) => snapshot)].map(item => [item.id, item]))
  const byId = new Map(project(natal, 'baseline').map(fact => [fact.id, fact]))
  const periods = new Set<string>()
  for (const { snapshot, evaluatedAt } of luck) {
    if (snapshot.scope === 'natal' || snapshot.scope === 'dailyLuck' || snapshot.scope !== snapshot.patternContext.scope
      || luckPeriodStatus(snapshot.validity, evaluatedAt) !== 'effective') continue
    const { from, to } = snapshot.validity
    const status = luckPeriodStatus(snapshot.validity, referenceTime)
    if (status === 'unknown' || from.kind !== 'exact' || to.kind !== 'exact') continue
    const key = JSON.stringify([snapshot.scope, Date.parse(from.instant), Date.parse(to.instant)])
    if (periods.has(key)) continue
    periods.add(key)
    const parent = snapshot.parentScopeId === null ? undefined : snapshots.get(snapshot.parentScopeId)
    for (const fact of project(snapshot, status === 'effective' ? 'current' : status, parent)) byId.set(fact.id, fact)
  }
  return [...byId.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}
