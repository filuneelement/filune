import { calculateTenGod } from '../../dayRelationships'
import { hasPair, STEM_COMBINATIONS } from '../producers/relationCatalog'
import { recordId } from '../producers/shared'
import type { FormulaFact, Scope, StemParticipant, StemRelationFact, StemRuntime } from './types'

export const scopes = ['natal', 'greatLuck', 'yearlyLuck', 'monthlyLuck', 'dailyLuck'] as const
const combines = (a: StemParticipant, b: StemParticipant) => hasPair(STEM_COMBINATIONS, a.stem, b.stem)

export function directScopes(scope: Scope): readonly Scope[] {
  const index = scopes.indexOf(scope)
  return index < 2 ? scopes.slice(0, index + 1) : ['natal', scopes[index - 1], scope]
}

export function stemRelations(id: string, stems: readonly StemParticipant[]): StemRelationFact[] {
  return stems.flatMap((source, i) => stems.flatMap((target, j) => {
    if (i === j) return []
    const relative = calculateTenGod(source.stem, target.stem)
    const actions: StemRelationFact['action'][] = []
    if (relative === '食神' || relative === '傷官') actions.push('generate')
    if (relative === '偏財' || relative === '正財') actions.push('control')
    if (i < j && combines(source, target)) actions.push('combine')
    return actions.map((action) => {
      const [from, to] = action === 'combine' && target.tenGod === '傷官' && source.tenGod === '偏官'
        ? [target, source] : [source, target]
      return { id: recordId('p0-stem-relation', [id, action, from.id, to.id]), action, source: from, target: to }
    })
  }))
}

export function resolveStemRuntime(scope: Scope, stems: readonly StemParticipant[], inherited: ReadonlyMap<string, StemRuntime>,
  natalCombinations: readonly (readonly string[])[] = []) {
  const runtime = new Map(inherited)
  for (const stem of stems) if (!runtime.has(stem.id)) runtime.set(stem.id, 'active')
  const combinations: { participants: readonly string[]; effect: 'weakened' | 'stopped'; ruleId: string }[] = []
  function apply(participants: readonly string[], effect: 'weakened' | 'stopped', ruleId: string) {
    participants.forEach((id) => runtime.set(id, effect))
    combinations.push({ participants, effect, ruleId })
  }
  if (scope === 'natal') {
    for (const pair of natalCombinations) apply(pair, 'stopped', 'EX-051/natal')
    return { runtime, combinations }
  }

  const luck = stems.filter((stem) => stem.scope !== 'natal').sort((a, b) => scopes.indexOf(a.scope) - scopes.indexOf(b.scope))
  const paired = new Set<string>()
  for (const [i, stem] of luck.entries()) {
    if (paired.has(stem.id) || runtime.get(stem.id) === 'stopped') continue
    const partner = luck.slice(i + 1).find((other) =>
      !paired.has(other.id) && runtime.get(other.id) !== 'stopped' && combines(stem, other))
    if (!partner) continue
    apply([stem.id, partner.id], 'weakened', 'EX-053')
    paired.add(stem.id)
    paired.add(partner.id)
  }
  // Only the incoming luck stem gets a new natal pass (LK-072 / IR-01).
  for (const stem of luck.filter((item) => item.scope === scope && !paired.has(item.id) && runtime.get(item.id) === 'active')) {
    const partner = stems.find((other) => other.scope === 'natal' && !other.dayMaster
      && runtime.get(other.id) !== 'stopped' && combines(stem, other))
    if (partner) apply([stem.id, partner.id], 'stopped', 'EX-052')
  }
  return { runtime, combinations }
}

export function killingFormula(relation: StemRelationFact, validCombination: boolean): FormulaFact['formulaType'] | undefined {
  if (relation.target.tenGod !== '偏官' || relation.source.dayMaster || relation.target.dayMaster) return
  if (relation.source.tenGod === '食神' && relation.action === 'control') return 'FoodGodControlsKilling'
  if (relation.source.tenGod !== '傷官') return
  if (relation.action === 'control') return 'HurtingOfficerControlsKilling'
  if (relation.action === 'combine' && validCombination) return 'HurtingOfficerCombinesKilling'
}
