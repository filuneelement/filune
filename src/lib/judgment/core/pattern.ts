import type { Validity } from '../contracts'
import type { ActualStructuralFunction } from './policies'
import type { StemRelationFact } from './types'
import { calculateTenGod } from '../../dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from '../../hiddenStemRoleTable'
import type {
  BranchPattern, EffectiveManifestedYongShen, FinalPatternContext, ManifestationHistory,
  MonthHiddenStemCandidate, ProvisionalPatternContext, Scope, StemParticipant, StemRuntime, YongShenRelation,
} from './types'

export function monthCommand(day: string | undefined, branch: string | undefined) {
  const roles = HIDDEN_STEM_ROLE_TABLE[branch as keyof typeof HIDDEN_STEM_ROLE_TABLE]
  const candidates: MonthHiddenStemCandidate[] = day && roles ? roles.map(({ stem, role }) => ({
    stem, tenGod: calculateTenGod(day, stem), sourceClass: role,
  })) : []
  const yangBlade = ['甲卯', '丙午', '庚酉', '壬子'].includes(`${day}${branch}`)
  const branchPattern: BranchPattern | null = yangBlade ? '羊刃'
    : candidates.find((candidate) => candidate.sourceClass === 'main')?.tenGod ?? null
  return { candidates, branchPattern }
}

const peer = (tenGod: BranchPattern | null) => tenGod === '比肩' || tenGod === '劫財' || tenGod === '羊刃'
const sameElement = (left: string, right: string) => peer(calculateTenGod(left, right))

function structure(branchPattern: BranchPattern | null, manifestations: readonly ManifestationHistory[]) {
  const components = manifestations.filter((item, index) =>
    !manifestations.slice(0, index).some(prior => sameElement(item.stem, prior.stem)))
  const patternMode = !branchPattern ? null : !components.length ? 'month_command_unusable' as const
    : peer(branchPattern) ? 'special_peer_pattern' as const
      : components.length > 1 ? 'combined' as const
        : components[0].sourceClass === 'main' ? 'proper' as const : 'transformed' as const
  return { heavenlyPatterns: components.map((item) => item.tenGod), patternMode }
}

export function provisionalPattern(id: string, scope: Scope, command: ReturnType<typeof monthCommand>,
  stems: readonly StemParticipant[], prior: readonly ManifestationHistory[],
  priorRuntime: ReadonlyMap<string, StemRuntime>, originPeriod?: Validity): ProvisionalPatternContext {
  const incoming = stems.filter((stem) => stem.scope === scope && !stem.dayMaster && !peer(stem.tenGod)).flatMap((stem) => {
    // A-8-1 I-02 preserves the visible stem's TenGod while matching the month command by element.
    const candidates = command.candidates.filter(candidate => sameElement(candidate.stem, stem.stem))
    const candidate = candidates.find(({ sourceClass }) => sourceClass === 'main')
      ?? candidates.find(({ sourceClass }) => sourceClass === 'middle') ?? candidates[0]
    return candidate ? [{ ...candidate, stem: stem.stem, tenGod: stem.tenGod, entityId: stem.id,
      manifestationScope: scope, ...(originPeriod ? { originPeriod } : {}), monthCommandRoot: true as const }] : []
  })
  const manifestationHistory = [...prior, ...incoming]
  return { id: `${id}:provisional`, scope, phase: 'provisional', branchPattern: command.branchPattern,
    monthHiddenStemCandidates: command.candidates, manifestationHistory, yongShenRelations: [],
    ...structure(command.branchPattern, [...prior.filter((item) => priorRuntime.get(item.entityId) !== 'stopped'), ...incoming]) }
}

export function finalPattern(provisional: ProvisionalPatternContext, runtime: ReadonlyMap<string, StemRuntime>): FinalPatternContext {
  const effectiveManifestedYongShen: EffectiveManifestedYongShen[] = provisional.manifestationHistory.flatMap((item) => {
    const effectiveness = runtime.get(item.entityId)
    return effectiveness && effectiveness !== 'stopped' ? [{ ...item, effectiveness }] : []
  })
  return { ...provisional, id: provisional.id.replace(/:provisional$/, ':final'), phase: 'final', effectiveManifestedYongShen,
    ...structure(provisional.branchPattern, effectiveManifestedYongShen) }
}

