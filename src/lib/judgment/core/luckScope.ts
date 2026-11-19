import { resolveStructuralEffect, structuralPathKey } from './structuralEffect'
import type { StructuralBlock } from './structuralEffect'
import { evaluateRoleEngine } from './roleEngine'
import type { RoleEngineState } from './roleEngine'
import { observeBladeControl, specialPatternSelection } from './peerPatterns'
import { calculateTenGod } from '../../dayRelationships'
import { detach, recordId, TABLE_REF } from '../producers/shared'
import type { Validity } from '../contracts'
import type { DeepReadonly } from '../types'
import { branchRelations, formations, roots } from './branches'
import type { BranchParticipant } from './branches'
import { combinationHistoryKey, currentCombinationEffects, matchesCombination, recordCombinations } from './combineHistory'
import type { CombinationHistory } from './combineHistory'
import { projectLuckEffects, recordLuckEffects } from './luckEffectLifecycle'
import { lastLuckInstant, luckOriginKey, luckPeriodStatus } from './luckValidity'
import { buildLuckEffects, evaluateConditionalByeong, evaluateCurrentRoles } from './luckEffects'
import type { ScopedPath } from './luckEffects'
import { evaluateYongShenRelations, finalPattern, monthCommand, provisionalPattern } from './pattern'
import { buildPolicyConditions, observePolicyFacts, supersedesPolicyEvidence } from './patternPolicyEvidence'
import type { PatternPolicyEvidence } from './patternPolicyEvidence'
import { foodProtectionPath, officerProtectionPath, policyRoleCandidates } from './patternRoles'
import type { PolicyByeongPath } from './patternRoles'
import { resolveActualFunction, resolvePatternEffectPolicy } from './policies'
import { directScopes, killingFormula, resolveStemRuntime, scopes, stemRelations } from './stems'
import type { CapacityEvidence, ConditionalByeong, FormulaFact, LuckEffectEvent, ManifestationHistory, RoleFunctionBasis, RoleHistory, Scope, StemParticipant, StemRuntime } from './types'

export type ScopePillar = {
  stem?: { id: string; value: string }
  branch?: { id: string; value: BranchParticipant['branch'] }
}
export type LuckScopeInput = {
  scope: Exclude<Scope, 'natal'>
  pillar: ScopePillar
  validity: Validity
  resourceExcessEvidenceIds?: readonly string[]
  capacityEvidence?: CapacityEvidence
  policyEvidence?: readonly PatternPolicyEvidence[]
}
/** Scoped qualitative evidence supplied by the caller; the core does not infer excess from counts. */
export type ResourceExcessEvidence = Partial<Record<Scope, readonly string[]>>
/** Pass a previous snapshot when evaluating a replacement period of the same chart. */
export type JudgmentCoreHistory = {
  combinationHistory: readonly CombinationHistory[]
  luckEffectHistory: readonly LuckEffectEvent[]
  patternContext: { manifestationHistory: readonly ManifestationHistory[] }
}

export type JudgmentCoreInput = {
  executionId: string
  referenceTime?: string
  priorHistory?: JudgmentCoreHistory
  natal: Partial<Record<'year' | 'month' | 'day' | 'time', ScopePillar>>
  natalValidity: Validity
  natalCombinations: readonly (readonly string[])[] | null
  roleHistory?: readonly RoleHistory[]
  roleFunctionBases?: readonly RoleFunctionBasis[]
  natalCapacityEvidence?: CapacityEvidence
  natalPolicyEvidence?: readonly PatternPolicyEvidence[]
  conditionalByeong?: readonly ConditionalByeong[]
  resourceExcessEvidenceIds?: readonly string[]
  luck: readonly LuckScopeInput[]
}

const freeze = <T>(value: T): DeepReadonly<T> => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value as DeepReadonly<T>
}

export type LuckScopeState = ReturnType<typeof runJudgmentCore>[number]

