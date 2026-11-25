import { calculateTenGod } from '../../dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from '../../hiddenStemRoleTable'
import { BREAKS, CLASHES, HARMS, WONJIN, hasGroup, hasPair, isPunishmentPair, SEASON_COMBINATIONS, SIX_COMBINATIONS, THREE_COMBINATIONS, THREE_PUNISHMENTS } from '../producers/relationCatalog'
import { recordId } from '../producers/shared'
import type { BranchPattern, RootState, Scope, ScopeRootFact, StemParticipant } from './types'

export type BranchParticipant = { id: string; branch: keyof typeof HIDDEN_STEM_ROLE_TABLE; scope: Scope }
export type BranchRelationEffect = { relationId: string; effect: 'active' | 'mitigated'; participants: readonly string[] }
export type BranchRuntimeState = { entityId: string; state: 'active' | 'bound' | 'conflicted'; relationRefs: readonly string[] }
type BranchMainSubject = BranchParticipant & { stem: string; god: ReturnType<typeof calculateTenGod> }
type BranchMainAction = {
  id: string; action: 'control' | 'generate'; source: BranchMainSubject; target: BranchMainSubject
  reachable: boolean; confirmed: boolean; evidenceRefs: readonly string[]
}
type BranchDamagePath = {
  sourceEntityId: string
  targetEntityId: string
  damagedFunction: string
  action: 'control' | 'generate' | 'clash'
  state: 'active' | 'weakened'
  relationRefs: string[]
  protection?: { entityId: string; relationRefs: string[] }
}
const sameElement = (a: string, b: string) => ['比肩', '劫財'].includes(calculateTenGod(a, b))
const rules = [
  ['six_combination', (a: string, b: string) => hasPair(SIX_COMBINATIONS, a, b)],
  ['clash', (a: string, b: string) => hasPair(CLASHES, a, b)],
  ['punishment', isPunishmentPair],
  ['break', (a: string, b: string) => hasPair(BREAKS, a, b)],
  ['harm', (a: string, b: string) => hasPair(HARMS, a, b)],
  ['wonjin', (a: string, b: string) => hasPair(WONJIN, a, b)],
] as const

export function branchRelations(scopeId: string, branches: readonly BranchParticipant[]) {
  const pairs = branches.flatMap((a, i) => branches.slice(i + 1).flatMap((b) => rules.flatMap(([kind, match]) =>
    match(a.branch, b.branch) ? [{ id: recordId('p0-branch-relation', [scopeId, kind, a.id, b.id]),
      kind, participants: [a.id, b.id] }] : [])))
  const triples = branches.flatMap((a, i) => branches.slice(i + 1).flatMap((b, j) => branches.slice(i + j + 2).flatMap(c =>
    hasGroup(THREE_PUNISHMENTS, [a.branch, b.branch, c.branch])
      ? [{ id: recordId('p0-branch-relation', [scopeId, 'punishment', a.id, b.id, c.id]), kind: 'punishment' as const,
        participants: [a.id, b.id, c.id] }] : [])))
  return [...pairs, ...triples]
}

