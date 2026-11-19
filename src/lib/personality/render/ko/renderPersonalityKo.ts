import type { StructuralRolePersonalityModifier } from '../../types'
import type { PersonalityRenderInput, PersonalityRenderSection, RenderedPersonality } from '../types'
import { renderPersonality, type PersonalityWording, type RenderTrait } from '../renderPersonality'
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
} satisfies Record<PersonalityRenderSection, string>

function context({ fact, mode }: RenderTrait): string {
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

const operations: Record<StructuralRolePersonalityModifier['operation'], readonly [string, string]> = {
  supports_expression: ['다른 면이 드러나는 데 힘을 보태는 쪽으로 쓰여', '다른 면이 드러나는 데 힘을 보탤 수 있어'],
  channels_expression: ['행동의 방향을 잡는 데 쓰여', '행동의 방향을 잡는 데 쓰일 수 있어'],
  restrains_expression: ['다른 면의 표현을 누그러뜨리는 쪽으로 쓰여', '다른 면의 표현을 누그러뜨릴 수 있어'],
  distorts_expression: ['다른 면을 드러내기 어렵게 하기도 해', '다른 면을 드러내기 어렵게 할 수 있어'],
  protects_expression: ['다른 면이 제 역할을 하도록 받쳐 줘', '다른 면이 제 역할을 하도록 받쳐 줄 수 있어'],
  resolves_tension: ['엇갈리는 면이 균형을 잡도록 도와줘', '엇갈리는 면이 균형을 잡도록 도울 수 있어'],
  contextualizes: ['상황에 따라 쓰이는 방식이 달라져', '상황에 따라 쓰이는 방식이 달라질 수 있어'],
}

const wording: PersonalityWording = {
  headings,
  traitPhrase,
  isCustomerSafe: isCustomerSafeKo,
  traitContext(trait, current) {
    return current ? '요즘은 ' + (trait.mode === 'outward' ? '겉으로' : trait.mode === 'inner' ? '속으로' : '')
      : context(trait)
  },
  traits({ prefix, phrases, kind, conditional }) {
    const label = joinPhrases(phrases)
    const start = prefix.trim() ? prefix.trim() + ' ' : ''
    return kind === 'growth'
      ? `${start}${label} 방식을 살펴볼 수 있어.`
      : `${start}${label} 면이 ${conditional ? '드러날 수 있어' : '있어'}.`
  },
  role({ anchor, current, standby, pendingInterference, conditional, anchorConditional, weakened, favorableBaseline, operation }) {
    const prefix = current ? '요즘은 ' : ''
    const condition = standby ? '받쳐 줄 필요가 생기면 '
      : pendingInterference ? '다른 반응과 맞물리는 상황에서는 ' : ''
    const ending = operations[operation][conditional ? 1 : 0]
    const subject = !conditional && anchorConditional ? ' 면이 드러나면 그 면은 ' : ' 면이 '
    const limitation = weakened ? '제한적으로 ' : ''
    return favorableBaseline
      ? `${anchor.phrase} 면은 평소에도 쓰여. 다만 ${prefix}${condition}그 면이 ${limitation}${ending}.`
      : `${prefix}${condition}${anchor.phrase}${subject}${limitation}${ending}.`
  },
  conflict(participants, current, conditional) {
    const clauses = participants.map(item => {
      const prefix = item.mode === 'outward' ? '겉으로는 ' : item.mode === 'inner' ? '속으로는 ' : ''
      return `${prefix}${item.phrase} 면`
    })
    return clauses.length === 1
      ? `${clauses[0]}에서 상황에 따라 다른 반응이 ${conditional ? '나올 수 있어' : '함께 드러나'}.`
      : `${current ? '요즘은 ' : ''}${clauses.join('과 ')}이 ${conditional ? '함께 드러날 수 있어' : '함께 드러나'}.`
  },
}

export function renderPersonalityKo(input: PersonalityRenderInput): RenderedPersonality {
  return renderPersonality(input, wording)
}
