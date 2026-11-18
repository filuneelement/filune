import { effectFactSchema, relationFactSchema, roleFunctionStateSchema, roleStateSchema, runtimeStateSchema, validitySchema } from '../contracts'
import type { EffectFact, EvidenceRecord, RoleFunctionState, RoleStateContract, RuntimeStateContract, Validity } from '../contracts'
import { producerPeriod, selectExecutionCandidates } from '../runtime/executionScopeContext'
import type { ExecutionScopeContext } from '../runtime/executionScopeContext'
import { containsTime, effectEvidence, sameValue } from '../runtime/guEungEffectEvidence'
import { detach, PROJECTION_EVIDENCE, recordId, RELATION_EVIDENCE, sortedUnique } from './shared'
import type { FactEntity, JudgmentProducerOutput } from './types'

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

type Input = {
  producer: JudgmentProducerOutput
  context: ExecutionScopeContext
  states: RuntimeStateContract[]
  roles: RoleStateContract[]
  natalScopeId?: string
  /** Prior luck stops retained by the validated carry evaluator for this scope. */
  priorLuckStops?: { scopeId: string; states: RuntimeStateContract[] }
  functions: TargetFunction[]
  evidence: EvidenceRecord[]
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
    if (candidate.kind !== 'stem-controls') continue
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
    for (const [targetFunctionId, fn] of functions.get(target.entityId) ?? []) {
      const role = fn.roleStateRef ? roles.get(fn.roleStateRef) : undefined
      const tenGod = fn.ownershipFactRef ? facts.get(fn.ownershipFactRef) : undefined
      const pillar = facts.get(target.canonicalFactRef)
      const tenGodPointer = stemTenGodPointer(target, pillar?.canonicalPointer)
      const expectedRole = fn.kind === 'yongshen' ? '용신' : '상신'
      const roleOwned = fn.kind !== 'ten-god' && fn.name === expectedRole && role?.subjectKind === 'entity' && role.entityId === target.entityId
        && role.role === expectedRole && role.status === 'evaluated'
        && role.usage === 'runtime-result' && !role.provisional && !role.uncertaintyIds.length && role.evidenceIds.length > 0 && role.evidenceIds.every((ref) => roleBasis.eligible(ref))
        && role.applicationRef?.executionId === context.executionId
        && (role.validScopeId === context.scopeId || (target.origin === 'natal' && role.validScopeId === input.natalScopeId))
      const ownership = fn.kind === 'ten-god'
        ? !!tenGod && tenGod.canonicalPointer === tenGodPointer && tenGod.value === fn.name
          && tenGod.assessment === 'confirmed' && !tenGod.uncertaintyIds.length && supported(tenGod.evidenceIds)
        : !!roleOwned
      const priorityKnown = priority?.scopeId === context.scopeId && supported(priority.evidenceIds)
      const currentRoleVerified = !!fn.currentRole?.evidenceIds.length
        && fn.currentRole.evidenceIds.every((ref) => basis.eligible(ref))
      const pre = fn.preRoleFunction
      const usablePre = pre?.functionId === targetFunctionId && containsTime(pre.effectivePeriod, context.referenceTime)
        && pre.evidenceIds.every((id) => eligible(id) || roleBasis.eligible(id) || supplied.has(id) && sameValue(supplied.get(id), basis.byId.get(id)))
      const roleActivity = pre ? !usablePre || pre.status === 'deferred' ? 'unknown'
        : pre.status === 'stopped' ? 'inactive' : 'active'
        : fn.currentRole ? (currentRoleVerified ? fn.currentRole.status : 'unknown')
        : role?.validScopeId === context.scopeId ? 'active' : 'unknown'
      const functionActive = targetState?.functionalState === 'stopped' || (ownership && fn.kind !== 'ten-god' && roleActivity === 'inactive')
        ? 'inactive' : ownership && !!targetState && targetState.functionalState !== 'unknown'
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
      if (functionActive === 'inactive' && targetState?.functionalState !== 'stopped') reasons.push('FUNCTION_INACTIVE')
      if (priorityKnown && priority.status === 'blocked') reasons.push('REACH_BLOCKED_BY_PRIORITY')
      const blocked = reasons.some((reason) => ['SOURCE_STOPPED', 'TARGET_STOPPED', 'FUNCTION_INACTIVE', 'REACH_BLOCKED_BY_PRIORITY'].includes(reason))
      const status = blocked ? 'blocked' : reasons.length ? 'deferred' : 'confirmed'
      const effectivePeriod = period && containsTime(period, context.referenceTime) ? period : context.effectivePeriod
      const effectId = recordId('effect', [context.scopeId, relation.relationFactId, targetFunctionId, 'weaken',
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
        sourceEntityId: source.entityId, targetEntityId: target.entityId, targetFunctionId, relationFactId: relation.relationFactId,
        effectType: 'weaken', runtimeStateRefs, roleStateRefs, ruleIds: ['OP-L01', 'OP-L02', 'OP-P06'], evidenceIds,
        provenance: { producerRef: { producerId: 'filune-function-effects', version: '1', sourceRef: 'effectFactProducer',
          inputFactIds: sortedUnique([relation.relationFactId, ...runtimeStateRefs, ...roleStateRefs, ...(usablePre ? [pre.roleFunctionStateId] : []), ...(ownership && tenGod ? [tenGod.id] : [])]) },
          ruleRevision: 181 },
        coverage: status === 'confirmed' ? 'complete' : 'partial', effectivePeriod, reasonCodes: reasons, status }))
    }
  }
  return detach({ effects, diagnostics })
}
