import { evaluateStemEffectiveness, evaluateStemFunctionEffects, generationCanReach, resolveStructuralEffect, structuralPathKey } from './structuralEffect'
import { evaluateStructuralSuccess } from './structuralSuccess'
import type { StructuralBlock } from './structuralEffect'
import { evaluateRoleEngine } from './roleEngine'
import type { RoleEngineState } from './roleEngine'
import { observeBladeControl, specialPatternSelection } from './peerPatterns'
import { calculateTenGod } from '../../dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from '../../hiddenStemRoleTable'
import { calculateTwelveStage, TWELVE_STAGE_RULES } from '../../twelveStages'
import type { HeavenlyStem } from '../../twelveStages'
import { detach, recordId, TABLE_REF } from '../producers/shared'
import type { Validity } from '../contracts'
import type { DeepReadonly } from '../types'
import { branchRelations, evaluateBranchDamage, formations, resolveBranchRuntime, roots } from './branches'
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
import { functionDamageEstablished, resolveActualFunction, resolvePatternEffectPolicy } from './policies'
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
  unconfirmedBranchMainIds?: readonly string[]
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
  let inheritedClashes: ReturnType<typeof branchRelations> = []
  let inheritedBindings: ReturnType<typeof branchRelations> = []
  let priorBranchActions: ReturnType<typeof evaluateBranchDamage>['relations'] = []
  let parentScopeId: string | null = null
  const historicalCombinations = histories.flatMap(({ combinationHistory }) => combinationHistory)
  let chainCombinations: CombinationHistory[] = []
  let luckEffectHistory = uniqueBy(histories.flatMap((history) => history.luckEffectHistory), ({ id }) => id)
  const historicalManifestations = histories.flatMap(({ patternContext }) => patternContext.manifestationHistory)
  const activeLuckSources = new Map<string, string>()
  let carriedPaths: ScopedPath[] = []
  let priorRoleEngine: RoleEngineState | null = null
  let inheritedCapacity: CapacityEvidence | null = null
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
    const directBranchIds = new Set(directBranches.map(({ id }) => id))
    // OP-Z10/11: retain the clash Fact and only attenuate its action through
    // a formation that participates in the current comparison.
    const branchRuntime = resolveBranchRuntime(directBranches, branchFacts,
      formationFacts.filter(({ participants }) => participants.every(id => directBranchIds.has(id))))
    const carriedClashes = inheritedClashes.filter(({ participants }) => !participants.every((id) => directBranchIds.has(id)))
    const bindings = [...inheritedBindings.filter(({ participants }) => !participants.every((id) => directBranchIds.has(id))),
      ...branchFacts.filter(({ kind }) => kind === 'six_combination')]
    const currentClashes = branchFacts.filter(({ kind, id }) => kind === 'clash'
      && branchRuntime.effects.some(({ relationId, effect }) => relationId === id && effect === 'active'))
    const root = roots(id, stems, branches, branchFacts, formationFacts,
      carriedClashes.flatMap(({ participants }) => participants), branchRuntime.effects)
    const formulas: FormulaFact[] = originEvents.flatMap(({ formula }) => formula ? [formula] : [])
    const bladeFacts = observeBladeControl(id, patternBasis.branchPattern, input.natal.month?.branch?.id,
      command.candidates.find(({ sourceClass }) => sourceClass === 'main')?.stem, directStems)
    const patternFacts = [...observePolicyFacts(id, patternBasis, directStems), ...bladeFacts]
    const policyRuntime = new Map(runtime)
    if (runtime.size) bladeFacts.forEach(({ target }) => policyRuntime.set(target.id, 'active'))
    const dayId = input.natal.day?.stem?.id
    const dayRootState = root.states.find(({ entityId }) => entityId === dayId)?.state
    const branchDamage = evaluateBranchDamage(id, day, patternBasis.branchPattern, directBranches,
      (['year', 'month', 'day', 'time'] as const).map((position) => input.natal[position]?.branch?.id),
      input.natal.month?.branch?.id, root.clashed, formationFacts, new Set(input.unconfirmedBranchMainIds),
      bindings.flatMap(({ participants }) => participants), priorBranchActions, bindings, {
        scope, facts: branchFacts, effects: branchRuntime.effects,
        operatingStems: directStems.filter(stem => !stem.dayMaster && ['active', 'weakened'].includes(runtime.get(stem.id) ?? '')),
        dayRoot: dayRootState ? { state: dayRootState, facts: root.facts.filter(({ stemEntityId }) => stemEntityId === dayId) } : undefined,
      })
    priorBranchActions = branchDamage.relations
    const dayRootAbsent = root.states.some(({ entityId, state }) => entityId === dayId && state === 'absent')
    const capacityRisk = dayRootAbsent
      ? stemFacts.find(({ source, target, action }) => action === 'control' && target.dayMaster
        && source.tenGod === '偏官' && runtime.get(source.id) === 'active' && runtime.get(target.id) === 'active'
        && root.states.some(({ entityId, state }) => entityId === source.id && state === 'strengthened')) : undefined
    const feed = capacityRisk && stemFacts.find(({ source, target, action }) => action === 'generate'
      && target.id === capacityRisk.source.id && ['正財', '偏財'].includes(source.tenGod)
      && generationCanReach(runtime.get(source.id), runtime.get(target.id),
        root.states.find(({ entityId }) => entityId === source.id)?.state))
    const suppliedCapacity = item.capacityEvidence?.evidenceIds.length ? item.capacityEvidence : inheritedCapacity
    inheritedCapacity = suppliedCapacity
    const capacity = suppliedCapacity ?? (capacityRisk && feed
      ? { state: 'killing_capacity_insufficient', evidenceIds: ['R-033', capacityRisk.id, feed.id] }
      : branchDamage.outputRefs.length && dayRootAbsent
        ? { state: 'output_capacity_insufficient', evidenceIds: ['R-038', ...branchDamage.outputRefs] } : null)
    const newEvidence = item.policyEvidence?.filter(({ evidenceIds }) => evidenceIds.length) ?? []
    carriedEvidence = [...newEvidence, ...carriedEvidence.filter((prior) =>
      !newEvidence.some((current) => supersedesPolicyEvidence(current, prior)))]
    const luckClashes = branchFacts.filter(({ kind }) => kind === 'clash').flatMap(({ id, participants }) => {
      const scopes = participants.flatMap((id) => branches.filter((branch) => branch.id === id).map((branch) => branch.scope))
      return scopes.length === 2 && scopes.every((scope) => scope !== 'natal') ? [{ id, scopes }] : []
    })
    const requiredResourceRefs = new Map(carriedPaths.flatMap(({ fact, actual }) =>
      actual.policyId === 'HO-06' && actual.structuralEffect?.currentlyEffective && actual.conditionEvidence?.length
        && runtime.get(fact.target.id) !== 'stopped' ? [[fact.target.id, actual.conditionEvidence] as const] : []))
    const contextualize = buildPolicyConditions(patternBasis, stemFacts, runtime, root.states, effectiveEvents,
      carriedEvidence, capacity, bladeFacts, luckClashes, requiredResourceRefs)
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
    const isControllerAttack = ({ fact, actual }: ScopedPath) => fact.action === 'control'
      && runtime.get(fact.source.id) !== 'stopped' && !blocks.has(fact.id)
      && (functionDamageEstablished(actual) || ['BLADE-04', 'BLADE-05'].includes(actual.policyId ?? '')
        && actual.byeongCandidate && Boolean(actual.conditionEvidence?.length))
      && ['OFF-04', 'KILL-04-required-food', 'HO-06', 'BLADE-04', 'BLADE-05'].includes(actual.policyId ?? '')
    const controllerAttacks = paths.filter(isControllerAttack)
    const rooted = (id: string) => root.states.some(state => state.entityId === id
      && (state.state === 'present' || state.state === 'strengthened'))
    const available = ({ fact, actual }: ScopedPath) => ['operating', 'reduced'].includes(actual.function)
      && !blocks.has(fact.id) && runtime.get(fact.source.id) !== 'stopped' && runtime.get(fact.target.id) !== 'stopped'
    const carriesKilling = [...paths, ...carriedPaths.filter(({ fact }) =>
      !directIds.has(fact.source.id) || !directIds.has(fact.target.id))].filter(available)
    const killingProtection = new Map<string, {
      guard?: ScopedPath; damage: ScopedPath[]; feed?: ScopedPath; residual?: boolean; unopposed?: boolean; refs?: string[]
    }>()
    for (const { fact } of carriesKilling) {
      if (fact.action !== 'control' || fact.source.tenGod !== '偏官' || !fact.target.dayMaster) continue
      const guards = carriesKilling.filter(({ fact: path }) => path.action === 'generate' && path.source.id === fact.source.id
        && ['印綬', '偏印'].includes(path.target.tenGod) && rooted(path.target.id)
        && carriesKilling.some(({ fact: tail }) => tail.action === 'generate' && tail.source.id === path.target.id && tail.target.id === fact.target.id))
      const damage = guards.flatMap(({ fact: guard }) => paths.filter(path => available(path)
        && path.fact.action === 'control' && path.fact.target.id === guard.target.id && rooted(path.fact.source.id)
        && ['正財', '偏財'].includes(path.fact.source.tenGod)))
      const guard = guards.find(({ fact: guard }) => !damage.some(({ fact: attack }) => attack.target.id === guard.target.id))
      const feed = carriesKilling.find(({ fact: supply }) => supply.action === 'generate' && supply.target.id === fact.source.id
        && ['正財', '偏財'].includes(supply.source.tenGod) && rooted(supply.source.id))
      const otherControl = carriesKilling.some(({ fact: control, actual }) =>
        control.action === 'control' && control.target.id === fact.source.id && rooted(control.source.id)
        && ['KILL-01', 'KILL-08', 'HO-04'].includes(actual.policyId ?? '')
        && !controllerAttacks.some(({ fact: attack }) => attack.target.id === control.source.id))
      const oldGuard = parentPaths.get(structuralPathKey(fact))?.structuralEffect?.mitigatedBy?.protectorId
      const guardStop = oldGuard && !guard && !otherControl && effectiveEvents.find(({ effect, participants }) =>
        effect === 'stopped' && participants.includes(oldGuard))
      if (feed && rooted(fact.source.id) && guardStop) {
        killingProtection.set(structuralPathKey(fact), { damage: [], feed, unopposed: true,
          refs: [guardStop.relation.id, feed.fact.id] })
        continue
      }
      const remoteFood = input.natalCombinations !== null && patternBasis.branchPattern === '正財'
        && fact.source.scope === 'natal' && fact.source.position === 'year'
        ? carriesKilling.find(({ fact: control }) => control.action === 'control' && control.target.id === fact.source.id
          && control.source.tenGod === '食神' && control.source.scope === 'natal' && control.source.position === 'time'
          && rooted(control.source.id)) : undefined
      const unopposed = scope === 'yearlyLuck' && fact.source.scope === scope && rooted(fact.source.id)
        && patternBasis.branchPattern === '食神'
        && branchDamage.paths.some(({ damagedFunction, state }) => damagedFunction === 'branch_food' && state === 'active')
        && !guards.length && !carriesKilling.some(({ fact: path }) => path.action === 'control' && path.target.id === fact.source.id
          && ['食神', '傷官'].includes(path.source.tenGod) && rooted(path.source.id))
      if (unopposed) {
        killingProtection.set(structuralPathKey(fact), { damage: [], unopposed: true })
        continue
      }
      const attestedResidual = carriedEvidence.find(({ entityId, condition, evidenceIds }) =>
        entityId === fact.source.id && condition === 'harmful_killing' && evidenceIds.length)
      if (!guards.length && dayRootAbsent && feed && attestedResidual
        && carriesKilling.some(({ fact: control, actual }) => control.target.id === fact.source.id
          && ['HO-04', 'KILL-08', 'KILL-01'].includes(actual.policyId ?? ''))) {
        const refs = [...attestedResidual.evidenceIds, feed.fact.id]
        killingProtection.set(structuralPathKey(fact), { damage: [], feed, residual: true, refs })
        continue
      }
      if ((!otherControl || guard) && (guards.length || remoteFood && feed && rooted(fact.source.id))) {
        const residual = Boolean(feed && rooted(fact.source.id) && (remoteFood || guard
          && patternBasis.branchPattern === '偏官' && fact.source.scope === 'natal'))
        killingProtection.set(structuralPathKey(fact), { guard: guard ?? remoteFood, damage, feed, residual })
      }
    }
    const controllerAttackRefs = (controllerId: string) => controllerAttacks.filter(({ fact }) => fact.target.id === controllerId)
      .map(({ fact }) => fact.id)
    const protectionChange = (protectorId: string) => {
      const attackRefs = controllerAttackRefs(protectorId)
      const stopRefs = effectiveEvents.filter(({ effect, participants }) => effect === 'stopped' && participants.includes(protectorId))
        .map(({ relation }) => relation.id)
      const lostRoots = root.states.find(({ entityId, state }) => entityId === protectorId && state === 'weakened')
      const damagedRootBranches = new Set(root.facts.filter(({ stemEntityId }) => stemEntityId === protectorId)
        .map(({ branchEntityId }) => branchEntityId))
      const rootClashRefs = lostRoots ? [...carriedClashes, ...currentClashes].filter(({ participants }) =>
        participants.some((id) => damagedRootBranches.has(id))).map(({ id }) => id) : []
      return { protectorStopped: runtime.get(protectorId) === 'stopped',
        protectionBroken: attackRefs.length > 0 || rootClashRefs.length > 0,
        evidenceRefs: [...attackRefs, ...stopRefs, ...rootClashRefs, ...(lostRoots?.factIds ?? [])] }
    }
    for (const path of paths) {
      const killing = killingProtection.get(structuralPathKey(path.fact))
      const prior = parentPaths.get(structuralPathKey(path.fact))
      // PA-202 and PA-204. Conversion is a scoped protection of the exact
      // day-master attack. Reopen it only when rooted wealth both feeds the
      // attacker and reaches every available resource mediator.
      if (killing && (killing.guard || killing.residual || killing.unopposed || killing.feed && killing.damage.length)) {
        const guard = killing.guard
        const policyId = 'killing-pressure-after-protection'
        const tail = guard?.fact.action === 'generate' ? carriesKilling.find(({ fact }) =>
          fact.action === 'generate' && fact.source.id === guard.fact.target.id && fact.target.id === path.fact.target.id) : undefined
        const refs = guard ? [guard.fact.id, ...(tail ? [tail.fact.id] : []),
          ...(killing.residual && killing.feed ? [killing.feed.fact.id] : [])]
          : killing.refs ?? [...killing.damage.map(({ fact }) => fact.id), ...(killing.feed ? [killing.feed.fact.id]
            : branchDamage.paths.filter(({ damagedFunction }) => damagedFunction === 'branch_food').flatMap(({ relationRefs }) => relationRefs))]
        path.actual = resolveStructuralEffect(scope, path.fact, { ...path.actual,
          policyId, selectedPolicy: policyId, matchedPolicies: [policyId], selectionReason: 'specific_conditions',
          ruleId: guard && !killing.residual ? 'PA-202' : killing.unopposed ? 'SG-034' : 'PA-204',
          evidenceStatus: 'SOURCE_INFERENCE', direction: 'unfavorable', byeongCandidate: true,
          ...(killing.residual && { function: 'reduced' as const }), conditionEvidence: refs,
        }, policyRuntime, prior, guard && !killing.residual ? { kind: 'active_protection', protectorId: guard.fact.target.id, evidenceRefs: refs } : undefined,
        guard && !killing.residual ? undefined : { protectorStopped: false, protectionBroken: !guard, evidenceRefs: refs })
        if (guard && killing.residual && path.actual.structuralEffect?.currentlyEffective) {
          const protectorId = guard.fact.action === 'control' ? guard.fact.source.id : guard.fact.target.id
          path.actual = { ...path.actual, structuralEffect: { ...path.actual.structuralEffect,
            mitigatedBy: { protectorId, evidenceRefs: [guard.fact.id, ...(tail ? [tail.fact.id] : [])] } } }
        }
        actualFunctions[path.observationIndex] = path.actual
        continue
      }
      const protection = path.actual.policyId === 'FOOD-05' ? foodProtectionPath(path, paths)
        : path.actual.policyId === 'OFF-03' ? officerProtectionPath(path, paths) : undefined
      const block = protection && !controllerAttackRefs(protection.fact.source.id).length
        ? { kind: 'active_protection' as const, evidenceRefs: [protection.fact.id],
        protectorId: protection.fact.source.id } : blocks.get(path.fact.id)
      const oldBlock = prior?.structuralEffect?.blockedBy
      const reactivation = oldBlock?.kind === 'active_protection' ? protectionChange(oldBlock.protectorId) : undefined
      const resolved = resolveStructuralEffect(scope, path.fact, path.actual, policyRuntime, prior, block, reactivation)
      path.actual = resolved
      actualFunctions[path.observationIndex] = resolved
    }
    // Inherited positional/protection blocks survive even when the participants leave the ordinary comparison range.
    carriedPaths = [...paths, ...carriedPaths.filter(({ fact }) => !directIds.has(fact.source.id) || !directIds.has(fact.target.id))
      .map(({ fact, actual }) => {
        const refreshed = resolveActualFunction(actual, patternBasis, fact, policyRuntime,
          root.states.filter(({ entityId }) => entityId === fact.source.id || entityId === fact.target.id),
          actual.formationEvidence, fact.action === 'combine' && effectiveEvents.some((event) => matchesCombination(event, fact)))
        const oldBlock = actual.structuralEffect?.blockedBy
        return { fact, actual: resolveStructuralEffect(scope, fact, refreshed, policyRuntime, actual, undefined,
          oldBlock?.kind === 'active_protection' ? protectionChange(oldBlock.protectorId) : undefined) }
      })]
    const monthBranch = input.natal.month?.branch?.value
    const rootBasis = root.states.map((state) => {
      const stem = stems.find(({ id }) => id === state.entityId)?.stem as HeavenlyStem | undefined
      return { ...state, ...(stem && monthBranch && Object.hasOwn(TWELVE_STAGE_RULES, stem)
        ? { monthStage: calculateTwelveStage(stem, monthBranch) } : {}) }
    })
    const stemFunctionEffects = evaluateStemFunctionEffects(carriedPaths.filter(({ actual }) =>
      actual.structuralEffect?.currentlyEffective).map(({ fact }) => fact), runtime, rootBasis)
    const stemEffectiveness = evaluateStemEffectiveness(runtime, stemFunctionEffects)
    const policyDamageRefs = new Set(carriedPaths.filter(({ actual }) => functionDamageEstablished(actual)).map(({ fact }) => fact.id))
    for (const path of carriedPaths) {
      if (!path.actual.structuralEffect?.currentlyEffective || path.fact.action === 'combine') continue
      const effects = stemFunctionEffects.filter((effect) => effect.targetEntityId === path.fact.source.id
        && effect.relationFactId !== path.fact.id)
      if (!effects.length) continue
      path.actual = { ...path.actual, sourceFunctionEffects: effects,
        function: effects.some(({ reducesFunction, relationFactId, kind }) =>
          reducesFunction && (kind === 'drain' || policyDamageRefs.has(relationFactId))) ? 'reduced' : path.actual.function }
      if ('observationIndex' in path && typeof path.observationIndex === 'number') {
        actualFunctions[path.observationIndex] = path.actual
      }
    }
    const patternContext = { ...patternBasis, specialYongShen: specialPatternSelection(patternBasis.branchPattern, stems, runtime), yongShenRelations: evaluateYongShenRelations(patternBasis, stemFacts, actualFunctions,
      effectiveEvents.filter(({ effect }) => effect === 'stopped').map(({ relation }) => relation)) }
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
    const currentRemedies = [...patternRoles.guEung, ...natalGuEung.filter((remedy) =>
      !patternRoles.guEung.some(({ targetByeongId }) => targetByeongId === remedy.targetByeongId))]
    const rootDamage = root.states.filter(({ state }) => state === 'weakened').flatMap(({ entityId }) =>
      root.facts.filter(({ stemEntityId }) => stemEntityId === entityId).flatMap(({ id, branchEntityId }) =>
        [...carriedClashes, ...currentClashes].filter(({ participants }) => participants.includes(branchEntityId))
          .flatMap((clash) => clash.participants.filter((branch) => branch !== branchEntityId)
            .map((sourceEntityId) => ({ sourceEntityId, targetEntityId: entityId, relationRefs: [clash.id, id] })))))
    const roleEngine = evaluateRoleEngine({ scope, stems, luck, pattern: patternContext, special: patternContext.specialYongShen,
      runtime, rootStates: root.states, stemFunctionEffects, capacity,
      completeNatal: ['year', 'month', 'day', 'time'].every((position) => {
        const pillar = input.natal[position as keyof JudgmentCoreInput['natal']]
        return !!pillar?.stem && !!pillar.branch
      }),
      coexistence: patternFacts.flatMap((fact, index) => fact.action === 'coexist'
        ? [{ fact, actual: actualFunctions[stemFacts.length + index] }] : []),
      rootDamage, branchDamage,
      requiredControllerIds: new Set([
        ...carriedEvidence.filter(({ condition }) => ['necessary_killing', 'needed_insufficient_killing', 'necessary_output'].includes(condition))
          .map(({ entityId }) => entityId),
        ...carriedPaths.filter(({ actual }) => ['HO-05-needed', 'BLADE-06'].includes(actual.policyId ?? '')
          && functionDamageEstablished(actual)).map(({ fact }) => fact.target.id),
      ]),
      paths: carriedPaths, effectiveCombinations: effectiveEvents, natalFacts, policyRoles: { ...patternRoles, guEung: currentRemedies },
      existingRoles: roleHistory, existingCurrent: currentRoles, conditionalByeong, prior: priorRoleEngine })
    priorRoleEngine = roleEngine
    const commandBranchId = input.natal.month?.branch?.id
    const coreEntityIds = new Set([...patternContext.effectiveManifestedYongShen.map(({ entityId }) => entityId),
      ...roleEngine.roleHistory.filter(({ role }) => role === 'YongShen').map(({ entityId }) => entityId)])
    const coreBranches = new Set(root.facts.filter(({ stemEntityId }) => coreEntityIds.has(stemEntityId))
      .map(({ branchEntityId }) => branchEntityId))
    if (commandBranchId) coreBranches.add(commandBranchId)
    // PP-607: the already established necessary resource remains functional when rooted in
    // the month command's resource formation and the actual attack reduces its function.
    const resourcePaths = carriedPaths.filter(({ fact, actual }) => actual.policyId === 'HO-06'
      && functionDamageEstablished(actual) && runtime.get(fact.target.id) !== 'stopped')
    const resourceFormations = formationFacts.filter(({ id, participants }) => participants.includes(commandBranchId ?? '')
      && resourcePaths.some(({ fact }) => root.states.some((state) => state.entityId === fact.target.id && state.formationIds.includes(id))))
    resourceFormations.forEach(({ participants }) => participants.forEach((id) => coreBranches.add(id)))
    const disruptionRefs = [...carriedClashes, ...branchFacts.filter(({ kind, id }) => kind !== 'six_combination' && kind !== 'wonjin'
      && branchRuntime.effects.some(({ relationId, effect }) => relationId === id && effect === 'active'))]
      .filter(({ participants }) => participants.some((id) => coreBranches.has(id))).map(({ id }) => id)
    const resourceBasis = resourceFormations.length ? {
      stemRefs: resourcePaths.map(({ fact }) => fact.id), branchRefs: resourceFormations.map(({ id }) => id),
    } : undefined
    const structuralSuccess = evaluateStructuralSuccess(patternContext, roleEngine, root.states, capacity,
      root.clashed.includes(commandBranchId ?? ''), Boolean(day && input.natalCombinations !== null), disruptionRefs, resourceBasis,
      branchDamage.commandRecoveryRefs)
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
      formationBranchPool: branches, formationFacts, branchFacts, branchRelationEffects: branchRuntime.effects,
      branchContexts: branches.map(({ id, branch, scope }) => {
        const position = scope === 'natal' ? (['year', 'month', 'day', 'time'] as const)
          .find(position => input.natal[position]?.branch?.id === id) : 'luck'
        const main = HIDDEN_STEM_ROLE_TABLE[branch].find(({ role }) => role === 'main')
        const tenGod = day && main && !input.unconfirmedBranchMainIds?.includes(id) ? calculateTenGod(day, main.stem) : undefined
        return { id, branch, ...(position && { position }), ...(tenGod && { tenGod }) }
      }),
      branchRuntimeStates: branchRuntime.runtime, stemFacts, patternFacts, formulas, actualFunctions, stemFunctionEffects, stemEffectiveness,
      roleEngine, structuralSuccess, branchDamage,
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
    inheritedClashes = [...carriedClashes, ...currentClashes]
    inheritedBindings = bindings
    parentScopeId = id
    return snapshot
  }))
}
