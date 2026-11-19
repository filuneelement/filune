import type { StructuralRolePersonalityModifier } from '../../types'
import type { PersonalityRenderInput, RenderedPersonality } from '../types'
import { renderPersonality, type PersonalityWording, type RenderTrait } from '../renderPersonality'
import { isCustomerSafeJa } from './guardrails'
import { traitPhraseJa } from './wording'

const operations: Record<StructuralRolePersonalityModifier['operation'], readonly [string, string]> = {
  supports_expression: ['別の傾向が働くのを支えているよ', '別の傾向が働くのを支えることもあるよ'],
  channels_expression: ['行動の方向づけに使われているよ', '行動の方向づけに使われることもあるよ'],
  restrains_expression: ['別の面の表れ方を抑えているよ', '別の面の表れ方を抑えることもあるよ'],
  distorts_expression: ['別の面が働くのを妨げているよ', '別の面が働くのを妨げることもあるよ'],
  protects_expression: ['別の面が力を発揮できるように支えているよ', '別の面が力を発揮する支えになることもあるよ'],
  resolves_tension: ['ぶつかり合う面の緊張を和らげているよ', 'ぶつかり合う面の緊張を和らげることもあるよ'],
  contextualizes: ['場面によって働き方が変わるんだ', '場面によって働き方が変わることもあるよ'],
}

function expressionContext(trait: RenderTrait): string {
  if (trait.mode === 'outward') return '表では、'
  if (trait.mode === 'inner') return '内面では、'
  return ''
}

const wording: PersonalityWording = {
  headings: {
    overview: '生まれ持った傾向',
    outward: '外から見えやすい面',
    closeRelations: '親しくなると見えてくる面',
    decision: '判断のしかた',
    emotion: '気持ちの扱い方',
    strengths: '力を発揮しやすい面',
    cautions: '気にかけたい面',
    currentExpression: '今の時期に表れる面',
  },
  traitPhrase: traitPhraseJa,
  distinguishCurrentTraits: true,
  isCustomerSafe(text) {
    if (!isCustomerSafeJa(text)) throw new Error('UNSAFE_JA_PERSONALITY_WORDING')
    return true
  },
  traitContext(trait, current) {
    if (current) return '今は、' + expressionContext(trait)
    if (trait.fact.sourcePosition === 'month_branch') return '普段の内面では、'
    if (trait.fact.sourcePosition === 'hour_branch') return '一人で考えるときは、'
    if (trait.fact.sourcePosition === 'day_branch') return '日々の暮らしの中では、'
    if (trait.fact.sourceType === 'day_stem' && trait.fact.traitType === 'core') return 'もともと、'
    if (trait.fact.sourceType === 'day_pillar' && trait.fact.traitType === 'core') return 'それに加えて、'
    return expressionContext(trait)
  },
  traits({ prefix, phrases, kind, conditional, reduced, repeatsNatal }) {
    return phrases.map((phrase, index) => {
      const start = index === 0 ? prefix : 'また、'
      if (reduced) return `${start}${phrase}面の表れ方が弱まっているよ。`
      if (repeatsNatal) return `${start}${phrase}面も、今の反応に表れることがあるよ。`
      if (kind === 'growth') return `${start}${phrase}というやり方も考えてみて。`
      // A clause with its own possibility marker already carries that nuance.
      if (phrase.endsWith('ことがある')) return `${start}${phrase}よ。`
      return conditional
        ? `${start}${phrase}面が表れることもあるよ。`
        : `${start}${phrase}ところがある${index === 0 ? 'んだ' : 'よ'}。`
    }).join('')
  },
  role({ anchor, current, standby, pendingInterference, conditional, anchorConditional, weakened, favorableBaseline, operation }) {
    const prefix = current ? '今は、' : ''
    const condition = standby ? '支えが必要になったときは、'
      : pendingInterference ? 'ほかの反応と重なる場面では、' : ''
    const subject = !conditional && anchorConditional ? '面が出ると、' : '面は、'
    const baseline = favorableBaseline ? `${anchor.phrase}面は普段から働いているよ。` : ''
    const action = operations[operation][conditional ? 1 : 0]
    const limitation = weakened ? 'ただ、その働きは弱まっているよ。' : ''
    return `${baseline}${prefix}${condition}${favorableBaseline ? 'その面は、' : anchor.phrase + subject}${action}。${limitation}`
  },
  conflict(participants, current, conditional) {
    const prefix = current ? '今は、' : ''
    const clauses = participants.map(item => `${expressionContext(item)}${item.phrase}面`)
    if (clauses.length === 1) {
      return `${prefix}${clauses[0]}には、場面によって${conditional ? '違う反応が出ることもあるよ' : '違う反応も出ているよ'}。`
    }
    return clauses.map((clause, index) => {
      const start = index === 0 ? prefix : index === 1 && participants.length === 2 ? '一方で、' : 'また、'
      const ending = conditional ? 'も出ることがあるよ' : index === 0 ? 'もあるんだ' : 'もあるよ'
      return `${start}${clause}${ending}。`
    }).join('')
  },
}

export function renderPersonalityJa(input: PersonalityRenderInput): RenderedPersonality {
  return renderPersonality(input, wording)
}
