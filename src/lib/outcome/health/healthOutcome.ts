import type { CalculatedChart } from '../../canonical/types'
import type { LuckScopeState } from '../../judgment/core/luckScope'
import { luckPeriodStatus } from '../../judgment/core/luckValidity'
import type { OutcomeFact } from '../types'
import { recordId } from '../../judgment/producers/shared'

const correspondence = {
  wood: ['liver', 'gallbladder', 'muscles', 'tendons', 'nerves'],
  fire: ['heart', 'blood_circulation', 'eyes'],
  earth: ['stomach', 'digestion', 'lower_back'],
  metal: ['lungs', 'large_intestine', 'skin'],
  water: ['kidneys', 'bladder'],
} as const

const stems = {
  甲: ['wood', 'R-43', 'CS-014', 'CS-026'], 乙: ['wood'],
  丙: ['fire', 'R-43', 'CS-034'], 丁: ['fire'],
  戊: ['earth', 'R-43'], 己: ['earth', 'R-43'],
  庚: ['metal'], 辛: ['metal', 'CS-077'],
  壬: ['water'], 癸: ['water', 'R-43', 'CS-061'],
} as const

type HealthLifeMeaning =
  | { readonly type: 'health_burden' }
  | { readonly type: 'health_problem_prone_period' }
  | { readonly type: 'body_area_burden'; readonly areas: readonly string[] }
  | { readonly type: 'health_management_period' }

type DayStem = keyof typeof stems
export type HealthOutcomeFact = OutcomeFact & ({
  readonly semanticType: 'traditional_body_correspondence'
  readonly dayStem: DayStem
  readonly element: keyof typeof correspondence
  readonly specificity: 'direct-source-specific' | 'element-level-only'
  readonly traditionalBodyAreas: readonly string[]
} | {
  readonly semanticType: 'structural_health_attention' | 'health_attention_period'
  readonly conditionId: string
  readonly originRelationId: string
  readonly originScope: OutcomeFact['scope']
  readonly originScopeId?: string
  readonly path: 'harmful_killing' | 'yongshen_pressure' | 'sangshen_pressure'
  readonly patternContextId: string
  readonly targetEntityId: string
  readonly traditionalBodyAreas?: readonly string[]
  readonly lifeMeanings: readonly HealthLifeMeaning[]
  readonly scopeHistory: readonly HealthScopeProjection[]
  readonly axis: 'stem'
  readonly currentFunction: 'operating' | 'reduced'
  readonly direction: LuckScopeState['actualFunctions'][number]['direction']
})

interface HealthScopeProjection {
  readonly scopeId: string
  readonly scope: OutcomeFact['scope']
  readonly period: NonNullable<OutcomeFact['period']>
  readonly lifecycle: 'active' | 'reduced' | 'stopped' | 'inactive'
  readonly currentlyEffective: boolean
  readonly temporalStatus: 'current' | 'future' | 'expired'
  readonly sourceRelationId: string
}

export interface EvaluatedHealthScope {
  readonly snapshot: LuckScopeState
  readonly evaluatedAt: string
  readonly parentSnapshot?: Pick<LuckScopeState, 'id' | 'scope' | 'actualFunctions'>
}

const scopes = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' } as const
const unique = (ids: readonly string[]) => [...new Set(ids)].sort()
const harmfulFeed = new Set(['KILL-05', 'WEALTH-06', 'PEER-05', 'ROB-05-harmful'])
const activeFunction = (fn: string) => fn === 'operating' || fn === 'reduced'

/** Rebase a window scope only when its supplied parent proves the natal run identity. */
function stableSourceId(value: string, executionId: string, natalId: string): string {
  const marker = value.indexOf(':[')
  if (marker < 0) return value
  const prefix = value.slice(0, marker)
  const suffix = value.endsWith(':final') ? ':final' : ''
  const body = value.slice(marker + 1, suffix ? -suffix.length : undefined)
  let parts: unknown
  try { parts = JSON.parse(body) } catch { return value }
  if (prefix === 'p0-scope' && Array.isArray(parts) && typeof parts[1] === 'string') {
    let periodKey: unknown
    try { periodKey = JSON.parse(parts[1]) } catch { periodKey = parts[1] }
    if (parts[0] === executionId) return value
    if (Array.isArray(periodKey) && periodKey[0] === 'natal') return natalId + suffix
    if (typeof parts[0] === 'string' && Array.isArray(periodKey)) {
      return recordId(prefix, [executionId, parts[1]]) + suffix
    }
  }
  const rebase = (item: unknown): unknown => {
    if (typeof item !== 'string') return Array.isArray(item) ? item.map(rebase) : item
    return stableSourceId(item, executionId, natalId)
  }
  return `${prefix}:${JSON.stringify(rebase(parts))}${suffix}`
}

