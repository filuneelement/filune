import type { FinalCompatibilityResult } from '../final/assembleFinalCompatibility'
import { buildCustomerCompatibility, type CustomerCompatibilityUnit, type CustomerSectionKind, type CustomerSemantic,
} from './customerCompatibility'
import { comparePeriodsEn, displayPeriodEn, periodIdentityEn, strictContainerEn, timeLabelsEn,
  type CompatibilityPeriodEN } from './enPeriods'
import { isCustomerSafeEn } from '../../personality/render/en/guardrails'

const headings = {
  overview: 'At a glance',
  strengths: 'What works well between you',
  risks: 'What needs attention',
  directionalInfluence: 'How you affect each other',
  personality: 'Personality and communication',
  relationshipFlow: 'Relationship and marriage flow',
  relationshipRelief: 'Periods when the relationship gets easier',
  relationshipStrain: 'Periods when the relationship gets harder',
  marriageOpportunity: 'Periods when marriage is easier to formalize',
  marriageQuality: 'Better marriage windows and heavier marriage windows',
  breakdownRisk: 'Periods when the relationship is more vulnerable to a major break',
} satisfies Record<CustomerSectionKind, string>

const wording = {
  relieves_byeong: 'helps resolve a problem that is difficult to handle alone',
  weakens_byeong: 'eases the pressure an existing problem puts on everyday life',
  supports_required_function: 'helps an important ability or role work more effectively',
  supports_required_root: 'gives an existing strength firmer support to work from',
  activates_byeong: 'brings a problem that had been quiet into everyday life as a real pressure',
  strengthens_harmful_path: 'amplifies a problem that is already present',
  damages_required_function: 'makes an important ability or role harder to use effectively',
  supports_harmful_root: 'allows an existing weak point to stay in place longer',
  direction_favorable: 'provides strong practical support, helping important problems get resolved and useful strengths come through',
  direction_favorable_dominant: 'has both supportive and difficult effects, but the more important effect is supportive',
  direction_balanced_mixed: 'has strong supportive effects and strong points of friction at the same time',
  direction_unfavorable_dominant: 'has some supportive effects, but more often amplifies existing strain or weakens something important',
  direction_unfavorable: 'clearly tends to weaken something important or reinforce problems that are already present',
  direction_minor_effect: 'does affect daily life, but does not strongly reshape its major foundations',
  communication_friction: 'Both people tend to hold thoughts and feelings in. As the relationship gets closer, important conversations are easier to postpone and harder to open up.',
  mutual_expression_restraint: 'Both people tend to sort through thoughts and feelings privately before speaking.',
  expression_withholding: 'It is more natural to sort through thoughts internally before sharing them.',
  expression_constraint: 'Thoughts and feelings tend to be worked through internally first, so speaking openly can take time.',
  communication_relief: 'It is easier than usual to say what you feel and respond to each other.',
  communication_friction_strengthened: 'Important conversations are being put off more often, and the strain in communication is growing.',
  expression_relief: 'It is easier than usual to put thoughts and feelings into words.',
  expression_strengthened: 'It is taking longer than usual to say what has been on your mind.',
  relationship_formation: 'New connections are easier to make, and distance can close more easily.',
  relationship_change: 'This is a period when the shape or direction of a close relationship is more likely to change.',
  marriage_opportunity: 'Marriage or making a relationship official is easier to move forward during this period.',
  mutual_marriage_window: 'Both people have timing that supports making the relationship official at the same time.',
  one_sided_marriage_window: 'This person has a period that supports moving the relationship toward a more formal commitment.',
  marriage_favorable: 'If marriage is being considered, the relationship itself also supports that decision during this period.',
  marriage_caution: 'Marriage or formal commitment is easier to move forward, but the relationship also carries more pressure during this period.',
  relationship_strain: 'This period asks more from the relationship. Issues that would normally be brushed aside are more likely to turn into actual conflict.',
  relationship_relief: 'Pressure that has been building in the relationship eases. Conversation and day-to-day interaction become easier to manage.',
} satisfies Record<Exclude<CustomerSemantic, 'relationship_breakdown_risk'>, string>

export type CompatibilityRendererInputEN = FinalCompatibilityResult & {
  readonly userContext?: FinalCompatibilityResult['userContext'] & { readonly displayNames?: Readonly<Record<string, string>> }
}

export interface CompatibilityStatementEN {
  readonly text: string
  readonly semanticIds: readonly CustomerSemantic[]
  readonly periods?: readonly CompatibilityPeriodEN[]
  readonly provenanceRefs: readonly string[]
}