export function runJudgmentCore(input: JudgmentCoreInput) {
  if (input.luck.some((item, index) => item.scope !== scopes[index + 1])) {
    throw new TypeError('Expected a contiguous natal-to-luck chain')
  }
  const past = input.luck.flatMap((item, index) => {
    if (luckPeriodStatus(item.validity, input.referenceTime) !== 'expired') return []
    // Replay through the supplied period while it was valid. Import history only,
    // leaving historical runtime and policy inputs out of the current pass.
    return evaluateChain({ ...input, luck: input.luck.slice(0, index + 1),
      referenceTime: lastLuckInstant(item.validity) }).slice(-1)
  })
  const histories = [...(input.priorHistory ? [input.priorHistory] : []), ...past]
  const current = evaluateChain(input, histories)
  const historicalManifestations = histories.flatMap(({ patternContext }) => patternContext.manifestationHistory)
  let latest = current[0]
  let index = 1
  const requested = input.luck.map(({ scope, validity }) => {
    if (luckPeriodStatus(validity, input.referenceTime) === 'effective') {
      latest = current[index++]
      return latest
    }
    // Preserve the requested snapshot and its history without evaluating an inactive pillar
    // or restricting the currently effective parent's comparison range.
    const id = recordId('p0-scope', [input.executionId, luckOriginKey(scope, validity)])
    const periodKey = luckOriginKey(scope, validity)
    const manifestationHistory = mergeManifestationHistory(historicalManifestations, latest.patternContext.manifestationHistory)
    return freeze(detach({
      ...latest, id, scope, validity, parentScopeId: latest.id,
      patternContext: { ...latest.patternContext, manifestationHistory },
      provisionalPatternContext: { ...latest.provisionalPatternContext, manifestationHistory },
      combinations: [], formulas: [], luckEffects: [],
      combinationEffects: latest.combinationEffects.map((effect) => ({
        ...effect, inherited: periodKey !== luckOriginKey(effect.originScope, effect.originPeriod),
      })),
      luckEffectStates: latest.luckEffectStates.map((effect) => ({
        ...effect, inherited: periodKey !== luckOriginKey(effect.originScope, effect.originPeriod),
      })),
    }))
  })
  return Object.freeze([current[0], ...requested])
}

function uniqueBy<T>(items: readonly T[], key: (item: T) => string) {
  const unique = new Map<string, T>()
  for (const item of items) {
    const id = key(item)
    if (!unique.has(id)) unique.set(id, item)
  }
  return [...unique.values()]
}

function mergeManifestationHistory(past: readonly ManifestationHistory[], current: readonly ManifestationHistory[]) {
  return uniqueBy([...past, ...current], ({ entityId, manifestationScope, originPeriod }) => JSON.stringify([
    entityId, manifestationScope !== 'natal' && originPeriod ? luckOriginKey(manifestationScope, originPeriod) : manifestationScope,
  ]))
}