/** Resolves relation action separately from relation existence; harmony never deletes a clash Fact. */
export function resolveBranchRuntime(branches: readonly BranchParticipant[], relations: ReturnType<typeof branchRelations>,
  formed: ReturnType<typeof formations> = []) {
  const effects: BranchRelationEffect[] = relations.map((relation) => ({
    relationId: relation.id,
    effect: relation.kind === 'clash' && (relations.some((other) => other.kind === 'six_combination'
      && other.participants.some((id) => relation.participants.includes(id)))
      || formed.some(formation => formation.participants.some(id => relation.participants.includes(id))))
      ? 'mitigated' : 'active',
    participants: relation.participants,
  }))
  const runtime: BranchRuntimeState[] = branches.map(({ id }) => {
    const applicable = effects.filter(({ participants }) => participants.includes(id))
    const conflicted = applicable.some((effect) => {
      const relation = relations.find((item) => item.id === effect.relationId)
      return relation?.kind === 'clash' || relation?.kind === 'punishment' || relation?.kind === 'break' || relation?.kind === 'harm'
    })
    const bound = applicable.some(({ relationId }) => relations.find((item) => item.id === relationId)?.kind === 'six_combination')
    return { entityId: id, state: conflicted ? 'conflicted' as const : bound ? 'bound' as const : 'active' as const,
      relationRefs: applicable.map(({ relationId }) => relationId) }
  })
  return { effects, runtime }
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

/** C-09/C-10 and I-04-2. Assess directed paths through the scoped main stems. */
export function evaluateBranchDamage(scopeId: string, dayStem: string | undefined, pattern: BranchPattern | null,
  branches: readonly BranchParticipant[], natalPositionIds: readonly (string | undefined)[],
  commandId: string | undefined, clashed: readonly string[], formed: ReturnType<typeof formations>,
  unconfirmedMainIds: ReadonlySet<string>, boundIds: readonly string[] = [], inherited: readonly BranchMainAction[] = [],
  bindings: ReturnType<typeof branchRelations> = [], support?: {
    scope: Scope
    facts: ReturnType<typeof branchRelations>
    effects: readonly BranchRelationEffect[]
    operatingStems: readonly StemParticipant[]
    dayRoot?: { state: RootState; facts: readonly ScopeRootFact[] }
  }) {
  if (!dayStem || !commandId || !pattern) return { paths: [], incomplete: [], protectivePaths: [], outputRefs: [], relations: [] }
  const subjects = branches.flatMap((branch) => {
    const main = HIDDEN_STEM_ROLE_TABLE[branch.branch].find(({ role }) => role === 'main')
    return main ? [{ ...branch, stem: main.stem, god: calculateTenGod(dayStem, main.stem) }] : []
  })
  const edges = subjects.flatMap((source) => subjects.flatMap((target): BranchMainAction[] => {
    if (source.id === target.id) return []
    const relation = calculateTenGod(source.stem, target.stem)
    const action = relation === '正財' || relation === '偏財' ? 'control'
      : relation === '食神' || relation === '傷官' ? 'generate' : null
    if (!action) return []
    const backing = formed.filter(({ participants, elementStem }) => participants.includes(source.id) && sameElement(elementStem, source.stem))
    const involvedFormation = backing.some(({ participants }) => participants.includes(target.id))
    const left = natalPositionIds.indexOf(source.id), right = natalPositionIds.indexOf(target.id)
    const reaches = left === -1 || right === -1 || Math.abs(left - right) === 1 || source.id === commandId || involvedFormation
    const available = !unconfirmedMainIds.has(source.id) && !unconfirmedMainIds.has(target.id)
    const weakened = (clashed.includes(source.id) || boundIds.includes(source.id)) && !backing.length
    return [{ id: recordId('branch-main-action', [scopeId, action, source.id, target.id]), action, source, target,
      reachable: available && reaches, confirmed: available && reaches && !weakened,
      evidenceRefs: backing.map(({ id }) => id) }]
  }))
  const directIds = new Set(branches.map(({ id }) => id))
  for (const relation of inherited) {
    if (directIds.has(relation.source.id) && directIds.has(relation.target.id)) continue
    const backing = formed.filter(({ participants, elementStem }) =>
      participants.includes(relation.source.id) && sameElement(elementStem, relation.source.stem))
    edges.push({ ...relation,
      confirmed: relation.reachable && (backing.length > 0 || !clashed.includes(relation.source.id) && !boundIds.includes(relation.source.id)),
      evidenceRefs: backing.map(({ id }) => id),
    })
  }
  const outputRefs = edges.filter(({ action, source, target, confirmed }) => confirmed && action === 'generate'
    && source.id === commandId && ['食神', '傷官'].includes(source.god) && ['偏財', '正財'].includes(target.god)).map(({ id }) => id)
  const incomplete: string[] = []
  const unresolvedRefs = new Set<string>()
  const protectivePaths: { entityId: string; relationRefs: string[] }[] = []
  if (pattern === '偏官') {
    const paths = edges.flatMap<BranchDamagePath>((feed) => {
      if (feed.action !== 'generate' || !['偏財', '正財'].includes(feed.source.god) || feed.target.id !== commandId) return []
      const guard = edges.find((edge) => edge.confirmed && edge.action === 'control' && edge.target.id === feed.source.id)
      if (guard) protectivePaths.push({ entityId: guard.source.id, relationRefs: [guard.id, feed.id] })
      if (feed.confirmed && guard) {
        return [{ sourceEntityId: feed.source.id, targetEntityId: feed.target.id,
          damagedFunction: 'branch_killing_protection', action: 'generate' as const, state: 'weakened' as const,
          relationRefs: [feed.id, guard.id, ...guard.evidenceRefs], protection: { entityId: guard.source.id,
            relationRefs: [guard.id, feed.id] } }]
      }
      // A182 §7: established transformation followed by a separately established attack on its resource.
      const affected = feed.confirmed && !guard && edges.find((shift) => shift.confirmed && shift.action === 'generate'
        && shift.source.id === commandId && ['偏印', '印綬'].includes(shift.target.god)
        && edges.some((supply) => supply.reachable && supply.action === 'generate' && supply.source.id === shift.target.id
          && ['比肩', '劫財'].includes(supply.target.god)))
      const attack = affected && edges.find((edge) => edge.confirmed && edge.action === 'control'
        && edge.source.id === feed.source.id && edge.target.id === affected.target.id)
      const backing = affected && formed.filter(({ participants, elementStem }) => participants.includes(affected.target.id)
        && sameElement(elementStem, affected.target.stem))
      if (affected && backing && backing.length) protectivePaths.push({ entityId: affected.target.id,
        relationRefs: [feed.id, affected.id, ...backing.map(({ id }) => id)] })
      // A contact with a supported mediator does not show residual damage.
      if (affected && attack && backing && !backing.length && clashed.includes(affected.target.id)) {
        return [{ sourceEntityId: feed.source.id, targetEntityId: affected.target.id,
        damagedFunction: 'branch_killing_protection', action: 'generate' as const, state: 'active' as const,
        relationRefs: [feed.id, affected.id, attack.id], protection: undefined }]
      }
      incomplete.push('BRANCH_WEALTH_KILLING_RESIDUAL_UNRESOLVED')
      unresolvedRefs.add(feed.id)
      return []
    })
    const refs = new Set([...unresolvedRefs, ...paths.flatMap(({ relationRefs }) => relationRefs), ...protectivePaths.flatMap(({ relationRefs }) => relationRefs)])
    return { paths, incomplete: [...new Set(incomplete)], protectivePaths, outputRefs, relations: edges.filter(({ id }) => refs.has(id)) }
  }
  if (['比肩', '劫財', '正財', '偏財'].includes(pattern)) {
    // BG-034/042 and SG-034: pressure and a verified output bridge can coexist.
    const paths = edges.flatMap<BranchDamagePath>((attack) => {
      if (attack.action !== 'control' || !['比肩', '劫財'].includes(attack.source.god)
        || !['正財', '偏財'].includes(attack.target.god) || ![attack.source.id, attack.target.id].includes(commandId)) return []
      if (!attack.confirmed) {
        incomplete.push('BRANCH_PEER_WEALTH_REACH_UNRESOLVED')
        unresolvedRefs.add(attack.id)
        return []
      }
      const head = edges.find((edge) => edge.confirmed && edge.action === 'generate' && edge.source.id === attack.source.id
        && ['食神', '傷官'].includes(edge.target.god) && edges.some((tail) =>
          tail.confirmed && tail.action === 'generate' && tail.source.id === edge.target.id && tail.target.id === attack.target.id))
      const tail = head && edges.find((edge) => edge.confirmed && edge.action === 'generate'
        && edge.source.id === head.target.id && edge.target.id === attack.target.id)
      const protection = head && tail ? { entityId: head.target.id, relationRefs: [head.id, tail.id, attack.id] } : undefined
      if (!protection && edges.some((start) => start.action === 'generate' && start.source.id === attack.source.id
        && ['食神', '傷官'].includes(start.target.god) && edges.some((end) =>
          end.action === 'generate' && end.source.id === start.target.id && end.target.id === attack.target.id))) {
        incomplete.push('BRANCH_PEER_WEALTH_RESIDUAL_AFTER_MEDIATION_UNRESOLVED')
        unresolvedRefs.add(attack.id)
        return []
      }
      if (protection) protectivePaths.push(protection)
      return [{ sourceEntityId: attack.source.id, targetEntityId: attack.target.id, damagedFunction: 'branch_wealth',
        action: 'control' as const, state: protection ? 'weakened' as const : 'active' as const,
        relationRefs: [attack.id, ...attack.evidenceRefs, ...(protection?.relationRefs.slice(0, 2) ?? [])], protection }]
    })
    // 07 L2334–2336. A scoped officer that reaches the peer month command has
    // an independent protective function before the next output attacks it.
    if (pattern === '劫財') for (const attack of edges) {
      if (attack.action !== 'control' || attack.source.god !== '傷官' || attack.target.god !== '正官'
        || attack.source.scope !== 'yearlyLuck' || attack.target.scope !== 'greatLuck' || !attack.reachable) continue
      const guards = edges.filter(guard => guard.action === 'control' && guard.source.god === '正官'
        && guard.target.id === commandId && guard.source.id !== attack.target.id && guard.confirmed)
      const role = edges.find(guard => guard.action === 'control' && guard.source.id === attack.target.id
        && guard.target.id === commandId && guard.reachable)
      if (!role) continue
      const binding = bindings.find(({ participants }) => participants.includes(attack.target.id)
        && participants.includes(attack.source.id))
      // Mutual binding can leave both functions reduced. Establish this only
      // when the attack reaches the same officer and another active output
      // backs it. Punishment alone supplies no directional effect.
      const backing = subjects.find(subject => subject.id !== attack.source.id && subject.god === '傷官'
        && subject.scope === 'natal' && subject.stem === attack.source.stem
        && !clashed.includes(subject.id) && !unconfirmedMainIds.has(subject.id))
      if ((!attack.confirmed || !role.confirmed) && (!binding || !backing || clashed.includes(attack.source.id))) {
        incomplete.push('BRANCH_OFFICER_ATTACK_REACH_UNRESOLVED')
        unresolvedRefs.add(attack.id)
        unresolvedRefs.add(role.id)
        continue
      }
      const support = guards[0]
      const refs = [attack.id, role.id, ...attack.evidenceRefs, ...(binding ? [binding.id] : []),
        ...(support ? [support.id] : [])]
      paths.push({ sourceEntityId: attack.source.id, targetEntityId: attack.target.id, damagedFunction: 'branch_officer',
        action: 'control', state: support || binding ? 'weakened' : 'active', relationRefs: refs,
        protection: support ? { entityId: support.source.id, relationRefs: [support.id, attack.id] } : undefined })
    }
    if (['正財', '偏財'].includes(pattern) && support?.scope === 'greatLuck' && support.dayRoot?.state === 'weakened') {
      // A repeated punishment only supplies adverse evidence when the incoming
      // Wealth also renews an active clash against the day master's root.
      const byId = new Map(subjects.map(subject => [subject.id, subject]))
      const triple = support.facts.filter(({ kind, participants }) => kind === 'punishment' && participants.length === 3
        && participants.includes(commandId))
      const incoming = subjects.find(({ scope, god }) => scope === support.scope && ['正財', '偏財'].includes(god))
      if (incoming && !clashed.includes(commandId) && !unconfirmedMainIds.has(commandId)) {
        const roots = support.dayRoot.facts
        const natalShape = triple.find(({ participants }) => participants.every(id => byId.get(id)?.scope === 'natal')
          && participants.some(id => byId.get(id)?.branch === incoming.branch))
        for (const { id: branchEntityId } of subjects) {
          const rootFacts = roots.filter(root => root.branchEntityId === branchEntityId)
          if (!rootFacts.length) continue
          const renewed = triple.filter(({ participants }) => participants.includes(incoming.id) && participants.includes(branchEntityId))
          const clash = support.facts.find(({ id, kind, participants }) => kind === 'clash'
            && participants.includes(incoming.id) && participants.includes(branchEntityId)
            && support.effects.some(effect => effect.relationId === id && effect.effect === 'active'))
          if (!natalShape || !renewed.length || !clash) continue
          paths.push({ sourceEntityId: incoming.id, targetEntityId: branchEntityId, damagedFunction: 'branch_wealth_capacity',
            action: 'clash', state: 'active',
            relationRefs: [clash.id, natalShape.id, ...renewed.map(({ id }) => id), ...rootFacts.map(({ id }) => id)] })
        }
      }
    }
    const refs = new Set([...unresolvedRefs, ...paths.flatMap(({ relationRefs }) => relationRefs)])
    return { paths, incomplete: [...new Set(incomplete)], protectivePaths, outputRefs, relations: edges.filter(({ id }) => refs.has(id)) }
  }
  if (pattern !== '食神' && pattern !== '正官') {
    return { paths: [], incomplete, protectivePaths, outputRefs, relations: edges.filter(({ id }) => outputRefs.includes(id)) }
  }
  const commandRecoveryRefs: string[] = []
  const peerRoot = support?.dayRoot?.facts.find(root => root.sourceClass === 'main'
    && subjects.some(subject => subject.id === root.branchEntityId && subject.scope === 'natal' && subject.god === '比肩')
    && !clashed.includes(root.branchEntityId) && !boundIds.includes(root.branchEntityId)
    && !unconfirmedMainIds.has(root.branchEntityId))
  const paths = edges.flatMap<BranchDamagePath>((attack) => {
    const food = pattern === '食神'
    if (attack.action !== 'control' || attack.target.id !== commandId
      || (food ? !['印綬', '偏印'].includes(attack.source.god) : attack.source.god !== '傷官')) return []
    const protection = edges.find((guard) => guard.confirmed && guard.action === 'control'
      && (food ? ['正財', '偏財'] : ['印綬', '偏印']).includes(guard.source.god) && guard.target.id === attack.source.id
      && !edges.some((counter) => counter.confirmed && counter.action === 'control' && counter.target.id === guard.source.id))
    const mediation = food && edges.find((feed) => feed.confirmed && feed.action === 'generate' && feed.source.id === attack.source.id
      && ['比肩', '劫財'].includes(feed.target.god) && edges.some((output) => output.confirmed && output.action === 'generate'
        && output.source.id === feed.target.id && output.target.id === commandId))
    const mediatorOutput = mediation && edges.find((output) => output.confirmed && output.action === 'generate'
      && output.source.id === mediation.target.id && output.target.id === commandId)
    if (mediation && mediatorOutput) protectivePaths.push({ entityId: mediation.target.id,
      relationRefs: [mediation.id, mediatorOutput.id, attack.id] })
    const activeBindings = bindings.filter(({ participants }) => participants.includes(attack.source.id)
      && !participants.includes(commandId) && branches.some(branch => participants.includes(branch.id)
        && branch.id !== attack.source.id && branch.scope !== 'natal'))
    // LK-099 and OP-Z12. The formation changes the attacker's participation
    // only when the arriving partner is independently protecting the command.
    const half = food && attack.reachable && support && formed.find(formation => formation.kind === 'half'
      && formation.participants.includes(attack.source.id) && !formation.participants.includes(commandId)
      && formation.participants.every(id => directIds.has(id))
      && !sameElement(formation.elementStem, attack.source.stem)
      && support.operatingStems.some(stem => sameElement(formation.elementStem, stem.stem))
      && branches.some(branch => branch.scope === support.scope && branch.id !== attack.source.id
        && formation.participants.includes(branch.id)
        && support.facts.some(({ id, kind, participants }) => kind === 'clash' && participants.includes(commandId)
          && participants.includes(branch.id) && support.effects.some(effect => effect.relationId === id && effect.effect === 'mitigated'))
        && bindings.some(({ participants }) => participants.includes(branch.id)
          && edges.some(other => other.action === 'control' && other.target.id === commandId
            && other.source.id !== attack.source.id && other.reachable && participants.includes(other.source.id)
            && ['印綬', '偏印'].includes(other.source.god)))))
    if (food && attack.reachable && (activeBindings.length || half)) {
      const partners = activeBindings[0]?.participants ?? (half ? half.participants : [])
      const entityId = partners.find(id => id !== attack.source.id)!
      const relationRefs = [attack.id, ...activeBindings.map(({ id }) => id), ...(half ? [half.id] : [])]
      protectivePaths.push({ entityId, relationRefs })
      if (half && peerRoot && !clashed.includes(commandId) && !boundIds.includes(commandId)) {
        commandRecoveryRefs.push(peerRoot.id, ...relationRefs)
      }
      return [{ sourceEntityId: attack.source.id, targetEntityId: attack.target.id, damagedFunction: 'branch_food',
        action: 'control' as const, state: 'weakened' as const, relationRefs, protection: { entityId, relationRefs } }]
    }
    if (!attack.confirmed || mediation && !protection) {
      incomplete.push(!food ? 'BRANCH_OFFICER_ATTACK_REACH_UNRESOLVED'
        : !attack.confirmed ? 'BRANCH_FOOD_ATTACK_REACH_UNRESOLVED' : 'BRANCH_FOOD_RESIDUAL_AFTER_MEDIATION_UNRESOLVED')
      unresolvedRefs.add(attack.id)
      return []
    }
    return [{ sourceEntityId: attack.source.id, targetEntityId: attack.target.id, damagedFunction: food ? 'branch_food' : 'branch_officer',
      action: 'control' as const, state: protection ? 'weakened' as const : 'active' as const,
      relationRefs: [attack.id, ...attack.evidenceRefs, ...(protection ? [protection.id, ...protection.evidenceRefs] : [])],
      ...(protection ? { protection: { entityId: protection.source.id, relationRefs: [protection.id, attack.id] } } : {}),
    }]
  })
  const refs = new Set([...outputRefs, ...unresolvedRefs, ...paths.flatMap(({ relationRefs }) => relationRefs),
    ...protectivePaths.flatMap(({ relationRefs }) => relationRefs)])
  return { paths, incomplete: [...new Set(incomplete)], protectivePaths, outputRefs,
    ...(commandRecoveryRefs.length && !incomplete.length && paths.every(({ state }) => state === 'weakened') && { commandRecoveryRefs }),
    relations: edges.filter(({ id }) => refs.has(id)) }
}

export function roots(scopeId: string, stems: readonly StemParticipant[], pool: readonly BranchParticipant[],
  relations: ReturnType<typeof branchRelations>, formed: ReturnType<typeof formations>, inheritedClashes: readonly string[] = [],
  relationEffects?: readonly BranchRelationEffect[]) {
  const activeRelationIds = relationEffects ? new Set(relationEffects.filter(({ effect }) => effect === 'active').map(({ relationId }) => relationId)) : null
  const clashed = new Set([...inheritedClashes, ...relations.filter((item) => item.kind === 'clash'
    && (!activeRelationIds || activeRelationIds.has(item.id))).flatMap((item) => item.participants)])
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
