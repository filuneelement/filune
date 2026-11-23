import {
  renderPersonalityEn, renderPersonalityJa, renderPersonalityKo,
  type CurrentPersonalityResult, type NatalPersonalityResult, type PersonalityFact, type RenderedPersonalityBlock,
} from '../../lib/personality'
import { traitPhrase as koPhrase } from '../../lib/personality/render/ko/wording'
import { traitPhraseJa } from '../../lib/personality/render/ja/wording'
import { traitPhraseEn } from '../../lib/personality/render/en/wording'
import { isCustomerSafeKo } from '../../lib/personality/render/ko/guardrails'
import { isCustomerSafeJa } from '../../lib/personality/render/ja/guardrails'
import { isCustomerSafeEn } from '../../lib/personality/render/en/guardrails'
import { customerContextFromSingleResult } from '../../lib/reading/customerContext'
import { assembleReading } from '../../lib/reading/assembleReading'
import { buildCustomerReadingPlan } from '../../lib/reading/customer/buildCustomerReadingPlan'
import { renderCustomerReadingKo } from '../../lib/reading/customer/renderCustomerReadingKo'
import type { ReadingSemanticUnit } from '../../lib/reading/types'
import { currentFlowNarrative, employedNarrative, natalNarratives, type NarrativePart, type PersonalityAxis } from './singleResultNarratives'
import { personalTopics, type Locale, type Messages } from '../../i18n'

const renderSinglePersonality = { ko: renderPersonalityKo, ja: renderPersonalityJa, en: renderPersonalityEn }

const phrases = { ko: koPhrase, ja: traitPhraseJa, en: traitPhraseEn }
const customerSafe = { ko: isCustomerSafeKo, ja: isCustomerSafeJa, en: isCustomerSafeEn }
const sourceOrder = ['day_stem', 'day_pillar', 'ten_god', 'position']
// These groups only prevent overlapping prose. The selected fact keeps its original wording.
const overlappingTraits = new Map([
  ['주체성', '자기 주관'], ['독립성', '자기 주관'], ['자기 주관', '자기 주관'],
  ['신속한 판단', '빠른 판단'], ['빠른 판단', '빠른 판단'],
  ['안정', '안정 추구'], ['안정 추구', '안정 추구'],
  ['치밀성', '정확성'], ['정확성', '정확성'],
])
const freeOverlappingTraits = new Map([
  ['꼼꼼함', '정확성'], ['치밀함', '정확성'], ['완료한 작업도 다시 점검함', '정확성'],
  ['조언을 들어도 스스로 납득한 뒤 움직임', '타당성을 스스로 확인하고 움직임'],
  ['완료한 결과에도 부족한 점을 먼저 돌아봄', '잘한 결과에도 만족하기 어려움'],
])

const axisByTraitType: Record<PersonalityFact['traitType'], PersonalityAxis> = {
  core: 'judgment', decision: 'judgment', strength: 'action', shadow: 'emotion', social: 'relationship',
  inner: 'observation', interpersonal: 'relationship', work: 'persistence', stress: 'emotion',
  growth: 'adaptation', internal_conflict: 'emotion', expression: 'expression',
}

const axisByTrait = new Map<string, PersonalityAxis>([
  ['정확성', 'observation'], ['분석력', 'observation'], ['정보를 비판적으로 선별함', 'observation'],
  ['자기 주관', 'independence'], ['응용성', 'adaptation'], ['혁신성', 'adaptation'],
  ['임기응변', 'adaptation'], ['순발력', 'action'], ['인내', 'persistence'], ['지구력', 'persistence'],
])

