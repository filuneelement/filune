import type { FinalCompatibilityResult } from '../final/assembleFinalCompatibility'
import { buildCustomerCompatibility, type CustomerCompatibilityUnit, type CustomerSectionKind, type CustomerSemantic,
} from './customerCompatibility'
import { comparePeriods, displayPeriod, intervalLabel, periodIdentity, strictContainer, timeLabels, type CompatibilityPeriodKO } from './koPeriods'

const headings = {
  overview: '한눈에 보는 두 사람',
  strengths: '이 관계의 강점',
  risks: '이 관계에서 주의할 점',
  directionalInfluence: '서로에게 미치는 영향',
  personality: '성격과 대화',
  relationshipFlow: '연애·결혼 흐름',
  relationshipRelief: '관계가 좋아지는 시기',
  relationshipStrain: '관계를 조심해야 하는 시기',
  marriageOpportunity: '결혼 가능성이 높아지는 시기',
  marriageQuality: '결혼하기 좋은 시기와 부담이 큰 시기',
  breakdownRisk: '관계 파탄 위험이 높아지는 시기',
} satisfies Record<CustomerSectionKind, string>

const wording = {
  relieves_byeong: '혼자 풀기 어려웠던 문제가 상대의 도움으로 풀립니다.',
  weakens_byeong: '기존 문제가 일상에 주던 부담이 상대의 도움으로 줄어듭니다.',
  supports_required_function: '생활에서 꼭 필요한 일을 해내는 데 상대가 힘을 보탭니다.',
  supports_required_root: '이미 가진 장점을 안정적으로 발휘할 발판을 상대가 마련해 줍니다.',
  activates_byeong: '잠잠하던 문제가 상대와 지내는 과정에서 실제 부담으로 드러납니다.',
  strengthens_harmful_path: '상대와 지내는 과정에서 이미 겪고 있던 문제가 더 커집니다.',
  damages_required_function: '상대와 지낼 때 평소 해내던 중요한 역할을 수행하기가 더 어려워집니다.',
  supports_harmful_root: '기존 문제를 지속시키는 조건이 관계 안에서 더 단단해집니다.',
  direction_favorable: '중요한 문제를 풀거나 꼭 필요한 일을 해내도록 돕는 힘이 큽니다.',
  direction_favorable_dominant: '도움과 부담이 함께 있지만, 중요한 부분을 받쳐 주는 도움이 더 크게 작용합니다.',
  direction_balanced_mixed: '중요한 도움과 큰 부담이 동시에 나타납니다.',
  direction_unfavorable_dominant: '도움도 있지만, 기존 문제를 키우는 부담이 더 크게 작용합니다.',
  direction_unfavorable: '기존 문제를 키우거나 필요한 역할을 약하게 하는 영향이 뚜렷합니다.',
  direction_minor_effect: '영향은 주고받되 생활의 중요한 부분을 크게 바꾸는 정도는 크지 않습니다.',
  communication_friction: '두 사람 모두 생각과 감정을 안에서 오래 정리하는 편이라, 가까워질수록 서로 필요한 말을 미루고 대화가 막히기 쉽습니다.',
  mutual_expression_restraint: '두 사람 모두 생각이나 감정을 바로 말로 옮기기보다 속으로 오래 정리합니다.',
  expression_withholding: '마음에 있는 생각을 바로 털어놓기보다 속에서 정리하는 시간이 깁니다.',
  expression_constraint: '생각을 충분히 정리한 뒤에 움직이며 감정을 말로 꺼내기까지 시간이 걸립니다.',
  communication_relief: '평소보다 서로 속마음을 꺼내고 답하기가 한결 수월합니다.',
  communication_friction_strengthened: '필요한 이야기를 미루는 일이 늘면서 대화의 답답함이 더 커집니다.',
  expression_relief: '평소보다 생각이나 감정을 말로 꺼내기가 수월해집니다.',
  expression_strengthened: '평소보다 생각을 속에 오래 담아 두고 말로 꺼내기가 더 어려워집니다.',
  relationship_formation: '서로 가까워지거나 새로운 관계를 시작하기 쉬운 시기입니다.',
  relationship_change: '가까운 관계의 방식이나 방향에 변화가 일어나는 시기입니다.',
  marriage_opportunity: '결혼이나 관계 공식화 이야기가 구체화되기 쉬운 시기입니다.',
  mutual_marriage_window: '두 사람 모두 관계를 공식화하거나 결혼을 구체화하기 쉬운 시기가 겹칩니다.',
  one_sided_marriage_window: '두 사람 중 이 사람에게 관계를 공식화하기 쉬운 흐름이 나타납니다.',
  marriage_favorable: '결혼을 추진할 때 관계도 그 결정을 함께 받쳐 주는 시기입니다.',
  marriage_caution: '결혼을 추진할 때 함께 감당해야 할 관계 부담이 커집니다.',
  relationship_strain: '관계를 유지하는 데 드는 부담이 커지고, 평소에 넘겼던 문제가 갈등으로 드러나기 쉽습니다.',
  relationship_relief: '쌓였던 관계 부담이 줄고 서로 지내는 일이 한결 수월해집니다.',
} satisfies Record<Exclude<CustomerSemantic, 'relationship_breakdown_risk'>, string>