export interface CompatibilityCustomerResultEN {
  readonly headline?: string
  readonly headlineSemanticIds?: readonly CustomerSemantic[]
  readonly headlineProvenanceRefs?: readonly string[]
  readonly sections: readonly {
    readonly key: CustomerSectionKind
    readonly heading: string
    readonly statements: readonly CompatibilityStatementEN[]
  }[]
  readonly timeline: readonly {
    readonly temporal: CompatibilityPeriodEN['temporal']
    readonly heading: string
    readonly interval?: CompatibilityPeriodEN['interval']
    readonly within?: string
    readonly statements: readonly CompatibilityStatementEN[]
    readonly provenanceRefs: readonly string[]
  }[]
}

type Customer = ReturnType<typeof buildCustomerCompatibility>
const namePattern = /^[\p{L}][\p{L}\p{M} .'-]{0,39}$/u

function namesFor(customer: Customer, input: CompatibilityRendererInputEN) {
  const names = new Map(customer.personIds.map((id, index) => {
    const candidate = input.userContext?.displayNames?.[id]?.trim()
    const safe = candidate && namePattern.test(candidate)
      ? candidate : index === 0 ? 'the first person' : 'the second person'
    return [id, safe]
  }))
  if (new Set(names.values()).size !== names.size) {
    customer.personIds.forEach((id, index) => names.set(id, index === 0 ? 'the first person' : 'the second person'))
  }
  return names
}

function breakdownText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus']) {
  const consequence = status === 'married'
    ? 'The marriage is clearly more vulnerable to a major break, including separation or divorce.'
    : status === 'dating' || status === 'partnered'
      ? 'The relationship is clearly more vulnerable to a major break or breakup.'
      : 'An important relationship is clearly more vulnerable to a major disruption and harder to sustain.'
  const paths = unit.breakdownPaths ?? []
  const basis = paths.includes('BREAKDOWN-A') && paths.includes('BREAKDOWN-B')
    ? 'Existing relationship problems and a major relationship shift overlap here. '
    : paths.includes('BREAKDOWN-A')
      ? 'Problems that have already existed in the relationship become active again during this period. '
      : paths.includes('BREAKDOWN-B')
        ? 'Even if the relationship is not usually unstable, a major shift involving someone important is active during this period. '
        : ''
  return basis + consequence
}

function unitText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus']) {
  if (unit.semantic === 'relationship_breakdown_risk') {
    const risk = breakdownText(unit, status)
    return unit.breakdownPaths?.length === 2 ? `${risk} The risk of a serious break is especially clear.` : risk
  }
  if (unit.semantic === 'marriage_caution' && unit.marriageOpportunityAlongside) {
    return 'Marriage or formal commitment is easier to move forward during this period. At the same time, the relationship carries more pressure than usual.'
  }
  return wording[unit.semantic]
}

function phrase(unit: CustomerCompatibilityUnit, names: ReadonlyMap<string, string>) {
  const [source, target] = unit.personIds.map(id => names.get(id) ?? 'both people')
  return unit.directed && target ? `${source} has an effect on ${target}` : target ? 'the relationship' : source
}

function unitStatement(unit: CustomerCompatibilityUnit, names: ReadonlyMap<string, string>, status: Customer['relationshipStatus']) {
  const text = unitText(unit, status)
  if (unit.semantic.startsWith('direction_')) return directionalText(unit, names)
  if (!unit.directed) return text
  const [source, target] = unit.personIds.map(id => names.get(id) ?? 'both people')
  return `From ${source} to ${target}: ${text}${text.endsWith('.') ? '' : '.'}`
}

function directionalText(unit: CustomerCompatibilityUnit, names: ReadonlyMap<string, string>) {
  const [source, target] = unit.personIds.map(id => names.get(id) ?? 'both people')
  switch (unit.semantic) {
    case 'direction_favorable': return `${source} provides strong practical support to ${target}. It helps resolve problems that are harder to handle alone and brings important strengths into better use.`
    case 'direction_favorable_dominant': return `${source} has both supportive and difficult effects on ${target}. Overall, the more important effect is supportive.`
    case 'direction_balanced_mixed': return `${source} provides strong support to ${target}, alongside strong points of friction.`
    case 'direction_unfavorable_dominant': return `${source} offers some support to ${target}, but more often amplifies existing strain or weakens something important.`
    case 'direction_unfavorable': return `${source} clearly tends to weaken something important for ${target} or reinforce problems that are already present.`
    case 'direction_minor_effect': return `${source} affects ${target}, but does not strongly reshape major foundations of ${target}'s life.`
    default: return `${source} affects ${target}.`
  }
}