function pointsFor(
  blocks: (RenderedPersonalityBlock | undefined)[],
  facts: readonly PersonalityFact[],
  locale: Locale,
  units: readonly ReadingSemanticUnit[],
  broader = false,
) {
  const eligible = new Set(blocks.flatMap(block => block?.sourceFactIds ?? []))
  const candidates = facts.filter(fact => eligible.has(fact.id) && fact.status !== 'deferred'
    && fact.traitType !== 'internal_conflict' && fact.traitType !== 'growth')
    .sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active')
      || sourceOrder.indexOf(a.sourceType) - sourceOrder.indexOf(b.sourceType))
  const points: {
    phrase: string; key: string; qualified: boolean; unit: ReadingSemanticUnit
    axis: PersonalityAxis; sourceType: PersonalityFact['sourceType']
  }[] = []
  const byRecord = new Map(units.map(unit => [unit.meaningRef.recordId, unit]))
  const usedGroups = new Set<string>()
  for (const fact of candidates) {
    const unit = byRecord.get(fact.id)
    const phrase = phrases[locale](fact.trait)
    if (!unit || broader && unit.status === 'deferred' || !phrase || !customerSafe[locale](phrase)) continue
    const key = phrase.normalize('NFKC').toLowerCase().replace(/[\p{P}\s]+/gu, '')
    const group = (broader ? freeOverlappingTraits.get(fact.trait) : undefined)
      ?? overlappingTraits.get(fact.trait) ?? fact.trait
    if (!key || usedGroups.has(group) || points.some(point => point.key.includes(key) || key.includes(point.key))) continue
    usedGroups.add(group)
    points.push({
      phrase, key, qualified: fact.status !== 'active' || unit.certainty !== 'confirmed', unit,
      axis: axisByTrait.get(group) ?? axisByTraitType[fact.traitType],
      sourceType: fact.sourceType,
    })
    if (!broader && points.length === 4) break
  }
  return points
}

export type CustomerParagraph = {
  text: string
  sourceFactIds: string[]
  semanticIds: string[]
  evidenceIds: string[]
  sourceEffectIds: string[]
  axesUsed: PersonalityAxis[]
}

export type SelectionContext = {
  topic?: string
  careerStatus?: string
  relationshipStatus?: string
}

export const paidChapterKeys = [
  'currentFlow', 'relationshipPattern', 'careerConditions', 'moneyPattern',
  'futureChanges', 'timingGuide', 'selectedTopicDeepDive',
] as const

type PaidChapterKey = typeof paidChapterKeys[number]
type CustomerReading = { title: string; paragraphs: CustomerParagraph[] }
export type PaidPreview = CustomerReading & { continuationHints: CustomerParagraph[] }

function paragraph(text: string, units: readonly ReadingSemanticUnit[], axes: readonly PersonalityAxis[] = []): CustomerParagraph {
  return {
    text,
    sourceFactIds: [...new Set(units.flatMap(unit => [...unit.sourcePersonalityFactIds, ...unit.sourceFactIds]))],
    semanticIds: [...new Set(units.map(unit => unit.id))],
    evidenceIds: [...new Set(units.flatMap(unit => unit.evidenceIds))],
    sourceEffectIds: [...new Set(units.flatMap(unit => unit.sourceEffectIds))],
    axesUsed: [...new Set(axes)],
  }
}

function resolveNarrative(parts: readonly NarrativePart[], facts: readonly PersonalityFact[],
  units: readonly ReadingSemanticUnit[], locale: Locale): CustomerParagraph[] {
  const byRecord = new Map(units.map(unit => [unit.meaningRef.recordId, unit]))
  const byTrait = new Map<string, ReadingSemanticUnit>()
  for (const fact of facts) {
    const unit = byRecord.get(fact.id)
    if (!unit || unit.status === 'deferred') continue
    const existing = byTrait.get(fact.trait)
    if (!existing || existing.status === 'partial' && unit.status === 'ready') byTrait.set(fact.trait, unit)
  }
  const paragraphs: CustomerParagraph[] = []
  for (const part of parts) {
    const support = part.requires.map(group => group.flatMap(trait => {
      const unit = byTrait.get(trait)
      return unit ? [unit] : []
    }))
    if (support.some(group => group.length === 0) || !customerSafe[locale](part.copy[locale])) return []
    paragraphs.push(paragraph(part.copy[locale], support.flat(), part.axes))
  }
  return paragraphs
}

function fallback(blocks: (RenderedPersonalityBlock | undefined)[], facts: readonly PersonalityFact[],
  units: readonly ReadingSemanticUnit[], locale: Locale, t: Messages, chapter: number) {
  const points = pointsFor(blocks, facts, locale, units)
  const lead = points[0]
  if (!lead) return []
  const template = t.resultChapterCopy[lead.qualified ? 'qualified' : 'supported'][chapter][0]
  const result = [paragraph(template.replace('{trait}', () => lead.phrase), [lead.unit])]
  const [, first, second] = points
  if (first && second) {
    result.push(paragraph(t.resultChapterCopy.synthesisPair
      .replace('{first}', () => first.phrase).replace('{second}', () => second.phrase), [first.unit, second.unit]))
  } else if (first) {
    const followUp = t.resultChapterCopy[first.qualified ? 'qualified' : 'supported'][chapter][1]
    result.push(paragraph(followUp.replace('{trait}', () => first.phrase), [first.unit]))
  }
  return result.filter(item => customerSafe[locale](item.text))
}