const unsafeName = /용신|상신|구응|격국|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인|대운|세운|월운|일진|통근|투출|형충회합|등급|점수|외도|임신|재혼|궁합|법적 분쟁|이혼|별거|이별|^(?:병|점)$/u

export type CompatibilityRendererInput = FinalCompatibilityResult & {
  readonly userContext?: { readonly displayNames?: Readonly<Record<string, string>> }
}

export interface CompatibilityStatementKO {
  readonly text: string
  readonly periods?: readonly CompatibilityPeriodKO[]
  readonly provenanceRefs: readonly string[]
}

export interface CompatibilityCustomerResultKO {
  readonly headline?: string
  readonly headlineProvenanceRefs?: readonly string[]
  readonly sections: readonly {
    readonly key: CustomerSectionKind
    readonly heading: string
    readonly statements: readonly CompatibilityStatementKO[]
  }[]
  readonly timeline: readonly {
    readonly temporal: CompatibilityPeriodKO['temporal']
    readonly heading: string
    readonly interval?: CompatibilityPeriodKO['interval']
    readonly within?: string
    readonly statements: readonly CompatibilityStatementKO[]
    readonly provenanceRefs: readonly string[]
  }[]
}

type Customer = ReturnType<typeof buildCustomerCompatibility>

function breakdownText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus']) {
  const consequence = status === 'married' ? '부부 관계가 크게 흔들리고 별거·이혼으로 이어질 위험이 뚜렷하게 높아집니다.'
    : status === 'dating' || status === 'partnered' ? '가까운 관계가 크게 흔들리고 이별로 이어질 위험이 뚜렷하게 높아집니다.'
      : '중요한 관계가 크게 흔들리거나 이어지기 어려워질 위험이 뚜렷하게 높아집니다.'
  const paths = unit.breakdownPaths ?? []
  const basis = paths.includes('BREAKDOWN-A') && paths.includes('BREAKDOWN-B')
    ? '기존 관계 문제와 큰 관계 변화가 겹치며 '
    : paths.includes('BREAKDOWN-A') ? '이미 부담이 되던 문제가 다시 커지며 '
      : paths.includes('BREAKDOWN-B') ? '상대와 관련된 일과 가까운 관계의 큰 변화가 겹치며 ' : ''
  return basis + consequence
}

function unitText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus']) {
  if (unit.semantic === 'relationship_breakdown_risk') return breakdownText(unit, status)
  if (unit.semantic === 'marriage_caution' && unit.marriageOpportunityAlongside) {
    return '결혼 이야기는 구체화되기 쉽지만 같은 시기에 두 사람이 함께 감당해야 할 부담도 커집니다.'
  }
  return wording[unit.semantic]
}

