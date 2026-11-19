import type { StructuralEffect } from './structuralEffect'
import type { EvidenceStatus, FinalPatternContext, PatternMode, RootState, StemRuntime } from './types'

import { conditions, directions, isGod, matchesPolicyFact, p11Policies, p12Policies, p13Policies, relationTypes } from './patternPolicyRegistry'
import type { Condition, PolicyEntry, PolicyFact } from './patternPolicyRegistry'

type Direction = typeof directions[number] | 'deferred'
export type PatternEffectPolicy = PolicyEntry & {
  patternMode: PatternMode | 'any'
  activeYongShenTypes: FinalPatternContext['heavenlyPatterns']
  overridesPolicyIds?: readonly string[]
}
export type PolicyResolution = { policyId: string | null; direction: Direction; ruleId: string | null;
  matchedPolicies: readonly string[]; selectedPolicy: string | null
  selectionReason: 'no_match' | 'specific_conditions' | 'documented_override' | 'required_function' | 'consistent_matches' | 'conflicting_directions' | 'unresolved_food_control'
  evidenceStatus: EvidenceStatus; byeongCandidate: boolean; conditionEvidence?: readonly string[] }
export type ActualStructuralFunction = PolicyResolution & {
  relationFactId: string
  patternContextId: string
  runtimeEvidence: readonly { entityId: string; state: StemRuntime }[]
  rootEvidence: readonly { entityId: string; state: RootState; factIds: readonly string[] }[]
  formationEvidence: readonly string[]
  capacityEvidence?: readonly string[]
  resolutionEvidence?: readonly string[]
  structuralEffect?: StructuralEffect
  flowConstraint?: 'excessive_resource_and_day'
  function: 'operating' | 'reduced' | 'inactive' | 'deferred'
}

export function validatePatternEffectRegistry(registry: readonly PatternEffectPolicy[]) {
  const ids = new Set<string>()
  for (const policy of registry) {
    if (!policy.policyId || ids.has(policy.policyId) || !policy.ruleId
      || !['officer', 'killing', 'wealth', 'resource', 'food_god', 'hurting', 'peer', 'rob', 'blade'].includes(policy.branchPattern)
      || !['any', 'proper', 'transformed', 'combined', 'month_command_unusable', 'special_peer_pattern'].includes(policy.patternMode)
      || !policy.activeYongShenTypes.every((god) => ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '偏官', '正官', '偏印', '印綬'].includes(god))
      || !Object.hasOwn(relationTypes, policy.relationType)
      || !directions.includes(policy.defaultDirection)
      || !['FILUNE_APPROVED_OVERRIDE', 'SOURCE_EXPLICIT', 'SOURCE_INFERENCE'].includes(policy.evidenceStatus)
      || !policy.requiredConditions.every((condition) => conditions.includes(condition))) {
      throw new TypeError(`Invalid pattern effect policy: ${policy.policyId}`)
    }
    ids.add(policy.policyId)
  }
}

const common = { relationType: 'WealthControlsResource', patternMode: 'any', activeYongShenTypes: [] } as const
export const patternEffectRegistry: readonly PatternEffectPolicy[] = [
  { ...common, policyId: 'resource-excess-uses-wealth', branchPattern: 'resource', defaultDirection: 'favorable',
    requiredConditions: ['resource_excessive'], overridesPolicyIds: ['RES-06'], evidenceStatus: 'SOURCE_EXPLICIT', ruleId: 'EX-046' },
  { ...common, policyId: 'food-god-wealth-protects-output', branchPattern: 'food_god', defaultDirection: 'favorable',
    requiredConditions: ['resource_attacks_food_god'], evidenceStatus: 'SOURCE_EXPLICIT', ruleId: 'EX-047' },
  ...[...p11Policies, ...p12Policies, ...p13Policies].map((policy) => ({ ...policy, patternMode: 'any' as const, activeYongShenTypes: [] })),
  { ...common, policyId: 'wealth-controls-resource-in-resource', branchPattern: 'resource', defaultDirection: 'unfavorable',
    requiredConditions: [], evidenceStatus: 'SOURCE_EXPLICIT', ruleId: 'EX-045' },
] as const satisfies readonly PatternEffectPolicy[]
validatePatternEffectRegistry(patternEffectRegistry)

