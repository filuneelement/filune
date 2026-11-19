import type { CurrentPersonalityFact } from '../current/types'
import { canonicalIds as ids, compareId as order } from '../facts/personalityFacts'
import type { PersonalityConflict, PersonalityFact, StructuralRolePersonalityModifier } from '../types'
import type {
  PersonalityRenderSection, RenderedPersonalityBlock, RenderedPersonality, PersonalityRenderInput, RenderProvenance,
} from './types'

type Paragraph = RenderedPersonalityBlock['paragraphs'][number]
type Mode = 'outward' | 'inner'
export interface RenderTrait {
  fact: PersonalityFact
  phrase: string
  mode?: Mode
  currentState?: CurrentPersonalityFact['state']
  repeatsNatal?: boolean
}

type TraitKind = 'trait' | 'shadow' | 'growth'

export interface PersonalityWording {
  headings: Record<PersonalityRenderSection, string>
  traitPhrase(trait: string): string | undefined
  isCustomerSafe(text: string): boolean
  distinguishCurrentTraits?: boolean
  traitContext(trait: RenderTrait, current: boolean): string
  traits(input: { prefix: string; phrases: string[]; kind: TraitKind; conditional: boolean; reduced: boolean; repeatsNatal: boolean }): string
  role(input: {
    anchor: RenderTrait
    current: boolean
    standby: boolean
    pendingInterference: boolean
    conditional: boolean
    anchorConditional: boolean
    weakened: boolean
    favorableBaseline: boolean
    operation: StructuralRolePersonalityModifier['operation']
  }): string
  conflict(participants: RenderTrait[], current: boolean, conditional: boolean): string
}