function overview(customer: Customer, subject: (unit: CustomerCompatibilityUnit) => string): CompatibilityStatementKO[] {
  const bySection = (key: CustomerSectionKind) => customer.sections.find(item => item.kind === key)?.units ?? []
  const lines: CompatibilityStatementKO[] = []
  const directions = bySection('directionalInfluence')
  const helpful = directions.find(item => item.semantic === 'direction_favorable' || item.semantic === 'direction_favorable_dominant')
  const difficult = directions.find(item => item.semantic === 'direction_unfavorable' || item.semantic === 'direction_unfavorable_dominant')
  const mixed = directions.find(item => item.semantic === 'direction_balanced_mixed')
  const supports = bySection('strengths')[0]
  const damages = bySection('risks')[0]
  const positive = helpful ?? supports
  const negative = difficult ?? damages
  if (positive && negative) {
    lines.push({ text: `${subject(positive)}에는 실질적인 도움이 있고, ${subject(negative)}에는 중요한 부담이 있습니다.`,
      provenanceRefs: [...new Set([...positive.sourceFactIds, ...negative.sourceFactIds])] })
  } else if (mixed || positive || negative) {
    const anchor = mixed ?? positive ?? negative
    if (anchor) lines.push({
      text: mixed ? `${subject(anchor)}에는 큰 도움과 큰 부담이 함께 드러납니다.`
        : positive ? `${subject(anchor)}에서 생활의 중요한 부분을 받쳐 주는 힘이 드러납니다.`
          : `${subject(anchor)}에서 생활의 중요한 부분에 부담이 드러납니다.`,
      provenanceRefs: anchor.sourceFactIds,
    })
  } else if (directions[0]) {
    lines.push({ text: '생활의 큰 흐름을 바꿀 만큼 강한 영향은 두드러지지 않습니다.', provenanceRefs: directions[0].sourceFactIds })
  }

  const personal = bySection('personality')
  const friction = personal.find(item => item.semantic === 'communication_friction')
  const relief = personal.find(item => item.semantic === 'communication_relief')
  if (friction || relief) lines.push({
    text: friction && relief ? '평소에는 대화가 막히기 쉽지만 지금은 서로 이야기를 풀어 가기 수월합니다.'
      : friction ? '두 사람의 기본 대화에서는 속마음을 꺼내는 일을 미루면서 마찰이 생깁니다.'
        : '지금은 서로 생각과 감정을 나누는 일이 평소보다 쉬워집니다.',
    provenanceRefs: [...new Set([...(friction?.sourceFactIds ?? []), ...(relief?.sourceFactIds ?? [])])],
  })
  const combinedMarriage = bySection('marriageQuality').filter(item => item.marriageOpportunityAlongside)
  const timingUnits = [...bySection('breakdownRisk'), ...combinedMarriage,
    ...(['relationshipStrain', 'relationshipRelief', 'marriageOpportunity', 'marriageQuality', 'relationshipFlow'] as const)
      .flatMap(key => bySection(key)).filter(item => !item.marriageOpportunityAlongside)]
  const timing = timingUnits.find(item => item.period?.temporal === 'current')
    ?? timingUnits.find(item => item.period?.temporal === 'future')
    ?? timingUnits.find(item => item.period?.temporal === 'undated')
    ?? timingUnits.find(item => item.period?.temporal === 'expired')
  if (timing) {
    const subjectText = subject(timing)
    const intro = timing.period?.interval ? intervalLabel(timing.period.interval) : timeLabels[timing.period?.temporal ?? 'undated']
    const headline = timing.semantic === 'relationship_breakdown_risk' ? '관계를 크게 흔드는 위험이 두드러집니다.'
      : timing.semantic === 'relationship_strain' ? '관계를 유지하는 데 따르는 부담이 드러납니다.'
        : timing.semantic === 'relationship_relief' ? '서로 지내며 느낀 부담이 가벼워집니다.'
          : timing.marriageOpportunityAlongside ? '결혼 논의가 구체화되기 쉬운 흐름과 관계 부담이 커지는 흐름이 함께 나타납니다.'
          : timing.semantic === 'marriage_caution' ? '결혼 준비와 함께 감당할 부담이 커집니다.'
            : timing.semantic === 'marriage_favorable' ? '결혼을 준비하는 흐름을 관계도 받쳐 줍니다.'
              : timing.semantic === 'relationship_change' || timing.semantic === 'relationship_formation' ? '가까운 관계의 흐름이 움직입니다.'
                : '결혼이나 관계 공식화 논의에 진전이 생기기 쉽습니다.'
    const prefix = timing.period?.temporal === 'undated' ? `달력 시점이 확인되지 않은 흐름에서 ${subjectText}에게는`
      : `${intro} 기간에 ${subjectText}에게는`
    lines.push({ text: `${prefix} ${headline}`, provenanceRefs: timing.sourceFactIds })
  }
  // Partial and undated results still have a grounded overview when no primary clause applies.
  if (!lines.length) {
    const anchor = customer.sections[0]?.units[0]
    if (anchor) {
      const fallback = anchor.semantic === 'expression_constraint' || anchor.semantic === 'expression_withholding'
        || anchor.semantic === 'mutual_expression_restraint' ? '생각을 밖으로 꺼내기 전 속에서 오래 정리하는 흐름이 드러납니다.'
        : anchor.semantic === 'expression_strengthened' || anchor.semantic === 'communication_friction_strengthened' ? '지금은 필요한 말이 늦어지고 대화의 부담이 더 커집니다.'
          : anchor.semantic === 'expression_relief' ? '지금은 생각과 감정을 한결 쉽게 전합니다.'
            : undefined
      if (fallback) lines.push({ text: fallback, provenanceRefs: anchor.sourceFactIds })
    }
  }
  return lines
}

