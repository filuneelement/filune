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

function structure(branchPattern: BranchPattern | null, manifestations: readonly ManifestationHistory[]) {
  const components = [...new Map(manifestations.map((item) => [item.stem, item])).values()]
  const patternMode = !branchPattern ? null : !components.length ? 'month_command_unusable' as const
    : peer(branchPattern) ? 'special_peer_pattern' as const
      : components.length > 1 ? 'combined' as const
        : components[0].sourceClass === 'main' ? 'proper' as const : 'transformed' as const
  return { heavenlyPatterns: components.map((item) => item.tenGod), patternMode }
}

export function provisionalPattern(id: string, scope: Scope, command: ReturnType<typeof monthCommand>,
  stems: readonly StemParticipant[], prior: readonly ManifestationHistory[],
  priorRuntime: ReadonlyMap<string, StemRuntime>, originPeriod?: Validity): ProvisionalPatternContext {
  const incoming = stems.filter((stem) => stem.scope === scope && !stem.dayMaster).flatMap((stem) =>
    command.candidates.filter((candidate) => candidate.stem === stem.stem && !peer(candidate.tenGod))
      .map((candidate) => ({ ...candidate, entityId: stem.id, manifestationScope: scope, ...(originPeriod ? { originPeriod } : {}), monthCommandRoot: true as const })))
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
  return manifestations.flatMap((a, i) => manifestations.slice(i + 1).filter((b) => a.stem !== b.stem).map((b) => {
    const between = ({ source, target }: StemRelationFact) =>
      source.id === a.entityId && target.id === b.entityId || source.id === b.entityId && target.id === a.entityId
    const relations = facts.filter(between)
    const stopped = stoppingFacts.find(between)
    const support = relations.find(({ source, target, action, id }) => {
      if (action !== 'generate' || source.tenGod !== '食神' || !['偏財', '正財'].includes(target.tenGod)) return false
      // A relation must connect distinct chart positions in the scope's observation set.
      if (source.scope === target.scope && source.position === target.position) return false
      const actual = functions.find(({ relationFactId }) => relationFactId === id)
      return actual && ['operating', 'reduced'].includes(actual.function)
        && !actual.rootEvidence.some(({ state }) => state === 'absent' || state === 'weakened')
    })
    const bothEffective = effective.has(a.entityId) && effective.has(b.entityId)
    const inactive = !bothEffective && (stopped || relations.some(({ id }) =>
      functions.some(({ relationFactId, function: state }) => relationFactId === id && state === 'inactive')))
    return {
      stems: [a.stem, b.stem],
      participantIds: [a.entityId, b.entityId],
      relationQuality: stopped ? 'unfavorable_conflict' : bothEffective && support ? 'favorable_harmony' : 'deferred',
      currentFunction: inactive ? 'inactive' : support && bothEffective
        ? functions.find(({ relationFactId }) => relationFactId === support.id)!.function : 'deferred',
      relationFactIds: [...new Set([...relations.map(({ id }) => id), ...(stopped ? [stopped.id] : [])])],
    }
  }))
}
