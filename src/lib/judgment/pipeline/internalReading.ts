import { luckPeriodStatus } from '../core/luckValidity'
import { judgmentCoreFromReading } from '../core/fromReading'
import type { JudgmentCoreEvidence } from '../core/fromReading'
import type { LuckScopeInput, ResourceExcessEvidence } from '../core/luckScope'
import type { RoleFunctionBasis } from '../core/types'
import { applyRoleFunctionEffects, evaluateRoleFunctions } from '../evaluators/roleFunctionState'
import type { RoleFunctionPath } from '../evaluators/roleFunctionState'
import { calculateCanonicalChart } from '../../canonical/calculateCanonicalChart'
import { calculateMonthlyLuck } from '../../calculateMonthlyLuck'
import type { BirthInput, CalculationContext } from '../../canonical/types'
import { evidenceContextSchema } from '../contracts'
import type { EvidenceRecord, Validity } from '../contracts'
import { produceJudgmentEngineFacts, produceExposureRootFacts } from '../producers'
import { produceEffectFacts, projectDailyEffectFacts, stemTenGodPointer } from '../producers/effectFactProducer'
import type { FunctionEffects, TargetFunction, ValidatedRoleAssignment } from '../producers/effectFactProducer'
import type { ExposureRootSources } from '../systems/exposureRootAuthority'
import { detach, recordId, RELATION_EVIDENCE, sortedUnique } from '../producers/shared'
import { adaptCarryContext, createExecutionScopeContext, producerPeriod, selectExecutionCandidates } from '../runtime'
import type { ExecutionScopeContext } from '../runtime'
import { evaluateNatalStemCombination } from '../evaluators/natalStemCombination'
import { evaluatePatternCandidates } from '../evaluators/patternCandidates'
import { evaluatePatternJudgment } from '../evaluators/patternJudgment'
import { evaluateYongShenCandidates } from '../evaluators/yongShenCandidates'
import { evaluateYongShenJudgment } from '../evaluators/yongShenJudgment'
import { evaluateSangShenCandidates } from '../evaluators/sangShenCandidates'
import { evaluateSangShenJudgment } from '../evaluators/sangShenJudgment'
import { evaluateByeongCandidates } from '../evaluators/byeongCandidates'
import { issueByeongRuleReceipts } from '../evaluators/byeongCandidates/ruleEvidence'
import { evaluateByeongJudgment } from '../evaluators/byeongJudgment'
import { evaluateGuEung } from '../evaluators/guEung'
import { carryForward, evaluateStemCombination, selectScope, UnsupportedPriorStopLuckPairError } from '../evaluators/stemCombination'
import type { StemCombinationResult, Work } from '../evaluators/stemCombination'
import { stageResult } from './stage'
import type { StageResult, StageStatus } from './stage'

export type InternalReadingInput = {
  birth: BirthInput
  calculation: CalculationContext
  executionId: string
  natalInspectionPeriod: Validity
  sources: ExposureRootSources & { draftA: string }
  /** Evaluate Daewoon without constructing a Sewoon or month at its boundary. */
  daewoonOnly?: boolean
  /** Optional precomputed daily pillar and its effective period. */
  dailyLuck?: Omit<LuckScopeInput, 'scope'>
  resourceExcessEvidence?: ResourceExcessEvidence
  judgmentCoreEvidence?: JudgmentCoreEvidence
  /** Gregorian label of the first 절기월. The period itself begins at that month's 절입. */
  monthlyWindowStart?: { year: number; month: number }
}

const aggregate = (statuses: string[]): StageStatus => statuses.includes('deferred') || !statuses.length
  ? 'deferred' : statuses.some((status) => status === 'confirmed' || status === 'candidate') ? 'confirmed' : 'rejected'