function headline(customer: Customer) {
  const first = (key: CustomerSectionKind) => customer.sections.find(section => section.kind === key)?.units[0]
  const strength = first('strengths')
  const friction = customer.sections.find(section => section.kind === 'personality')?.units
    .find(unit => unit.semantic === 'communication_friction')
  const risk = first('risks')
  const breakdown = first('breakdownRisk')
  const marriage = first('marriageOpportunity')
  const caution = customer.sections.find(section => section.kind === 'marriageQuality')?.units
    .find(unit => unit.semantic === 'marriage_caution')
  if (strength && friction) return {
    headline: '실질적인 도움과 대화 마찰이 함께 있는 관계',
    headlineProvenanceRefs: [...new Set([...strength.sourceFactIds, ...friction.sourceFactIds])],
  }
  if (strength && risk) return {
    headline: '도움과 부담이 함께 드러나는 관계',
    headlineProvenanceRefs: [...new Set([...strength.sourceFactIds, ...risk.sourceFactIds])],
  }
  if (breakdown) return { headline: '관계가 크게 흔들릴 위험이 높아지는 흐름', headlineProvenanceRefs: breakdown.sourceFactIds }
  if (marriage && caution) return {
    headline: '결혼 기회와 관계 부담이 모두 나타나는 흐름',
    headlineProvenanceRefs: [...new Set([...marriage.sourceFactIds, ...caution.sourceFactIds])],
  }
  return customer.sections.length ? { headline: '두 사람의 관계' } : {}
}

function timelineText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus'], owner: string, nested: boolean) {
  if (unit.semantic === 'relationship_breakdown_risk') {
    if (!nested) return `${owner}에게는 ${breakdownText(unit, status)}`
    const event = status === 'married' ? '별거·이혼으로 이어질'
      : status === 'dating' || status === 'partnered' ? '이별로 이어질' : '중요한 관계가 크게 흔들릴'
    return `${owner}에게는 ${event} 위험이 뚜렷하게 높아지는 세부 구간입니다.`
  }
  if (unit.semantic === 'mutual_marriage_window') {
    return '두 사람 모두 관계를 공식화하거나 결혼을 구체화하기 쉬운 흐름이 이 기간에 겹칩니다.'
  }
  const suffix = nested ? '세부 구간입니다.' : '시기입니다.'
  const prefix = `${owner}에게는`
  switch (unit.semantic) {
    case 'relationship_strain': return `${prefix} 관계를 유지하는 부담이 커지는 ${suffix}`
    case 'relationship_relief': return `${prefix} 관계 부담이 줄어드는 ${suffix}`
    case 'marriage_favorable': return `${prefix} 관계가 결혼 준비를 받쳐 주는 ${suffix}`
    case 'marriage_caution': return unit.marriageOpportunityAlongside
      ? `${prefix} 결혼 이야기가 구체화되기 쉽고 관계 부담도 커지는 ${suffix}`
      : `${prefix} 결혼 준비에 따른 관계 부담이 커지는 ${suffix}`
    case 'marriage_opportunity': return `${prefix} 결혼이나 관계 공식화가 구체화되기 쉬운 ${suffix}`
    case 'one_sided_marriage_window': return `두 사람 중 ${owner}에게 관계를 공식화하기 쉬운 흐름이 확인되는 ${suffix}`
    case 'relationship_formation': return `${prefix} 가까워지거나 새로운 관계를 시작하기 쉬운 ${suffix}`
    case 'relationship_change': return `${prefix} 가까운 관계의 방향이 바뀌는 ${suffix}`
    default: return `${prefix} ${unitText(unit, status)}`
  }
}

