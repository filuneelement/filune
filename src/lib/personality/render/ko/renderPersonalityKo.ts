import type { PersonalityConflict, PersonalityFact, StructuralRolePersonalityModifier } from '../../types'
import type {
  PersonalityKoSection, RenderedPersonalityBlock, RenderedPersonalityKo, RenderPersonalityKoInput, RenderProvenance,
} from '../types'
import { isCustomerSafeKo } from './guardrails'
import { traitPhrase } from './wording'

const headings = {
  overview: '타고난 모습',
  outward: '겉으로 보이는 모습',
  closeRelations: '가까워졌을 때 드러나는 모습',
  decision: '판단하는 방식',
  emotion: '감정을 다루는 방식',
  strengths: '잘 발휘되는 면',
  cautions: '살피면 좋은 면',
  currentExpression: '요즘 더 드러나는 모습',
} satisfies Record<PersonalityKoSection, string>

type Paragraph = RenderedPersonalityBlock['paragraphs'][number]
type Mode = 'outward' | 'inner'
type Trait = { fact: PersonalityFact; phrase: string; mode?: Mode }

const ids = (values: Iterable<string>) => [...new Set(values)].sort()
const order = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

function sectionFor({ fact, mode }: Trait): PersonalityKoSection {
  switch (fact.traitType) {
    case 'social': return 'outward'
    case 'interpersonal':
    case 'inner': return 'closeRelations'
    case 'decision': return 'decision'
    case 'stress':
    case 'internal_conflict': return 'emotion'
    case 'strength': return 'strengths'
    case 'shadow':
    case 'growth': return 'cautions'
    case 'expression': return mode === 'outward' ? 'outward' : mode === 'inner' ? 'closeRelations' : 'emotion'
    case 'work': return mode === 'inner' ? 'decision' : 'outward'
    case 'core':
      if (fact.sourceType === 'day_stem') return 'overview'
      return mode === 'outward' ? 'outward' : mode === 'inner' ? 'closeRelations' : 'overview'
  }
}

function context({ fact, mode }: Trait): string {
  if (fact.sourcePosition === 'month_branch') return '평소 속으로는'
  if (fact.sourcePosition === 'hour_branch') return '혼자 생각할 때는'
  if (fact.sourcePosition === 'day_branch') return '생활 속에서는'
  if (fact.sourceType === 'day_stem' && fact.traitType === 'core') return '기본적으로'
  if (fact.sourceType === 'day_pillar' && fact.traitType === 'core') return '또'
  if (mode === 'outward') return '겉으로는'
  return ''
}

function joinPhrases(phrases: string[]): string {
  const last = phrases[phrases.length - 1]
  if (phrases.length === 1) return last
  return phrases.slice(0, -1).join(', ') + ' 모습과 ' + last
}

function traitParagraphs(traits: Trait[], current = false): Paragraph[] {
  const groups = new Map<string, { prefix: string; conditional: boolean; kind: 'trait' | 'shadow' | 'growth'; traits: Trait[] }>()
  for (const trait of traits) {
    const conditional = current || trait.fact.status !== 'active'
    const prefix = current ? '요즘은 ' + (trait.mode === 'outward' ? '겉으로' : trait.mode === 'inner' ? '속으로' : '')
      : context(trait)
    const kind = trait.fact.traitType === 'growth' ? 'growth' : trait.fact.traitType === 'shadow' ? 'shadow' : 'trait'
    const key = JSON.stringify([prefix, conditional, kind])
    const group = groups.get(key) ?? { prefix, conditional, kind, traits: [] }
    group.traits.push(trait)
    groups.set(key, group)
  }
  const results: Paragraph[] = []
  for (const { prefix, conditional, kind, traits: group } of groups.values()) {
    const unique = ids(group.map(trait => trait.phrase))
    for (let index = 0; index < unique.length; index += 2) {
      const phrases = unique.slice(index, index + 2)
      const label = joinPhrases(phrases)
      const start = prefix.trim() ? prefix.trim() + ' ' : ''
      const text = kind === 'growth'
        ? `${start}${label} 방식을 살펴볼 수 있어.`
        : `${start}${label} 면이 ${conditional ? '드러날 수 있어' : '있어'}.`
      results.push({
        text,
        certainty: conditional || kind === 'growth' ? 'conditional' : 'confirmed',
        sourceFactIds: ids(group.filter(trait => phrases.includes(trait.phrase)).map(trait => trait.fact.id)),
        sourceConflictIds: [], sourceModifierIds: [],
      })
    }
  }
  return results
}

