import { effectFactSchema, relationFactSchema, roleFunctionStateSchema, roleStateSchema, runtimeStateSchema, validitySchema } from '../contracts'
import type { EffectFact, EvidenceRecord, RoleFunctionState, RoleStateContract, RuntimeStateContract, Validity } from '../contracts'
import { producerPeriod, selectExecutionCandidates } from '../runtime/executionScopeContext'
import type { ExecutionScopeContext } from '../runtime/executionScopeContext'
import { containsTime, effectEvidence, sameValue } from '../runtime/guEungEffectEvidence'
import { detach, PROJECTION_EVIDENCE, recordId, RELATION_EVIDENCE, sortedUnique } from './shared'
import type { FactEntity, JudgmentProducerOutput } from './types'
import { generationCanReach } from '../core/structuralEffect'
import type { RootState } from '../core/types'
import type { LuckScopeState } from '../core/luckScope'
import type { ProducerReference } from './types'

/** Project the incoming daily applications from the existing Judgment snapshot. */
export function projectDailyEffectFacts(snapshot: LuckScopeState, executionId: string, referenceTime: string,
  producerRef: ProducerReference) {
  const period = snapshot.validity
  if (snapshot.scope !== 'dailyLuck' || snapshot.patternContext.scope !== 'dailyLuck' || snapshot.runtimeStatus !== 'resolved'
    || period.from.kind !== 'exact' || period.to.kind !== 'exact' || !containsTime(period, referenceTime)) return null
  const relations = snapshot.stemFacts.filter(({ source, target }) => source.scope === 'dailyLuck' || target.scope === 'dailyLuck')
  const byId = new Map(relations.map((relation) => [relation.id, relation]))
  const effects: FunctionEffects['effects'] = []
  for (const effect of snapshot.stemFunctionEffects) {
    const relation = byId.get(effect.relationFactId)
    if (!relation || effect.kind === 'weaken' && !effect.reducesFunction) continue
    const target = relation.source.id === effect.targetEntityId ? relation.source : relation.target
    const targetFunctionId = recordId('target-function', [target.id, 'ten-god', target.tenGod])
    const runtimeStateRefs = [relation.source.id, relation.target.id].map((id) => recordId('daily-runtime-state', [snapshot.id, id]))
    effects.push(effectFactSchema.parse({ contractVersion: '1',
      effectId: recordId('effect', [snapshot.id, relation.id, targetFunctionId, effect.kind]), scopeId: snapshot.id,
      sourceEntityId: effect.sourceEntityId, targetEntityId: target.id, targetFunctionId, relationFactId: relation.id,
      effectType: effect.kind, ...(effect.kind === 'drain' ? { reducesFunction: effect.reducesFunction } : {}),
      runtimeStateRefs, roleStateRefs: [], ruleIds: ['OP-L01', 'OP-L02', 'OP-P06'], evidenceIds: [RELATION_EVIDENCE],
      provenance: { producerRef: { ...producerRef, producerId: 'filune-judgment-core', sourceRef: 'effectFactProducer/projectDailyEffectFacts',
        inputFactIds: [snapshot.id, relation.id, ...runtimeStateRefs, ...(effect.sourceRoot?.factIds ?? []),
          ...(effect.sourceRoot?.formationIds ?? [])] }, ruleRevision: 181 },
      coverage: 'complete', effectivePeriod: period, reasonCodes: [], status: 'confirmed',
    }))
  }
  const referencedStates = new Set(effects.flatMap(({ runtimeStateRefs }) => runtimeStateRefs))
  const runtimeStates = snapshot.runtime.flatMap(({ entityId, state }) => {
    const stateId = recordId('daily-runtime-state', [snapshot.id, entityId])
    if (!referencedStates.has(stateId) || state === 'stopped') return []
    const ruleId = state === 'weakened' ? 'EX-053' : 'OP-L02'
    return [runtimeStateSchema.parse({ contractVersion: '1', stateId, targetEntityId: entityId, scopeId: snapshot.id,
      functionalState: state, originMode: 'local', transition: 'established', validity: period,
      causingApplicationRefs: [{ applicationId: recordId('daily-state-application', [snapshot.id, entityId]),
        executionId, scopeId: snapshot.id, ruleId, ruleVersion: 'A181' }], evidenceIds: [RELATION_EVIDENCE], uncertaintyIds: [],
      ...(state === 'weakened' ? { weakeningDescription: { ruleId, wording: 'Luck combination weakens the existing stem function' } } : {}),
    })]
  })
  return { effects, diagnostics: [], runtimeStates, relationRefs: [...new Set(effects.map(({ relationFactId }) => relationFactId))] }
}