function stableFactReferences<T>(value: T, executionId: string, natalId: string): T {
  if (typeof value === 'string') return stableSourceId(value, executionId, natalId) as T
  if (Array.isArray(value)) return value.map(item => stableFactReferences(item, executionId, natalId)) as T
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, stableFactReferences(item, executionId, natalId)])) as T
  return value
}

function relationCoordinates(id: string): readonly [string, string, string] | undefined {
  const marker = id.indexOf(':[')
  if (marker < 0 || !id.startsWith('p0-stem-relation:')) return
  try {
    const parts = JSON.parse(id.slice(marker + 1)) as unknown[]
    if (parts.length === 4 && parts.slice(1).every(item => typeof item === 'string')) {
      return [parts[1] as string, parts[2] as string, parts[3] as string]
    }
  } catch { /* An opaque upstream ID cannot be coordinate-matched. */ }
}

function executionIdFromScope(id: string): string | undefined {
  if (!id.startsWith('p0-scope:')) return
  try {
    const [executionId] = JSON.parse(id.slice(id.indexOf(':[') + 1)) as unknown[]
    return typeof executionId === 'string' ? executionId : undefined
  } catch { return }
}

function traditional(canonical: Readonly<CalculatedChart>, natal: LuckScopeState): HealthOutcomeFact | undefined {
  const day = canonical.chart.pillars.day
  if (day.status !== 'confirmed' || !Object.hasOwn(stems, day.value.stem)) return
  const dayStem = day.value.stem as DayStem
  const [element, ...sources] = stems[dayStem]
  return {
    id: 'health:' + JSON.stringify(['traditional_body_correspondence', natal.id, dayStem]),
    domain: 'health', semanticType: 'traditional_body_correspondence', scope: 'natal', scopeId: natal.id,
    dayStem, element, specificity: sources.length ? 'direct-source-specific' : 'element-level-only',
    traditionalBodyAreas: sources.length ? [...correspondence[element]] : [],
    certainty: 'confirmed', lifecycle: 'active', temporalStatus: 'baseline', currentlyEffective: true,
    sourceJudgmentIds: [], sourceRoleIds: [], sourceRelationIds: [], sourceParticipantIds: [], sourceLuckEffectIds: [],
    provenance: unique(['A I-16', 'OUT-HEALTH-01', ...sources.map(source => `⑲-A:${source}`),
      ...(!sources.length ? ['⑲-A B/F:traditional image and FILUNE element-level limit'] : [])]),
  }
}