const operations: Record<StructuralRolePersonalityModifier['operation'], readonly [string, string]> = {
  supports_expression: ['다른 면이 드러나는 데 힘을 보태는 쪽으로 쓰여', '다른 면이 드러나는 데 힘을 보탤 수 있어'],
  channels_expression: ['행동의 방향을 잡는 데 쓰여', '행동의 방향을 잡는 데 쓰일 수 있어'],
  restrains_expression: ['다른 면의 표현을 누그러뜨리는 쪽으로 쓰여', '다른 면의 표현을 누그러뜨릴 수 있어'],
  distorts_expression: ['다른 면을 드러내기 어렵게 하기도 해', '다른 면을 드러내기 어렵게 할 수 있어'],
  protects_expression: ['다른 면이 제 역할을 하도록 받쳐 줘', '다른 면이 제 역할을 하도록 받쳐 줄 수 있어'],
  resolves_tension: ['엇갈리는 면이 균형을 잡도록 도와줘', '엇갈리는 면이 균형을 잡도록 도울 수 있어'],
  contextualizes: ['상황에 따라 쓰이는 방식이 달라져', '상황에 따라 쓰이는 방식이 달라질 수 있어'],
}

const roleStance = {
  confirmed: 'assertive', contextual: 'conditional', deferred: 'conditional',
  reduced: 'weakened', inactive: 'omit',
} as const satisfies Record<StructuralRolePersonalityModifier['status'], string>

function roleOperationMeaning(role: StructuralRolePersonalityModifier) {
  if (role.operation !== 'contextualizes') return role.operation
  if (role.roleContext === 'protective_standby') return 'protects_expression'
  if (role.roleContext === 'conditional_byeong') return 'distorts_expression'
  return role.operation
}

function roleParagraph(
  role: StructuralRolePersonalityModifier, lookup: Map<string, Trait>, current: boolean,
  eligible?: ReadonlySet<string>,
): Paragraph | undefined {
  const stance = roleStance[role.status]
  if (stance === 'omit') return undefined
  if (role.sourceRole === 'byeong' && !role.damagePath
    && (role.roleContext !== 'conditional_byeong' || !role.historyPathRefs.length)) return undefined
  if (role.sourceRole === 'gueung' && !role.targetByeongId) return undefined
  const anchor = ids(role.targetPersonalityFactIds).filter(id => !eligible || eligible.has(id))
    .map(id => lookup.get(id)).find(trait => trait !== undefined)
  if (!anchor) return undefined
  const standby = role.roleContext === 'protective_standby'
  const conditionalHistory = role.roleContext === 'conditional_byeong'
  const operating = role.currentFunction === 'operating'
  const pendingInterference = conditionalHistory && !operating
  const conditional = stance !== 'assertive' || standby || pendingInterference || role.operation === 'contextualizes'
  const anchorConditional = anchor.fact.status !== 'active'
  const prefix = current ? '요즘은 ' : ''
  const condition = standby ? '받쳐 줄 필요가 생기면 '
    : pendingInterference ? '다른 반응과 맞물리는 상황에서는 ' : ''
  const operation = operations[roleOperationMeaning(role)][conditional ? 1 : 0]
  const subject = !conditional && anchorConditional ? ' 면이 드러나면 그 면은 ' : ' 면이 '
  const limitation = stance === 'weakened' ? '제한적으로 ' : ''
  const favorableBaseline = pendingInterference && !anchorConditional && role.currentFunction === 'favorable'
  const text = favorableBaseline
    ? `${anchor.phrase} 면은 평소에도 쓰여. 다만 ${prefix}${condition}그 면이 ${limitation}${operation}.`
    : `${prefix}${condition}${anchor.phrase}${subject}${limitation}${operation}.`
  return {
    text,
    certainty: conditional ? 'conditional' : anchorConditional ? 'mixed' : 'confirmed',
    sourceFactIds: [anchor.fact.id], sourceModifierIds: [role.id], sourceConflictIds: [],
  }
}