export type TargetFunction = {
  targetEntityId: string
  kind: 'ten-god' | 'yongshen' | 'sangshen'
  name: string
  scopeId: string
  effectivePeriod: Validity
  ownershipFactRef?: string
  roleStateRef?: string
  /** Required for a structural role to operate in a scope other than its assignment scope. */
  preRoleFunction?: RoleFunctionState
  currentRole?: { status: 'active' | 'inactive' | 'unknown'; evidenceIds: string[] }
}

export type ValidatedRoleAssignment = {
  roleStateRef: string
  entityId: string
  role: '용신' | '상신'
  scopeId: string
  executionId: string
  judgmentId: string
  producerRef: JudgmentProducerOutput['producerRef']
  evidenceIds: string[]
}

type Input = {
  producer: JudgmentProducerOutput
  context: ExecutionScopeContext
  states: RuntimeStateContract[]
  roles: RoleStateContract[]
  /** Exact handoff from the confirmed upstream role judgment that issued each RoleState. */
  validatedRoleAssignments?: ValidatedRoleAssignment[]
  natalScopeId?: string
  /** Prior luck stops retained by the validated carry evaluator for this scope. */
  priorLuckStops?: { scopeId: string; states: RuntimeStateContract[] }
  functions: TargetFunction[]
  evidence: EvidenceRecord[]
  rootStates?: readonly { entityId: string; state: RootState; factIds: readonly string[]; formationIds: readonly string[] }[]
  /** The scoped, post-combination priority assessment. Absence means it was not resolved. */
  priority?: { scopeId: string; status: 'clear' | 'blocked'; evidenceIds: string[] }
}

export type FunctionEffectDiagnostic = {
  relationFactId: string
  sourceEntityId: string
  targetEntityId: string
  targetFunctionId: string
  functionKind: TargetFunction['kind']
  functionName: string
  relation: 'confirmed' | 'unknown'
  sourceState: RuntimeStateContract['functionalState'] | 'unavailable'
  targetState: RuntimeStateContract['functionalState'] | 'unavailable'
  functionOwnership: 'confirmed' | 'unknown'
  functionActive: 'active' | 'inactive' | 'unknown'
  reach: 'confirmed' | 'blocked' | 'unknown'
  status: 'confirmed' | 'deferred' | 'blocked'
  reasonCodes: string[]
}

export type FunctionEffects = { effects: EffectFact[]; diagnostics: FunctionEffectDiagnostic[] }

function intersect(periods: Validity[]): Validity | undefined {
  const starts = periods.map(({ from }) => from.kind === 'exact' ? from.instant : from.kind === 'range' ? from.latest : null)
  const ends = periods.map(({ to }) => to.kind === 'exact' ? to.instant : to.kind === 'range' ? to.earliest : null)
  if (starts.includes(null) || ends.includes(null)) return
  const from = starts.sort().at(-1)!
  const to = ends.sort()[0]!
  if (from >= to) return
  return { periodId: recordId('effect-period', [from, to]), from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } }
}

export function stemTenGodPointer(entity: FactEntity, pillarPointer?: string): string | undefined {
  return entity.origin === 'natal' ? `/chart/basicRelations/${entity.position}/value/stemTenGod`
    : pillarPointer?.replace(/\/pillar$/, '/stemTenGod')
}

