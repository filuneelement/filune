import type { FinalCompatibilityResult } from '../final/assembleFinalCompatibility'
import { buildCustomerCompatibility, type CustomerCompatibilityUnit, type CustomerSectionKind, type CustomerSemantic,
} from './customerCompatibility'
import { comparePeriodsJa, displayPeriodJa, periodIdentityJa, strictContainerJa, timeLabelsJa,
  type CompatibilityPeriodJA } from './jaPeriods'

const headings = {
  overview: '二人の関係をひと目で',
  strengths: 'この関係の強み',
  risks: 'この関係で気をつけたいこと',
  directionalInfluence: 'お互いに与える影響',
  personality: '性格とコミュニケーション',
  relationshipFlow: '恋愛・結婚の流れ',
  relationshipRelief: '関係が楽になる時期',
  relationshipStrain: '関係の負担が大きくなる時期',
  marriageOpportunity: '結婚の話が具体化しやすい時期',
  marriageQuality: '結婚を進めやすい時期・負担が大きい時期',
  breakdownRisk: '関係が大きく揺れるリスクが高まる時期',
} satisfies Record<CustomerSectionKind, string>

const wording = {
  relieves_byeong: '一人ではほどきにくかった問題が、二人の関係の中でほどけていくよ。',
  weakens_byeong: 'もともとの問題が日々に与える負担を、相手が軽くしてくれるよ。',
  supports_required_function: '日々の大切なことをやり遂げる力を、相手が支えてくれるよ。',
  supports_required_root: 'すでに持っている長所を、実際に生かしやすくなる関係だよ。',
  activates_byeong: '落ち着いていた問題が、相手と過ごす中で負担として表れやすいよ。',
  strengthens_harmful_path: 'もともと抱えている問題が、二人の関係の中で大きくなりやすいよ。',
  damages_required_function: '相手といると、普段できている大切なことがやりにくくなりやすいよ。',
  supports_harmful_root: 'もともとの弱点が、関係の中で長引きやすくなるよ。',
  direction_favorable: '大切な問題をほどき、必要な力を引き出す働きが強い関係だよ。',
  direction_favorable_dominant: '負担になる面もあるけれど、全体では支えになる働きのほうが大きいよ。',
  direction_balanced_mixed: '大きく助け合える部分と、強くぶつかる部分がどちらもはっきりある関係だよ。',
  direction_unfavorable_dominant: '助けになる面もあるけれど、もともとの負担を大きくする面のほうが目立つよ。',
  direction_unfavorable: '必要な働きを弱めたり、もともとの問題を強めたりしやすい関係だよ。',
  direction_minor_effect: '影響はあるけれど、暮らしの大きな土台を変えるほど強くはないよ。',
  communication_friction: '二人とも気持ちや考えを内側にためやすく、近くなるほど必要な話を後回しにしがちだよ。',
  mutual_expression_restraint: '二人とも、気持ちや考えをすぐ言葉にするより、自分の中で長く整理するほうなんだ。',
  expression_withholding: '気持ちをすぐ打ち明けるより、自分の中で整理してから話す傾向が強いよ。',
  expression_constraint: '考えを自分の中で整理してから動き、気持ちを言葉にするまで時間がかかりやすいよ。',
  communication_relief: '普段より気持ちを伝えやすく、相手の話にも応えやすい時期だよ。',
  communication_friction_strengthened: '必要な話を後回しにしやすくなり、会話の詰まりが大きくなっているよ。',
  expression_relief: '普段より考えや気持ちを言葉にしやすい時期だよ。',
  expression_strengthened: '考えを内側にためやすく、言葉にするまで時間がかかりやすい時期だよ。',
  relationship_formation: '新しい接点が生まれたり、距離が縮まったりしやすい時期だよ。',
  relationship_change: '近しい関係の形や距離感に変化が起きやすい時期だよ。',
  marriage_opportunity: '結婚や関係を正式な形にする話が具体的になりやすい時期だよ。',
  mutual_marriage_window: '二人とも関係を正式な形に進めやすい流れが、同じ時期に重なっているよ。',
  one_sided_marriage_window: '関係を正式な形に進めやすい流れが表れているよ。',
  marriage_favorable: '結婚を進めるなら、関係そのものもその決断を支えやすい時期だよ。',
  marriage_caution: '結婚を進める話が具体的になりやすい一方で、二人で抱える負担も大きくなりやすいよ。',
  relationship_strain: '関係を続ける負担が大きくなり、普段なら流せることも衝突になりやすい時期だよ。',
  relationship_relief: 'たまっていた関係の負担が軽くなり、二人で過ごすことが楽になりやすい時期だよ。',
} satisfies Record<Exclude<CustomerSemantic, 'relationship_breakdown_risk'>, string>