function conflictParagraph(conflict: PersonalityConflict, lookup: Map<string, Trait>, current: boolean): Paragraph | undefined {
  const participants = ids(conflict.factIds).flatMap(id => {
    const trait = lookup.get(id)
    return trait ? [trait] : []
  })
  if (!participants.length || participants.length !== new Set(conflict.factIds).size) return undefined
  // Role conflicts reuse the operations already supplied by the engine.
  // Conflict IDs are attached to the relevant role paragraphs below.
  if (conflict.conflictType === 'structural_role_tension' || conflict.conflictType === 'conditional_role_shift') return undefined
  const conditional = conflict.resolution === 'deferred' || current || participants.some(item => item.fact.status !== 'active')
  const byContext = [...participants].sort((a, b) => order(a.mode === 'outward' ? '' : a.mode ?? 'other', b.mode === 'outward' ? '' : b.mode ?? 'other'))
  const clauses = byContext.map(item => {
    const prefix = item.mode === 'outward' ? '겉으로는 ' : item.mode === 'inner' ? '속으로는 ' : ''
    return `${prefix}${item.phrase} 면`
  })
  const text = clauses.length === 1
    ? `${clauses[0]}에서 상황에 따라 다른 반응이 ${conditional ? '나올 수 있어' : '함께 드러나'}.`
    : `${current ? '요즘은 ' : ''}${clauses.join('과 ')}이 ${conditional ? '함께 드러날 수 있어' : '함께 드러나'}.`
  return {
    text, certainty: conditional ? 'conditional' : 'confirmed',
    sourceFactIds: ids(conflict.factIds), sourceModifierIds: [], sourceConflictIds: [conflict.id],
  }
}

function evidence(paragraphs: Paragraph[]): RenderProvenance {
  return {
    sourceFactIds: ids(paragraphs.flatMap(item => item.sourceFactIds)),
    sourceModifierIds: ids(paragraphs.flatMap(item => item.sourceModifierIds)),
    sourceConflictIds: ids(paragraphs.flatMap(item => item.sourceConflictIds)),
  }
}

function changedRole(role: StructuralRolePersonalityModifier, natal?: StructuralRolePersonalityModifier) {
  return !natal || role.status !== natal.status || role.operation !== natal.operation
    || role.currentFunction !== natal.currentFunction || role.roleContext !== natal.roleContext
}