function structural(snapshot: LuckScopeState, temporalStatus: HealthOutcomeFact['temporalStatus'],
  parent?: EvaluatedHealthScope['parentSnapshot'], executionId = '', natalId = ''): HealthOutcomeFact[] {
  if (snapshot.scope === 'dailyLuck' || snapshot.patternContext.scope !== snapshot.scope
    || snapshot.runtimeStatus !== 'resolved') return []
  const scope = scopes[snapshot.scope]
  const relations = [...snapshot.stemFacts, ...snapshot.patternFacts]
  const functions = new Map(snapshot.actualFunctions.map(actual => [actual.relationFactId, actual]))
  const runtime = new Map(snapshot.runtime.map(state => [state.entityId, state.state]))
  const roles = snapshot.roleEngine.roleHistory
  const effects = snapshot.luckEffectStates.filter(state => state.currentlyEffective && !state.expired)
  const relationIds = new Set(relations.map(item => item.id))
  const facts: HealthOutcomeFact[] = []
  const representedAttacks = new Set<string>()
  const standaloneAttacks = new Map<string, string>()
  for (const relation of relations) {
    const { id, source, target, action } = relation
    const actual = functions.get(id)
    if (!actual?.structuralEffect?.currentlyEffective || !activeFunction(actual.function)
      || actual.patternContextId !== snapshot.patternContext.id
      || [source.id, target.id].some(entityId => !runtime.has(entityId) || runtime.get(entityId) === 'stopped')) continue
    if (actual.direction !== 'unfavorable' && actual.direction !== 'unfavorable_candidate') continue

    const damage = snapshot.policyRoles.byeong.filter(item => item.sourceEntityId === source.id
      && item.targetEntityId === target.id && item.action === action && item.relationFactIds.includes(id))
    if (damage.some(item => item.currentState === 'inactive')) continue
    const conditional = snapshot.conditionalByeong.filter(item => item.triggerRelationFactId === id
      && item.currentState === 'active' && item.requiresHarmfulKilling && activeFunction(item.currentFunction))
    const linkedRoles = roles.filter(role => snapshot.roleEngine.currentRoles.some(current =>
      current.roleId === role.roleId && current.pathRefs.includes(id)
      && (activeFunction(current.currentFunction) || current.currentState === 'weakened')))
    const targetRoles = roles.filter(role => role.entityId === target.id)
    const damageSubjects = new Set([...damage.map(item => item.id), ...conditional.map(item => item.sourceEntityId),
      ...linkedRoles.filter(role => role.role === 'Byeong' || role.role === 'ConditionalByeong').map(role => role.roleId)])
    const roleSubjects = new Set([target.id, ...targetRoles.map(role => role.roleId)])
    const linkedEffects = effects.filter(({ event }) =>
      (event.sourceRelationFactId === id || event.evidenceRefs.includes(id)) && (
        ['activates_byeong', 'strengthens_byeong', 'weakens_byeong'].includes(event.effectType)
          ? damageSubjects.has(event.subjectId)
          : ['attacks_yongshen', 'weakens_sangshen'].includes(event.effectType) && roleSubjects.has(event.subjectId)))
    const sang = targetRoles.filter(role => role.role === 'SangShen' && linkedEffects.some(({ event }) =>
      event.effectType === 'weakens_sangshen' && event.subjectId === role.roleId))
    const yong = snapshot.patternContext.effectiveManifestedYongShen.some(role => role.entityId === target.id)
      || targetRoles.some(role => role.role === 'YongShen' && linkedRoles.includes(role))
    const supportedDamage = actual.byeongCandidate && damage.length > 0
    let path: 'harmful_killing' | 'yongshen_pressure' | 'sangshen_pressure'
    let pressureTargetId = target.id
    let attackRelationId: string | undefined
    if (action === 'generate' && target.tenGod === '偏官' && (conditional.length
      || supportedDamage && harmfulFeed.has(actual.policyId ?? '') && actual.conditionEvidence?.length)) {
      const attack = relations.find(witness => witness.action === 'control' && witness.source.id === target.id
        && witness.target.dayMaster && functions.get(witness.id)?.structuralEffect?.currentlyEffective)
      if (!attack) continue
      attackRelationId = attack.id
      pressureTargetId = attack.target.id
      path = 'harmful_killing'
    } else if (action === 'control' && source.tenGod === '偏官' && target.dayMaster && supportedDamage) {
      path = 'harmful_killing'
    } else if (action === 'control' && yong && (supportedDamage || linkedEffects.some(({ event }) =>
      event.effectType === 'attacks_yongshen' && (event.subjectId === target.id
        || targetRoles.some(role => role.role === 'YongShen' && role.roleId === event.subjectId))))) {
      path = 'yongshen_pressure'
    } else if (action === 'control' && sang.length) {
      path = 'sangshen_pressure'
    } else continue

    const { relationOriginFactId, originScope, inherited } = actual.structuralEffect
    const reactivationRefs: string[] = []
    if (path === 'yongshen_pressure' && supportedDamage && !inherited && originScope === snapshot.scope
      && relationOriginFactId !== id) {
      const block = parent?.actualFunctions.find(previous =>
        previous.structuralEffect?.relationOriginFactId === relationOriginFactId)?.structuralEffect?.blockedBy
      if (block?.kind === 'active_protection') {
        // Use the current effect and recorded cause of protection loss from Judgment.
        // The former protector's role assignment alone supplies no timing.
        reactivationRefs.push(...snapshot.combinationEffects.filter(effect => effect.currentlyEffective && !effect.expired
          && effect.originScopeId === snapshot.id && !effect.inherited && effect.effect === 'stopped'
          && effect.participants.includes(block.protectorId)).map(effect => effect.sourceRelationFactId))
        for (const loss of snapshot.policyRoles.byeong) {
          if (loss.damagedFunction !== 'officer_protection' || loss.currentState === 'inactive'
            || loss.targetEntityId !== block.protectorId || !loss.relationFactIds.includes(id)) continue
          reactivationRefs.push(...relations.filter(cause => cause.source.id === loss.sourceEntityId
            && cause.target.id === loss.targetEntityId && cause.action === loss.action
            && (cause.source.scope === snapshot.scope || cause.target.scope === snapshot.scope)
            && loss.relationFactIds.includes(cause.id)).map(cause => cause.id))
        }
      }
    }
    // An independently evaluated reopening can keep both original participants.
    if (scope !== 'natal' && source.scope !== snapshot.scope && target.scope !== snapshot.scope
      && !reactivationRefs.length
      && !linkedEffects.some(effect => effect.originScopeId === snapshot.id && !effect.inherited)) continue

    const reduced = actual.function === 'reduced' || damage.some(item => item.currentState === 'weakened')
      || conditional.some(item => item.currentFunction === 'reduced')
      || (attackRelationId !== undefined && functions.get(attackRelationId)?.function === 'reduced')
    const semanticType = scope === 'natal' ? 'structural_health_attention' : 'health_attention_period'
    const conditionId = 'health-condition:' + JSON.stringify([path, action, source.id, target.id])
    const affected = path === 'harmful_killing' ? undefined : stems[target.stem as DayStem]?.[0]
    const traditionalBodyAreas = affected && (scope !== 'month' || actual.direction === 'unfavorable')
      ? [...correspondence[affected]] : undefined
    const lifeMeanings: HealthLifeMeaning[] = [{ type: 'health_burden' }]
    if (scope !== 'natal') {
      lifeMeanings.push({ type: 'health_problem_prone_period' }, { type: 'health_management_period' })
    }
    const burdenAreas = actual.direction === 'unfavorable' ? traditionalBodyAreas : undefined
    if (burdenAreas) lifeMeanings.push({ type: 'body_area_burden', areas: burdenAreas })
    const attack = attackRelationId ? functions.get(attackRelationId) : undefined
    const evidence = [...reactivationRefs, ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? []),
      ...(attack?.conditionEvidence ?? []), ...(attack?.resolutionEvidence ?? []),
      ...damage.flatMap(item => item.evidenceRefs), ...conditional.map(item => item.supportingRelationFactId)]
    const outcomeId = 'health:' + JSON.stringify([semanticType, stableSourceId(snapshot.id, executionId, natalId), conditionId])
    if (attackRelationId) representedAttacks.add(attackRelationId)
    else if (path === 'harmful_killing') standaloneAttacks.set(outcomeId, id)
    facts.push({
      id: outcomeId,
      domain: 'health', semanticType, scope, scopeId: snapshot.id, conditionId, lifeMeanings,
      originRelationId: relationOriginFactId, originScope: originScope === 'dailyLuck' ? scope : scopes[originScope],
      path, targetEntityId: pressureTargetId, scopeHistory: [],
      ...(traditionalBodyAreas && { traditionalBodyAreas }),
      patternContextId: snapshot.patternContext.id, direction: actual.direction, axis: 'stem',
      currentFunction: reduced ? 'reduced' : 'operating',
      ...(scope === 'natal' ? {} : { period: snapshot.validity }),
      certainty: reduced || actual.direction !== 'unfavorable' ? 'contextual' : 'confirmed',
      lifecycle: reduced ? 'reduced' : 'active', temporalStatus,
      currentlyEffective: temporalStatus === 'baseline' || temporalStatus === 'current',
      sourceJudgmentIds: [snapshot.id],
      sourceRelationIds: unique([id, ...(attackRelationId ? [attackRelationId] : []), ...evidence.filter(ref => relationIds.has(ref) || ref === relationOriginFactId)]),
      sourceRoleIds: unique([...linkedRoles, ...sang, ...targetRoles.filter(role => yong && role.role === 'YongShen')].map(role => role.roleId)),
      sourceLuckEffectIds: unique(linkedEffects.map(({ event }) => event.id)),
      sourceParticipantIds: unique([source.id, target.id, pressureTargetId]),
      provenance: unique(['OUT-HEALTH-02', '⑲-A C–F', snapshot.patternContext.id, relationOriginFactId,
        ...(scope === 'natal' ? [] : ['B CH-7']),
        ...(burdenAreas ? ['A I-16', 'B W-35'] : []),
        ...(actual.ruleId ? [actual.ruleId] : []), ...evidence,
        ...actual.rootEvidence.flatMap(root => root.factIds), ...actual.formationEvidence]),
    })
  }
  // Feeding a killing and its linked attack describe one health burden. Keep
  // the feed's provenance and timing when the exact attack is already included.
  return facts.filter(fact => !representedAttacks.has(standaloneAttacks.get(fact.id) ?? ''))
}

