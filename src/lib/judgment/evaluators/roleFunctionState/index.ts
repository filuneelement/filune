import { effectFactSchema, roleFunctionStateSchema, roleStateSchema, runtimeStateSchema } from '../../contracts'
import type { EffectFact, EvidenceRecord, RoleFunctionState, RoleStateContract, RuntimeStateContract, Validity } from '../../contracts'
import { detach, PROJECTION_EVIDENCE, recordId, RELATION_EVIDENCE, sortedUnique } from '../../producers/shared'
import type { JudgmentProducerOutput } from '../../producers/types'
import { selectExecutionCandidates } from '../../runtime/executionScopeContext'
import type { ExecutionScopeContext } from '../../runtime/executionScopeContext'
import { containsTime, effectEvidence, sameValue } from '../../runtime/guEungEffectEvidence'
import type { ValidatedRoleAssignment } from '../../producers/effectFactProducer'

export type RoleFunctionPath = {
  roleStateRef: string
  judgmentRef: string
  actionId?: string
  actionUnspecified?: boolean
  observedRelationRefs?: string[]
  requiredRelationRefs: string[]
  requiredParticipantIds: string[]
  structuralFactRefs: string[]
  requiredFunctionIds?: string[]
  /** Current eligibility of role targets and structural premises, established separately from stem state. */
  structuralStatus: 'confirmed' | 'unknown'
  /** The approved path definition excludes alternatives if a required participant stops. */
  exclusive: boolean
  evidenceIds: string[]
}

export function roleFunctionId(entityId: string, type: RoleFunctionState['functionType'], actionId?: string) {
  return recordId('target-function', [entityId, type, type === 'yongshen' ? '용신' : '상신', ...(actionId ? [actionId] : [])])
}

type Input = {
  producer: JudgmentProducerOutput
  context: ExecutionScopeContext
  natalScopeId: string
  roles: RoleStateContract[]
  states: RuntimeStateContract[]
  paths: RoleFunctionPath[]
  evidence: EvidenceRecord[]
  validatedRoleAssignments?: ValidatedRoleAssignment[]
  /** Current scope's applicable structural restrictions were evaluated. */
  restrictionsResolved: boolean
  /** Reproduce legacy EffectFact input references without publishing a role-wide function state. */
  retainUnspecifiedForEffectCompatibility?: boolean
}

function overlap(periods: Validity[], referenceTime: string): Validity | undefined {
  if (!periods.every((item) => containsTime(item, referenceTime))) return
  const from = periods.map(({ from }) => from.kind === 'exact' ? from.instant : from.kind === 'range' ? from.latest : '').sort().at(-1)!
  const to = periods.map(({ to }) => to.kind === 'exact' ? to.instant : to.kind === 'range' ? to.earliest : '').sort()[0]
  return { periodId: recordId('role-function-period', [from, to]), from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } }
}