/** Internal first-scope pipeline. Documents supply authority; case expectations stay in the verifier. */
function runSingleInternalReading({ birth, calculation, executionId, natalInspectionPeriod, sources, dailyLuck, resourceExcessEvidence, judgmentCoreEvidence, daewoonOnly }: InternalReadingInput) {
  const canonical = calculateCanonicalChart(birth, calculation)
  const producer = produceJudgmentEngineFacts(canonical, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: sources.A } })
  const { producerRef } = producer
  const referenceTime = canonical.context.referenceTime
  const context = createExecutionScopeContext(producer, { executionId, referenceTime, stage: 'natal', selectedPeriodRefs: {}, natalInspectionPeriod })
  const stages: StageResult[] = []
  const add: (id: string, status: StageStatus, details?: Parameters<typeof stageResult>[4]) => StageResult =
    (id, status, details) => {
      const result = stageResult(context, producerRef, id, status, details)
      stages.push(result)
      return result
    }
  const evidenceById = new Map<string, EvidenceRecord>()
  function mergeEvidence(...sets: EvidenceRecord[][]) {
    for (const item of sets.flat()) {
      const prior = evidenceById.get(item.evidenceId)
      if (prior && JSON.stringify(detach(prior)) !== JSON.stringify(detach(item))) throw new TypeError('Conflicting pipeline evidence')
      evidenceById.set(item.evidenceId, item)
    }
  }
  mergeEvidence(producer.evidence.records)
  const chartFacts = producer.facts.filter((item) => item.canonicalPointer.startsWith('/chart/pillars/'))
  add('canonical', canonical.uncertainties.length ? 'deferred' : 'confirmed', {
    resultRefs: [producerRef.sourceRef], uncertaintyIds: canonical.uncertainties.map((item) => item.id),
  })
  const unavailableNatal = producer.unavailableEntityFactRefs.filter((id) => id.includes('/chart/pillars/'))
  add('judgment-facts', unavailableNatal.length || chartFacts.some((item) => item.assessment !== 'confirmed') ? 'deferred' : 'confirmed', {
    resultRefs: chartFacts.map((item) => item.id), uncertaintyIds: chartFacts.flatMap((item) => item.uncertaintyIds),
    reasonCodes: unavailableNatal.length ? ['NATAL_PILLAR_FACTS_UNAVAILABLE'] : [], ruleIds: ['C-09', 'C-10', 'C-11'], evidenceIds: producer.evidence.records.map((item) => item.evidenceId),
  })
  const derived = produceExposureRootFacts({ producer, context }, sources)
  const natalCombination = evaluateNatalStemCombination({ producer, context })
  const base = { producer, context, derived, natalCombination }
  add('natal-stem-state', natalCombination.states.length && natalCombination.states.every((item) => item.functionalState !== 'unknown')
    ? 'confirmed' : 'deferred', {
    resultRefs: natalCombination.states.map((item) => item.stateId),
    ruleIds: natalCombination.states.flatMap((item) => item.causingApplicationRefs.map((app) => app.ruleId)),
    evidenceIds: natalCombination.states.flatMap((item) => item.evidenceIds),
    uncertaintyIds: natalCombination.states.flatMap((item) => item.uncertaintyIds),
  })
  const patternCandidates = evaluatePatternCandidates(base)
  const pattern = evaluatePatternJudgment({ ...base, candidates: patternCandidates.candidates })
  const roleInput = { ...base, candidates: patternCandidates.candidates, patternJudgment: pattern.judgment, judgmentEvidence: pattern.evidence }
  const yongCandidates = evaluateYongShenCandidates(roleInput)
  const yongShen = evaluateYongShenJudgment({ ...roleInput, yongShenCandidates: yongCandidates.candidates, candidateEvidence: yongCandidates.evidence })
  const helperInput = { ...base, patternJudgment: pattern.judgment, yongShenResult: yongShen }
  const sangCandidates = evaluateSangShenCandidates(helperInput)
  const sangShen = evaluateSangShenJudgment({ ...helperInput, sangShenCandidates: sangCandidates.candidates, sangShenEvidence: sangCandidates.evidence })
  const roles = [...new Map([...yongShen.roleStates, ...sangShen.roleStates].map((role) => [role.roleStateId, role])).values()]
  const validatedRoleAssignments: ValidatedRoleAssignment[] = [
    ...yongShen.judgments.filter((judgment) => judgment.status === 'confirmed' && judgment.roleStateRef).map((judgment) => ({
      roleStateRef: judgment.roleStateRef!, entityId: judgment.entityId, role: '용신' as const,
      scopeId: judgment.scopeId, executionId, judgmentId: judgment.judgmentId,
      producerRef: judgment.provenance.producerRef, evidenceIds: judgment.evidenceIds,
    })),
    ...sangShen.judgments.filter((judgment) => judgment.status === 'confirmed' && judgment.roleStateRef).map((judgment) => ({
      roleStateRef: judgment.roleStateRef!, entityId: judgment.entityId, role: '상신' as const,
      scopeId: judgment.scopeId, executionId, judgmentId: judgment.judgmentId,
      producerRef: judgment.provenance.producerRef, evidenceIds: judgment.evidenceIds,
    })),
  ]
  mergeEvidence(pattern.evidence.records, natalCombination.bundle.evidence.records, yongShen.evidence.records,
    sangShen.evidence.records, issueByeongRuleReceipts(sources.A, 'exposure-root:source-A'))
  function markCandidates(id: string, candidates: { candidateId: string; status: string; sourceRuleIds: string[]; evidenceIds: string[] }[]) {
    add(id, aggregate(candidates.map((item) => item.status)), {
      resultRefs: candidates.map((item) => item.candidateId), ruleIds: candidates.flatMap((item) => item.sourceRuleIds),
      evidenceIds: candidates.flatMap((item) => item.evidenceIds),
    })
  }
  markCandidates('pattern-candidates', patternCandidates.candidates)
  add('pattern', pattern.judgment.status, {
    resultRefs: [pattern.judgment.judgmentId], ruleIds: pattern.judgment.sourceRuleIds, evidenceIds: pattern.judgment.evidenceIds,
    reasonCodes: pattern.judgment.reasonCodes, uncertaintyIds: [...pattern.judgment.uncertainty.blockingIds, ...pattern.judgment.uncertainty.contextIds],
  })
  for (const [id, candidates, result] of [['yongshen', yongCandidates.candidates, yongShen],
    ['sangshen', sangCandidates.candidates, sangShen]] as const) {
    markCandidates(`${id}-candidates`, candidates)
    add(id, aggregate(result.judgments.map((item) => item.status)), {
      resultRefs: result.judgments.map((item) => item.judgmentId), ruleIds: result.judgments.flatMap((item) => item.sourceRuleIds),
      reasonCodes: result.judgments.flatMap((item) => item.reasonCodes), evidenceIds: result.judgments.flatMap((item) => item.evidenceIds),
      uncertaintyIds: result.judgments.flatMap((item) => [...item.uncertainty.blockingIds, ...item.uncertainty.contextIds]),
    })
  }

  function effectsIn(current: ExecutionScopeContext, runtimeStates: StemCombinationResult['states'], natalByeongRoles?: ReturnType<typeof evaluateByeongJudgment>['roleStates']) {
    const evidence = evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: recordId('pipeline-evidence', [current.scopeId]),
      records: [...evidenceById.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) })
    const input = { producer, context: current, patternJudgment: pattern.judgment, natalScopeId: context.scopeId, draftRuleSource: sources.draftA,
      yongShenJudgments: yongShen.judgments, sangShenJudgments: sangShen.judgments, upstreamRoles: roles, runtimeStates, evidence, reviews: [] }
    const candidates = evaluateByeongCandidates(input)
    const byeong = evaluateByeongJudgment({ ...input, candidateResult: candidates, ...(natalByeongRoles ? { natalByeongRoles } : {}) })
    // A scoped state or relationship by itself provides no independent relief effect.
    const guEung = evaluateGuEung({ boundary: { contractVersion: '1', scopeId: current.scopeId, referenceTime, byeong, evidence },
      candidates: [], relations: [], states: [], effects: [], links: [] })
    return { candidates, byeong, guEung }
  }
  function markEffects(current: ExecutionScopeContext, result: ReturnType<typeof effectsIn>) {
    const mark = (id: string, status: StageStatus, details: Parameters<typeof stageResult>[4]) =>
      stages.push(stageResult(current, producerRef, id, status, details))
    const candidates = result.candidates.candidates
    mark('byeong-candidates', aggregate(candidates.map((item) => item.status)), {
      resultRefs: candidates.map((item) => item.candidateId),
      reasonCodes: candidates.flatMap((item) => item.reasonCodes), ruleIds: candidates.flatMap((item) => item.ruleIds),
      evidenceIds: candidates.flatMap((item) => item.evidenceIds),
    })
    const { byeong, guEung } = result
    mark('byeong', byeong.status === 'deferred' ? 'deferred' : 'confirmed', {
      resultRefs: byeong.judgments.map((item) => item.judgmentId), reasonCodes: [...byeong.reasonCodes, ...byeong.judgments.flatMap((item) => item.reasonCodes)],
      ruleIds: byeong.judgments.flatMap((item) => item.ruleIds), evidenceIds: byeong.judgments.flatMap((item) => item.evidenceIds),
    })
    mark('gueung', guEung.status === 'not-applicable' ? 'not-applicable' : guEung.status === 'confirmed' ? 'confirmed' : 'deferred', {
      resultRefs: guEung.roleStates.map((item) => item.roleStateId), reasonCodes: guEung.reasonCodes,
      ruleIds: guEung.applications.map((item) => item.ruleId), evidenceIds: guEung.damagePaths.flatMap((item) => item.evidenceIds),
    })
  }
  const natalEffects = effectsIn(context, natalCombination.states)
  markEffects(context, natalEffects)
  const rootStemScope = evaluateStemCombination({ producer, context })
  mergeEvidence(rootStemScope.bundle.evidence.records)

  const factsByPointer = new Map(producer.facts.map((fact) => [fact.canonicalPointer, fact]))
  const factsById = new Map(producer.facts.map((fact) => [fact.id, fact]))
  // Preserve the basis of legacy deferred EffectFacts while keeping undefined actions out of roleFunctions.
  const legacyEffectPaths: RoleFunctionPath[] = []
  for (const judgment of yongShen.judgments) {
    if (judgment.status !== 'confirmed' || !judgment.roleStateRef) continue
    const candidates = yongCandidates.candidates.filter((candidate) => judgment.sourceCandidateIds.includes(candidate.candidateId))
    legacyEffectPaths.push({ roleStateRef: judgment.roleStateRef, judgmentRef: judgment.judgmentId,
      requiredRelationRefs: [], requiredParticipantIds: [],
      structuralFactRefs: sortedUnique([pattern.judgment.judgmentId, ...judgment.functionBasis.exposureFactIds,
        ...derived.roots.filter((root) => root.rootExistence === 'present'
          && candidates.some((candidate) => candidate.roleBasis.rootFactIds.includes(root.id))).map((root) => root.id)]),
      structuralStatus: 'confirmed', exclusive: false, evidenceIds: judgment.evidenceIds })
  }
  for (const judgment of sangShen.judgments) {
    if (judgment.status !== 'confirmed' || !judgment.roleStateRef) continue
    const edges = judgment.functionBasis.relationFactIds.map((id) => producer.relations.find((relation) => relation.relationFactId === id))
    if (edges.some((edge) => !edge || !edge.sourceEntityId || !edge.targetEntityId)) continue
    const requiredEdges = edges.filter((edge) => edge?.sourceEntityId === judgment.entityId)
    if (!requiredEdges.length) continue
    legacyEffectPaths.push({ roleStateRef: judgment.roleStateRef, judgmentRef: judgment.judgmentId,
      actionId: judgment.judgmentId,
      requiredRelationRefs: requiredEdges.map((edge) => edge!.relationFactId),
      requiredParticipantIds: sortedUnique(requiredEdges.flatMap((edge) => edge ? [edge.sourceEntityId!, edge.targetEntityId!] : [])),
      observedRelationRefs: judgment.functionBasis.relationFactIds,
      structuralFactRefs: sortedUnique([judgment.sourcePatternJudgmentId, ...judgment.relatedYongShenIds,
        ...judgment.functionBasis.rootFactIds, ...judgment.functionBasis.relationFactIds]),
      structuralStatus: 'confirmed', exclusive: false, evidenceIds: judgment.evidenceIds })
  }
  function functionEffectsIn(scope: ExecutionScopeContext | null, states: StemCombinationResult['states'],
    combination: Pick<ReturnType<typeof evaluateNatalStemCombination>, 'status' | 'bundle'> | null,
    preRoles: ReturnType<typeof evaluateRoleFunctions> = [], rootStates?: (typeof judgmentCore)[number]['rootStates']): FunctionEffects {
    if (!scope) return { effects: [], diagnostics: [] }
    const included = new Set(scope.includedEntityIds)
    const functions: TargetFunction[] = []
    const scopeFields = { scopeId: scope.scopeId, effectivePeriod: scope.effectivePeriod }
    for (const entity of producer.entities) {
      if (entity.part !== 'stem' || !included.has(entity.entityId)) continue
      const pointer = stemTenGodPointer(entity, factsById.get(entity.canonicalFactRef)?.canonicalPointer)
      const fact = pointer ? factsByPointer.get(pointer) : undefined
      if (fact && typeof fact.value === 'string') functions.push({ ...scopeFields, targetEntityId: entity.entityId,
        kind: 'ten-god', name: fact.value, ownershipFactRef: fact.id })
    }
    for (const [kind, name, candidates] of [['yongshen', '용신', yongCandidates.candidates],
      ['sangshen', '상신', sangCandidates.candidates]] as const) {
      const ids = new Set([...candidates.map((item) => item.entityId), ...roles.flatMap((role) =>
        role.role === name && role.entityId ? [role.entityId] : [])])
      for (const entityId of ids) {
        if (!included.has(entityId)) continue
        const refs = roles.filter((role) => role.role === name && role.entityId === entityId
          && role.status === 'evaluated' && !role.provisional)
        const snapshots = preRoles.filter(({ fact }) => fact.entityId === entityId && fact.functionType === kind
          && refs.length === 1 && fact.roleStateRef === refs[0].roleStateId)
        for (const snapshot of snapshots.length ? snapshots : [undefined]) {
          functions.push({ ...scopeFields, targetEntityId: entityId, kind, name,
            ...(snapshot ? { preRoleFunction: snapshot.fact } : {}),
            ...(refs.length === 1 ? { roleStateRef: refs[0].roleStateId } : {}) })
        }
      }
    }
    const priorityEvidence = combination?.bundle.coverage.filter((item) => item.scopeId === scope.scopeId
      && item.kind === 'stem-combination' && item.completion === 'complete')
      .flatMap((item) => item.evidenceIds).filter((ref) => ref === RELATION_EVIDENCE) ?? []
    return produceEffectFacts({ producer, context: scope, states, roles, functions, validatedRoleAssignments, natalScopeId: context.scopeId,
      evidence: [...evidenceById.values()], rootStates,
      ...(combination?.status === 'evaluated' ? { priorLuckStops: { scopeId: scope.scopeId,
        states: states.filter((state) => state.scopeId !== scope.scopeId) } } : {}),
      ...(combination?.status === 'evaluated' ? { priority: { scopeId: scope.scopeId,
        status: 'clear', evidenceIds: priorityEvidence } } : {}) })
  }
  function markFunctionEffects(scope: { scopeId: string; effectivePeriod: Validity | null; periodSelectionStatus?: string }, result: FunctionEffects) {
    const scopeConfirmed = scope.periodSelectionStatus === 'confirmed'
    const deferred = !scopeConfirmed || result.effects.some((fact) => fact.status === 'deferred')
    const status: StageStatus = deferred ? 'deferred' : result.effects.length ? 'confirmed' : 'not-applicable'
    const stage = stageResult(scope, producerRef, 'effect-facts', status, {
      resultRefs: result.effects.map((fact) => fact.effectId), ruleIds: ['OP-P06'],
      reasonCodes: scopeConfirmed ? result.diagnostics.flatMap((item) => item.reasonCodes) : ['EFFECT_SCOPE_UNCONFIRMED'],
      evidenceIds: result.effects.flatMap((fact) => fact.evidenceIds),
    })
    stages.push(stage)
    return stage
  }
  const activePeriods: Partial<Record<'greatLuck' | 'yearlyLuck' | 'monthlyLuck', Validity>> = {}
  for (const stage of daewoonOnly ? ['greatLuck'] as const : ['greatLuck', 'yearlyLuck', 'monthlyLuck'] as const) {
    const refs = sortedUnique(producer.entities.flatMap((item) => item.sourceScope === stage && item.periodRef ? [item.periodRef] : []))
    const matches = refs.map((ref) => producerPeriod(producer, ref)).filter((period) => luckPeriodStatus(period, referenceTime) === 'effective')
    if (matches.length === 1) activePeriods[stage] = matches[0]
  }
  const branchMainObservations = [...derived.hiddenObservations, ...derived.branchMainObservations]
  const unconfirmedBranchMainIds = producer.entities.filter(({ part, origin, entityId }) => part === 'branch' && origin === 'natal'
    && !branchMainObservations.some((item) => item.branchEntityId === entityId && item.role === 'main'
      && item.assessment === 'confirmed' && !item.uncertaintyIds.length)).map(({ entityId }) => entityId)
  const relationById = new Map(producer.relations.map((relation) => [relation.relationFactId, relation]))
  const roleFunctionBases: RoleFunctionBasis[] = [...(judgmentCoreEvidence?.roleFunctionBases ?? [])]
  for (const judgment of sangShen.judgments) {
    if (judgment.status !== 'confirmed' || !judgment.roleStateRef) continue
    for (const id of judgment.functionBasis.relationFactIds) {
      const relation = relationById.get(id)
      if (relation?.sourceEntityId !== judgment.entityId || !relation.targetEntityId || relation.assessment !== 'confirmed'
        || relation.existence !== 'present' || relation.uncertaintyIds.length
        || relation.kind !== 'stem-generates' && relation.kind !== 'stem-controls') continue
      roleFunctionBases.push({ roleHistoryRef: judgment.roleStateRef, sourceEntityId: relation.sourceEntityId,
        targetEntityId: relation.targetEntityId, action: relation.kind === 'stem-generates' ? 'generate' : 'control',
        evidenceIds: judgment.evidenceIds })
    }
  }
  const judgmentCore = judgmentCoreFromReading(producer, executionId, natalInspectionPeriod, natalCombination,
    [...roles, ...natalEffects.byeong.roleStates, ...natalEffects.guEung.roleStates], activePeriods, dailyLuck, resourceExcessEvidence,
    { ...judgmentCoreEvidence, roleFunctionBases }, unconfirmedBranchMainIds)
  const natalSuccess = judgmentCore[0].structuralSuccess
  const successState = add('success-state', natalSuccess.overall.grade ? 'confirmed' : 'deferred', {
    reasonCodes: [...natalSuccess.overall.reasonCodes], resultRefs: [judgmentCore[0].id], ruleIds: [...natalSuccess.ruleIds],
  })
  const natalPreRoles = evaluateRoleFunctions({ producer, context, natalScopeId: context.scopeId,
    roles, states: natalCombination.states, paths: legacyEffectPaths, evidence: [...evidenceById.values()],
    validatedRoleAssignments, restrictionsResolved: natalCombination.status === 'evaluated' })
  const natalFunctionEffects = functionEffectsIn(context, natalCombination.states, natalCombination, natalPreRoles, judgmentCore[0].rootStates)
  const natalRoleFunctions = natalPreRoles.map(({ fact, diagnostic, requiredFunctionIds }) => ({
    preEffect: fact, diagnostic,
    postEffect: applyRoleFunctionEffects(fact, natalFunctionEffects.effects, referenceTime, requiredFunctionIds),
  }))
  markFunctionEffects(context, natalFunctionEffects)

  function runLuck(stage: 'greatLuck' | 'yearlyLuck' | 'monthlyLuck', parent: StemCombinationResult | null) {
    const own = activePeriods[stage]
    const required = stage === 'monthlyLuck' ? ['yearlyLuck', 'monthlyLuck'] as const
      : stage === 'yearlyLuck' ? ['greatLuck', 'yearlyLuck'] as const : ['greatLuck'] as const
    const contextAvailable = required.every((key) => activePeriods[key])
    const fallback = { scopeId: recordId('unresolved-scope', [executionId, stage]), effectivePeriod: own ?? null }
    const scope = contextAvailable ? createExecutionScopeContext(producer, { executionId, referenceTime, stage,
      selectedPeriodRefs: Object.fromEntries(required.map((key) => [key, activePeriods[key]!.periodId])),
      intersectYearWithGreatLuck: stage === 'yearlyLuck',
      monthlyGreatLuckPeriodRef: stage === 'monthlyLuck' ? activePeriods.greatLuck?.periodId : undefined }) : null
    const selected = producer.entities.find((item) => item.periodRef === own?.periodId && item.sourceScope === stage && item.part === 'stem')
    const pillar = selected ? producer.facts.find((item) => item.id === selected.canonicalFactRef) : undefined
    const calendarConfirmed = !!own && pillar?.assessment === 'confirmed'
    const calendarStage = stageResult(scope ?? fallback, producerRef, stage, calendarConfirmed ? 'confirmed' : 'deferred', {
      resultRefs: pillar ? [pillar.id] : [], evidenceIds: pillar?.evidenceIds, ruleIds: ['OP-L01'],
      reasonCodes: calendarConfirmed ? [] : ['CURRENT_PERIOD_OR_PILLAR_UNCONFIRMED'], uncertaintyIds: pillar?.uncertaintyIds,
    })
    stages.push(calendarStage)
    const scopedRelations = scope ? selectExecutionCandidates(producer, scope).relations : []
    let stateResult: StemCombinationResult | null = null
    let carryOnly: Work | undefined
    if (scope && parent?.status === 'evaluated') {
      const input = { producer, context: scope, upstream: parent }
      try {
        stateResult = evaluateStemCombination(input)
      } catch (error) {
        if (stage !== 'monthlyLuck' || !(error instanceof UnsupportedPriorStopLuckPairError)) throw error
        carryOnly = { input, ...selectScope(input), states: new Map(), events: [], excludedFromNatal: new Set(), priorLuckProcessing: new Set() }
        carryForward(carryOnly, parent)
      }
    }
    const runtimeStates = stateResult?.states ?? [...(carryOnly?.states.values() ?? [])].filter((state) =>
      state.scopeId === scope?.scopeId && state.originMode === 'inherited')
    const carryInput = stateResult ?? (carryOnly && scope ? { producerSnapshotIdentity: scope.producerSnapshotIdentity, bundle: carryOnly.bundle } : null)
    if (carryInput) mergeEvidence(carryInput.bundle.evidence.records)
    const stemState = stageResult(scope ?? fallback, producerRef, 'luck-stem-state', stateResult?.status === 'evaluated' ? 'confirmed' : 'deferred', {
      resultRefs: runtimeStates.map((item) => item.stateId), ruleIds: ['OP-L01', 'OP-L02', ...(carryOnly ? ['OP-T10'] : [])],
      reasonCodes: carryOnly ? ['PRIOR_STOP_LUCK_PAIR_UNSUPPORTED']
        : stateResult?.status === 'evaluated' ? [] : ['LUCK_STATE_OR_UPSTREAM_UNAVAILABLE', ...(stateResult?.deferred.map((item) => item.reason) ?? [])],
      evidenceIds: runtimeStates.flatMap((item) => item.evidenceIds),
      uncertaintyIds: runtimeStates.flatMap((item) => item.uncertaintyIds),
    })
    stages.push(stemState)
    const carryContext = scope && carryInput ? adaptCarryContext(producer, scope, carryInput).incoming : []
    const evaluated = scope ? effectsIn(scope, runtimeStates, natalEffects.byeong.roleStates) : null
    if (scope && evaluated) markEffects(scope, evaluated)
    else for (const id of ['byeong-candidates', 'byeong', 'gueung']) {
      stages.push(stageResult(fallback, producerRef, id, 'deferred', { reasonCodes: ['LUCK_SCOPE_UNAVAILABLE'] }))
    }
    const preRoles = scope ? evaluateRoleFunctions({ producer, context: scope, natalScopeId: context.scopeId,
      roles, states: runtimeStates, paths: legacyEffectPaths, evidence: [...evidenceById.values()],
      validatedRoleAssignments,
      retainUnspecifiedForEffectCompatibility: true,
      restrictionsResolved: stateResult?.status === 'evaluated' }) : []
    const coreScope = judgmentCore.find((snapshot) => snapshot.scope === stage)
    const functionEffects = functionEffectsIn(scope, runtimeStates, stateResult, preRoles, coreScope?.rootStates)
    const success = coreScope?.structuralSuccess
    const successStage = stageResult(scope ?? fallback, producerRef, 'success-state', success?.overall.grade ? 'confirmed' : 'deferred', {
      ruleIds: [...(success?.ruleIds ?? [])], reasonCodes: [...(success?.overall.reasonCodes ?? ['LUCK_STRUCTURE_UNRESOLVED'])],
      resultRefs: coreScope ? [coreScope.id] : [],
    })
    stages.push(successStage)
    const roleFunctions = preRoles.filter(({ fact }) => !fact.reasonCodes.includes('ROLE_ACTION_UNSPECIFIED')).map(({ fact, diagnostic, requiredFunctionIds }) => ({
      preEffect: fact, diagnostic,
      postEffect: applyRoleFunctionEffects(fact, functionEffects.effects, referenceTime, requiredFunctionIds),
    }))
    const roleEffectDeferrals = preRoles.filter(({ fact }) => fact.reasonCodes.includes('ROLE_ACTION_UNSPECIFIED'))
      .map(({ fact }) => ({ inputRef: fact.roleFunctionStateId, roleStateRef: fact.roleStateRef,
        targetFunctionId: fact.functionId, reasonCodes: fact.reasonCodes, evidenceIds: fact.evidenceIds }))
    const relationActions = [...new Map(preRoles.flatMap(({ diagnostic }) =>
      diagnostic.observedActions.map((action) => [action.relationFactId, action] as const))).values()]
    const roleEffectContexts = functionEffects.effects.flatMap((effect) => {
      if (effect.status !== 'confirmed') return []
      const roleStateRefs = sortedUnique(roles.filter((role) => role.entityId === effect.targetEntityId
        && role.status === 'evaluated' && !role.provisional && !role.uncertaintyIds.length
        && role.usage === 'runtime-result' && role.validScopeId === context.scopeId
        && role.applicationRef?.executionId === context.executionId).map((role) => role.roleStateId))
      return roleStateRefs.length ? [{ effectId: effect.effectId, targetEntityId: effect.targetEntityId, roleStateRefs }] : []
    })
    const effectFactStage = markFunctionEffects(scope ?? fallback, functionEffects)
    const interpretation = stageResult(scope ?? fallback, producerRef, 'luck-function-effects', 'deferred', {
      reasonCodes: ['LUCK_FUNCTION_EFFECTS_UNVERIFIED'], ruleIds: ['OP-L03'],
    })
    stages.push(interpretation)
    return {
      stateResult,
      output: { calendarStage, stemState, interpretation, successStage, structuralSuccess: success ?? null,
        pillar: pillar?.value ?? null, effectivePeriod: own ?? null,
        scope, carryContext, relations: scopedRelations, runtimeStates, functionEffects, roleFunctions, relationActions, roleEffectContexts, roleEffectDeferrals, effectFactStage,
        currentApplications: stateResult?.bundle.applications.filter((item) => item.scopeId === scope?.scopeId) ?? [],
        byeongCandidates: evaluated?.candidates.candidates ?? [], byeong: evaluated?.byeong ?? null, guEung: evaluated?.guEung ?? null, natalScopeId: context.scopeId },
    }
  }
  const great = runLuck('greatLuck', rootStemScope)
  const year = runLuck('yearlyLuck', great.stateResult)
  const month = runLuck('monthlyLuck', year.stateResult)
  const dailySnapshot = judgmentCore.find(({ scope }) => scope === 'dailyLuck')
  const dailyProjection = dailySnapshot && projectDailyEffectFacts(dailySnapshot, executionId, referenceTime, producerRef)
  const day = dailyProjection && dailySnapshot ? {
    effectivePeriod: dailySnapshot.validity, structuralSuccess: dailySnapshot.structuralSuccess,
    functionEffects: { effects: dailyProjection.effects, diagnostics: dailyProjection.diagnostics },
    runtimeStates: dailyProjection.runtimeStates,
    relations: dailySnapshot.stemFacts.filter(({ id }) => dailyProjection.relationRefs.includes(id)),
    effectFactStage: markFunctionEffects({ scopeId: dailySnapshot.id, effectivePeriod: dailySnapshot.validity,
      periodSelectionStatus: 'confirmed' }, dailyProjection),
  } : null
  const interpretationInputs = [great.output, year.output, month.output].map((item) => ({
    scopeId: item.interpretation.scopeId, affectedFunction: null, issueType: null, effectDirection: null, reliefLevel: null,
    functionEffectRefs: item.functionEffects.effects.filter((fact) => fact.status === 'confirmed').map((fact) => fact.effectId),
    activePeriod: item.effectivePeriod, status: item.interpretation.status, evidenceRefs: item.interpretation.evidenceIds,
  }))
  if (day) interpretationInputs.push({
    scopeId: day.effectFactStage.scopeId, affectedFunction: null, issueType: null, effectDirection: null, reliefLevel: null,
    functionEffectRefs: day.functionEffects.effects.map(({ effectId }) => effectId), activePeriod: day.effectivePeriod,
    status: day.effectFactStage.status, evidenceRefs: day.effectFactStage.evidenceIds,
  })
  const reading = detach({
    canonical,
    natal: { pattern: pattern.judgment, yongShen: yongShen.judgments, sangShen: sangShen.judgments,
      functionEffects: natalFunctionEffects, roleFunctions: natalRoleFunctions, byeong: natalEffects.byeong, guEung: natalEffects.guEung, successState, structuralSuccess: natalSuccess, roles: [...roles, ...natalEffects.byeong.roleStates], runtimeStates: natalCombination.states },
    luck: { daewoon: great.output, sewoon: year.output, month: month.output, day },
    interpretationInputs, diagnostics: {
      completeness: stages.some((item) => item.status === 'deferred') ? 'partial' : 'complete',
      stages, facts: [...chartFacts, ...producer.facts.filter((item) => Object.values(activePeriods).some((period) =>
        period.periodId.replace('canonical-period:', '') + '/pillar' === item.canonicalPointer))],
      natalCandidates: { pattern: patternCandidates.candidates, yongShen: yongCandidates.candidates,
        sangShen: sangCandidates.candidates, byeong: natalEffects.candidates.candidates },
      evidence: [...evidenceById.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) },
  })
  return { ...reading, judgmentCore }
}