export function resolvePatternEffectPolicy(context: FinalPatternContext, relation: PolicyFact,
  evidence: ReadonlySet<Condition>, conditionEvidence: readonly string[] = [],
  registry: readonly PatternEffectPolicy[] = patternEffectRegistry): PolicyResolution {
  const branch = context.branchPattern
  const family = branch === '正官' ? 'officer' : branch === '偏官' ? 'killing'
    : branch && branch !== '羊刃' && isGod(branch, 'wealth') ? 'wealth'
      : branch && branch !== '羊刃' && isGod(branch, 'resource') ? 'resource'
        : branch === '食神' ? 'food_god' : branch === '傷官' ? 'hurting'
          : branch === '比肩' ? 'peer' : branch === '劫財' ? 'rob' : branch === '羊刃' ? 'blade' : null
  const matches = registry.filter((item) => item.branchPattern === family && matchesPolicyFact(relation, item.relationType)
    && (item.patternMode === 'any' || item.patternMode === context.patternMode)
    && item.activeYongShenTypes.every((god) => context.effectiveManifestedYongShen.some((stem) => stem.tenGod === god))
    && item.requiredConditions.every((condition) => evidence.has(condition)))
  const matchedPolicies = matches.map(({ policyId }) => policyId).sort()
  const moreSpecific = (a: PatternEffectPolicy, b: PatternEffectPolicy) =>
    (a.patternMode === b.patternMode || b.patternMode === 'any')
    && b.activeYongShenTypes.every((god) => a.activeYongShenTypes.includes(god))
    && b.requiredConditions.every((condition) => a.requiredConditions.includes(condition))
    && (a.patternMode !== b.patternMode || a.activeYongShenTypes.some((god) => !b.activeYongShenTypes.includes(god))
      || a.requiredConditions.some((condition) => !b.requiredConditions.includes(condition)))
  const overrides = (a: PatternEffectPolicy, b: PatternEffectPolicy) => a.overridesPolicyIds?.includes(b.policyId) === true
  const remaining = matches.filter((item) => !matches.some((other) => other !== item
    && (overrides(other, item) || !overrides(item, other) && moreSpecific(other, item))))
  const unresolved = family === 'killing' && evidence.has('unresolved_food_control')
    && (matchesPolicyFact(relation, 'FoodControlsKilling') || matchesPolicyFact(relation, 'ResourceControlsFood'))
  const conflicting = matches.length > 0 && (remaining.length === 0
    || new Set(remaining.map(({ defaultDirection }) => defaultDirection)).size > 1)
  // Equivalent directions may share a deterministic provenance preference. Opposing directions cannot.
  const provenance = ['FILUNE_APPROVED_OVERRIDE', 'SOURCE_EXPLICIT', 'SOURCE_INFERENCE']
  const policy = unresolved || conflicting ? undefined : remaining.sort((a, b) =>
    provenance.indexOf(a.evidenceStatus) - provenance.indexOf(b.evidenceStatus) || a.policyId.localeCompare(b.policyId))[0]
  const requiredControl = evidence.has('required_harmful_food_control')
    && (policy?.policyId === 'KILL-01' || policy?.policyId === 'KILL-04-required-food')
  const selectionReason: PolicyResolution['selectionReason'] = conflicting ? 'conflicting_directions'
    : unresolved ? 'unresolved_food_control' : !policy ? 'no_match'
      : requiredControl ? 'required_function' : matches.some((item) => overrides(policy, item)) ? 'documented_override'
        : matches.length > remaining.length ? 'specific_conditions' : 'consistent_matches'
  return { policyId: policy?.policyId ?? null, selectedPolicy: policy?.policyId ?? null, matchedPolicies, selectionReason,
    direction: policy?.defaultDirection ?? 'deferred', ruleId: policy?.ruleId ?? null,
    evidenceStatus: policy?.evidenceStatus ?? 'DEFERRED',
    byeongCandidate: policy?.defaultDirection === 'unfavorable' || ['WEALTH-05', 'WEALTH-06', 'RES-09', 'FOOD-03', 'FOOD-08', 'ROB-05-harmful', 'BLADE-04', 'BLADE-05'].includes(policy?.policyId ?? ''),
    ...((policy?.requiredConditions.length || requiredControl || unresolved || conflicting) && conditionEvidence.length ? { conditionEvidence } : {}) }
}

export function resolveActualFunction(policy: PolicyResolution, context: FinalPatternContext, relation: PolicyFact,
  runtime: ReadonlyMap<string, StemRuntime>, rootEvidence: ActualStructuralFunction['rootEvidence'],
  formationEvidence: readonly string[], validCombination: boolean, capacityEvidence?: readonly string[], coexistEffective = false): ActualStructuralFunction {
  const runtimeEvidence = [relation.source, relation.target].flatMap(({ id }) => {
    const state = runtime.get(id)
    return state ? [{ entityId: id, state }] : []
  })
  const stopped = runtimeEvidence.some(({ state }) => state === 'stopped')
  const current = relation.action === 'coexist' && coexistEffective ? 'operating' : relation.action === 'combine' && !validCombination || relation.action !== 'combine' && stopped ? 'inactive'
    : runtimeEvidence.length !== 2 ? 'deferred'
      : runtimeEvidence.some(({ state }) => state === 'weakened') ? 'reduced' : 'operating'
  return { ...policy, byeongCandidate: policy.byeongCandidate && (current === 'operating' || current === 'reduced'), relationFactId: relation.id, patternContextId: context.id, runtimeEvidence, rootEvidence,
    formationEvidence, ...(capacityEvidence?.length ? { capacityEvidence } : {}), function: current }
}
