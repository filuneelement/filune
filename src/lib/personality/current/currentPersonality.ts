import { canonicalIds, compareId } from '../facts/personalityFacts'
import { collectRoleConflicts } from '../modifiers/structuralRoleModifier'
import { TEN_GOD_TO_PERSONALITY_ID, type NatalPersonalityResult, type PersonalityConflict, type PersonalityFact } from '../types'
import { createLuckExpressions, natalMode } from './luckPersonalityFacts'
import { projectRoleModifiers, relatedRoleEffects, ROLE_EFFECT_TYPES } from './currentRoleModifiers'
import type {
  CurrentPersonalityFact, CurrentPersonalityOrigin, CurrentPersonalityResult, PersonalityEffectHistory, PersonalityPeriod,
  PersonalityScope, PersonalityScopeExpression, PersonalityStructuralEffect, PersonalityStructuralScope,
} from './types'

const SCOPE_ORDER: PersonalityScope[] = ['natal', 'daewoon', 'sewoon', 'month', 'day']
const TEN_GOD_ORDER = Object.values(TEN_GOD_TO_PERSONALITY_ID)
const MODE_ORDER = ['outward', 'inner']
const CONFLICT_RULE = 'src/docs/rules/master/11-personality-master.md#L410-L422'
const periodStatus = (period: PersonalityPeriod | undefined, time: number) => {
  if (!period) return 'unknown'
  const start = Date.parse(period.start)
  const end = Date.parse(period.end)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return 'unknown'
  return time < start ? 'future' : time >= end ? 'expired' : 'effective'
}

function selectScopeChain(scopes: readonly PersonalityStructuralScope[], requested: PersonalityScope, time: number) {
  const natal = scopes.filter(scope => scope.scope === 'natal' && scope.currentlyEffective)
  if (natal.length !== 1 || natal[0].parentScopeId !== null) throw new TypeError('Expected one effective natal root.')
  if (new Set(scopes.map(scope => scope.id)).size !== scopes.length) throw new TypeError('Duplicate Personality scope ID.')
  const chain = [natal[0]]
  for (const scope of SCOPE_ORDER.slice(1, SCOPE_ORDER.indexOf(requested) + 1)) {
    const parent = chain[chain.length - 1]
    const candidates = scopes.filter(item => item.scope === scope && item.parentScopeId === parent.id
      && item.currentlyEffective && periodStatus(item.period, time) === 'effective')
    if (candidates.length > 1) throw new TypeError(`Ambiguous effective Personality scope: ${scope}`)
    if (candidates.length === 1) chain.push(candidates[0])
  }
  return chain
}

