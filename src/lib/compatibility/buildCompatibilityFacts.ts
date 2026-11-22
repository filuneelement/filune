import { calculateTenGod } from '../dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from '../hiddenStemRoleTable'
import { branchRelations, formations } from '../judgment/core/branches'
import type { BranchParticipant } from '../judgment/core/branches'
import { hasPair, hasGroup, STEM_COMBINATIONS, THREE_COMBINATIONS, THREE_PUNISHMENTS } from '../judgment/producers/relationCatalog'
import { recordId, sortedUnique } from '../judgment/producers/shared'
import { linkCrossPathEvidence } from './pathEvidence'
import type { CompatibilityFacts, CompatibilityPerson, CrossBranchInteractionFact, CrossDirection,
  CrossParticipant, CrossRoleInteractionFact, CrossRootSupportFact, CrossStemInteractionFact } from './types'

const positions = ['year', 'month', 'day', 'time'] as const
const participantKey = ({ personId, entityId }: CrossParticipant) => recordId('participant', [personId, entityId])
const sourceIds = (participants: readonly CrossParticipant[]) =>
  sortedUnique(participants.flatMap(part => [part.judgmentId, part.entityId]))
const inOrder = <T extends { id: string }>(items: T[]) => items.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

function members(person: CompatibilityPerson) {
  const { judgment, chart, id } = person
  if (judgment.scope !== 'natal') throw new TypeError('Compatibility requires a natal Judgment snapshot')
  const directIds = new Set(judgment.directEntityIds)
  function collect<Value extends string>(read: (pillar: NonNullable<CompatibilityPerson['chart']['year']>) =>
    { id: string; value: Value } | undefined) {
    return positions.flatMap(position => {
      const pillar = chart[position]
      const entity = pillar && read(pillar)
      if (!entity) return []
      if (!directIds.has(entity.id)) throw new TypeError('Compatibility chart entity is missing from natal Judgment')
      return [{ personId: id, judgmentId: judgment.id, entityId: entity.id,
        position: position === 'time' ? 'hour' as const : position, value: entity.value }]
    })
  }
  const stems = collect(pillar => pillar.stem)
  const branches = collect(pillar => pillar.branch)
  const ids = [...stems, ...branches].map(part => part.entityId)
  if (new Set(ids).size !== ids.length) throw new TypeError('Compatibility chart entities must have unique IDs within a person')
  return { ...person, stems, branches,
    runtime: new Map(judgment.runtime.map(entry => [entry.entityId, entry.state])) }
}

type Person = ReturnType<typeof members>
function available(person: Person, part: CrossParticipant) {
  const state = person.runtime.get(part.entityId)
  return state === 'active' || state === 'weakened'
}

function stemInteractions(first: Person, second: Person) {
  const facts: CrossStemInteractionFact[] = []
  for (const a of first.stems) for (const b of second.stems) {
    const participants = [a, b] as const
    const directions = [{ source: a, target: b }, { source: b, target: a }]
    const bothAvailable = available(first, a) && available(second, b)
    const refs = sourceIds(participants)
    if (hasPair(STEM_COMBINATIONS, a.value, b.value)) {
      facts.push({ id: recordId('cross-stem', ['combine', participantKey(a), participantKey(b)]),
        action: 'combine', participants, sourceFactIds: refs, provenance: ['Master09:EX-050', 'Compatibility:C-02'],
        compatibilityRuntimeEffects: bothAvailable ? directions.map(direction => ({ ...direction, state: 'stopped' })) : [] })
    }
    for (const direction of directions) {
      const { source, target } = direction
      const relative = calculateTenGod(source.value, target.value)
      const action = relative === '食神' || relative === '傷官' ? 'generate'
        : relative === '正財' || relative === '偏財' ? 'control' : null
      if (!action) continue
      facts.push({ id: recordId('cross-stem', [action, participantKey(source), participantKey(target)]),
        action, participants: [source, target], direction, sourceFactIds: refs,
        provenance: ['Master09:EX-050', 'Compatibility:C-02'],
        compatibilityRuntimeEffects: action === 'control' && bothAvailable ? [{ ...direction, state: 'weakened' }] : [] })
    }
  }
  return facts
}