/** Applies OP-P06 to evaluated inputs; the observation graph alone cannot issue an effect. */
export function produceEffectFacts(input: Input): FunctionEffects {
  const { context, producer, priority } = input
  const { relations } = selectExecutionCandidates(producer, context)
  const basis = effectEvidence(input.evidence)
  const supplied = new Map(producer.evidence.records.map((item) => [item.evidenceId, item]))
  // These receipts establish reproducibility of canonical observations, independent of birth-data verification.
  const computational = new Set([PROJECTION_EVIDENCE, RELATION_EVIDENCE].filter((ref) =>
    supplied.has(ref) && sameValue(supplied.get(ref), basis.byId.get(ref))))
  const eligible = (ref: string) => computational.has(ref) || basis.eligible(ref)
  const supported = (refs: string[]) => refs.length > 0 && refs.every(eligible)
  const legacyRuleRef = 'producer-evidence:source-A179'
  const legacyRuleRegistered = supplied.has(legacyRuleRef) && sameValue(supplied.get(legacyRuleRef), basis.byId.get(legacyRuleRef))
  const supportedState = (state: RuntimeStateContract) =>
    supported(state.evidenceIds.filter((ref) => ref !== legacyRuleRef))
    && state.evidenceIds.every((ref) => eligible(ref) || (ref === legacyRuleRef && legacyRuleRegistered))
  const entities = new Map(producer.entities.map((entity) => [entity.entityId, entity]))
  const facts = new Map(producer.facts.map((fact) => [fact.id, fact]))
  const natalPillars = ['year', 'month', 'day', 'time'].map((position) => {
    const fact = facts.get(`canonical:/chart/pillars/${position}/value/ganZhi`)
    return fact?.assessment === 'confirmed' && !fact.uncertaintyIds.length && typeof fact.value === 'string'
      ? fact.value : null
  })
  const roleBasis = effectEvidence(input.evidence, natalPillars.every((item) => item !== null) ? natalPillars.join(' ') : undefined)
  const roles = new Map<string, RoleStateContract>()
  for (const raw of input.roles) {
    const role = roleStateSchema.parse(raw)
    const previous = roles.get(role.roleStateId)
    if (previous && !sameValue(previous, role)) throw new TypeError('Conflicting effect role state')
    roles.set(role.roleStateId, role)
  }
  const validatedAssignments = new Map<string, ValidatedRoleAssignment>()
  for (const assignment of input.validatedRoleAssignments ?? []) {
    const prior = validatedAssignments.get(assignment.roleStateRef)
    if (prior && !sameValue(prior, assignment)) throw new TypeError('Conflicting validated role assignment')
    validatedAssignments.set(assignment.roleStateRef, assignment)
  }
  const states = new Map<string, RuntimeStateContract[]>()
  function addState(state: RuntimeStateContract) {
    const candidates = states.get(state.targetEntityId) ?? []
    if (!candidates.some((item) => item.stateId === state.stateId && JSON.stringify(item) === JSON.stringify(state))) candidates.push(state)
    states.set(state.targetEntityId, candidates)
  }
  for (const raw of input.states) {
    const state = runtimeStateSchema.parse(raw)
    if (state.scopeId === context.scopeId
      && state.causingApplicationRefs.every((app) => app.executionId === context.executionId)) addState(state)
  }
  if (input.priorLuckStops?.scopeId === context.scopeId) {
    for (const raw of input.priorLuckStops.states) {
      const state = runtimeStateSchema.parse(raw)
      const actor = entities.get(state.targetEntityId)
      if (state.scopeId !== context.scopeId && state.functionalState === 'stopped'
        && actor && actor.origin !== 'natal' && context.includedEntityIds.includes(actor.entityId)
        && state.causingApplicationRefs.some((app) => app.ruleId === 'OP-T07'
          && app.scopeId === state.scopeId && app.executionId === context.executionId)) addState(state)
    }
  }
  function currentState(entityId: string) {
    const candidates = states.get(entityId)?.filter((state) => containsTime(state.validity, context.referenceTime)) ?? []
    const state = candidates.length === 1 ? candidates[0] : undefined
    return state && (state.functionalState === 'unknown' || !state.uncertaintyIds.length) && supportedState(state) ? state : undefined
  }
  const functions = new Map<string, Map<string, TargetFunction>>()
  for (const raw of input.functions) {
    if (raw.scopeId !== context.scopeId || !context.includedEntityIds.includes(raw.targetEntityId)) {
      throw new TypeError('Effect function scope mismatch')
    }
    if (raw.preRoleFunction && (roleFunctionStateSchema.parse(raw.preRoleFunction).phase !== 'pre-effect'
      || raw.preRoleFunction.scopeId !== context.scopeId || raw.preRoleFunction.entityId !== raw.targetEntityId
      || raw.preRoleFunction.roleStateRef !== raw.roleStateRef || raw.preRoleFunction.functionType !== raw.kind)) {
      throw new TypeError('Effect requires a matching pre-effect role function snapshot')
    }
    const fn = { ...raw, effectivePeriod: validitySchema.parse(raw.effectivePeriod) }
    const functionId = recordId('target-function', [fn.targetEntityId, fn.kind, fn.name,
      ...(fn.preRoleFunction?.actionId ? [fn.preRoleFunction.actionId] : [])])
    const entries = functions.get(fn.targetEntityId) ?? new Map()
    const previous = entries.get(functionId)
    if (previous && !sameValue(previous, fn)) throw new TypeError('Conflicting target function inputs')
    entries.set(functionId, fn)
    functions.set(fn.targetEntityId, entries)
  }
  const effects: EffectFact[] = []
  const diagnostics: FunctionEffectDiagnostic[] = []
  const seen = new Set<string>()
  for (const candidate of relations) {
    if (candidate.kind !== 'stem-controls' && candidate.kind !== 'stem-generates') continue
    const relation = relationFactSchema.parse(candidate)
    const source = entities.get(relation.sourceEntityId!)
    const target = entities.get(relation.targetEntityId!)
    if (source?.part !== 'stem' || target?.part !== 'stem') continue
    // Only the newly evaluated scope participates in a new application (IR-01).
    if (source.sourceScope !== context.stage && target.sourceScope !== context.stage) continue
    const relationConfirmed = relation.existence === 'present' && relation.assessment === 'confirmed'
      && !relation.uncertaintyIds.length && source.assessment === 'confirmed' && target.assessment === 'confirmed'
      && supported(relation.evidenceIds)
    const sourceState = currentState(source.entityId)
    const targetState = currentState(target.entityId)
    const sourceRoot = input.rootStates?.find(({ entityId }) => entityId === source.entityId)
    const affected = candidate.kind === 'stem-controls'
      ? [{ entity: target, effectType: 'weaken' as const }]
      : [{ entity: target, effectType: 'strengthen' as const }, { entity: source, effectType: 'drain' as const }]
    for (const { entity: functionEntity, effectType } of affected) for (const [targetFunctionId, fn] of functions.get(functionEntity.entityId) ?? []) {
      // Source 설기 changes a structural role function only when that source role is owned and active.
      if (effectType === 'drain' && fn.kind === 'ten-god') continue
      const role = fn.roleStateRef ? roles.get(fn.roleStateRef) : undefined
      const tenGod = fn.ownershipFactRef ? facts.get(fn.ownershipFactRef) : undefined
      const functionState = functionEntity.entityId === source.entityId ? sourceState : targetState
      const pillar = facts.get(functionEntity.canonicalFactRef)
      const tenGodPointer = stemTenGodPointer(functionEntity, pillar?.canonicalPointer)
      const expectedRole = fn.kind === 'yongshen' ? '용신' : '상신'
      const assignment = fn.roleStateRef ? validatedAssignments.get(fn.roleStateRef) : undefined
      const upstreamRoleConfirmed = !!assignment && !!role && assignment.entityId === functionEntity.entityId
        && assignment.role === expectedRole && assignment.scopeId === role.validScopeId
        && assignment.executionId === context.executionId && assignment.evidenceIds.length > 0
        && !!assignment.judgmentId && sameValue(assignment.producerRef, producer.producerRef)
        && sameValue(sortedUnique(assignment.evidenceIds), sortedUnique(role.evidenceIds))
      const roleOwned = fn.kind !== 'ten-god' && fn.name === expectedRole && role?.subjectKind === 'entity' && role.entityId === functionEntity.entityId
        && role.role === expectedRole && role.status === 'evaluated'
        && role.usage === 'runtime-result' && !role.provisional && !role.uncertaintyIds.length && role.evidenceIds.length > 0
        && (upstreamRoleConfirmed || role.evidenceIds.every((ref) => roleBasis.eligible(ref)))
        && role.applicationRef?.executionId === context.executionId
        && (role.validScopeId === context.scopeId || (functionEntity.origin === 'natal' && role.validScopeId === input.natalScopeId))
      const ownership = fn.kind === 'ten-god'
        ? !!tenGod && tenGod.canonicalPointer === tenGodPointer && tenGod.value === fn.name
          && tenGod.assessment === 'confirmed' && !tenGod.uncertaintyIds.length && supported(tenGod.evidenceIds)
        : !!roleOwned
      const priorityKnown = priority?.scopeId === context.scopeId && supported(priority.evidenceIds)
      const currentRoleVerified = !!fn.currentRole?.evidenceIds.length
        && fn.currentRole.evidenceIds.every((ref) => basis.eligible(ref))
      const pre = fn.preRoleFunction
      const usablePre = pre?.functionId === targetFunctionId && containsTime(pre.effectivePeriod, context.referenceTime)
        && (pre.evidenceIds.every((id) => eligible(id) || roleBasis.eligible(id) || supplied.has(id) && sameValue(supplied.get(id), basis.byId.get(id)))
          || upstreamRoleConfirmed && pre.status !== 'deferred')
      const roleActivity = fn.kind === 'yongshen' && upstreamRoleConfirmed && functionState?.functionalState !== 'stopped'
        ? 'active'
        : pre ? !usablePre || pre.status === 'deferred' ? 'unknown'
        : pre.status === 'stopped' ? 'inactive' : 'active'
        : fn.currentRole ? (currentRoleVerified ? fn.currentRole.status : 'unknown')
        : role?.validScopeId === context.scopeId ? 'active' : 'unknown'
      const functionActive = functionState?.functionalState === 'stopped' || (ownership && fn.kind !== 'ten-god' && roleActivity === 'inactive')
        ? 'inactive' : ownership && !!functionState && functionState.functionalState !== 'unknown'
          && (fn.kind === 'ten-god' || roleActivity === 'active') && containsTime(fn.effectivePeriod, context.referenceTime)
          ? 'active' : 'unknown'
      const periods = [context.effectivePeriod, fn.effectivePeriod, ...(usablePre ? [pre.effectivePeriod] : []), ...[sourceState, targetState].flatMap((state) => state ? [state.validity] : []),
        ...[source, target].flatMap((entity) => entity.periodRef ? [producerPeriod(producer, entity.periodRef)] : [])]
      const period = intersect(periods)
      const reasons: string[] = []
      if (!relationConfirmed) reasons.push('RELATION_UNCONFIRMED')
      if (!sourceState || sourceState.functionalState === 'unknown') reasons.push('SOURCE_STATE_UNCONFIRMED')
      if (!targetState || targetState.functionalState === 'unknown') reasons.push('TARGET_STATE_UNCONFIRMED')
      if (!ownership) reasons.push('FUNCTION_OWNERSHIP_UNCONFIRMED')
      if (functionActive === 'unknown') reasons.push(usablePre && pre.reasonCodes.includes('ROLE_ACTION_UNSPECIFIED')
        ? 'ROLE_ACTION_UNSPECIFIED' : 'FUNCTION_ACTIVITY_UNCONFIRMED')
      if (!period || !containsTime(period, context.referenceTime)) reasons.push('EFFECT_PERIOD_UNCONFIRMED')
      if (!priorityKnown) reasons.push('REACH_PRIORITY_UNRESOLVED')
      if (sourceState?.functionalState === 'stopped') reasons.push('SOURCE_STOPPED')
      if (targetState?.functionalState === 'stopped') reasons.push('TARGET_STOPPED')
      if (functionActive === 'inactive' && functionState?.functionalState !== 'stopped') reasons.push('FUNCTION_INACTIVE')
      if (effectType === 'drain' && !usablePre) reasons.push('SOURCE_DRAIN_NOT_ESTABLISHED')
      if (candidate.kind === 'stem-generates' && sourceState?.functionalState === 'weakened'
        && !generationCanReach('weakened', 'active', sourceRoot?.state)) reasons.push('GENERATION_REACH_UNCONFIRMED')
      if (priorityKnown && priority.status === 'blocked') reasons.push('REACH_BLOCKED_BY_PRIORITY')
      const blocked = reasons.some((reason) => ['SOURCE_STOPPED', 'TARGET_STOPPED', 'FUNCTION_INACTIVE', 'REACH_BLOCKED_BY_PRIORITY'].includes(reason))
      const status = blocked ? 'blocked' : reasons.length ? 'deferred' : 'confirmed'
      const effectivePeriod = period && containsTime(period, context.referenceTime) ? period : context.effectivePeriod
      const effectId = recordId('effect', [context.scopeId, relation.relationFactId, targetFunctionId, effectType,
        JSON.stringify(effectivePeriod.from), JSON.stringify(effectivePeriod.to)])
      if (seen.has(effectId)) continue
      seen.add(effectId)
      diagnostics.push({ relationFactId: relation.relationFactId, sourceEntityId: source.entityId, targetEntityId: target.entityId,
        targetFunctionId, functionKind: fn.kind, functionName: fn.name, relation: relationConfirmed ? 'confirmed' : 'unknown',
        sourceState: sourceState?.functionalState ?? 'unavailable', targetState: targetState?.functionalState ?? 'unavailable',
        functionOwnership: ownership ? 'confirmed' : 'unknown', functionActive,
        reach: status === 'confirmed' ? 'confirmed' : blocked ? 'blocked' : 'unknown', status, reasonCodes: reasons })
      if (blocked) continue
      const runtimeStateRefs = [sourceState, targetState].flatMap((state) => state ? [state.stateId] : [])
      const roleStateRefs = roleOwned ? [role.roleStateId] : []
      const evidenceIds = sortedUnique([...(relationConfirmed ? relation.evidenceIds : []),
        ...(sourceState?.evidenceIds ?? []), ...(targetState?.evidenceIds ?? []),
        ...(ownership ? (fn.kind === 'ten-god' ? tenGod!.evidenceIds : role!.evidenceIds) : []),
        ...(priorityKnown ? priority.evidenceIds : []), ...(usablePre ? pre.evidenceIds : []), ...(fn.currentRole?.evidenceIds.filter((ref) => eligible(ref)) ?? [])])
      effects.push(effectFactSchema.parse({ contractVersion: '1', effectId, scopeId: context.scopeId,
        sourceEntityId: source.entityId, targetEntityId: functionEntity.entityId, targetFunctionId, relationFactId: relation.relationFactId,
        effectType, ...(effectType === 'drain' ? { reducesFunction: sourceRoot?.state === 'weakened' } : {}),
        runtimeStateRefs, roleStateRefs, ruleIds: ['OP-L01', 'OP-L02', 'OP-P06'], evidenceIds,
        provenance: { producerRef: { producerId: 'filune-function-effects', version: '1', sourceRef: 'effectFactProducer',
          inputFactIds: sortedUnique([relation.relationFactId, ...runtimeStateRefs, ...roleStateRefs,
            ...(candidate.kind === 'stem-generates' && sourceRoot ? [...sourceRoot.factIds, ...sourceRoot.formationIds] : []),
            ...(usablePre ? [pre.roleFunctionStateId] : []), ...(ownership && tenGod ? [tenGod.id] : [])]) },
          ruleRevision: 181 },
        coverage: status === 'confirmed' ? 'complete' : 'partial', effectivePeriod, reasonCodes: reasons, status }))
    }
  }
  return detach({ effects, diagnostics })
}