function overview(customer: Customer, referenceTime: string, names: ReadonlyMap<string, string>): CompatibilityStatementEN[] {
  const bySection = (key: CustomerSectionKind) => customer.sections.find(item => item.kind === key)?.units ?? []
  const lines: CompatibilityStatementEN[] = []
  const directions = bySection('directionalInfluence')
  const helpful = directions.find(item => item.semantic === 'direction_favorable' || item.semantic === 'direction_favorable_dominant')
  const difficult = directions.find(item => item.semantic === 'direction_unfavorable' || item.semantic === 'direction_unfavorable_dominant')
  const mixed = directions.find(item => item.semantic === 'direction_balanced_mixed')
  const positive = helpful ?? bySection('strengths')[0]
  const negative = difficult ?? bySection('risks')[0]
  if (mixed) lines.push({ text: 'There is strong support between you, along with clear points of friction.',
    semanticIds: [mixed.semantic], provenanceRefs: mixed.sourceFactIds })
  else if (positive && negative) lines.push({
    text: `${capitalize(positive.directed ? directionalText(positive, names) : `${phrase(positive, names)} has meaningful supportive effects.`)} ${capitalize(negative.directed
      ? directionalText(negative, names) : `${phrase(negative, names)} also carries meaningful pressure.`)}`,
    semanticIds: [positive.semantic, negative.semantic], provenanceRefs: [...new Set([...positive.sourceFactIds, ...negative.sourceFactIds])],
  })
  else if (positive || negative) {
    const anchor = positive ?? negative!
    lines.push({ text: positive ? 'The relationship offers practical support in important parts of everyday life.'
        : 'The relationship places pressure on important parts of everyday life.',
    semanticIds: [anchor.semantic], provenanceRefs: anchor.sourceFactIds })
  } else if (directions[0]) lines.push({
    text: 'You affect each other, but the effect does not strongly reshape the major foundations of either person’s life.',
    semanticIds: [directions[0].semantic], provenanceRefs: directions[0].sourceFactIds,
  })

  const personal = bySection('personality')
  const friction = personal.find(item => item.semantic === 'communication_friction')
  const relief = personal.find(item => item.semantic === 'communication_relief')
  if (friction || relief) lines.push({
    text: friction && relief
      ? 'Communication is usually one of the harder parts of this relationship, but the current period makes it easier to speak openly and clear the air.'
      : friction ? 'Both people tend to hold things in, which makes it easier to postpone important conversations and let communication shrink.'
        : 'Right now, it is easier than usual to say what you feel and hear each other out.',
    semanticIds: [friction?.semantic, relief?.semantic].filter((item): item is CustomerSemantic => Boolean(item)),
    provenanceRefs: [...new Set([...(friction?.sourceFactIds ?? []), ...(relief?.sourceFactIds ?? [])])],
  })

  const timingUnits = [...bySection('breakdownRisk'), ...bySection('marriageQuality').filter(item => item.marriageOpportunityAlongside),
    ...(['relationshipStrain', 'relationshipRelief', 'marriageOpportunity', 'marriageQuality', 'relationshipFlow'] as const)
      .flatMap(key => bySection(key)).filter(item => !item.marriageOpportunityAlongside)]
  const temporal = (item: CustomerCompatibilityUnit) => displayPeriodEn(item, Date.parse(referenceTime))?.temporal
  const timing = timingUnits.find(item => temporal(item) === 'current')
    ?? timingUnits.find(item => temporal(item) === 'current_spanning')
    ?? timingUnits.find(item => temporal(item) === 'future')
    ?? timingUnits.find(item => temporal(item) === 'undated')
    ?? timingUnits.find(item => temporal(item) === 'expired')
  if (timing) {
    const period = displayPeriodEn(timing, Date.parse(referenceTime))
    const time = period?.intervalLabel ?? timeLabelsEn[period?.temporal ?? 'undated']
    const owner = timing.personIds.length > 1 ? 'both people' : names.get(timing.personIds[0]) ?? 'one person'
    const message = timing.semantic === 'relationship_breakdown_risk' ? 'the risk of a serious relationship break is clearly higher.'
      : timing.semantic === 'relationship_strain' ? 'the relationship carries more pressure than usual.'
        : timing.semantic === 'relationship_relief' ? 'the effort needed to keep the relationship going eases.'
          : timing.marriageOpportunityAlongside ? 'marriage is easier to formalize, while relationship pressure also increases.'
            : timing.semantic === 'marriage_caution' ? 'marriage planning brings more relationship pressure.'
              : timing.semantic === 'marriage_favorable' ? 'the relationship supports moving toward marriage.'
                : timing.semantic === 'relationship_change' || timing.semantic === 'relationship_formation'
                  ? 'the relationship is more likely to move or change.'
                  : 'marriage or formal commitment is easier to move forward.'
    lines.push({ text: `${time}: ${owner} has a period when ${message}`, semanticIds: [timing.semantic], provenanceRefs: timing.sourceFactIds })
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
  const make = (text: string, units: CustomerCompatibilityUnit[]) => ({ headline: text,
    headlineSemanticIds: units.map(unit => unit.semantic), headlineProvenanceRefs: [...new Set(units.flatMap(unit => unit.sourceFactIds))] })
  if (strength && friction) return make('Practical support with communication friction', [strength, friction])
  if (strength && risk) return make('Support alongside meaningful strain', [strength, risk])
  if (breakdown) return make('A period of elevated relationship-break risk', [breakdown])
  if (marriage && caution) return make('Marriage opportunity alongside relationship pressure', [marriage, caution])
  return customer.sections.length ? { headline: 'Your relationship' } : {}
}

function timelineText(unit: CustomerCompatibilityUnit, status: Customer['relationshipStatus'], owner: string) {
  if (unit.semantic === 'relationship_breakdown_risk') {
    return `${owner ? `${owner}: ` : ''}${breakdownText(unit, status)}`
  }
  if (unit.semantic === 'mutual_marriage_window') return 'Both people have timing that supports making the relationship official at the same time.'
  const prefix = owner ? `${owner}: ` : ''
  switch (unit.semantic) {
    case 'relationship_strain': return `${prefix}the relationship asks for more effort, and everyday issues are more likely to become real conflict.`
    case 'relationship_relief': return `${prefix}relationship pressure eases, making day-to-day interaction easier.`
    case 'marriage_favorable': return `${prefix}the relationship supports moving toward marriage.`
    case 'marriage_caution': return unit.marriageOpportunityAlongside
      ? `${prefix}marriage is easier to formalize, while relationship pressure also increases.`
      : `${prefix}marriage planning carries more relationship pressure.`
    case 'marriage_opportunity': return `${prefix}marriage or formal commitment is easier to move forward.`
    case 'one_sided_marriage_window': return `${prefix}this period supports moving toward a more formal commitment.`
    case 'relationship_formation': return `${prefix}new connections are easier to make and distance can close.`
    case 'relationship_change': return `${prefix}the shape or direction of a close relationship is more likely to change.`
    default: return `${prefix}${unitText(unit, status)}`
  }
}

function periodPhrase(period: CompatibilityPeriodEN) {
  const label = period.temporal === 'current' ? 'the current period'
    : period.temporal === 'current_spanning' ? 'the long-term flow that includes the present'
      : period.temporal === 'future' ? 'the period ahead'
        : period.temporal === 'expired' ? 'an earlier period' : 'a period whose calendar dates are not available'
  return period.intervalLabel ? `${label} (${period.intervalLabel})` : label
}

function validateCustomerText(text: string, input: CompatibilityRendererInputEN) {
  const suppliedNames = Object.values(input.userContext?.displayNames ?? {}).filter(name => namePattern.test(name.trim()))
  const withoutNames = suppliedNames.reduce((result, name) => result.replaceAll(name.trim(), 'Alex'), text)
  if (!isCustomerSafeEn(withoutNames)) throw new Error('UNSAFE_EN_COMPATIBILITY_WORDING')
}

export function renderCompatibilityEn(input: CompatibilityRendererInputEN): CompatibilityCustomerResultEN {
  const customer = buildCustomerCompatibility(input)
  const names = namesFor(customer, input)
  const opening = overview(customer, input.referenceTime, names)
  const sections: Array<CompatibilityCustomerResultEN['sections'][number]> = opening.length
    ? [{ key: 'overview', heading: headings.overview, statements: opening }] : []
  const cards = new Map<string, { period: CompatibilityPeriodEN; statements: CompatibilityStatementEN[];
    refs: Set<string>; within?: string; section: CustomerSectionKind }>()
  const individualOpportunity = customer.sections.find(section => section.kind === 'marriageOpportunity')?.units
    .filter(unit => unit.semantic === 'marriage_opportunity').flatMap(unit => {
      const period = displayPeriodEn(unit, Date.parse(input.referenceTime))
      return period ? [{ unit, period }] : []
    }) ?? []
  for (const section of customer.sections) {
    const groups = new Map<string, { unit: CustomerCompatibilityUnit; periods: Map<string, CompatibilityPeriodEN>; refs: Set<string> }>()
    for (const unit of section.units) {
      const key = JSON.stringify([unit.semantic, unit.personIds, unit.directed, unit.marriageOpportunityAlongside, unit.breakdownPaths])
      const group = groups.get(key) ?? { unit, periods: new Map(), refs: new Set() }
      const period = displayPeriodEn(unit, Date.parse(input.referenceTime))
      if (period) {
        const periodKey = periodIdentityEn(period)
        const prior = group.periods.get(periodKey)
        group.periods.set(periodKey, { ...period,
          provenanceRefs: [...new Set([...(prior?.provenanceRefs ?? []), ...period.provenanceRefs])] })
      }
      unit.sourceFactIds.forEach(ref => group.refs.add(ref))
      groups.set(key, group)
    }
    const statements = [...groups.values()].map(({ unit, periods: periodMap, refs }) => {
      const periods = [...periodMap.values()].sort(comparePeriodsEn).map(period => {
        const parent = strictContainerEn(period, [...periodMap.values()])
          ?? (unit.semantic === 'mutual_marriage_window' || unit.semantic === 'one_sided_marriage_window'
            ? strictContainerEn(period, individualOpportunity.filter(entry => unit.personIds.includes(entry.unit.personIds[0])
              || unit.semantic === 'mutual_marriage_window').map(entry => entry.period)) : undefined)
        return parent?.intervalLabel ? { ...period, within: parent.intervalLabel, withinProvenanceRefs: parent.provenanceRefs } : period
      })
      const owner = unit.personIds.length > 1 ? 'both people' : names.get(unit.personIds[0]) ?? ''
      if (section.kind !== 'personality') for (const period of periods) {
        const key = JSON.stringify([periodIdentityEn(period), period.interval ? undefined : section.kind])
        const card = cards.get(key) ?? { period, statements: [], refs: new Set<string>(), section: section.kind }
        if (period.within) {
          if (unit.semantic === 'mutual_marriage_window') card.within = `Both people have overlapping relationship timing within the broader period from ${period.within}.`
          else card.within ??= `This is a focused period within the broader span from ${period.within}.`
        }
        card.statements.push({ text: timelineText(unit, customer.relationshipStatus,
          unit.personIds.length > 1 && unit.semantic === 'mutual_marriage_window' ? '' : owner),
          semanticIds: [unit.semantic], provenanceRefs: period.provenanceRefs })
        for (const ref of [...period.provenanceRefs, ...(period.withinProvenanceRefs ?? [])]) card.refs.add(ref)
        cards.set(key, card)
      }
      const timedText = periods.length ? (() => {
        const primary = periods.find(period => !period.within) ?? periods[0]
        const focused = periods.filter(period => period.within && period.intervalLabel)
        const who = unit.semantic === 'mutual_marriage_window' ? '' : unit.personIds.length > 1 ? 'both people' : owner
        const focusedLabels = [...new Set(focused.filter(period => period.intervalLabel !== primary.intervalLabel
          && period.within === primary.intervalLabel)
          .map(period => period.intervalLabel))]
        const focusedText = focusedLabels.length ? ` The same flow includes focused windows: ${focusedLabels.join(', ')}.` : ''
        const timed = timelineText(unit, customer.relationshipStatus,
          unit.semantic === 'mutual_marriage_window' ? '' : owner)
        const body = timed.startsWith(`${owner}: `) ? timed.slice(owner.length + 2) : timed
        return `During ${periodPhrase(primary)}, ${who ? `for ${who}, ` : ''}${body.charAt(0).toLowerCase()}${body.slice(1)}${focusedText}`
      })() : unitStatement(unit, names, customer.relationshipStatus)
      return { text: timedText,
        semanticIds: [unit.semantic], ...(periods.length && { periods }), provenanceRefs: [...refs] }
    })
    if (statements.length) sections.push({ key: section.kind, heading: headings[section.kind], statements })
  }
  const timeline = [...cards.values()].sort((a, b) => comparePeriodsEn(a.period, b.period)).map(card => ({
    temporal: card.period.temporal,
    heading: card.period.intervalLabel ? `${timeLabelsEn[card.period.temporal]} · ${card.period.intervalLabel}`
      : `${timeLabelsEn[card.period.temporal]} · ${headings[card.section]}`,
    ...(card.period.interval && { interval: card.period.interval }), ...(card.within && { within: card.within }),
    statements: card.statements, provenanceRefs: [...card.refs],
  }))
  const result = { ...headline(customer), sections, timeline }
  const texts = [result.headline, ...sections.flatMap(section => [section.heading, ...section.statements.map(item => item.text)]),
    ...timeline.flatMap(card => [card.heading, card.within, ...card.statements.map(item => item.text)])]
    .filter((text): text is string => Boolean(text))
  texts.forEach(text => validateCustomerText(text, input))
  return result
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