function currentConflicts(
  facts: readonly PersonalityFact[], mode: ReadonlyMap<string, 'outward' | 'inner'>,
  origins: ReadonlyMap<string, CurrentPersonalityOrigin[]>, temporaryIds: ReadonlySet<string>, time: number,
) {
  const outward = facts.filter(fact => mode.get(fact.id) === 'outward' && fact.tenGod === '傷官'
    && fact.traitType === 'social' && fact.trait === '예리한 표현')
  const inner = facts.filter(fact => mode.get(fact.id) === 'inner' && (fact.tenGod === '正印' || fact.tenGod === '偏印')
    && fact.traitType === 'decision' && fact.sourcePosition !== 'year_branch')
  const conflicts: PersonalityConflict[] = []
  const events: PersonalityEffectHistory[] = []
  for (const outer of outward) for (const internal of inner) {
    // Use the first effective support for each temporary fact. A descendant
    // repeating an inherited fact does not start a new conflict occurrence.
    const participants = [outer, internal].filter(fact => temporaryIds.has(fact.id))
    const supportingOrigins = participants.flatMap(fact => {
      const origin = origins.get(fact.id)?.find(item => periodStatus(item.originPeriod, time) === 'effective')
      return origin ? [origin] : []
    })
    if (!supportingOrigins.length || supportingOrigins.length !== participants.length) continue
    supportingOrigins.sort((a, b) => SCOPE_ORDER.indexOf(b.originScope) - SCOPE_ORDER.indexOf(a.originScope))
    const activation = supportingOrigins[0]
    const period = { ...activation.originPeriod }
    for (const { originPeriod } of supportingOrigins) {
      if (Date.parse(originPeriod.start) > Date.parse(period.start)) period.start = originPeriod.start
      if (Date.parse(originPeriod.end) < Date.parse(period.end)) period.end = originPeriod.end
    }
    if (periodStatus(period, time) !== 'effective') continue
    const factIds = canonicalIds([outer.id, internal.id])
    const id = `conflict:current:${JSON.stringify(factIds)}`
    const sourceIds = canonicalIds(supportingOrigins.map(origin => origin.originEffectId))
    conflicts.push({
      id, factIds, conflictType: participants.length === 2 ? 'temporary_expression_tension' : 'natal_vs_current',
      resolution: 'context_split', explanationEvidence: canonicalIds([CONFLICT_RULE, ...outer.provenanceIds, ...internal.provenanceIds]),
    })
    events.push({
      id: `effect:personality:${JSON.stringify([id, sourceIds])}`, type: 'conflict_activation',
      originScope: activation.originScope, originScopeId: activation.originScopeId, originPeriod: period,
      currentlyEffective: true, expired: false, inherited: activation.inherited,
      sourceIds, factIds,
    })
  }
  return { conflicts: conflicts.sort((a, b) => compareId(a.id, b.id)), events }
}

function mergeHistory(
  previous: readonly PersonalityEffectHistory[], current: readonly PersonalityEffectHistory[], time: number,
) {
  const history = new Map(previous.map(item => [item.id, {
    ...item, currentlyEffective: false, inherited: false, expired: item.expired || periodStatus(item.originPeriod, time) === 'expired',
  }]))
  for (const item of current) {
    const old = history.get(item.id)
    history.set(item.id, old ? {
      ...item, factIds: canonicalIds([...old.factIds, ...item.factIds]),
      sourceIds: canonicalIds([...old.sourceIds, ...item.sourceIds]),
    } : item)
  }
  return [...history.values()].sort((a, b) => SCOPE_ORDER.indexOf(a.originScope) - SCOPE_ORDER.indexOf(b.originScope)
    || compareId(a.originPeriod?.start ?? '', b.originPeriod?.start ?? '') || compareId(a.id, b.id))
}

function effectiveEffects(scope: PersonalityStructuralScope, time: number): PersonalityStructuralEffect[] {
  return scope.effects.filter(effect => effect.currentlyEffective && !effect.expired
    && periodStatus(effect.originPeriod, time) === 'effective')
}