/** Reads confirmed natal assignments and rebuilds the functional snapshot for this execution scope. */
export function evaluateRoleFunctions(input: Input) {
  const { context, producer } = input
  const relations = new Map(selectExecutionCandidates(producer, context).relations.map((item) => [item.relationFactId, item]))
  const included = new Set(context.includedEntityIds)
  const pillars = ['year', 'month', 'day', 'time'].map((position) => {
    const fact = producer.facts.find((item) => item.canonicalPointer === `/chart/pillars/${position}/value/ganZhi`)
    return fact?.assessment === 'confirmed' && !fact.uncertaintyIds.length && typeof fact.value === 'string' ? fact.value : null
  })
  const basis = effectEvidence(input.evidence, pillars.every((item) => item !== null) ? pillars.join(' ') : undefined)
  const canonical = new Set(producer.evidence.records.filter((item) =>
    [PROJECTION_EVIDENCE, RELATION_EVIDENCE, 'producer-evidence:source-A179'].includes(item.evidenceId)
    && sameValue(item, basis.byId.get(item.evidenceId))).map((item) => item.evidenceId))
  const supported = (refs: string[]) => refs.length > 0 && refs.every((id) => canonical.has(id) || basis.eligible(id))
  const validatedAssignments = new Map((input.validatedRoleAssignments ?? []).map((item) => [item.roleStateRef, item]))
  const currentStates = input.states.map((item) => runtimeStateSchema.parse(item)).filter((item) =>
    item.scopeId === context.scopeId && included.has(item.targetEntityId) && !item.uncertaintyIds.length && item.functionalState !== 'unknown'
    && item.causingApplicationRefs.every((app) => app.executionId === context.executionId)
    && containsTime(item.validity, context.referenceTime) && supported(item.evidenceIds))
  function currentState(entityId: string) {
    const matches = currentStates.filter((state) => state.targetEntityId === entityId)
    return matches.length === 1 ? matches[0] : undefined
  }
  const seen = new Set<string>()
  const resolvedFunctions = new Map<string, RoleFunctionState>()
  // The only v1 cross-role dependency is from a helper to its referenced yongshen.
  const ordered = [...input.roles].sort((a, b) => Number(a.role === '상신') - Number(b.role === '상신'))
  return detach(ordered.flatMap((item) => {
    const role = roleStateSchema.parse(item)
    if ((role.role !== '용신' && role.role !== '상신') || !role.entityId || seen.has(role.roleStateId)) return []
    const entityId = role.entityId
    seen.add(role.roleStateId)
    const type = role.role === '용신' ? 'yongshen' : 'sangshen'
    const paths = input.paths.filter((path) => path.roleStateRef === role.roleStateId
      && (!path.actionUnspecified || input.retainUnspecifiedForEffectCompatibility))
    if (!paths.length && !input.retainUnspecifiedForEffectCompatibility) return []
    const actionIds = new Set(paths.map((path) => path.actionId))
    if (actionIds.size !== paths.length) throw new TypeError('Duplicate role action definition')
    return (paths.length ? paths : [undefined]).map((path) => {
      const functionId = roleFunctionId(entityId, type, path?.actionId)
      const unspecified = !path || path.actionUnspecified === true
      const edges = (path?.requiredRelationRefs ?? []).map((id) => relations.get(id))
      const requiredParticipantIds = sortedUnique([entityId, ...(path?.requiredParticipantIds ?? []),
        ...edges.flatMap((edge) => edge?.participantEntityIds ?? [])])
      const participants = requiredParticipantIds.map((entityId) => ({ entityId, state: currentState(entityId) }))
      const states = participants.flatMap(({ state }) => state ? [state] : [])
      const owner = participants.find(({ entityId }) => entityId === role.entityId)?.state
      const ownership = role.subjectKind === 'entity' && role.status === 'evaluated' && role.usage === 'runtime-result'
        && !role.provisional && !role.uncertaintyIds.length && role.validScopeId === input.natalScopeId
        && role.applicationRef?.executionId === context.executionId && role.evidenceIds.length > 0
        && (role.evidenceIds.every((id) => basis.eligible(id)) || (() => {
          const assignment = validatedAssignments.get(role.roleStateId)
          return !!assignment && assignment.entityId === entityId && assignment.role === role.role
            && assignment.scopeId === role.validScopeId && assignment.executionId === context.executionId
            && !!assignment.judgmentId && sameValue(assignment.producerRef, producer.producerRef)
            && sameValue(sortedUnique(assignment.evidenceIds), sortedUnique(role.evidenceIds))
        })())
      const scopeReady = context.periodSelectionStatus === 'confirmed' && included.has(entityId)
      const dependencies = (path?.requiredFunctionIds ?? []).map((id) => {
        const dependency = resolvedFunctions.get(id)
        return type === 'sangshen' && dependency?.functionType === 'yongshen' ? dependency : undefined
      })
      const dependencyReady = dependencies.every((item) => ['active', 'strengthened', 'weakened'].includes(item?.status ?? ''))
      const dependencyStopped = dependencies.some((item) => item?.status === 'stopped')
      const stoppedParticipant = participants.some(({ state }) => state?.functionalState === 'stopped')
      const validRelations = edges.every((edge) => edge?.existence === 'present' && edge.assessment === 'confirmed'
        && !edge.uncertaintyIds.length && supported(edge.evidenceIds))
      const assignment = validatedAssignments.get(role.roleStateId)
      const judgmentHandoff = !!assignment && assignment.entityId === entityId && assignment.role === role.role
        && assignment.scopeId === role.validScopeId && assignment.executionId === context.executionId
        && !!assignment.judgmentId && sameValue(assignment.producerRef, producer.producerRef)
        && sameValue(sortedUnique(assignment.evidenceIds), sortedUnique(role.evidenceIds))
      const validStructure = !!path && (supported(path.evidenceIds) || judgmentHandoff) && !!path.structuralFactRefs.length
        && path.structuralStatus === 'confirmed'
      const period = overlap([context.effectivePeriod, ...states.map((state) => state.validity),
        ...dependencies.flatMap((item) => item ? [item.effectivePeriod] : [])], context.referenceTime)
      const reasons: string[] = []
      if (!ownership) reasons.push('ROLE_OWNERSHIP_UNCONFIRMED')
      if (!scopeReady || !period) reasons.push('ROLE_FUNCTION_SCOPE_OR_PERIOD_UNCONFIRMED')
      if (!owner) reasons.push('ROLE_ENTITY_STATE_UNCONFIRMED')
      if (unspecified) reasons.push('ROLE_ACTION_UNSPECIFIED')
      else {
        if (!validRelations) reasons.push('REQUIRED_RELATIONS_UNCONFIRMED')
        if (!validStructure) reasons.push('ROLE_FUNCTION_STRUCTURE_UNCONFIRMED')
      }
      if (participants.some(({ entityId, state }) => !included.has(entityId) || !state)) reasons.push('REQUIRED_PARTICIPANT_STATE_UNCONFIRMED')
      if (!dependencyReady) reasons.push(dependencyStopped ? 'REQUIRED_ROLE_FUNCTION_STOPPED' : 'REQUIRED_ROLE_FUNCTION_UNCONFIRMED')
      if (!input.restrictionsResolved) reasons.push('ROLE_FUNCTION_RESTRICTIONS_UNRESOLVED')
      if (stoppedParticipant && owner?.functionalState !== 'stopped') reasons.push('REQUIRED_PARTICIPANT_STOPPED')
      if ((stoppedParticipant || dependencyStopped) && !path?.exclusive && owner?.functionalState !== 'stopped') reasons.push('ALTERNATIVE_PATH_UNRESOLVED')
      const stopped = !unspecified && ownership && scopeReady && period && (owner?.functionalState === 'stopped'
        || (stoppedParticipant || dependencyStopped) && validRelations && validStructure && path?.exclusive)
      const weakened = states.some((state) => state.functionalState === 'weakened')
        || dependencies.some((item) => item?.status === 'weakened')
      const status = stopped ? 'stopped' : reasons.length ? 'deferred' : weakened ? 'weakened' : 'active'
      const fact = roleFunctionStateSchema.parse({ contractVersion: '1',
        roleFunctionStateId: recordId('role-function-state', [context.scopeId, functionId, 'pre-effect']),
        scopeId: context.scopeId, entityId, ...(path?.actionId ? { actionId: path.actionId } : {}), roleStateRef: role.roleStateId, functionId, functionType: type,
        phase: 'pre-effect', status, relationRefs: sortedUnique(path?.requiredRelationRefs ?? []),
        runtimeStateRefs: sortedUnique(states.map((state) => state.stateId)), effectRefs: [],
        ruleIds: ['OP-L01', 'OP-L02', 'OP-P07'], evidenceIds: sortedUnique([
          ...(ownership ? role.evidenceIds : []), ...(path?.evidenceIds.filter((id) => supported([id])) ?? []),
          ...states.flatMap((state) => state.evidenceIds), ...dependencies.flatMap((item) => item?.evidenceIds ?? []), ...edges.flatMap((edge) => edge?.evidenceIds.filter((id) => supported([id])) ?? [])]),
        provenance: { ruleVersion: 'A182', producerRef: { producerId: 'filune-role-function', version: '1',
          sourceRef: 'roleFunctionState/pre-effect', inputFactIds: sortedUnique([role.roleStateId,
            ...(path ? [path.judgmentRef, ...path.structuralFactRefs, ...path.requiredRelationRefs] : []), ...states.map((state) => state.stateId), ...dependencies.flatMap((item) => item ? [item.roleFunctionStateId] : [])]) } },
        effectivePeriod: period ?? context.effectivePeriod,
        reasonCodes: status === 'stopped' ? [owner?.functionalState === 'stopped' ? 'ROLE_ENTITY_STOPPED' : 'EXCLUSIVE_REQUIRED_PATH_STOPPED']
          : reasons.length ? reasons : [weakened ? 'REQUIRED_PARTICIPANT_WEAKENED' : 'REQUIRED_PATH_ACTIVE'],
      })
      resolvedFunctions.set(functionId, fact)
      const observedActions = (path?.observedRelationRefs ?? []).flatMap((ref) => {
        const relation = relations.get(ref)
        if (!relation?.sourceEntityId || !relation.targetEntityId) return []
        const source = currentState(relation.sourceEntityId)
        const target = currentState(relation.targetEntityId)
        const confirmed = relation.existence === 'present' && relation.assessment === 'confirmed'
          && !relation.uncertaintyIds.length && supported(relation.evidenceIds)
        const status = confirmed && (source?.functionalState === 'stopped' || target?.functionalState === 'stopped') ? 'stopped'
          : confirmed && source && target && input.restrictionsResolved ? 'investigable' : 'deferred'
        return [{ relationFactId: ref, sourceEntityId: relation.sourceEntityId, targetEntityId: relation.targetEntityId,
          runtimeStateRefs: [source, target].flatMap((state) => state ? [state.stateId] : []),
          sourceState: source?.functionalState ?? 'unknown', targetState: target?.functionalState ?? 'unknown', status }]
      })
      return { fact, diagnostic: { functionId, roleOwnership: ownership ? 'confirmed' : 'unknown',
        entityRuntimeState: owner?.functionalState ?? 'unknown', requiredRelations: fact.relationRefs,
        structuralFactRefs: path?.structuralFactRefs ?? [],
        requiredParticipants: participants.map(({ entityId, state }) => ({ entityId, state: state?.functionalState ?? 'unknown' })),
        preEffectState: status, reasonCodes: fact.reasonCodes, observedActions }, requiredFunctionIds: path?.requiredFunctionIds ?? [] }
    })
  }))
}