export type CompatibilityRendererInputJA = FinalCompatibilityResult & {
  readonly userContext?: FinalCompatibilityResult['userContext'] & { readonly displayNames?: Readonly<Record<string, string>> }
}

export interface CompatibilityStatementJA {
  readonly text: string
  readonly semanticIds: readonly CustomerSemantic[]
  readonly periods?: readonly CompatibilityPeriodJA[]
  readonly provenanceRefs: readonly string[]
}

export interface CompatibilityCustomerResultJA {
  readonly headline?: string
  readonly headlineSemanticIds?: readonly CustomerSemantic[]
  readonly headlineProvenanceRefs?: readonly string[]
  readonly sections: readonly {
    readonly key: CustomerSectionKind
    readonly heading: string
    readonly statements: readonly CompatibilityStatementJA[]
  }[]
  readonly timeline: readonly {
    readonly temporal: CompatibilityPeriodJA['temporal']
    readonly heading: string
    readonly interval?: CompatibilityPeriodJA['interval']
    readonly within?: string
    readonly statements: readonly CompatibilityStatementJA[]
    readonly provenanceRefs: readonly string[]
  }[]
}

type Customer = ReturnType<typeof buildCustomerCompatibility>

const unsafeName = /用神|相神|救応|救應|格局|比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|印綬|大運|歳運|月運|日運|三合|六合|冲|沖|刑|破|害|不倫|浮気|妊娠|再婚|相性|点数|%(?:\d*)/u
const unsafeAddressName = /^(?:あなた|君|お前|様|ちゃん|くん)$/u
const namePattern = /^[\p{L}][\p{L}\p{M}ー・ ·-]{0,39}$/u

function breakdownText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus']) {
  const consequence = status === 'married' ? '夫婦の関係が大きく揺れ、別居や離婚につながるリスクがはっきり高まる時期だよ。'
    : status === 'dating' || status === 'partnered' ? '近しい関係が大きく揺れ、別れにつながるリスクがはっきり高まる時期だよ。'
      : '大切な関係が大きく揺れ、続けることが難しくなるリスクがはっきり高まる時期だよ。'
  const paths = unit.breakdownPaths ?? []
  const basis = paths.includes('BREAKDOWN-A') && paths.includes('BREAKDOWN-B')
    ? '前から抱えていた問題と、この時期の大きな関係変化が重なり、'
    : paths.includes('BREAKDOWN-A') ? '前から関係の中にあった問題が、この時期にもう一度強く表れ、'
      : paths.includes('BREAKDOWN-B') ? '普段の関係が大きく悪くなくても、この時期は大切な相手との間で大きな動きが起きやすく、'
        : ''
  return basis + consequence
}

function unitText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus']) {
  if (unit.semantic === 'relationship_breakdown_risk') return breakdownText(unit, status)
  if (unit.semantic === 'marriage_caution' && unit.marriageOpportunityAlongside) {
    return '結婚の話は具体的になりやすい時期だよ。ただ、同じ時期に二人で抱える負担も大きくなるんだ。'
  }
  return wording[unit.semantic]
}

function namesFor(customer: Customer, input: CompatibilityRendererInputJA) {
  const names = new Map(customer.personIds.map((id, index) => {
    const candidate = input.userContext?.displayNames?.[id]?.trim()
    const safe = candidate && namePattern.test(candidate) && !unsafeName.test(candidate) && !unsafeAddressName.test(candidate)
      ? `${candidate}さん` : index === 0 ? '一人目' : '二人目'
    return [id, safe]
  }))
  if (new Set(names.values()).size !== names.size) {
    customer.personIds.forEach((id, index) => names.set(id, index === 0 ? '一人目' : '二人目'))
  }
  return names
}