export function renderPersonalityKo({ natal, current }: RenderPersonalityKoInput): RenderedPersonalityKo {
  const sections = new Map<PersonalityKoSection, Paragraph[]>()
  const lookup = new Map<string, Trait>()
  const add = (section: PersonalityKoSection, paragraph?: Paragraph) => {
    if (!paragraph || !isCustomerSafeKo(paragraph.text)) return
    const paragraphs = sections.get(section) ?? []
    const duplicate = paragraphs.find(item => item.text === paragraph.text)
    if (duplicate) Object.assign(duplicate, evidence([duplicate, paragraph]))
    else paragraphs.push(paragraph)
    sections.set(section, paragraphs)
  }

  const positionModes = new Map<string, Mode>()
  for (const position of natal.positionExpressions) {
    if (position.expressionMode === 'outward') position.factIds.forEach(id => positionModes.set(id, 'outward'))
    if (['inner', 'decision', 'innate', 'private'].includes(position.expressionMode)) {
      position.factIds.forEach(id => positionModes.set(id, 'inner'))
    }
  }
  for (const fact of [...natal.facts].sort((a, b) => order(a.id, b.id))) {
    const phrase = fact.provenanceIds.length && traitPhrase(fact.trait)
    if (phrase) lookup.set(fact.id, { fact, phrase, mode: positionModes.get(fact.id) })
  }
  const natalConflicts = [...natal.conflicts].sort((a, b) => order(a.id, b.id))
  const conflictParagraphs = natalConflicts.flatMap(conflict => {
    const paragraph = conflictParagraph(conflict, lookup, false)
    return paragraph ? [paragraph] : []
  })
  const describedTogether = new Set(conflictParagraphs.flatMap(paragraph => paragraph.sourceFactIds)
    .filter(id => lookup.get(id)?.fact.traitType === 'internal_conflict'))
  const natalRoles = new Map(natal.structuralRoleModifiers.map(role => [role.id, role]))
  const activeCurrent = new Map(current?.currentFacts.filter(fact => fact.currentlyEffective
    && fact.state !== 'inactive').map(fact => [fact.personalityFactId, fact]))
  const history = new Map(current?.effectHistory.map(event => [event.id, event]))
  const eventIsLive = (id: string) => {
    const event = history.get(id)
    return !event || event.currentlyEffective && !event.expired
  }
  const visibleCurrent = [...activeCurrent.values()].filter(fact => fact.origins.some(origin => {
    return eventIsLive(origin.originEffectId)
  }))
  const visibleIds = new Set(visibleCurrent.map(item => item.personalityFactId))
  const currentRoleTargets = new Set([...activeCurrent.values()].filter(item => item.origin === 'natal'
    || visibleIds.has(item.personalityFactId)).map(item => item.personalityFactId))
  for (const fact of current?.temporaryFacts ?? []) {
    const phrase = visibleIds.has(fact.id) && fact.provenanceIds.length && traitPhrase(fact.trait)
    if (phrase) lookup.set(fact.id, { fact, phrase, mode: activeCurrent.get(fact.id)?.expressionMode })
  }

  for (const section of Object.keys(headings) as PersonalityKoSection[]) {
    const traits = natal.facts.flatMap(fact => {
      const trait = lookup.get(fact.id)
      return trait && !describedTogether.has(fact.id) && sectionFor(trait) === section ? [trait] : []
    }).sort((a, b) => Number(a.fact.sourceType !== 'day_stem') - Number(b.fact.sourceType !== 'day_stem')
      || order(a.fact.id, b.fact.id))
    traitParagraphs(traits).forEach(paragraph => add(section, paragraph))
  }
  for (const paragraph of conflictParagraphs) add('emotion', paragraph)

  function renderRoles(roles: StructuralRolePersonalityModifier[], isCurrent: boolean, conflicts: PersonalityConflict[]) {
    for (const role of [...roles].sort((a, b) => order(a.id, b.id))) {
      const paragraph = roleParagraph(role, lookup, isCurrent, isCurrent ? currentRoleTargets : undefined)
      if (!paragraph) continue
      paragraph.sourceConflictIds = ids(conflicts.flatMap(conflict =>
        'modifierIds' in conflict && Array.isArray(conflict.modifierIds) && conflict.modifierIds.includes(role.id) ? [conflict.id] : []))
      add(isCurrent ? 'currentExpression' : role.operation === 'distorts_expression' ? 'cautions' : 'overview', paragraph)
    }
  }
  renderRoles(natal.structuralRoleModifiers, false, natalConflicts)
  if (current) {
    traitParagraphs(visibleCurrent.flatMap(item => {
      const trait = lookup.get(item.personalityFactId)
      return trait ? [{ ...trait, mode: item.expressionMode ?? trait.mode }] : []
    }).sort((a, b) => order(a.fact.id, b.fact.id)), true).forEach(paragraph => add('currentExpression', paragraph))
    const currentConflicts = [...current.conflicts].sort((a, b) => order(a.id, b.id))
    for (const conflict of currentConflicts) {
      if (!conflict.factIds.every(id => activeCurrent.has(id))) continue
      if (!conflict.factIds.some(id => visibleIds.has(id)) || conflict.factIds.some(id =>
        activeCurrent.get(id)?.origin === 'luck' && !visibleIds.has(id))) continue
      if (conflict.conflictType === 'natal_vs_current' || conflict.conflictType === 'temporary_expression_tension') {
        add('currentExpression', conflictParagraph(conflict, lookup, true))
      }
    }
    const selected = current.scopeExpressions.find(scope => scope.scopeId === current.evaluationScopeId)
    const roleEffects = new Map(selected?.roleModifierStates.map(role => [role.modifierId, role.sourceStructuralEffectIds]))
    renderRoles(current.structuralRoleModifiers.filter(role => {
      const effects = roleEffects.get(role.id) ?? []
      return changedRole(role, natalRoles.get(role.id)) && (!effects.length || effects.some(eventIsLive))
    }), true, currentConflicts)
  }

  const result: RenderedPersonalityKo = { provenance: [] }
  for (const section of Object.keys(headings) as PersonalityKoSection[]) {
    const paragraphs = sections.get(section)
    if (!paragraphs?.length) continue
    const references = evidence(paragraphs)
    const certainty = paragraphs.every(item => item.certainty === 'confirmed') ? 'confirmed'
      : paragraphs.every(item => item.certainty === 'conditional') ? 'conditional' : 'mixed'
    result[section] = { heading: headings[section], text: paragraphs.map(item => item.text).join('\n\n'),
      certainty, paragraphs, ...references }
    result.provenance.push(references)
  }
  return result
}