/** Consume confirmed effects once, preserving both directions of change. */
export function applyRoleFunctionEffects(pre: RoleFunctionState, effects: EffectFact[], referenceTime: string, requiredFunctionIds: string[] = []) {
  roleFunctionStateSchema.parse(pre)
  if (pre.phase !== 'pre-effect') throw new TypeError('Role function effects require a pre-effect snapshot')
  const targets = new Set([pre.functionId, ...requiredFunctionIds])
  const applicable = effects.map((item) => effectFactSchema.parse(item)).filter((item) =>
    item.status === 'confirmed' && item.scopeId === pre.scopeId && containsTime(item.effectivePeriod, referenceTime)
    && targets.has(item.targetFunctionId) && (item.targetFunctionId === pre.functionId
      ? item.targetEntityId === pre.entityId && item.provenance.producerRef.inputFactIds.includes(pre.roleFunctionStateId)
      : item.provenance.producerRef.inputFactIds.some((id) => pre.provenance.producerRef.inputFactIds.includes(id)
        && id.startsWith('role-function-state:'))))
  const canChange = containsTime(pre.effectivePeriod, referenceTime) && (pre.status === 'active' || pre.status === 'weakened')
  const used = canChange ? applicable : []
  const effectRefs = sortedUnique(used.map((item) => item.effectId))
  const strengthens = used.some((item) => item.effectType === 'strengthen')
  const weakens = used.some((item) => item.effectType === 'weaken'
    || item.effectType === 'drain' && item.reducesFunction !== false)
  const status = weakens || pre.status === 'weakened' ? 'weakened' : strengthens ? 'strengthened' : pre.status
  return roleFunctionStateSchema.parse({ ...pre, phase: 'post-effect',
    roleFunctionStateId: recordId('role-function-state', [pre.scopeId, pre.functionId, 'post-effect']),
    status, effectRefs,
    effectivePeriod: overlap([pre.effectivePeriod, ...used.map((item) => item.effectivePeriod)], referenceTime) ?? pre.effectivePeriod,
    evidenceIds: sortedUnique([...pre.evidenceIds, ...used.flatMap((item) => item.evidenceIds)]),
    reasonCodes: sortedUnique([...pre.reasonCodes, ...(weakens ? ['CONFIRMED_FUNCTION_WEAKEN'] : []),
      ...(used.some(({ effectType }) => effectType === 'drain') ? ['CONFIRMED_FUNCTION_DRAIN'] : []),
      ...(strengthens ? ['CONFIRMED_FUNCTION_STRENGTHEN'] : [])]),
    provenance: { ...pre.provenance, producerRef: { ...pre.provenance.producerRef, sourceRef: 'roleFunctionState/post-effect',
      inputFactIds: [pre.roleFunctionStateId, ...effectRefs] } },
  })
}
