import type { ActualStructuralFunction } from './policies'
import type { TwelveStage } from '../../twelveStages'
import type { RootState, StemRelationFact, Scope, StemRuntime } from './types'

export function generationCanReach(source: StemRuntime | undefined, target: StemRuntime | undefined, sourceRoot: RootState | undefined) {
  return (source === 'active' || source === 'weakened' && (sourceRoot === 'present' || sourceRoot === 'strengthened'))
    && (target === 'active' || target === 'weakened')
}

export type StemFunctionEffect = {
  relationFactId: string
  sourceEntityId: string
  targetEntityId: string
  kind: 'strengthen' | 'weaken' | 'drain'
  reducesFunction: boolean
  sourceRoot?: { state: RootState; factIds: readonly string[]; formationIds: readonly string[]; monthStage?: TwelveStage }
}

export function evaluateStemFunctionEffects(facts: readonly StemRelationFact[], runtime: ReadonlyMap<string, StemRuntime>,
  roots: readonly (NonNullable<StemFunctionEffect['sourceRoot']> & { entityId: string })[]): StemFunctionEffect[] {
  const root = new Map(roots.map(({ entityId, ...basis }) => [entityId, basis]))
  return facts.flatMap((fact): StemFunctionEffect[] => {
    const source = runtime.get(fact.source.id)
    const target = runtime.get(fact.target.id)
    if (!source || !target || source === 'stopped' || target === 'stopped') return []
    const sourceRoot = root.get(fact.source.id)
    const effect = { relationFactId: fact.id, sourceEntityId: fact.source.id, targetEntityId: fact.target.id,
      ...(sourceRoot ? { sourceRoot } : {}) }
    if (fact.action === 'control') return [{ ...effect, kind: 'weaken',
      reducesFunction: sourceRoot?.state === 'present' || sourceRoot?.state === 'strengthened' }]
    if (fact.action !== 'generate' || !generationCanReach(source, target, sourceRoot?.state)) return []
    return [{ ...effect, kind: 'strengthen', reducesFunction: false },
      { ...effect, targetEntityId: fact.source.id, kind: 'drain',
        reducesFunction: sourceRoot?.state === 'weakened' }]
  })
}

export function evaluateStemEffectiveness(runtime: ReadonlyMap<string, StemRuntime>, effects: readonly StemFunctionEffect[]) {
  return [...runtime].map(([entityId, state]) => {
    const applied = state === 'stopped' ? [] : effects.filter(({ targetEntityId }) => targetEntityId === entityId)
    const strengthened = applied.some(({ kind }) => kind === 'strengthen')
    const weakened = state === 'weakened' || applied.some(({ reducesFunction }) => reducesFunction)
    const currentFunction = state === 'stopped' ? 'inactive' : weakened ? 'reduced' : strengthened ? 'strengthened' : 'operating'
    return { entityId, currentFunction, strengthened, weakened, effects: applied }
  })
}

type ScopedFact = StemRelationFact & { basis?: 'month_blade' }
export type StructuralBlock =
  | { kind: 'stopped_participant'; evidenceRefs: readonly string[] }
  | { kind: 'required_path_blocked'; evidenceRefs: readonly string[] }
  | { kind: 'active_protection'; evidenceRefs: readonly string[]; protectorId: string }

export type StructuralEffect = {
  originScope: Scope
  relationOriginFactId: string
  inherited: boolean
  currentlyEffective: boolean
  blockedBy?: StructuralBlock
  mitigatedBy?: { protectorId: string; evidenceRefs: readonly string[] }
  protectedDamage?: true
}

export function structuralPathKey(fact: ScopedFact) {
  const ids = [fact.source.id, fact.target.id]
  if (fact.action === 'combine') ids.sort()
  return JSON.stringify([fact.action, fact.basis ?? null, ...ids])
}

export function resolveStructuralEffect(scope: Scope, fact: ScopedFact, actual: ActualStructuralFunction,
  runtime: ReadonlyMap<string, StemRuntime>, prior?: ActualStructuralFunction, currentBlock?: StructuralBlock,
  reactivation?: { protectorStopped: boolean; protectionBroken: boolean; evidenceRefs?: readonly string[] }): ActualStructuralFunction {
  const previous = prior?.structuralEffect
  const inheritedBlock = previous?.blockedBy
  // An observed end to the exact protective action can reopen its path. A missing Fact cannot.
  const protectionEnded = inheritedBlock?.kind === 'active_protection'
    && (reactivation?.protectorStopped || reactivation?.protectionBroken)
  const stopped = fact.action === 'combine' ? [] : [fact.source.id, fact.target.id].filter((id) => runtime.get(id) === 'stopped')
  const runtimeBlock: StructuralBlock | undefined = stopped.length ? { kind: 'stopped_participant', evidenceRefs: stopped } : undefined
  const retainBlock = inheritedBlock && !protectionEnded
  const blockedBy = retainBlock ? inheritedBlock : currentBlock ?? runtimeBlock
  const currentFunction = blockedBy ? 'inactive' : actual.function
  const inherited = Boolean(previous && (retainBlock || !blockedBy && currentFunction === prior?.function))
  const damageCandidate = actual.byeongCandidate || Boolean(previous?.protectedDamage && protectionEnded)
  const reactivationRefs = protectionEnded && !blockedBy ? [...(inheritedBlock?.evidenceRefs ?? []), ...(reactivation?.evidenceRefs ?? [])] : []
  return {
    ...actual,
    function: currentFunction,
    byeongCandidate: !blockedBy && damageCandidate,
    ...(blockedBy ? { resolutionEvidence: blockedBy.evidenceRefs } : {}),
    ...(reactivationRefs.length ? { resolutionEvidence: [...new Set(reactivationRefs)] } : {}),
    structuralEffect: {
      originScope: inherited && previous ? previous.originScope : scope,
      relationOriginFactId: previous?.relationOriginFactId ?? fact.id,
      inherited,
      currentlyEffective: currentFunction === 'operating' || currentFunction === 'reduced',
      ...(blockedBy ? { blockedBy } : {}),
      ...(blockedBy?.kind === 'active_protection' && (damageCandidate || previous?.protectedDamage) ? { protectedDamage: true as const } : {}),
    },
  }
}