function overview(customer: Customer, referenceTime: string, subject: (unit: CustomerCompatibilityUnit) => string) {
  const bySection = (key: CustomerSectionKind) => customer.sections.find(item => item.kind === key)?.units ?? []
  const lines: CompatibilityStatementJA[] = []
  const directions = bySection('directionalInfluence')
  const helpful = directions.find(item => item.semantic === 'direction_favorable' || item.semantic === 'direction_favorable_dominant')
  const difficult = directions.find(item => item.semantic === 'direction_unfavorable' || item.semantic === 'direction_unfavorable_dominant')
  const mixed = directions.find(item => item.semantic === 'direction_balanced_mixed')
  const positive = helpful ?? bySection('strengths')[0]
  const negative = difficult ?? bySection('risks')[0]
  if (positive && negative) lines.push({
    text: `${subject(positive)}${positive.directed ? 'は' : 'には'}支えになる働きがあり、${subject(negative)}${negative.directed ? 'は' : 'には'}大きな負担があるよ。`,
    semanticIds: [positive.semantic, negative.semantic], provenanceRefs: [...new Set([...positive.sourceFactIds, ...negative.sourceFactIds])],
  })
  else if (mixed || positive || negative) {
    const anchor = mixed ?? positive ?? negative!
    lines.push({ text: mixed ? `${subject(anchor)}には大きな助けと負担がどちらも表れているよ。`
      : positive ? `${subject(anchor)}には暮らしを支える働きが表れているよ。`
        : `${subject(anchor)}には暮らしの大切な部分への負担が表れているよ。`,
    semanticIds: [anchor.semantic], provenanceRefs: anchor.sourceFactIds })
  } else if (directions[0]) lines.push({
    text: '暮らしの大きな土台を変えるほどの強い影響は目立たないよ。',
    semanticIds: [directions[0].semantic], provenanceRefs: directions[0].sourceFactIds,
  })

  const personal = bySection('personality')
  const friction = personal.find(item => item.semantic === 'communication_friction')
  const relief = personal.find(item => item.semantic === 'communication_relief')
  if (friction || relief) lines.push({
    text: friction && relief ? '普段は会話が詰まりやすい二人だけれど、今は気持ちを伝えやすく、話を進めやすいよ。'
      : friction ? '普段の会話では気持ちを打ち明けるのを後回しにしやすく、すれ違いが起きやすいよ。'
        : '今は考えや気持ちを伝え合うことが、普段より楽になっているよ。',
    semanticIds: [friction?.semantic, relief?.semantic].filter((item): item is CustomerSemantic => Boolean(item)),
    provenanceRefs: [...new Set([...(friction?.sourceFactIds ?? []), ...(relief?.sourceFactIds ?? [])])],
  })

  const timingUnits = [...bySection('breakdownRisk'),
    ...bySection('marriageQuality').filter(item => item.marriageOpportunityAlongside),
    ...(['relationshipStrain', 'relationshipRelief', 'marriageOpportunity', 'marriageQuality', 'relationshipFlow'] as const)
      .flatMap(key => bySection(key)).filter(item => !item.marriageOpportunityAlongside)]
  const timing = timingUnits.find(item => item.period?.temporal === 'current')
    ?? timingUnits.find(item => item.period?.temporal === 'future')
    ?? timingUnits.find(item => item.period?.temporal === 'undated')
    ?? timingUnits.find(item => item.period?.temporal === 'expired')
  if (timing) {
    const period = displayPeriodJa(timing, Date.parse(referenceTime))
    const intro = period?.intervalLabel ?? timeLabelsJa[period?.temporal ?? 'undated']
    const message = timing.semantic === 'relationship_breakdown_risk' ? '関係が大きく揺れるリスクがはっきり高まっているよ。'
      : timing.semantic === 'relationship_strain' ? '関係を続ける負担が大きくなりやすいよ。'
        : timing.semantic === 'relationship_relief' ? '二人で過ごす負担が軽くなりやすいよ。'
          : timing.marriageOpportunityAlongside ? '結婚の話が進みやすい一方で、関係の負担も大きくなりやすいよ。'
            : timing.semantic === 'marriage_caution' ? '結婚の準備とともに、二人で抱える負担も大きくなりやすいよ。'
              : timing.semantic === 'marriage_favorable' ? '結婚の話を進めることを、関係も支えやすいよ。'
                : timing.semantic === 'relationship_change' || timing.semantic === 'relationship_formation' ? '近しい関係に動きが出やすいよ。'
                  : '結婚や関係を正式な形にする話が進みやすいよ。'
    const prefix = period?.temporal === 'undated' ? `${intro}、${subject(timing)}には` : `${intro}、${subject(timing)}には`
    lines.push({ text: `${prefix}${message}`, semanticIds: [timing.semantic], provenanceRefs: timing.sourceFactIds })
  }
  if (!lines.length) {
    const anchor = customer.sections[0]?.units[0]
    if (anchor && ['expression_constraint', 'expression_withholding', 'mutual_expression_restraint'].includes(anchor.semantic)) {
      lines.push({ text: '気持ちを言葉にする前に、自分の中で長く整理する傾向が表れているよ。',
        semanticIds: [anchor.semantic], provenanceRefs: anchor.sourceFactIds })
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
  const result = (text: string, units: CustomerCompatibilityUnit[]) => ({ headline: text,
    headlineSemanticIds: units.map(unit => unit.semantic), headlineProvenanceRefs: [...new Set(units.flatMap(unit => unit.sourceFactIds))] })
  if (strength && friction) return result('支えになる力と、会話のすれ違いが同時に表れる関係', [strength, friction])
  if (strength && risk) return result('助けになる面と、負担になる面がある関係', [strength, risk])
  if (breakdown) return result('関係が大きく揺れるリスクが高まる流れ', [breakdown])
  if (marriage && caution) return result('結婚の話が進みやすく、関係の負担も大きくなる流れ', [marriage, caution])
  return customer.sections.length ? { headline: '二人の関係' } : {}
}

function timelineText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus'], owner: string, nested: boolean) {
  if (unit.semantic === 'relationship_breakdown_risk') {
    if (!nested) return `${owner}には${breakdownText(unit, status)}`
    return `${owner}には${breakdownText(unit, status).replace('時期だよ。', '細かな時期だよ。')}`
  }
  if (unit.semantic === 'mutual_marriage_window') return '二人とも関係を正式な形に進めやすい流れが、この時期に重なっているよ。'
  const suffix = nested ? '細かな時期だよ。' : '時期だよ。'
  const prefix = `${owner}には`
  switch (unit.semantic) {
    case 'relationship_strain': return `${prefix}関係を続ける負担が大きくなりやすい${suffix}`
    case 'relationship_relief': return `${prefix}関係の負担が軽くなりやすい${suffix}`
    case 'marriage_favorable': return `${prefix}関係が結婚の話を支えやすい${suffix}`
    case 'marriage_caution': return unit.marriageOpportunityAlongside
      ? `${prefix}結婚の話が進みやすい一方で、関係の負担も大きくなりやすい${suffix}`
      : `${prefix}結婚の準備に伴う関係の負担が大きくなりやすい${suffix}`
    case 'marriage_opportunity': return `${prefix}結婚や関係の具体化が進みやすい${suffix}`
    case 'one_sided_marriage_window': return `${owner}には、関係を正式な形に進めやすい流れが出ている${suffix}`
    case 'relationship_formation': return `${prefix}距離が縮まったり、新しい関係が始まったりしやすい${suffix}`
    case 'relationship_change': return `${prefix}近しい関係の形や距離感が変わりやすい${suffix}`
    default: return `${prefix}${unitText(unit, status)}`
  }
}

export function renderCompatibilityJa(input: CompatibilityRendererInputJA): CompatibilityCustomerResultJA {
  const customer = buildCustomerCompatibility(input)
  const names = namesFor(customer, input)
  const subject = (unit: CustomerCompatibilityUnit) => {
    const [first, second] = unit.personIds.map(id => names.get(id) ?? '二人')
    return unit.directed && second ? `${first}から${second}へ` : second ? '二人' : first ?? '二人'
  }
  const opening = overview(customer, input.referenceTime, subject)
  const sections: Array<CompatibilityCustomerResultJA['sections'][number]> = opening.length
    ? [{ key: 'overview', heading: headings.overview, statements: opening }] : []
  const cards = new Map<string, { period: CompatibilityPeriodJA; statements: CompatibilityStatementJA[];
    refs: Set<string>; within?: string; section: CustomerSectionKind }>()
  const individualOpportunity = customer.sections.find(section => section.kind === 'marriageOpportunity')?.units
    .filter(unit => unit.semantic === 'marriage_opportunity').flatMap(unit => {
      const period = displayPeriodJa(unit, Date.parse(input.referenceTime))
      return period ? [{ unit, period }] : []
    }) ?? []
  for (const section of customer.sections) {
    const groups = new Map<string, { unit: CustomerCompatibilityUnit; periods: Map<string, CompatibilityPeriodJA>; refs: Set<string> }>()
    for (const unit of section.units) {
      const key = JSON.stringify([unit.semantic, unit.personIds, unit.directed, unit.marriageOpportunityAlongside, unit.breakdownPaths])
      const group = groups.get(key) ?? { unit, periods: new Map(), refs: new Set() }
      const period = displayPeriodJa(unit, Date.parse(input.referenceTime))
      if (period) {
        const periodKey = periodIdentityJa(period)
        const prior = group.periods.get(periodKey)
        group.periods.set(periodKey, { ...period,
          provenanceRefs: [...new Set([...(prior?.provenanceRefs ?? []), ...period.provenanceRefs])] })
      }
      unit.sourceFactIds.forEach(ref => group.refs.add(ref))
      groups.set(key, group)
    }
    const statements = [...groups.values()].map(({ unit, periods: periodMap, refs }) => {
      const owner = subject(unit)
      const periods = [...periodMap.values()].sort(comparePeriodsJa).map(period => {
        const parent = strictContainerJa(period, [...periodMap.values()])
          ?? (unit.semantic === 'mutual_marriage_window' || unit.semantic === 'one_sided_marriage_window'
            ? strictContainerJa(period, individualOpportunity.filter(entry => unit.personIds.includes(entry.unit.personIds[0])
              || unit.semantic === 'mutual_marriage_window').map(entry => entry.period)) : undefined)
        return parent?.intervalLabel ? { ...period, within: parent.intervalLabel, withinProvenanceRefs: parent.provenanceRefs } : period
      })
      const labels = periods.map(period => period.within && period.intervalLabel ? `その中の${period.intervalLabel}`
        : period.intervalLabel ? `${timeLabelsJa[period.temporal]}・${period.intervalLabel}` : timeLabelsJa[period.temporal])
      const prefix = [...(owner === '二人には' && unitText(unit, customer.relationshipStatus).startsWith('二人') ? [] : [owner]), ...labels]
      if (section.kind !== 'personality') for (const period of periods) {
        const key = JSON.stringify([periodIdentityJa(period), period.interval ? undefined : section.kind])
        const card = cards.get(key) ?? { period, statements: [], refs: new Set<string>(), section: section.kind }
        if (period.within) {
          if (unit.semantic === 'mutual_marriage_window') card.within = `${period.within}のうち、二人の流れが重なる時期`
          else card.within ??= `${period.within}の中で注目したい時期`
        }
        card.statements.push({ text: timelineText(unit, customer.relationshipStatus, owner, Boolean(period.within)),
          semanticIds: [unit.semantic], provenanceRefs: period.provenanceRefs })
        for (const ref of [...period.provenanceRefs, ...(period.withinProvenanceRefs ?? [])]) card.refs.add(ref)
        cards.set(key, card)
      }
      return { text: `${prefix.length ? `［${prefix.join('／')}］` : ''}${unitText(unit, customer.relationshipStatus)}`,
        semanticIds: [unit.semantic], ...(periods.length && { periods }), provenanceRefs: [...refs] }
    })
    if (statements.length) sections.push({ key: section.kind, heading: headings[section.kind], statements })
  }
  const timeline = [...cards.values()].sort((a, b) => comparePeriodsJa(a.period, b.period)).map(card => ({
    temporal: card.period.temporal,
    heading: card.period.intervalLabel ? `${timeLabelsJa[card.period.temporal]}・${card.period.intervalLabel}`
      : `${timeLabelsJa[card.period.temporal]}・${headings[card.section]}`,
    ...(card.period.interval && { interval: card.period.interval }), ...(card.within && { within: card.within }),
    statements: card.statements, provenanceRefs: [...card.refs],
  }))
  return { ...headline(customer), sections, timeline }
}