export function buildHealthOutcome(input: {
  readonly canonical: Readonly<CalculatedChart>
  readonly natal: LuckScopeState
  readonly luck?: readonly EvaluatedHealthScope[]
}): readonly HealthOutcomeFact[] {
  const { canonical, natal, luck = [] } = input
  if (natal.scope !== 'natal') return []
  const executionId = executionIdFromScope(natal.id) ?? ''
  const baseline = traditional(canonical, natal)
  const snapshots = new Map([natal, ...luck.map(({ snapshot }) => snapshot)].map(snapshot => [snapshot.id, snapshot]))
  const facts = new Map<string, HealthOutcomeFact>()
  for (const fact of [...(baseline ? [baseline] : []), ...structural(natal, 'baseline', undefined, executionId, natal.id)]) facts.set(fact.id, fact)
  const evaluated: LuckScopeState[] = []
  const represented = new Set<string>()
  for (const { snapshot, evaluatedAt, parentSnapshot } of luck) {
    if (snapshot.scope === 'natal' || luckPeriodStatus(snapshot.validity, evaluatedAt) !== 'effective') continue
    const status = luckPeriodStatus(snapshot.validity, canonical.context.referenceTime)
    if (status === 'unknown' || snapshot.scope === 'dailyLuck' || snapshot.patternContext.scope !== snapshot.scope) continue
    const { from, to } = snapshot.validity
    if (from.kind !== 'exact' || to.kind !== 'exact') continue
    const periodKey = JSON.stringify([snapshot.scope, Date.parse(from.instant), Date.parse(to.instant)])
    if (represented.has(periodKey)) continue
    represented.add(periodKey)
    evaluated.push(snapshot)
    const parent = snapshot.parentScopeId === null ? undefined
      : parentSnapshot?.id === snapshot.parentScopeId ? parentSnapshot : snapshots.get(snapshot.parentScopeId)
    const snapshotExecutionId = executionIdFromScope(snapshot.id) ?? executionId
    const parentExecutionId = parent ? executionIdFromScope(parent.id) : undefined
    const identityExecutionId = snapshotExecutionId !== executionId && parentExecutionId === executionId
      ? executionId : snapshotExecutionId
    for (const fact of structural(snapshot, status === 'effective' ? 'current' : status, parent, identityExecutionId, natal.id)) {
      if (!facts.has(fact.id)) facts.set(fact.id, fact)
    }
  }
  const originScopes = new Map([natal, ...evaluated,
    ...luck.flatMap(({ snapshot, parentSnapshot }) => parentSnapshot && parentSnapshot.id === snapshot.parentScopeId
      ? [parentSnapshot] : []),
  ].flatMap(snapshot =>
    snapshot.actualFunctions.map(actual => [actual.relationFactId, snapshot] as const)))
  return [...facts.values()].map(fact => {
    if (fact.semanticType === 'traditional_body_correspondence') return fact
    const scopeHistory = evaluated.flatMap(snapshot => {
      if (snapshot.scope === 'natal' || snapshot.scope === 'dailyLuck' || snapshot.id === fact.scopeId) return []
      const witness = [...snapshot.actualFunctions, ...snapshot.inheritedRoleFunctions.map(({ actual }) => actual)]
        .find(actual => actual.structuralEffect?.relationOriginFactId === fact.originRelationId)
      if (!witness?.structuralEffect || Object.keys(scopes).indexOf(snapshot.scope)
        <= Object.values(scopes).indexOf(fact.scope)) return []
      const status = luckPeriodStatus(snapshot.validity, canonical.context.referenceTime)
      if (status === 'unknown') return []
      const adverse = witness.direction === 'unfavorable' || witness.direction === 'unfavorable_candidate'
      const effective = adverse && witness.structuralEffect.currentlyEffective
      const lifecycle = effective ? witness.function === 'reduced' ? 'reduced' : 'active'
        : witness.structuralEffect.blockedBy?.kind === 'stopped_participant' ? 'stopped' : 'inactive'
      return [{ scopeId: snapshot.id, scope: scopes[snapshot.scope], period: snapshot.validity,
        lifecycle, temporalStatus: status === 'effective' ? 'current' : status, currentlyEffective: status === 'effective' && effective,
        sourceRelationId: witness.relationFactId }] satisfies HealthScopeProjection[]
    }).sort((a, b) => a.scopeId < b.scopeId ? -1 : a.scopeId > b.scopeId ? 1 : 0)
    let origin = originScopes.get(fact.originRelationId)
    let originRelationId = fact.originRelationId
    if (!origin) {
      const coordinates = relationCoordinates(fact.originRelationId)
      if (coordinates) {
        const [action, sourceId, targetId] = coordinates
        const natalRelation = natal.stemFacts.find(relation => relation.action === action
          && relation.source.id === sourceId && relation.target.id === targetId)
        if (natalRelation) {
          origin = natal
          originRelationId = natalRelation.id
        }
      }
    }
    const rebased = { ...fact, originRelationId, scopeHistory,
      ...(origin && origin.scope !== 'dailyLuck' && { originScope: scopes[origin.scope], originScopeId: origin.id }) }
    return stableFactReferences(rebased, executionId, natal.id)
  }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}