export function buildCurrentPersonality(input: {
  natalPersonality: NatalPersonalityResult
  structuralScopes: readonly PersonalityStructuralScope[]
  evaluationScope: PersonalityScope
  referenceTime: string
  previousEffectHistory?: readonly PersonalityEffectHistory[]
}): CurrentPersonalityResult {
  const natal = input.natalPersonality
  const time = Date.parse(input.referenceTime)
  if (!Number.isFinite(time)) throw new TypeError('Expected the Judgment evaluation time.')
  const chain = selectScopeChain(input.structuralScopes, input.evaluationScope, time)
  const selected = chain[chain.length - 1]
  const expressions = createLuckExpressions(natal.facts, chain)
  const effects = effectiveEffects(selected, time)
  const roleModifiers = projectRoleModifiers(natal.structuralRoleModifiers, selected, effects)
  const roleConflicts = collectRoleConflicts(roleModifiers)
  const roleEffectLinks = new Map(roleModifiers.map(role => [role.id, relatedRoleEffects(role, effects)]))
  // The first origin is the earliest scope in the confirmed chain, independent of input array order.
  const firstScope = (id: string) => SCOPE_ORDER.indexOf(expressions.origins.get(id)?.[0].originScope ?? 'natal')
  const temporaryFacts = [...expressions.temporary.values()].sort((a, b) => firstScope(a.id) - firstScope(b.id)
    || MODE_ORDER.indexOf(expressions.modes.get(a.id) ?? '') - MODE_ORDER.indexOf(expressions.modes.get(b.id) ?? '')
    || (a.tenGod ? TEN_GOD_ORDER.indexOf(a.tenGod) : -1) - (b.tenGod ? TEN_GOD_ORDER.indexOf(b.tenGod) : -1)
    || compareId(a.id, b.id))
  const allFacts = [...natal.facts, ...temporaryFacts]
  const temporaryIds = new Set(temporaryFacts.map(fact => fact.id))
  const factModes = new Map<string, 'outward' | 'inner'>()
  for (const fact of allFacts) {
    const mode = natalMode(fact)
    if (mode) factModes.set(fact.id, mode)
  }
  for (const [id, mode] of expressions.modes) factModes.set(id, mode)

  const conflicts = currentConflicts(allFacts, factModes, expressions.origins, temporaryIds, time)
  const currentFacts: CurrentPersonalityFact[] = allFacts.map(fact => {
    const temporary = temporaryIds.has(fact.id)
    const origins = expressions.origins.get(fact.id) ?? []
    const structural = roleModifiers.filter(role => role.targetPersonalityFactIds.includes(fact.id))
      .flatMap(role => roleEffectLinks.get(role.id) ?? [])
    const manifestations = effects.filter(effect => effect.effectType === 'manifests_yongshen'
      && origins.some(origin => origin.originScope === effect.originScope
        && origin.originPeriod.start === effect.originPeriod?.start && origin.originPeriod.end === effect.originPeriod.end
        && origin.sourceLuckFactIds.includes(effect.sourceEntityId)))
    return {
      personalityFactId: fact.id, origin: temporary ? 'luck' : 'natal',
      originScope: temporary ? origins[0].originScope : 'natal',
      expressionMode: factModes.get(fact.id),
      state: temporary ? 'contextual' : 'baseline', currentlyEffective: true, origins,
      sourceStructuralEffectIds: canonicalIds([...structural, ...manifestations].map(effect => effect.id)),
    }
  })

  const nativeEffectReports = new Map<string, PersonalityEffectHistory>()
  for (const scope of [...input.structuralScopes].sort((a, b) => compareId(a.id, b.id))) {
    for (const effect of scope.effects) {
      const active = scope.id === selected.id && effects.includes(effect)
      const previous = nativeEffectReports.get(effect.id)
      if (previous && scope.id !== selected.id) continue
      nativeEffectReports.set(effect.id, {
        id: effect.id, type: ROLE_EFFECT_TYPES.has(effect.effectType) ? 'role_modifier_change' : 'structural_context',
        structuralEffectType: effect.effectType,
        originScope: effect.originScope, ...(effect.originScopeId && { originScopeId: effect.originScopeId }),
        ...(effect.originPeriod && { originPeriod: { ...effect.originPeriod } }),
        currentlyEffective: active, expired: effect.expired || periodStatus(effect.originPeriod, time) === 'expired',
        inherited: active && (effect.originScope !== selected.scope || effect.originPeriod?.periodId !== selected.period?.periodId),
        sourceIds: canonicalIds([effect.id, effect.sourceEntityId, effect.subjectId, ...effect.sourceIds]),
        factIds: currentFacts.filter(fact => fact.sourceStructuralEffectIds.includes(effect.id)).map(fact => fact.personalityFactId),
      })
    }
  }

  const expiredScopes = input.structuralScopes.filter(scope => scope.scope !== 'natal'
    && scope.occurrences.length && periodStatus(scope.period, time) === 'expired')
  const expiredTemporary = createLuckExpressions(natal.facts, expiredScopes).events.map(event => ({
    ...event, currentlyEffective: false, expired: true, inherited: false,
  }))
  const effectHistory = mergeHistory(input.previousEffectHistory ?? [], [
    ...expiredTemporary, ...expressions.events, ...nativeEffectReports.values(), ...conflicts.events,
  ], time)
  const natalRoleConflicts = new Set(natal.roleConflicts.map(conflict => conflict.id))
  const baseConflicts = natal.conflicts.filter(conflict => !natalRoleConflicts.has(conflict.id))
  const scopeExpressions: PersonalityScopeExpression[] = []
  for (const scope of [...input.structuralScopes].sort((a, b) => SCOPE_ORDER.indexOf(a.scope) - SCOPE_ORDER.indexOf(b.scope)
    || compareId(a.period?.start ?? '', b.period?.start ?? '') || compareId(a.id, b.id))) {
    const index = chain.indexOf(scope)
    const effective = index !== -1
    const previousIds = new Set(chain.slice(0, Math.max(index, 0)).map(parent => parent.id))
    const direct = expressions.events.filter(event => event.originScopeId === scope.id)
    const inherited = expressions.events.filter(event => event.originScopeId && previousIds.has(event.originScopeId))
    const localEffects = effective ? effectiveEffects(scope, time) : []
    const localRoles = effective ? projectRoleModifiers(natal.structuralRoleModifiers, scope, localEffects) : []
    const localFactIds = new Set([...natal.facts.map(fact => fact.id), ...direct.flatMap(event => event.factIds), ...inherited.flatMap(event => event.factIds)])
    scopeExpressions.push({
      scope: scope.scope, scopeId: scope.id, ...(scope.period && { period: { ...scope.period } }),
      inheritedFactIds: effective && scope.scope !== 'natal'
        ? canonicalIds([...natal.facts.map(fact => fact.id), ...inherited.flatMap(event => event.factIds)]) : [],
      temporaryFactIds: effective ? canonicalIds(direct.flatMap(event => event.factIds)) : [],
      roleModifierIds: localRoles.map(role => role.id),
      roleModifierStates: localRoles.map(role => ({
        modifierId: role.id, status: role.status, currentFunction: role.currentFunction,
        sourceStructuralEffectIds: canonicalIds(relatedRoleEffects(role, localEffects).map(effect => effect.id)),
      })),
      conflictIds: effective ? [
        ...baseConflicts, ...collectRoleConflicts(localRoles),
        ...conflicts.conflicts.filter(conflict => conflict.factIds.every(id => localFactIds.has(id))),
      ].map(conflict => conflict.id) : [],
      inheritedEffectIds: effective ? canonicalIds([
        ...inherited.map(event => event.id),
        ...conflicts.events.filter(event => event.originScopeId && previousIds.has(event.originScopeId)).map(event => event.id),
        ...effectiveEffects(scope, time).filter(effect => effect.originScope !== scope.scope).map(effect => effect.id),
      ]) : [],
      currentlyEffective: effective,
    })
  }

  const provenanceById = new Map(natal.provenance.map(item => [item.id, item]))
  for (const item of expressions.provenance) if (!provenanceById.has(item.id)) provenanceById.set(item.id, item)
  const provenance = [...provenanceById.values()].sort((a, b) => compareId(a.id, b.id))
  return {
    natal, requestedScope: input.evaluationScope, evaluationScope: selected.scope, evaluationScopeId: selected.id,
    scopeExpressions, currentFacts, temporaryFacts, structuralRoleModifiers: roleModifiers,
    conflicts: [...baseConflicts, ...roleConflicts, ...conflicts.conflicts],
    effectHistory, provenance, provenanceIds: canonicalIds([...provenanceById.keys(), ...effects.map(effect => effect.id),
      ...expressions.events.map(event => event.id), ...roleModifiers.flatMap(role => role.provenanceIds)]),
  }
}
