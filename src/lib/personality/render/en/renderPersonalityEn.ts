import type { StructuralRolePersonalityModifier } from '../../types'
import type { PersonalityRenderInput, RenderedPersonality } from '../types'
import { renderPersonality, type PersonalityWording, type RenderTrait } from '../renderPersonality'
import { isCustomerSafeEn } from './guardrails'
import { traitPhraseEn } from './wording'

const operations: Record<StructuralRolePersonalityModifier['operation'], readonly [string, string]> = {
  supports_expression: ['helps another tendency come through', 'can help another tendency come through'],
  channels_expression: ['shapes the direction your actions take', 'can shape the direction your actions take'],
  restrains_expression: ['holds back how another tendency comes through', 'can hold back how another tendency comes through'],
  distorts_expression: ['is getting in the way of another part of how you respond', 'can get in the way of another part of how you respond'],
  protects_expression: ['helps keep another tendency working', 'can help keep another tendency working'],
  resolves_tension: ['eases the tension between those competing responses', 'can ease the tension between those competing responses'],
  contextualizes: ['works differently depending on the situation', 'can work differently depending on the situation'],
}

function expressionContext(trait: RenderTrait): string {
  if (trait.mode === 'outward') return 'Around other people'
  if (trait.mode === 'inner') return 'In private'
  return ''
}

function sentence(prefix: string, clause: string): string {
  const text = prefix ? `${prefix}, ${clause}` : clause
  return text[0].toUpperCase() + text.slice(1) + '.'
}

function qualifiedPhrase(phrase: string, conditional: boolean, also = ''): string {
  // Some source traits describe a possibility in their own right.
  return conditional && !/^(?:sometimes |tend to |can )/u.test(phrase)
    ? `may ${also}${phrase}`
    : also + phrase
}

const wording: PersonalityWording = {
  headings: {
    overview: 'Your natural tendencies',
    outward: 'What others notice',
    closeRelations: 'What comes through as people get closer',
    decision: 'How you make decisions',
    emotion: 'How you handle feelings',
    strengths: 'What you do well',
    cautions: 'Where things can get harder',
    currentExpression: 'What comes through right now',
  },
  traitPhrase: traitPhraseEn,
  distinguishCurrentTraits: true,
  isCustomerSafe(text) {
    if (!isCustomerSafeEn(text)) throw new Error('UNSAFE_EN_PERSONALITY_WORDING')
    return true
  },
  traitContext(trait, current) {
    const setting = expressionContext(trait)
    if (current) return setting ? `Right now, ${setting.toLowerCase()}` : 'Right now'
    if (trait.fact.sourcePosition === 'month_branch') return 'Privately'
    if (trait.fact.sourcePosition === 'hour_branch') return 'When you have time to think on your own'
    if (trait.fact.sourcePosition === 'day_branch') return 'In everyday life'
    if (trait.fact.sourceType === 'day_stem' && trait.fact.traitType === 'core') return 'Naturally'
    if (trait.fact.sourceType === 'day_pillar' && trait.fact.traitType === 'core') return 'Alongside that'
    return setting
  },
  traits({ prefix, phrases, kind, conditional, reduced, repeatsNatal }) {
    // Independent clauses keep any conditions inside a trait attached to that trait.
    return phrases.map((phrase, index) => {
      const start = index === 0 ? prefix : ''
      const also = index === 0 ? '' : 'also '
      if (reduced) return sentence(start, `that part of how you ${phrase} comes through less strongly`)
      if (repeatsNatal) return sentence(start, `as part of a familiar response, you ${qualifiedPhrase(phrase, true, also)}`)
      if (kind === 'growth') return sentence(start, `one option is to ${phrase}`)
      return sentence(start, `you ${qualifiedPhrase(phrase, conditional, also)}`)
    }).join(' ')
  },
  role({ anchor, current, standby, pendingInterference, conditional, anchorConditional, weakened, favorableBaseline, operation }) {
    const timing = current ? 'Right now' : ''
    const context = standby ? 'when support is needed'
      : pendingInterference ? 'when this response overlaps with another' : ''
    const prefix = [timing, context].filter(Boolean).join(', ')
    const action = operations[operation][conditional ? 1 : 0]
    const subject = favorableBaseline ? 'it' : `the way you ${anchor.phrase}`
    const baseline = favorableBaseline ? sentence('', `you already ${anchor.phrase} in everyday situations`) + ' ' : ''
    const main = !conditional && anchorConditional
      ? sentence([prefix, `when you ${anchor.phrase}`].filter(Boolean).join(', '), `that response ${action}`)
      : sentence(prefix, `${subject} ${action}`)
    return baseline + main + (weakened ? ' That effect is weaker.' : '')
  },
  conflict(participants, current, conditional) {
    const timing = current ? 'Right now' : ''
    if (participants.length === 1) {
      const { phrase } = participants[0]
      return sentence(timing, `how you ${phrase} ${conditional ? 'can bring out' : 'brings out'} different responses depending on the situation`)
    }
    return participants.map((item, index) => {
      const setting = expressionContext(item)
      const prefix = index === 0 ? [timing, setting.toLowerCase()].filter(Boolean).join(', ')
        : index === 1 ? setting ? `At the same time, ${setting.toLowerCase()}` : 'At the same time'
          : setting
      return sentence(prefix, `you ${qualifiedPhrase(item.phrase, conditional, index > 1 && !setting ? 'also ' : '')}`)
    }).join(' ')
  },
}

export function renderPersonalityEn(input: PersonalityRenderInput): RenderedPersonality {
  return renderPersonality(input, wording)
}