export function renderCompatibilityKo(input: CompatibilityRendererInput): CompatibilityCustomerResultKO {
  const customer = buildCustomerCompatibility(input)
  const names = new Map(customer.personIds.map((id, index) => {
    const name = input.userContext?.displayNames?.[id]?.trim()
    return [id, name && /^[가-힣A-Za-z][가-힣A-Za-z ·-]{0,39}$/u.test(name) && !unsafeName.test(name)
      ? name : index === 0 ? '첫 번째 사람' : '두 번째 사람']
  }))
  if (new Set(names.values()).size !== names.size) {
    customer.personIds.forEach((id, index) => names.set(id, index === 0 ? '첫 번째 사람' : '두 번째 사람'))
  }
  const subject = (unit: CustomerCompatibilityUnit) => {
    const [first, second] = unit.personIds.map(id => names.get(id) ?? '해당 사람')
    return unit.directed && second ? `${first} → ${second} 방향` : second ? '두 사람' : first ?? '두 사람'
  }
  const opening = overview(customer, subject)
  const sections: Array<CompatibilityCustomerResultKO['sections'][number]> = opening.length
    ? [{ key: 'overview', heading: headings.overview, statements: opening }] : []
  const at = Date.parse(input.referenceTime)
  const cards = new Map<string, {
    period: CompatibilityPeriodKO
    statements: CompatibilityStatementKO[]
    refs: Set<string>
    within?: string
    section: CustomerSectionKind
  }>()
  const individualOpportunity = customer.sections.find(section => section.kind === 'marriageOpportunity')?.units
    .filter(unit => unit.semantic === 'marriage_opportunity')
    .flatMap(unit => {
      const period = displayPeriod(unit, at)
      return period ? [{ unit, period }] : []
    }) ?? []
  for (const section of customer.sections) {
    const groups = new Map<string, {
      unit: CustomerCompatibilityUnit
      periods: Map<string, CompatibilityPeriodKO>
      refs: Set<string>
    }>()
    for (const unit of section.units) {
      const key = JSON.stringify([unit.semantic, unit.personIds, unit.directed,
        unit.marriageOpportunityAlongside, unit.breakdownPaths])
      const group = groups.get(key) ?? { unit, periods: new Map(), refs: new Set() }
      const period = displayPeriod(unit, at)
      if (period) {
        const periodKey = periodIdentity(period)
        const prior = group.periods.get(periodKey)
        group.periods.set(periodKey, { ...period,
          provenanceRefs: [...new Set([...prior?.provenanceRefs ?? [], ...period.provenanceRefs])] })
      }
      unit.sourceFactIds.forEach(ref => group.refs.add(ref))
      groups.set(key, group)
    }
    const statements = [...groups.values()].map(group => {
      const { unit } = group
      const owner = subject(unit)
      const body = unitText(unit, customer.relationshipStatus)
      const periods = [...group.periods.values()].sort(comparePeriods).map(period => {
        const parent = strictContainer(period, [...group.periods.values()])
          ?? (unit.semantic === 'mutual_marriage_window' || unit.semantic === 'one_sided_marriage_window'
            ? strictContainer(period, individualOpportunity
            .filter(entry => unit.personIds.includes(entry.unit.personIds[0])).map(entry => entry.period)) : undefined)
        return parent?.intervalLabel ? { ...period, within: parent.intervalLabel,
          withinProvenanceRefs: parent.provenanceRefs } : period
      })
      const labels = periods.map(period => {
        if (period.within && period.intervalLabel) return `그중 ${period.intervalLabel}`
        return period.intervalLabel ? `${timeLabels[period.temporal]} · ${period.intervalLabel}` : timeLabels[period.temporal]
      })
      const subjectLabel = owner === '두 사람' && body.startsWith('두 사람') ? [] : [owner]
      const prefix = [...subjectLabel, ...labels]
      if (section.kind !== 'personality') for (const period of periods) {
        const key = JSON.stringify([periodIdentity(period), period.interval ? undefined : section.kind])
        const card = cards.get(key) ?? { period, statements: [], refs: new Set<string>(), section: section.kind }
        if (period.within) {
          if (unit.semantic === 'mutual_marriage_window') {
            card.within = `${period.within} 중 두 사람에게 관계 공식화 흐름이 겹치는 구간`
          } else {
            card.within ??= `${period.within} 흐름 중 함께 살펴볼 구간`
          }
        }
        const text = timelineText(unit, customer.relationshipStatus, owner, Boolean(period.within))
        card.statements.push({ text, provenanceRefs: period.provenanceRefs })
        for (const ref of [...period.provenanceRefs, ...period.withinProvenanceRefs ?? []]) card.refs.add(ref)
        cards.set(key, card)
      }
      return {
        text: `${prefix.length ? `[${prefix.join(' / ')}] ` : ''}${body}`,
        ...(periods.length && { periods }), provenanceRefs: [...group.refs],
      }
    })
    if (statements.length) sections.push({ key: section.kind, heading: headings[section.kind], statements })
  }
  const timeline = [...cards.values()].sort((a, b) => comparePeriods(a.period, b.period)).map(card => ({
    temporal: card.period.temporal,
    heading: card.period.intervalLabel ? `${timeLabels[card.period.temporal]} · ${card.period.intervalLabel}` : `${timeLabels[card.period.temporal]} · ${headings[card.section]}`,
    ...(card.period.interval && { interval: card.period.interval }),
    ...(card.within && { within: card.within }),
    statements: card.statements,
    provenanceRefs: [...card.refs],
  }))
  return { ...headline(customer), sections, timeline }
}