function evaluateChain(input: JudgmentCoreInput, histories: readonly JudgmentCoreHistory[] = []) {
  const day = input.natal.day?.stem?.value
  const command = monthCommand(day, input.natal.month?.branch?.value)
  const stems: StemParticipant[] = []
  const branches: BranchParticipant[] = []
  const roleHistory = input.roleHistory ?? []
  const stageInputs = [{ scope: 'natal' as const, validity: input.natalValidity,
    resourceExcessEvidenceIds: input.resourceExcessEvidenceIds, capacityEvidence: input.natalCapacityEvidence, policyEvidence: input.natalPolicyEvidence },
  ...input.luck.filter(({ validity }) => luckPeriodStatus(validity, input.referenceTime) === 'effective')]

  let previousRuntime = new Map<string, StemRuntime>()
  let previousHistory: ReturnType<typeof provisionalPattern>['manifestationHistory'] = []
  let inheritedClashes: readonly string[] = []
  let parentScopeId: string | null = null
  const historicalCombinations = histories.flatMap(({ combinationHistory }) => combinationHistory)
  let chainCombinations: CombinationHistory[] = []
  let luckEffectHistory = uniqueBy(histories.flatMap((history) => history.luckEffectHistory), ({ id }) => id)
  const historicalManifestations = histories.flatMap(({ patternContext }) => patternContext.manifestationHistory)
  const activeLuckSources = new Map<string, string>()
  let carriedPaths: ScopedPath[] = []
  let priorRoleEngine: RoleEngineState | null = null
  let previousByeong: PolicyByeongPath[] = []
  let natalGuEung: ReturnType<typeof policyRoleCandidates>['guEung'] = []
  let natalConditional: ConditionalByeong[] = []
  let carriedEvidence: readonly PatternPolicyEvidence[] = []
  let natalFacts: ReturnType<typeof stemRelations> = []
  let parentEffects: Parameters<typeof buildLuckEffects>[2] = null
  return Object.freeze(stageInputs.map((item) => {
    const { scope, validity } = item
    const periodKey = luckOriginKey(scope, validity)
    const id = recordId('p0-scope', [input.executionId, periodKey])
    const pillars = 'pillar' in item ? [['luck', item.pillar] as const]
      : (['year', 'month', 'time', 'day'] as const).map((position) => [position, input.natal[position]] as const)
    for (const [position, pillar] of pillars) {
      if (pillar?.stem && day) stems.push({ id: pillar.stem.id, stem: pillar.stem.value, scope, position,
        tenGod: calculateTenGod(day, pillar.stem.value), dayMaster: position === 'day' })
      if (pillar?.branch) branches.push({ id: pillar.branch.id, branch: pillar.branch.value, scope })
    }
    const direct = directScopes(scope)
    const directStems = stems.filter((stem) => direct.includes(stem.scope))
    const directBranches = branches.filter((branch) => direct.includes(branch.scope))
    const provisional = provisionalPattern(id, scope, command, stems, previousHistory, previousRuntime, validity)
    const resolved = day && input.natalCombinations !== null
      ? resolveStemRuntime(scope, directStems, previousRuntime, input.natalCombinations)
      : { runtime: new Map<string, StemRuntime>(), combinations: [] }
    const { runtime, combinations } = resolved
    const effective = finalPattern(provisional, runtime)
    const manifestationHistory = scope === 'natal' ? provisional.manifestationHistory
      : mergeManifestationHistory(historicalManifestations, provisional.manifestationHistory)
    const patternBasis = input.natalCombinations === null ? { ...effective, patternMode: null } : effective
    const stemFacts = stemRelations(id, directStems)
    if (scope === 'natal') natalFacts = stemFacts
    const originEvents = recordCombinations(combinations, stemFacts, scope, id, patternBasis.id, validity)
      .filter((event) => !chainCombinations.some((prior) => prior.effect === event.effect && matchesCombination(prior, event.relation)))
    chainCombinations = [...chainCombinations, ...originEvents]
    const combinationHistory = uniqueBy([...historicalCombinations, ...chainCombinations], combinationHistoryKey)
    const combinationEffects = currentCombinationEffects(combinationHistory, runtime, scope, validity, input.referenceTime, chainCombinations)
    const effectiveKeys = new Set(combinationHistory.filter((_, index) => combinationEffects[index].currentlyEffective).map(combinationHistoryKey))
    const effectiveEvents = chainCombinations.filter((event) => effectiveKeys.has(combinationHistoryKey(event)))
    const branchFacts = branchRelations(id, directBranches)
    const formationFacts = formations(id, branches)
    const root = roots(id, stems, branches, branchFacts, formationFacts, inheritedClashes)
    const formulas: FormulaFact[] = originEvents.flatMap(({ formula }) => formula ? [formula] : [])
    const bladeFacts = observeBladeControl(id, patternBasis.branchPattern, input.natal.month?.branch?.id,
      command.candidates.find(({ sourceClass }) => sourceClass === 'main')?.stem, directStems)
    const patternFacts = [...observePolicyFacts(id, patternBasis, directStems), ...bladeFacts]
    const policyRuntime = new Map(runtime)
    if (runtime.size) bladeFacts.forEach(({ target }) => policyRuntime.set(target.id, 'active'))
    const capacity = item.capacityEvidence?.evidenceIds.length ? item.capacityEvidence : parentEffects?.capacity ?? null
    const newEvidence = item.policyEvidence?.filter(({ evidenceIds }) => evidenceIds.length) ?? []
    carriedEvidence = [...newEvidence, ...carriedEvidence.filter((prior) =>
      !newEvidence.some((current) => supersedesPolicyEvidence(current, prior)))]
    const contextualize = buildPolicyConditions(patternBasis, stemFacts, runtime, root.states, effectiveEvents, carriedEvidence, capacity, bladeFacts)
    const parentPaths = new Map(carriedPaths.map(({ fact, actual }) => [structuralPathKey(fact), actual]))
    const blocks = new Map<string, StructuralBlock>()
    const actualFunctions = [...stemFacts, ...patternFacts].map((relation) => {
      const validCombination = relation.action === 'combine' && effectiveEvents.some((event) => matchesCombination(event, relation))
      const { conditions, refs, rootedSource, wealthDamageRefs, blockedRefs, flowConstraint, verifiedDamage } = contextualize(relation)
      if (item.resourceExcessEvidenceIds?.length) {
        conditions.add('resource_excessive')
        refs.push(...item.resourceExcessEvidenceIds)
      }
      const basePolicy = resolvePatternEffectPolicy(patternBasis, relation, conditions, refs)
      const peerDamage = ['PEER-06', 'ROB-03'].includes(basePolicy.policyId ?? '')
      const mitigated = peerDamage && conditions.has('protected_peer_wealth')
      const harmfulWealth = peerDamage && conditions.has('wealth_is_harmful')
      const policy = basePolicy.policyId === 'WEALTH-05' && (!rootedSource || !wealthDamageRefs.length)
        || basePolicy.policyId === 'OFF-03' && !rootedSource
        ? { ...basePolicy, byeongCandidate: false } : basePolicy.policyId === 'WEALTH-05'
          ? { ...basePolicy, conditionEvidence: wealthDamageRefs } : basePolicy.policyId === 'HO-03' && verifiedDamage
            ? { ...basePolicy, byeongCandidate: true, conditionEvidence: refs }
            : peerDamage ? { ...basePolicy, direction: harmfulWealth ? 'deferred' as const : basePolicy.direction,
              byeongCandidate: rootedSource && !mitigated && !harmfulWealth,
              ...(refs.length ? { conditionEvidence: refs } : {}) } : basePolicy
      const formulaType = (relation.action === 'coexist' ? undefined : killingFormula(relation, false))
        ?? (policy.ruleId === 'EX-046' ? 'ResourceExcessUsesWealth' : undefined)
      if (formulaType) formulas.push({ id: recordId('p0-formula', [relation.id, formulaType]), formulaType,
        relationFactIds: [relation.id], patternContextId: patternBasis.id, validity })
      const rootEvidence = root.states.filter(({ entityId }) => entityId === relation.source.id || entityId === relation.target.id)
      const actual = resolveActualFunction(policy, patternBasis, relation, policyRuntime, rootEvidence,
        [...new Set(rootEvidence.flatMap(({ formationIds }) => formationIds))], validCombination,
        capacity?.evidenceIds, conditions.has('killing_removed') || conditions.has('officer_removed'))
      if (mitigated && actual.function === 'operating') return { ...actual, function: 'reduced' as const, resolutionEvidence: refs }
      if (blockedRefs.length) blocks.set(relation.id, { kind: 'required_path_blocked', evidenceRefs: blockedRefs })
      return flowConstraint ? { ...actual, flowConstraint: 'excessive_resource_and_day' as const,
        ...(actual.function === 'operating' ? { function: 'reduced' as const } : {}) } : actual
    })
    const directIds = new Set([...directStems, ...directBranches].map(({ id }) => id))
    const paths = [...stemFacts, ...patternFacts].flatMap((fact, i) =>
      fact.action === 'coexist' ? [] : [{ fact, actual: actualFunctions[i], observationIndex: i }])
    for (const path of paths) {
      const protection = path.actual.policyId === 'FOOD-05' ? foodProtectionPath(path, paths)
        : path.actual.policyId === 'OFF-03' ? officerProtectionPath(path, paths) : undefined
      const block = protection ? { kind: 'active_protection' as const, evidenceRefs: [protection.fact.id],
        protectorId: protection.fact.source.id } : blocks.get(path.fact.id)
      const prior = parentPaths.get(structuralPathKey(path.fact))
      const oldBlock = prior?.structuralEffect?.blockedBy
      const reactivation = oldBlock?.kind === 'active_protection' ? {
        protectorStopped: runtime.get(oldBlock.protectorId) === 'stopped',
        protectionBroken: path.actual.policyId === 'OFF-03' && paths.some(({ fact, actual }) =>
          fact.target.id === oldBlock.protectorId && actual.policyId === 'OFF-04'
          && (actual.function === 'operating' || actual.function === 'reduced')),
      } : undefined
      const resolved = resolveStructuralEffect(scope, path.fact, path.actual, policyRuntime, prior, block, reactivation)
      path.actual = resolved
      actualFunctions[path.observationIndex] = resolved
    }
    const patternContext = { ...patternBasis, specialYongShen: specialPatternSelection(patternBasis.branchPattern, stems, runtime), yongShenRelations: evaluateYongShenRelations(patternBasis, stemFacts, actualFunctions,
      effectiveEvents.filter(({ effect }) => effect === 'stopped').map(({ relation }) => relation)) }
    // Inherited positional/protection blocks survive even when the participants leave the ordinary comparison range.
    carriedPaths = [...paths, ...carriedPaths.filter(({ fact }) => !directIds.has(fact.source.id) || !directIds.has(fact.target.id))
      .map(({ fact, actual }) => {
        const refreshed = resolveActualFunction(actual, patternBasis, fact, policyRuntime,
          root.states.filter(({ entityId }) => entityId === fact.source.id || entityId === fact.target.id),
          actual.formationEvidence, fact.action === 'combine' && effectiveEvents.some((event) => matchesCombination(event, fact)))
        return { fact, actual: resolveStructuralEffect(scope, fact, refreshed, policyRuntime, actual) }
      })]
    const currentRoles = evaluateCurrentRoles(roleHistory, input.roleFunctionBases ?? [], runtime, carriedPaths)
    if (scope === 'natal') {
      natalConditional = paths.filter(({ actual }) => ['WEALTH-01', 'FOOD-01', 'FOOD-04', 'PEER-03'].includes(actual.policyId ?? '')
        && actual.function === 'operating')
        .map(({ fact, actual }) => ({ kind: 'can_generate_future_killing', sourceEntityId: fact.target.id,
          supportingRelationFactId: fact.id, requiresHarmfulKilling: true,
          ...(actual.policyId === 'PEER-03' ? { triggerPolicyId: 'PEER-05' as const }
            : actual.policyId !== 'WEALTH-01' ? { triggerPolicyId: 'FOOD-03' as const } : {}), status: 'conditional' }))
    }
    const suppliedConditional = input.conditionalByeong ?? []
    const conditionalByeong = evaluateConditionalByeong([...suppliedConditional, ...natalConditional.filter((candidate) =>
      !suppliedConditional.some(({ supportingRelationFactId }) => supportingRelationFactId === candidate.supportingRelationFactId))],
    carriedPaths, natalFacts)
    const luck = stems.find((stem) => scope !== 'natal' && stem.scope === scope)
    if (luck) activeLuckSources.set(periodKey, luck.id)
    const patternRoles = policyRoleCandidates(scope, carriedPaths, previousByeong, effectiveEvents, luck, carriedEvidence)
    previousByeong = patternRoles.byeong
    if (scope === 'natal') natalGuEung = patternRoles.guEung
    const roleEngine = evaluateRoleEngine({ scope, stems, luck, pattern: patternContext, special: patternContext.specialYongShen,
      runtime, rootStates: root.states, paths: carriedPaths, effectiveCombinations: effectiveEvents, natalFacts, policyRoles: { ...patternRoles, guEung: natalGuEung },
      existingRoles: roleHistory, existingCurrent: currentRoles, conditionalByeong, prior: priorRoleEngine })
    priorRoleEngine = roleEngine
    const effectState = { patternContext, currentRoles, conditionalByeong, capacity, rootStates: root.states, formationFacts }
    const luckEffects = buildLuckEffects(scope, luck, parentEffects,
      effectState, roleHistory, carriedPaths, originEvents.map(({ relation }) => relation), input.roleFunctionBases ?? [])
    const projectionContext = { ...effectState, paths: carriedPaths, roles: roleEngine.currentRoles,
      byeong: patternRoles.byeong, combinations: effectiveEvents }
    const recorded = recordLuckEffects([...luckEffects, ...patternRoles.luckEffects, ...roleEngine.luckEffects],
      id, validity, projectionContext, parentEffects?.formationFacts ?? [])
    const knownIds = new Set(luckEffectHistory.map(({ id }) => id))
    const newEvents = recorded.filter((event) => !knownIds.has(event.id))
    luckEffectHistory = [...luckEffectHistory, ...newEvents]
    const luckEffectStates = projectLuckEffects(luckEffectHistory, periodKey, input.referenceTime, activeLuckSources, projectionContext)
    parentEffects = effectState
    const snapshot = freeze(detach({
      id, scope, parentScopeId, validity, provisionalPatternContext: { ...provisional, manifestationHistory },
      patternContext: { ...patternContext, manifestationHistory },
      directEntityIds: [...directStems, ...directBranches].map(({ id }) => id),
      formationBranchPool: branches, formationFacts, branchFacts, stemFacts, patternFacts, formulas, actualFunctions,
      roleEngine,
      policyRoles: { sangShen: patternRoles.sangShen, byeong: patternRoles.byeong, guEung: natalGuEung },
      runtime: [...runtime].map(([entityId, state]) => ({ entityId, state })),
      runtimeStatus: day && input.natalCombinations !== null ? 'resolved' as const : 'deferred' as const,
      combinations: originEvents.map(({ participants, effect, ruleId }) => ({ participants, effect, ruleId })),
      combinationHistory, combinationEffects,
      inheritedRoleFunctions: carriedPaths.slice(paths.length).filter(({ fact, actual }) =>
        actual.structuralEffect?.blockedBy || currentRoles.some(({ functionRefs }) => functionRefs?.includes(fact.id))
        || conditionalByeong.some(({ triggerRelationFactId }) => triggerRelationFactId === fact.id)),
      rootFacts: root.facts, rootStates: root.states, roleHistory, currentRoles,
      conditionalByeong, capacity, luckEffects: newEvents, luckEffectHistory, luckEffectStates,
      evidence: { hiddenStemTableRef: TABLE_REF, ruleIds: ['EX-011', 'EX-135', 'EX-133', 'EX-056'],
        resourceExcessEvidenceIds: item.resourceExcessEvidenceIds ?? [],
        overrides: command.branchPattern === '羊刃' ? [{ ruleId: 'EX-026',
          evidenceStatus: 'FILUNE_APPROVED_OVERRIDE', conflict: 'SOURCE_CONFLICT' }] : [] },
    }))
    previousRuntime = runtime
    previousHistory = provisional.manifestationHistory
    inheritedClashes = root.clashed
    parentScopeId = id
    return snapshot
  }))
}