/** PT-016–019: use the exact participants of observed paths and their scoped function. */
export function evaluateYongShenRelations(context: FinalPatternContext, facts: readonly StemRelationFact[],
  functions: readonly ActualStructuralFunction[], stoppingFacts: readonly StemRelationFact[]): YongShenRelation[] {
  const manifestations = context.manifestationHistory
  const effective = new Set(context.effectiveManifestedYongShen.map(({ entityId }) => entityId))
  const actualById = new Map(functions.map(actual => [actual.relationFactId, actual]))
  const live = (id: string) => ['operating', 'reduced'].includes(actualById.get(id)?.function ?? '')
  return manifestations.flatMap((a, i) => manifestations.slice(i + 1).filter((b) => !sameElement(a.stem, b.stem)).map((b) => {
    const between = ({ source, target }: StemRelationFact) =>
      source.id === a.entityId && target.id === b.entityId || source.id === b.entityId && target.id === a.entityId
    const relations = facts.filter(between)
    const stopped = stoppingFacts.find(between)
    let bridgeRef: string | undefined
    const support = relations.find(({ source, target, action, id }) => {
      if (action !== 'generate') return false
      // A relation must connect distinct chart positions in the scope's observation set.
      if (source.scope === target.scope && source.position === target.position) return false
      const actual = actualById.get(id)
      if (context.branchPattern === '偏官' && source.tenGod === '偏官'
        && ['印綬', '偏印'].includes(target.tenGod) && actual && live(id)
        && actual.rootEvidence.some(({ entityId, state }) => entityId === target.id && ['present', 'strengthened'].includes(state))) {
        bridgeRef = facts.find(({ source: resource, target: day, action: next, id }) =>
          resource.id === target.id && day.dayMaster && next === 'generate' && live(id))?.id
        if (bridgeRef) return true
      }
      if (!['食神', '傷官'].includes(source.tenGod) || !['偏財', '正財'].includes(target.tenGod)) return false
      return actual && ['operating', 'reduced'].includes(actual.function)
        && (source.tenGod === '食神' || ['favorable', 'favorable_auxiliary'].includes(actual.direction))
        && !actual.rootEvidence.some(({ state }) => state === 'absent' || state === 'weakened')
    })
    const harm = relations.find(({ id }) => {
      const actual = actualById.get(id)
      return actual?.byeongCandidate && live(id) && actual.structuralEffect?.currentlyEffective
        && (actual.direction === 'unfavorable'
          || actual.direction === 'unfavorable_candidate' && Boolean(actual.conditionEvidence?.length))
    }) ?? relations.find(fact => fact.action === 'generate' && live(fact.id)
      && ['正財', '偏財'].includes(fact.source.tenGod) && fact.target.tenGod === '偏官'
      && functions.some(actual => actual.policyId === 'killing-pressure-after-protection'
        && actual.structuralEffect?.currentlyEffective && actual.conditionEvidence?.includes(fact.id)))
    const bothEffective = effective.has(a.entityId) && effective.has(b.entityId)
    const operatingPath = support ?? harm
    const inactive = !bothEffective && (stopped || relations.some(({ id }) =>
      functions.some(({ relationFactId, function: state }) => relationFactId === id && state === 'inactive')))
    return {
      stems: [a.stem, b.stem],
      participantIds: [a.entityId, b.entityId],
      relationQuality: stopped ? 'unfavorable_conflict' : !bothEffective ? 'deferred'
        : support && harm ? 'mixed' : support ? 'favorable_harmony' : harm ? 'unfavorable_conflict' : 'deferred',
      currentFunction: inactive ? 'inactive' : operatingPath && bothEffective
        ? actualById.get(operatingPath.id)!.function : 'deferred',
      relationFactIds: [...new Set([...relations.map(({ id }) => id), ...(stopped ? [stopped.id] : []), ...(bridgeRef ? [bridgeRef] : [])])],
    }
  }))
}
