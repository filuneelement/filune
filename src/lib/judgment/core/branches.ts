import { calculateTenGod } from '../../dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from '../../hiddenStemRoleTable'
import { BREAKS, CLASHES, HARMS, hasPair, isPunishmentPair, SEASON_COMBINATIONS, SIX_COMBINATIONS, THREE_COMBINATIONS } from '../producers/relationCatalog'
import { recordId } from '../producers/shared'
import type { RootState, Scope, ScopeRootFact, StemParticipant } from './types'

export type BranchParticipant = { id: string; branch: keyof typeof HIDDEN_STEM_ROLE_TABLE; scope: Scope }
const sameElement = (a: string, b: string) => ['比肩', '劫財'].includes(calculateTenGod(a, b))
const rules = [
  ['six_combination', (a: string, b: string) => hasPair(SIX_COMBINATIONS, a, b)],
  ['clash', (a: string, b: string) => hasPair(CLASHES, a, b)],
  ['punishment', isPunishmentPair],
  ['break', (a: string, b: string) => hasPair(BREAKS, a, b)],
  ['harm', (a: string, b: string) => hasPair(HARMS, a, b)],
] as const

export function branchRelations(scopeId: string, branches: readonly BranchParticipant[]) {
  return branches.flatMap((a, i) => branches.slice(i + 1).flatMap((b) => rules.flatMap(([kind, match]) =>
    match(a.branch, b.branch) ? [{ id: recordId('p0-branch-relation', [scopeId, kind, a.id, b.id]),
      kind, participants: [a.id, b.id] }] : [])))
}

export function formations(scopeId: string, pool: readonly BranchParticipant[]) {
  const groups = [
    ...THREE_COMBINATIONS.map((branches, i) => ({ branches, elementStem: ['壬', '甲', '丙', '庚'][i], seasonal: false })),
    ...SEASON_COMBINATIONS.map((branches, i) => ({ branches, elementStem: ['甲', '丙', '庚', '壬'][i], seasonal: true })),
  ]
  return groups.flatMap(({ branches, elementStem, seasonal }) => {
    const members = pool.filter((item) => branches.includes(item.branch))
    const distinct = new Set(members.map((item) => item.branch))
    const kind = distinct.size === 3 ? seasonal ? 'season' : 'three'
      : !seasonal && distinct.size === 2 && members.some((item) => item.branch === branches[1]) ? 'half' : null
    return kind ? [{ id: recordId('p0-formation', [scopeId, kind, branches]), kind, elementStem,
      participants: members.map((item) => item.id) }] : []
  })
}

export function roots(scopeId: string, stems: readonly StemParticipant[], pool: readonly BranchParticipant[],
  relations: ReturnType<typeof branchRelations>, formed: ReturnType<typeof formations>, inheritedClashes: readonly string[] = []) {
  const clashed = new Set([...inheritedClashes, ...relations.filter((item) => item.kind === 'clash').flatMap((item) => item.participants)])
  const facts: ScopeRootFact[] = stems.flatMap((stem) => pool.flatMap((branch) => HIDDEN_STEM_ROLE_TABLE[branch.branch]
    .filter((root) => sameElement(stem.stem, root.stem))
    .map((root) => ({ id: recordId('p0-root', [scopeId, stem.id, branch.id, root.stem]), stemEntityId: stem.id,
      branchEntityId: branch.id, hiddenStem: root.stem, sourceClass: root.role }))))
  const states = stems.map((stem) => {
    const matching = facts.filter((fact) => fact.stemEntityId === stem.id)
    const formationIds = formed.filter((item) => sameElement(item.elementStem, stem.stem)).map((item) => item.id)
    const state: RootState = formationIds.length ? 'strengthened' : !matching.length ? 'absent'
      : matching.every((fact) => clashed.has(fact.branchEntityId)) ? 'weakened' : 'present'
    return { entityId: stem.id, state, factIds: matching.map((fact) => fact.id), formationIds }
  })
  return { facts, states, clashed: [...clashed] }
}