function branchInteractions(first: Person, second: Person) {
  const people = [...first.branches, ...second.branches]
  const byKey = new Map(people.map(person => [participantKey(person), person]))
  const pool: BranchParticipant[] = people.map(person => ({
    id: participantKey(person), branch: person.value, scope: 'natal',
  }))
  const facts: CrossBranchInteractionFact[] = []
  function add(relationType: CrossBranchInteractionFact['relationType'], participants: readonly CrossParticipant[], elementStem?: string) {
    if (new Set(participants.map(part => part.personId)).size !== 2) return
    facts.push({ id: recordId('cross-branch', [relationType, ...participants.map(participantKey).sort()]),
      relationType, participants, formation: elementStem !== undefined, strengthensElement: elementStem !== undefined,
      ...(elementStem !== undefined && { elementStem }),
      spousePalacePair: participants.filter(part => part.position === 'day').length === 2,
      sourceFactIds: sourceIds(participants), provenance: ['Master03'] })
  }
  for (const relation of branchRelations('compatibility', pool)) {
    add(relation.kind, relation.participants.map(id => byKey.get(id)!))
  }
  for (const a of first.branches) for (const b of second.branches) {
    if (THREE_COMBINATIONS.some(group => group[0] === a.value && group[2] === b.value
      || group[2] === a.value && group[0] === b.value)) add('three_partial_without_center', [a, b])
  }
  for (const formation of formations('compatibility', pool)) {
    const { kind } = formation
    if (kind === 'three' || kind === 'half' || kind === 'season') {
      add(kind, formation.participants.map(id => byKey.get(id)!), formation.elementStem)
    }
  }
  for (const [i, a] of people.entries()) for (const [j, b] of people.entries()) {
    if (j <= i) continue
    for (const c of people.slice(j + 1)) {
      const group = [a, b, c]
      if (hasGroup(THREE_PUNISHMENTS, group.map(part => part.value))) add('three_punishment', group)
    }
  }
  return facts
}

function rootSupport(provider: Person, receiver: Person): CrossRootSupportFact[] {
  return provider.branches.flatMap(branch => receiver.stems.flatMap(stem =>
    HIDDEN_STEM_ROLE_TABLE[branch.value].flatMap(hidden => {
      const relative = calculateTenGod(stem.value, hidden.stem)
      if (relative !== '比肩' && relative !== '劫財') return []
      return [{ id: recordId('cross-root', [participantKey(branch), participantKey(stem), hidden.stem, hidden.role]),
        provider: branch, receiver: stem, hiddenStem: hidden.stem, hiddenStemLevel: hidden.role,
        rootPriority: hidden.role === 'main' ? 'main' : 'secondary',
        rootType: 'same_element_hidden_stem', sourceFactIds: sourceIds([branch, stem]),
        provenance: [provider.judgment.evidence.hiddenStemTableRef, 'Master04', 'Compatibility:C-03'] }]
    })))
}