function sectionFor({ fact, mode }: RenderTrait): PersonalityRenderSection {
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

function traitParagraphs(traits: RenderTrait[], wording: PersonalityWording, current = false): Paragraph[] {
  const groups = new Map<string, { prefix: string; conditional: boolean; kind: TraitKind; reduced: boolean; repeatsNatal: boolean; traits: RenderTrait[] }>()
  for (const trait of traits) {
    const conditional = current || trait.fact.status !== 'active'
    const prefix = wording.traitContext(trait, current)
    const kind = trait.fact.traitType === 'growth' ? 'growth' : trait.fact.traitType === 'shadow' ? 'shadow' : 'trait'
    const reduced = wording.distinguishCurrentTraits === true && trait.currentState === 'reduced'
    const repeatsNatal = wording.distinguishCurrentTraits === true && trait.repeatsNatal === true
    const key = JSON.stringify([prefix, conditional, kind, reduced, repeatsNatal])
    const group = groups.get(key) ?? { prefix, conditional, kind, reduced, repeatsNatal, traits: [] }
    group.traits.push(trait)
    groups.set(key, group)
  }
  const results: Paragraph[] = []
  for (const { prefix, conditional, kind, reduced, repeatsNatal, traits: group } of groups.values()) {
    const unique = ids(group.map(trait => trait.phrase))
    for (let index = 0; index < unique.length; index += 2) {
      const phrases = unique.slice(index, index + 2)
      results.push({
        text: wording.traits({ prefix, phrases, kind, conditional, reduced, repeatsNatal }),
        certainty: conditional || kind === 'growth' ? 'conditional' : 'confirmed',
        sourceFactIds: ids(group.filter(trait => phrases.includes(trait.phrase)).map(trait => trait.fact.id)),
        sourceConflictIds: [], sourceModifierIds: [],
      })
    }
  }
  return results
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
  role: StructuralRolePersonalityModifier, lookup: Map<string, RenderTrait>, current: boolean,
  wording: PersonalityWording, eligible?: ReadonlySet<string>,
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
  const favorableBaseline = pendingInterference && !anchorConditional && role.currentFunction === 'favorable'
  return {
    text: wording.role({
      anchor, current, standby, pendingInterference, conditional, anchorConditional,
      weakened: stance === 'weakened', favorableBaseline, operation: roleOperationMeaning(role),
    }),
    certainty: conditional ? 'conditional' : anchorConditional ? 'mixed' : 'confirmed',
    sourceFactIds: [anchor.fact.id], sourceModifierIds: [role.id], sourceConflictIds: [],
  }
}

function conflictParagraph(conflict: PersonalityConflict, lookup: Map<string, RenderTrait>, current: boolean, wording: PersonalityWording): Paragraph | undefined {
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
  return {
    text: wording.conflict(byContext, current, conditional),
    certainty: conditional ? 'conditional' : 'confirmed',
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

export function renderPersonality({ natal, current }: PersonalityRenderInput, wording: PersonalityWording): RenderedPersonality {
  const sections = new Map<PersonalityRenderSection, Paragraph[]>()
  const lookup = new Map<string, RenderTrait>()
  const add = (section: PersonalityRenderSection, paragraph?: Paragraph) => {
    if (!paragraph || !wording.isCustomerSafe(paragraph.text)) return
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
    const phrase = fact.provenanceIds.length && wording.traitPhrase(fact.trait)
    if (phrase) lookup.set(fact.id, { fact, phrase, mode: positionModes.get(fact.id) })
  }
  const natalConflicts = [...natal.conflicts].sort((a, b) => order(a.id, b.id))
  const conflictParagraphs = natalConflicts.flatMap(conflict => {
    const paragraph = conflictParagraph(conflict, lookup, false, wording)
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
    const phrase = visibleIds.has(fact.id) && fact.provenanceIds.length && wording.traitPhrase(fact.trait)
    if (phrase) lookup.set(fact.id, { fact, phrase, mode: activeCurrent.get(fact.id)?.expressionMode })
  }

  for (const section of Object.keys(wording.headings) as PersonalityRenderSection[]) {
    const traits = natal.facts.flatMap(fact => {
      const trait = lookup.get(fact.id)
      return trait && !describedTogether.has(fact.id) && sectionFor(trait) === section ? [trait] : []
    }).sort((a, b) => Number(a.fact.sourceType !== 'day_stem') - Number(b.fact.sourceType !== 'day_stem')
      || order(a.fact.id, b.fact.id))
    traitParagraphs(traits, wording).forEach(paragraph => add(section, paragraph))
  }
  for (const paragraph of conflictParagraphs) add('emotion', paragraph)

  function renderRoles(roles: StructuralRolePersonalityModifier[], isCurrent: boolean, conflicts: PersonalityConflict[]) {
    for (const role of [...roles].sort((a, b) => order(a.id, b.id))) {
      const paragraph = roleParagraph(role, lookup, isCurrent, wording, isCurrent ? currentRoleTargets : undefined)
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
      return trait ? [{ ...trait, mode: item.expressionMode ?? trait.mode, currentState: item.state, repeatsNatal: item.origin === 'natal' }] : []
    }).sort((a, b) => order(a.fact.id, b.fact.id)), wording, true).forEach(paragraph => add('currentExpression', paragraph))
    const currentConflicts = [...current.conflicts].sort((a, b) => order(a.id, b.id))
    for (const conflict of currentConflicts) {
      if (!conflict.factIds.every(id => activeCurrent.has(id))) continue
      if (!conflict.factIds.some(id => visibleIds.has(id)) || conflict.factIds.some(id =>
        activeCurrent.get(id)?.origin === 'luck' && !visibleIds.has(id))) continue
      if (conflict.conflictType === 'natal_vs_current' || conflict.conflictType === 'temporary_expression_tension') {
        add('currentExpression', conflictParagraph(conflict, lookup, true, wording))
      }
    }
    const selected = current.scopeExpressions.find(scope => scope.scopeId === current.evaluationScopeId)
    const roleEffects = new Map(selected?.roleModifierStates.map(role => [role.modifierId, role.sourceStructuralEffectIds]))
    renderRoles(current.structuralRoleModifiers.filter(role => {
      const effects = roleEffects.get(role.id) ?? []
      return changedRole(role, natalRoles.get(role.id)) && (!effects.length || effects.some(eventIsLive))
    }), true, currentConflicts)
  }

  const result: RenderedPersonality = { provenance: [] }
  for (const section of Object.keys(wording.headings) as PersonalityRenderSection[]) {
    const paragraphs = sections.get(section)
    if (!paragraphs?.length) continue
    const references = evidence(paragraphs)
    const certainty = paragraphs.every(item => item.certainty === 'confirmed') ? 'confirmed'
      : paragraphs.every(item => item.certainty === 'conditional') ? 'conditional' : 'mixed'
    result[section] = { heading: wording.headings[section], text: paragraphs.map(item => item.text).join('\n\n'),
      certainty, paragraphs, ...references }
    result.provenance.push(references)
  }
  return result
}