function runMonthlyWindow(input: InternalReadingInput, natal: ReturnType<typeof runSingleInternalReading>,
  start: NonNullable<InternalReadingInput['monthlyWindowStart']>) {
  if (!Number.isInteger(start.year) || start.year < 100 || start.year > 9997 || !Number.isInteger(start.month)
    || start.month < 1 || start.month > 12) throw new RangeError('Invalid monthly window start')
  const day = natal.canonical.chart.pillars.day
  if (!('value' in day)) throw new TypeError('Day stem required to enumerate canonical monthly periods')
  const calendars = [start.year, start.year + 1].flatMap((year) =>
    calculateMonthlyLuck(year, day.value.stem, new Date(input.calculation.referenceTime)).cards.map((card) => ({ year, card })))
  const first = calendars.findIndex(({ year, card }) => year === start.year && card.month === start.month)
  if (first < 0) throw new RangeError('Monthly window start is unavailable')
  const window = calendars.slice(first, first + 12)
  if (window.length !== 12 || window.some(({ card }, index) => card.endInstant <= card.startInstant
    || index > 0 && window[index - 1].card.endInstant.getTime() !== card.startInstant.getTime())) {
    throw new TypeError('Canonical monthly periods do not form a continuous window')
  }
  let priorHistory = input.judgmentCoreEvidence?.priorHistory
  return window.map(({ year, card }, index) => {
    const startInstant = card.startInstant.toISOString()
    const endInstant = card.endInstant.toISOString()
    // Rebuild the current parent chain independently; only event history crosses the month boundary.
    const reading = runSingleInternalReading({ ...input, executionId: recordId('monthly-window-run', [input.executionId, startInstant]),
      judgmentCoreEvidence: { ...input.judgmentCoreEvidence, priorHistory },
      calculation: { ...input.calculation, referenceTime: startInstant, monthlyLuckYear: year },
      natalInspectionPeriod: { periodId: recordId('monthly-window-natal-inspection', [startInstant]),
        from: { kind: 'exact', instant: startInstant }, to: { kind: 'exact', instant: endInstant } } })
    priorHistory = reading.judgmentCore.at(-1) ?? priorHistory
    const { month, sewoon } = reading.luck
    const effectivePeriod: Validity = month.effectivePeriod ?? {
      periodId: recordId('monthly-window-calendar-period', [startInstant]),
      from: { kind: 'exact', instant: startInstant }, to: { kind: 'exact', instant: endInstant },
    }
    if (month.effectivePeriod && (month.pillar !== card.pillar || effectivePeriod.from.kind !== 'exact'
      || effectivePeriod.to.kind !== 'exact' || effectivePeriod.from.instant !== startInstant || effectivePeriod.to.instant !== endInstant)) {
      throw new TypeError('Monthly execution period differs from canonical 절기월')
    }
    const parentSewoon = sewoon.scope && sewoon.effectivePeriod
      ? { id: sewoon.scope.scopeId, pillar: sewoon.pillar, effectivePeriod: sewoon.effectivePeriod }
      : null
    const scopeId = month.calendarStage.scopeId
    const stages = reading.diagnostics.stages.filter((stage) => stage.scopeId === scopeId)
    const judgmentCore = reading.judgmentCore.find((state) => state.scope === 'monthlyLuck') ?? null
    const successState = month.successStage
    const evidenceRefs = sortedUnique([
      ...stages.flatMap((stage) => stage.evidenceIds),
      ...month.relations.flatMap((relation) => relation.evidenceIds),
      ...month.runtimeStates.flatMap((state) => state.evidenceIds),
      ...month.roleFunctions.flatMap((item) => item.postEffect.evidenceIds),
      ...month.roleEffectDeferrals.flatMap((item) => item.evidenceIds),
      ...month.functionEffects.effects.flatMap((effect) => effect.evidenceIds),
    ])
    const parent = reading.judgmentCore.find((state) => state.id === judgmentCore?.parentScopeId)
    // Window entries can be consumed without the full parent chain from this evaluation.
    const parentJudgmentCore = parent ? {
      id: parent.id, scope: parent.scope, actualFunctions: parent.actualFunctions, stemFacts: parent.stemFacts,
    } : null
    return {
      monthIndex: index + 1, calendarYear: year, calendarMonth: card.month, jieName: card.jieName, pillar: card.pillar,
      startInstant, endInstant, effectivePeriod, referenceTime: startInstant, scopeId, scope: month.scope,
      parentSewoonId: parentSewoon?.id ?? null, parentSewoon, natalScopeId: month.natalScopeId,
      natalPatternRef: reading.natal.pattern.judgmentId, natalRoles: reading.natal.roles,
      roleFunctions: month.roleFunctions, relationActions: month.relationActions,
      roleEffectContexts: month.roleEffectContexts, roleEffectDeferrals: month.roleEffectDeferrals, functionEffects: month.functionEffects, relationFacts: month.relations, runtimeStates: month.runtimeStates.filter((state) => state.scopeId === scopeId),
      historicalStateRefs: month.runtimeStates.filter((state) => state.scopeId !== scopeId).map((state) => state.stateId),
      carryRefs: month.carryContext,
      currentApplications: month.currentApplications,
      judgmentCore, parentJudgmentCore,
      publicationAncestors: reading.judgmentCore.filter(state => state.scope === 'greatLuck' || state.scope === 'yearlyLuck')
        .map(({ id, parentScopeId, scope, validity }) => ({ id, parentScopeId, scope, validity })),
      status: month.interpretation.status,
      stageStatus: { calendar: month.calendarStage.status, stemState: month.stemState.status,
        byeong: stages.find((stage) => stage.stageId === 'byeong')?.status ?? 'deferred',
        guEung: stages.find((stage) => stage.stageId === 'gueung')?.status ?? 'deferred',
        successState: successState.status, functionEffects: month.effectFactStage.status },
      reasonCodes: sortedUnique(stages.flatMap((stage) => stage.reasonCodes)),
      evidenceRefs, evidence: reading.diagnostics.evidence.filter((item) => evidenceRefs.includes(item.evidenceId)),
      provenance: month.calendarStage.provenance,
      stages,
    }
  })
}

/** Preserve the current-month result; a window adds independent 절기월 snapshots. */
export function runInternalReading(input: InternalReadingInput) {
  const current = runSingleInternalReading(input)
  if (input.daewoonOnly || !input.monthlyWindowStart) return current
  return { ...current, luck: { ...current.luck, monthlyWindow: runMonthlyWindow(input, current, input.monthlyWindowStart) } }
}