function roleInteractions(people: readonly Person[], stems: readonly CrossStemInteractionFact[],
  roots: readonly CrossRootSupportFact[]): CrossRoleInteractionFact[] {
  const facts: CrossRoleInteractionFact[] = []
  const natal = new Map(people.map(person => [person.id, person]))
  function link(direction: CrossDirection, action: CrossRoleInteractionFact['action'], interactionId: string, effective: boolean) {
    const { source, target } = direction
    const { judgment } = natal.get(target.personId)!
    const paths = [...judgment.stemFacts, ...judgment.patternFacts]
    const pathIds = new Set(paths.map(path => path.id))
    const linkedPaths = new Set<string>()
    for (const role of judgment.roleEngine.roleHistory.filter(item => item.entityId === target.entityId)) {
      const current = judgment.roleEngine.currentRoles.find(item => item.roleId === role.roleId)
      const targetPathIds = sortedUnique([...role.pathRefs, ...(current?.pathRefs ?? [])].filter(id => pathIds.has(id)))
      const harmful = role.role === 'Byeong' || role.role === 'ConditionalByeong'
      if (harmful) targetPathIds.forEach(id => linkedPaths.add(id))
      const operating = current?.currentFunction === 'operating' || current?.currentFunction === 'reduced'
      const supports = action === 'root_support' || action === 'generate'
      const interactionType = !effective ? 'role_contact'
        : harmful ? supports ? 'harmful_activation_candidate'
          : operating && targetPathIds.length ? 'relief_candidate' : 'role_contact'
          : supports ? 'support_candidate' : operating ? 'damage_candidate' : 'role_contact'
      const pathEvidence = linkCrossPathEvidence(judgment, role, current, action, interactionId, effective)
      facts.push({
        id: recordId('cross-role', [interactionId, participantKey(target), role.roleId]),
        source, target, action, sourceInteractionId: interactionId, interactionType,
        targetRoleId: role.roleId, targetRole: role.role,
        ...(harmful && { targetByeongId: role.roleId }),
        ...(current && { currentState: current.currentState, currentFunction: current.currentFunction }),
        targetPathIds, sourceFactIds: sortedUnique([...sourceIds([source, target]), interactionId, role.roleId, ...targetPathIds]),
        provenance: ['Master05', 'Master06', 'Compatibility:C-02', 'Compatibility:C-03'],
        ...(pathEvidence.length && { pathEvidence }),
      })
    }
    if (!effective || (action !== 'root_support' && action !== 'generate')) return
    // Preserve observed output paths even when Judgment has not assigned a harmful role.
    for (const path of judgment.stemFacts.filter(item => item.source.id === target.entityId
      && item.action !== 'combine' && !linkedPaths.has(item.id))) {
      const actual = judgment.actualFunctions.find(item => item.relationFactId === path.id)
      if (!actual) continue
      facts.push({
        id: recordId('cross-role', [interactionId, participantKey(target), path.id]),
        source, target, action, sourceInteractionId: interactionId,
        interactionType: actual.byeongCandidate ? 'harmful_activation_candidate' : 'path_contact',
        targetPathIds: [path.id], currentFunction: actual.function,
        sourceFactIds: sortedUnique([...sourceIds([source, target]), interactionId, path.id]),
        provenance: ['Master05', 'Master06', 'Compatibility:C-03'],
      })
    }
  }
  for (const stem of stems) {
    for (const effect of stem.compatibilityRuntimeEffects) link(effect, stem.action, stem.id, true)
    if (stem.action === 'generate' && stem.direction) {
      const effective = [stem.direction.source, stem.direction.target].every(part => available(natal.get(part.personId)!, part))
      link(stem.direction, stem.action, stem.id, effective)
    }
  }
  for (const root of roots) {
    link({ source: root.provider, target: root.receiver }, 'root_support', root.id,
      available(natal.get(root.receiver.personId)!, root.receiver))
  }
  return facts
}

/** Identity uses C1's canonical ordering of the two person IDs. */
export function compatibilityPairIdentity(a: string, b: string) {
  if (!a || !b || a === b) throw new TypeError('Compatibility requires distinct person IDs')
  const canonicalOrder = a < b ? [a, b] as const : [b, a] as const
  return { pairId: recordId('compatibility-pair', canonicalOrder), canonicalOrder }
}

/** Evaluates two independent natal snapshots; no personal states are written or re-evaluated. */
export function buildCompatibilityFacts(a: CompatibilityPerson, b: CompatibilityPerson): CompatibilityFacts {
  const { canonicalOrder } = compatibilityPairIdentity(a.id, b.id)
  const [first, second] = canonicalOrder[0] === a.id ? [members(a), members(b)] : [members(b), members(a)]
  const stems = stemInteractions(first, second)
  const roots = [...rootSupport(first, second), ...rootSupport(second, first)]
  return {
    stemInteractions: inOrder(stems),
    branchInteractions: inOrder(branchInteractions(first, second)),
    rootSupport: inOrder(roots),
    roleInteractions: inOrder(roleInteractions([first, second], stems, roots)),
    diagnostics: [first, second].flatMap(({ id, chart }) => {
      const unavailableParts = (['stem', 'branch'] as const).filter(part => !chart.time?.[part])
      return unavailableParts.length ? [{ personId: id, code: 'HOUR_UNAVAILABLE', unavailableParts }] : []
    }),
  }
}