function broaderFreeReading(blocks: (RenderedPersonalityBlock | undefined)[], facts: readonly PersonalityFact[],
  units: readonly ReadingSemanticUnit[], locale: Locale, t: Messages, chapter: number) {
  const points = pointsFor(blocks, facts, locale, units, true)
  const primary = points[0]
  if (!primary) return []
  const pillarContext = chapter === 0 ? points.find(point =>
    point.sourceType === 'day_pillar' && point.axis !== primary.axis) : undefined
  const preferred = [primary, ...(pillarContext ? [pillarContext] : [])]
  const axes = new Set(preferred.map(point => point.axis))
  const additionalAxes = points.filter(({ axis }) => {
    if (axes.has(axis)) return false
    axes.add(axis)
    return true
  })
  const firstByAxis = [...preferred, ...additionalAxes]
  const [lead, ...support] = [...firstByAxis, ...points.filter(point => !firstByAxis.includes(point))].slice(0, 8)
  const leadTemplates = t.resultChapterCopy[lead.qualified ? 'qualified' : 'supported'][chapter]
  const leadParagraph = paragraph(leadTemplates[0].replace('{trait}', () => lead.phrase), [lead.unit], [lead.axis])
  const groups = Math.min(4, support.length)
  const paragraphs = Array.from({ length: groups }, (_, index) => {
    const start = Math.floor(index * support.length / groups)
    const end = Math.floor((index + 1) * support.length / groups)
    const [first, second] = support.slice(start, end)
    const templates = t.resultChapterCopy[first.qualified ? 'qualified' : 'supported'][chapter]
    const text = second
      ? t.resultChapterCopy.densePairs[index % t.resultChapterCopy.densePairs.length]
        .replace('{first}', () => first.phrase).replace('{second}', () => second.phrase)
      : templates[(index + 1) % templates.length].replace('{trait}', () => first.phrase)
    return paragraph(text, second ? [first.unit, second.unit] : [first.unit],
      second ? [first.axis, second.axis] : [first.axis])
  })
  return [leadParagraph, ...paragraphs].filter(item => customerSafe[locale](item.text))
}

export function synthesizeSingleResult(natal: NatalPersonalityResult, current: CurrentPersonalityResult | undefined,
  referenceTime: string, context: SelectionContext, locale: Locale, t: Messages) {
  const reading = renderSinglePersonality[locale]({ natal })
  const customerContext = customerContextFromSingleResult(context)
  const assembly = assembleReading({ personality: natal, referenceTime, customerContext, productScope: 'premium' })
  const natalUnits = assembly.semanticUnits.filter(unit => unit.meaningRef.kind === 'personality_fact')
  const eligibleFacts = new Set(Object.values(reading).flatMap(block => 'sourceFactIds' in block ? block.sourceFactIds : []))
  const facts = natal.facts.filter(fact => eligibleFacts.has(fact.id))
  const specs = [
    { title: t.reading.freeTemperament, recipe: natalNarratives.temperament,
      blocks: [reading.overview, reading.decision, reading.outward, reading.closeRelations, reading.emotion] },
    { title: t.reading.strengths, recipe: natalNarratives.strengths, blocks: [reading.strengths] },
    { title: t.reading.freePatterns, recipe: natalNarratives.patterns,
      blocks: [reading.decision, reading.emotion, reading.cautions, reading.closeRelations] },
  ]
  const free = locale === 'ko' ? renderCustomerReadingKo(buildCustomerReadingPlan({
    natal, referenceTime,
    assembly: assembleReading({ personality: natal, referenceTime, customerContext, productScope: 'free' }),
  }), natal).map(chapter => {
    const paragraphs = chapter.paragraphs.map(({ text, plan }): CustomerParagraph => ({
      text, sourceFactIds: [...plan.sourcePersonalityFactIds, ...plan.sourceFactIds],
      semanticIds: [...plan.semanticUnitIds], evidenceIds: [...plan.evidenceIds],
      sourceEffectIds: [...plan.sourceEffectIds], axesUsed: [],
    }))
    return {
      title: chapter.title, paragraphs, readiness: chapter.readiness,
      debug: {
        section: chapter.title,
        sourceFactIds: [...new Set(paragraphs.flatMap(item => item.sourceFactIds))],
        semanticIds: [...new Set(paragraphs.flatMap(item => item.semanticIds))],
        axesUsed: [],
      },
    }
  }) : specs.map(({ title, recipe, blocks }, index) => {
    const authored = resolveNarrative(recipe, facts, natalUnits, locale)
    const paragraphs = authored.length ? authored : broaderFreeReading(blocks, facts, natalUnits, locale, t, index)
    const debug = {
      section: title,
      sourceFactIds: [...new Set(paragraphs.flatMap(item => item.sourceFactIds))],
      semanticIds: [...new Set(paragraphs.flatMap(item => item.semanticIds))],
      axesUsed: [...new Set(paragraphs.flatMap(item => item.axesUsed))],
    }
    return { title, paragraphs, debug }
  })

  const paid: Partial<Record<PaidChapterKey, PaidPreview>> = {}
  const currentUnits = current
    ? assembleReading({ personality: current, referenceTime, customerContext, productScope: 'premium' }).semanticUnits.filter(unit =>
      unit.meaningRef.kind === 'current_personality_fact'
      && (unit.sourceStatus === 'active' || unit.sourceStatus === 'contextual'))
    : []
  const currentFacts = current ? [...current.natal.facts, ...current.temporaryFacts] : []
  if (current) {
    const rendered = renderSinglePersonality[locale]({ natal: current.natal, current })
    const eligible = rendered.currentExpression?.sourceFactIds ?? []
    const effectiveUnits = currentUnits.filter(unit => eligible.includes(unit.meaningRef.recordId))
    let paragraphs = resolveNarrative(currentFlowNarrative, currentFacts, effectiveUnits, locale)
    if (!paragraphs.length) {
      const points = pointsFor([rendered.currentExpression], currentFacts, locale, effectiveUnits)
      const [first, second] = points
      if (first) {
        const text = second
          ? t.resultChapterCopy.currentPair.replace('{first}', () => first.phrase).replace('{second}', () => second.phrase)
          : t.resultChapterCopy.current[0].replace('{trait}', () => first.phrase)
        if (customerSafe[locale](text)) paragraphs = [paragraph(text, second ? [first.unit, second.unit] : [first.unit])]
      }
    }
    if (paragraphs.length) {
      const firstIds = new Set(paragraphs[0].semanticIds)
      const support = effectiveUnits.filter(unit => firstIds.has(unit.id))
      const period = support[0]?.period
      const continuationHints = period && 'start' in period ? [
        paragraph(t.resultChapterCopy.currentPeriod
          .replace('{years}', () => new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Tokyo', year: 'numeric' })
            .formatRange(new Date(period.start), new Date(period.end))), support),
      ] : []
      paid.currentFlow = { title: t.resultPreview.chapters[0].title, paragraphs, continuationHints }
    }
  }

  let selected: CustomerParagraph[] = []
  if (context.topic === 'work' && context.careerStatus === 'employed') {
    selected = resolveNarrative(employedNarrative, [...facts, ...currentFacts], [...natalUnits, ...currentUnits], locale)
  }
  if (!selected.length && (context.topic === 'work' || context.topic === 'love')) {
    const isWork = context.topic === 'work'
    const blocks = isWork ? [reading.outward, reading.decision] : [reading.closeRelations]
    const relevant = facts.filter(fact => isWork ? fact.traitType === 'work' || fact.traitType === 'decision'
      : fact.traitType === 'interpersonal')
    selected = fallback(blocks, relevant, natalUnits, locale, t, 2)
    const status = isWork ? context.careerStatus : context.relationshipStatus
    const lens = status && Object.entries(t.resultChapterCopy.topicLens).find(([key]) => key === status)?.[1]
    if (lens && selected.length) {
      const last = selected.length - 1
      selected[last] = { ...selected[last], text: selected[last].text + ' ' + lens }
    }
  }
  const topicLabel = t.flow.topics[personalTopics.findIndex(topic => topic === context.topic)]
  const selectedTopicPreview = selected.length ? {
    title: t.resultChapterCopy.selectedTopicTitle.replace('{topic}', () => topicLabel),
    paragraphs: selected, continuationHints: [],
  } : undefined
  if (selectedTopicPreview) paid.selectedTopicDeepDive = selectedTopicPreview

  const chapters = paidChapterKeys.map((key, index) => ({
    key, title: paid[key]?.title ?? t.resultPreview.chapters[index]?.title ?? t.resultPreview.focusTitle,
    preview: paid[key],
  }))
  return { free, paid, chapters, selectedTopicPreview, context }
}
