import { getCurrentJstYear } from '../calculateMonthlyLuck'
import { CURRENT_CALCULATION_VERSION } from '../canonical/version'
import type { BirthInput } from '../canonical/types'
import { buildEventTiming } from '../eventTiming'
import type { EventDomain, EventKnownFacts, EvaluatedEventScope } from '../eventTiming'
import { runInternalReading, type InternalReadingInput } from '../judgment/pipeline/internalReading'
import { healthOutcomeFromReading, moneyOutcomeFromReading, relationshipOutcomeFromReading } from '../outcome'
import A from '../../docs/source/authority/A_rev179.md?raw'
import draftA from '../../docs/source/authority/A_rev180.md?raw'
import C from '../../docs/source/authority/C_rev215.md?raw'
import D from '../../docs/source/authority/D_rev152.md?raw'
import approval from '../../docs/source/authority/25-7_rev16.md?raw'
import { findJieBoundariesForGregorianYear } from '../solarTermPillars'
import { bounds } from '../reading/semanticUnit'
import { assembleReading } from '../reading/assembleReading'
import type { ReadingAssemblyInput, ReadingJudgmentResult } from '../reading/types'
import { buildWorkStudyOutcomes, type WorkStudyTarget } from '../outcome/workStudy'
import { applyStructuralRoleModifiers, buildCurrentPersonality, buildNatalPersonality } from '../personality'
import { projectCurrentPersonalityScopes } from '../personalityCurrentReading'
import { projectNatalStructuralReading } from '../personalityStructuralReading'
import { buildCustomerReadingPlan } from '../reading/customer/buildCustomerReadingPlan'
import { renderCustomerReading } from '../reading/customer/renderCustomerReadingKo'
import { renderFlowAxes, type CustomerReadingLocale } from '../reading/customer/customerLanguage'
import { timingClaimIdentity } from '../reading/customer/timingChapters'
import { renderJudgmentStructure } from '../reading/customer/renderJudgmentStructure'

const contextKeys = {
  contract: 'event.contract.process',
  business_start: 'event.business.startGoal',
  business_expansion: 'event.business.operating',
  business_adjustment: 'event.business.adjustment',
  business_restructure: 'event.business.restructure',
} as const satisfies Record<EventDomain, keyof EventKnownFacts>

function mergeOverlappingPeriods(periods: readonly (readonly [string, string])[]) {
  const merged: (readonly [string, string])[] = []
  for (const [start, end] of [...periods].sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))) {
    const last = merged.at(-1)
    if (!last || Date.parse(start) >= Date.parse(last[1])) {
      merged.push([start, end])
    } else if (Date.parse(end) > Date.parse(last[1])) {
      merged[merged.length - 1] = [last[0], end]
    }
  }
  return merged
}

export interface BirthReadingOptions {
  eventContext?: EventDomain
  customerContext?: ReadingAssemblyInput['customerContext']
  productScope: ReadingAssemblyInput['productScope']
  referenceTime: string
  monthlyWindowStart?: InternalReadingInput['monthlyWindowStart']
  dailyLuck?: InternalReadingInput['dailyLuck']
  workStudyTargets?: readonly WorkStudyTarget[] | ((scopes: ReadingJudgmentResult['judgmentCore']) => readonly WorkStudyTarget[])
}

export function birthReadingContext(referenceTime: string) {
  const at = new Date(referenceTime)
  const instant = at.toISOString()
  const jstYear = getCurrentJstYear(at)
  const firstJie = findJieBoundariesForGregorianYear(jstYear)[0]
  const monthlyLuckYear = at < firstJie.instant ? jstYear - 1 : jstYear
  return {
    calculation: { referenceTime: instant, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear },
    // The Judgment runtime requires a natal inspection window. Event projection uses Luck periods only.
    natalInspectionPeriod: {
      periodId: 'product-natal-inspection',
      from: { kind: 'exact', instant },
      to: { kind: 'exact', instant: new Date(at.getTime() + 1).toISOString() },
    },
    sources: { A, draftA, C, D, approval },
  } satisfies Pick<InternalReadingInput, 'calculation' | 'natalInspectionPeriod' | 'sources'>
}

/** The product reading owner. Assembly receives projected facts from the existing Event Timing engine. */
export function readBirthChart(birth: BirthInput, options: BirthReadingOptions) {
  return evaluateBirthReading(birth, options, false).assembly
}

const chapterOrder = [
    ['CR-01'], ['CR-02'], ['CR-03'], ['CR-05'], ['CR-06'], ['CR-07'], ['CR-04', 'CR-08', 'CR-09'],
] as const

function groupCustomerPlan(plan: ReturnType<typeof buildCustomerReadingPlan>) {
  const chapterGroups = chapterOrder.map(ids => (ids as readonly string[]).filter(id =>
    plan.chapters.some(chapter => chapter.chapterId === id))).filter(ids => ids.length)
  return { ...plan, chapterGroups }
}

export function readBirthCustomerPlan(birth: BirthInput, options: BirthReadingOptions) {
  const { assembly, natal } = evaluateBirthReading(birth, options, true)
  return groupCustomerPlan(buildCustomerReadingPlan({ assembly, natal }))
}

export function readBirthCustomerReading(birth: BirthInput, options: BirthReadingOptions, locales: readonly CustomerReadingLocale[]) {
  const { assembly, natal } = evaluateBirthReading(birth, options)
  const plan = groupCustomerPlan(buildCustomerReadingPlan({ assembly, natal }))
  return Object.fromEntries(locales.map(locale => {
    const rendered = renderCustomerReading(plan, natal, locale)
    const unitsById = new Map(plan.semanticUnits.map(unit => [unit.id, unit]))
    const publishedText = new Set<string>()
    const claimKeys = new Set<string>()
    return [locale, plan.chapterGroups.map((ids, index) => {
      const groupedFlow = ids.includes('CR-04')
      const seenTiming = new Set<string>()
      let repeatedParagraphCount = 0
      const sections = ids.flatMap(id => rendered.filter(chapter => chapter.chapterId === id)).map(section => {
        const axisGroups = new Map<string, { unit: NonNullable<ReturnType<typeof unitsById.get>>;
          ids: string[]; periods: (readonly [string, string])[] }>()
        for (const { plan } of section.paragraphs) {
          if (plan.expression.kind !== 'judgment_structure') continue
          const unit = unitsById.get(plan.expression.unitId)
          const meaning = unit?.structuralInterpretation
          const period = bounds(unit?.period)
          if (!unit || meaning?.kind !== 'axis' || !period) continue
          const key = JSON.stringify(meaning)
          const group = axisGroups.get(key) ?? { unit, ids: [], periods: [] }
          group.ids.push(plan.id)
          group.periods.push(period)
          axisGroups.set(key, group)
        }
        const continuationById = new Map([...axisGroups.values()].filter(group => group.ids.length > 1)
          .flatMap(group => group.ids.map(id => [id, group] as const)))
        return {
        ...section,
        paragraphs: section.paragraphs.flatMap(paragraph => {
          const { plan } = paragraph
          const continuation = continuationById.get(plan.id)
          if (continuation && continuation.ids[0] !== plan.id) {
            repeatedParagraphCount++
            return []
          }
          const periods = continuation && mergeOverlappingPeriods(continuation.periods)
          const text = continuation && renderJudgmentStructure(continuation.unit, locale, periods) || paragraph.text
          const textKey = text.normalize('NFC').replace(/\s+/gu, ' ').trim()
          const timing = groupedFlow && plan.expression.kind === 'temporal' && !plan.expression.contribution.boundary
            ? JSON.stringify(plan.expression.contribution.activations.map(item =>
              [item.sourceId, item.interval, item.lifecycle, item.direction])) : undefined
          if (publishedText.has(textKey) || timing && seenTiming.has(timing)) {
            repeatedParagraphCount++
            return []
          }
          publishedText.add(textKey)
          if (timing) seenTiming.add(timing)
          return [{ ...paragraph, text }]
        }),
        }
      })
      const paragraphs = sections.flatMap(section => section.paragraphs)
      const explainedAxes = new Set(paragraphs.flatMap(({ plan }) => {
        if (plan.expression.kind !== 'judgment_structure') return []
        const unit = unitsById.get(plan.expression.unitId)
        const detail = unit?.structuralInterpretation
        return detail?.kind === 'axis' && detail.stem && detail.branch && unit?.meaningRef.scopeId
          ? [unit.meaningRef.scopeId] : []
      }))
      const comparisons = groupedFlow ? (['stem', 'branch'] as const).flatMap(axis => {
        const related = plan.flowAxes.filter(item => item.favorableAxis === axis && !explainedAxes.has(item.snapshotId))
        return related.length ? [{
          id: `structure:${JSON.stringify(related.map(item => item.snapshotId))}`, text: renderFlowAxes(related, locale),
        }] : []
      }) : []
      const distinct = (select: (item: typeof paragraphs[number]['plan']) => readonly string[]) =>
        new Set(paragraphs.flatMap(({ plan }) => select(plan))).size
      const newClaims = new Set<string>()
      for (const { plan } of paragraphs) {
        const expression = plan.expression
        const structure = expression.kind === 'judgment_structure'
          ? unitsById.get(expression.unitId)?.structuralInterpretation : undefined
        const keys = structure?.kind === 'axis' ? [JSON.stringify(['axis', structure.changeIdentity,
          structure.stem, structure.branch, structure.shift, structure.shiftSubject, structure.rootChanges, structure.changes])]
          : expression.kind === 'temporal' ? [timingClaimIdentity(expression.contribution)]
            : expression.kind === 'personality' ? [JSON.stringify(['personality', expression.voice, expression.scene, plan.contributionKeys])]
              : plan.semanticUnitIds
        for (const key of keys) if (!claimKeys.has(key)) { claimKeys.add(key); newClaims.add(key) }
      }
      const count = (text: string) => [...text.normalize('NFC')].length
      return {
        number: index + 1,
        title: groupedFlow ? { ko: '현재와 앞으로의 흐름', ja: '今とこれからの流れ', en: 'The present and what lies ahead' }[locale]
          : sections[0].title,
        sections: sections.map((section, sectionIndex) => ({
          title: section.title,
          paragraphs: [...(sectionIndex === 0 ? comparisons : []), ...section.paragraphs.map(({ text, plan }) => ({ text, id: plan.id }))],
        })),
        quality: {
          characterCount: [...paragraphs, ...comparisons].reduce((sum, { text }) => sum + count(text), 0),
          distinctSemanticCount: newClaims.size + comparisons.length,
          distinctCauseCount: distinct(item => item.causeAvailable ? item.lifeMechanismIds : []),
          distinctLifeMechanismCount: distinct(item => item.lifeMechanismIds),
          paragraphRoleCoverage: [...new Set([...paragraphs.map(({ plan }) => plan.purpose), ...(comparisons.length ? ['contrast'] : [])])],
          duplicateMeaningCount: sections.reduce((sum, section) => sum + section.quality.duplicateMeaningCount, 0),
          repeatedParagraphCount,
          unsupportedClaimCount: sections.reduce((sum, section) => sum + section.quality.unsupportedClaimCount, 0),
          excludedCandidateCount: sections.reduce((sum, section) => sum + section.quality.excludedCandidateCount, 0),
          rejectedPlannedClaimCount: sections.reduce((sum, section) => sum + section.quality.rejectedPlannedClaimCount, 0),
          structuralCauseCount: paragraphs.filter(paragraph => paragraph.renderedCause).length,
        },
      }
    })]
  }))
}

export type LocalizedCustomerReading = ReturnType<typeof readBirthCustomerReading>

export function evaluateBirthReading(birth: BirthInput, options: BirthReadingOptions, withPersonality = true) {
  const { eventContext, customerContext, referenceTime, productScope, monthlyWindowStart } = options
  if (eventContext !== undefined && (typeof eventContext !== 'string' || !Object.hasOwn(contextKeys, eventContext))) {
    throw new TypeError('Unsupported event context')
  }

  const context = birthReadingContext(referenceTime)
  const instant = context.calculation.referenceTime
  const evaluated = runInternalReading({
    ...context, birth, executionId: 'product-birth-reading', monthlyWindowStart, dailyLuck: options.dailyLuck,
  })
  const judgment: ReadingJudgmentResult = {
    ...evaluated,
    luck: { ...evaluated.luck, monthlyWindow: 'monthlyWindow' in evaluated.luck ? evaluated.luck.monthlyWindow : undefined },
  }
  const moneyOutcomes = moneyOutcomeFromReading({ judgment })
  const healthOutcomes = healthOutcomeFromReading({ judgment })
  const relationshipOutcomes = relationshipOutcomeFromReading({ judgment })

  const eventTiming = eventContext === undefined ? undefined : buildEventTiming({
    scopes: collectEventScopes(judgment, instant),
    moneyOutcomes,
    relationshipOutcomes,
    knownFacts: { [contextKeys[eventContext]]: true },
    referenceTime: instant,
  })

  const adjacent = productScope === 'premium' ? evaluateAdjacentDaewoon(birth, judgment) : []
  const nextYear = productScope === 'premium' ? evaluateNextSewoon(birth, judgment) : []
  const transitionOutcomes = adjacent.length ? [
    ...moneyOutcomeFromReading({ judgment, evaluatedLuckScopes: adjacent }),
    ...relationshipOutcomeFromReading({ judgment, evaluatedLuckScopes: adjacent }),
  ].filter(fact => adjacent.some(({ snapshot }) => snapshot.id === fact.scopeId)) : undefined

  const natalScope = judgment.judgmentCore[0]
  const natal = withPersonality && natalScope ? applyStructuralRoleModifiers(buildNatalPersonality(judgment.canonical.chart),
    projectNatalStructuralReading(natalScope)) : undefined
  const personality = natal && productScope === 'premium' ? buildCurrentPersonality({
    natalPersonality: natal, structuralScopes: projectCurrentPersonalityScopes(judgment.judgmentCore, natal.dayStem, instant),
    evaluationScope: 'daewoon', referenceTime: instant,
  }) : natal
  const targets = typeof options.workStudyTargets === 'function' && productScope === 'premium'
    ? options.workStudyTargets(judgment.judgmentCore) : options.workStudyTargets
  const workStudyOutcomes = productScope === 'premium'
    ? buildWorkStudyOutcomes(judgment.judgmentCore, Array.isArray(targets) ? targets : [], instant) : undefined
  const assembly = assembleReading({
    evaluatedLuckScopes: [...adjacent, ...nextYear], transitionOutcomes,
    judgment, workStudyOutcomes, personality, productScope, customerContext,
    moneyOutcomes: nextYear.length ? moneyOutcomeFromReading({ judgment, evaluatedLuckScopes: nextYear }) : moneyOutcomes,
    healthOutcomes: nextYear.length ? healthOutcomeFromReading({ judgment, evaluatedLuckScopes: nextYear }) : healthOutcomes,
    relationshipOutcomes: nextYear.length ? relationshipOutcomeFromReading({ judgment, evaluatedLuckScopes: nextYear }) : relationshipOutcomes,
    ...(eventTiming && { eventTimingFacts: eventTiming.facts }),
  })
  return { assembly, natal, judgment }
}

function evaluateNextSewoon(birth: BirthInput, judgment: ReadingJudgmentResult) {
  const currentScope = judgment.judgmentCore.find(snapshot => snapshot.scope === 'yearlyLuck' && snapshot.runtimeStatus === 'resolved')
  const active = currentScope && bounds(currentScope.validity)
  if (!active) return []
  // A runtime year's end can be clipped by a daewoon transition. The
  // containing canonical solar year retains the actual next Risshun.
  const { cards, currentIndex } = judgment.canonical.yearlyLuck
  const current = cards[currentIndex]
  const next = cards[currentIndex + 1]
  if (!current || !next || active[0] < current.startInstant || active[1] > current.endInstant
    || next.startInstant !== current.endInstant) return []
  const start = next.startInstant
  const result = runInternalReading({
    ...birthReadingContext(start), birth, executionId: 'product-next-sewoon',
  })
  const snapshot = result.judgmentCore.find(scope => scope.scope === 'yearlyLuck' && scope.runtimeStatus === 'resolved'
    && bounds(scope.validity)?.[0] === start)
  const parentSnapshot = result.judgmentCore.find(scope => scope.id === snapshot?.parentScopeId)
  return snapshot && parentSnapshot ? [{ snapshot, evaluatedAt: start, parentSnapshot, publicationAncestors: result.judgmentCore.filter(scope =>
    scope.scope === 'natal' || scope.scope === 'greatLuck') }] : []
}

function evaluateAdjacentDaewoon(birth: BirthInput, judgment: ReadingJudgmentResult) {
  const great = judgment.canonical.greatLuck
  const current = judgment.judgmentCore.find(snapshot => snapshot.scope === 'greatLuck' && snapshot.runtimeStatus === 'resolved')
  if (!current || great.status !== 'available' || great.value.currentIndex == null) return []
  const index = great.value.currentIndex
  const currentBounds = bounds(current.validity)
  if (!currentBounds) return []
  const previous = great.value.cards[index - 1]
  const next = great.value.cards[index + 1]
  return [
    ...(previous?.endInstant === currentBounds[0] ? [previous] : []),
    ...(next?.startInstant === currentBounds[1] ? [next] : []),
  ].flatMap(card => {
    const { startInstant, endInstant } = card
    if (!startInstant || !endInstant) return []
    const result = runInternalReading({
      ...birthReadingContext(startInstant), birth, executionId: 'product-adjacent-daewoon', daewoonOnly: true,
    })
    const snapshot = result.judgmentCore.find(value => value.scope === 'greatLuck' && value.runtimeStatus === 'resolved'
      && bounds(value.validity)?.[0] === startInstant && bounds(value.validity)?.[1] === endInstant)
    return snapshot ? [{ snapshot, evaluatedAt: startInstant }] : []
  })
}

export function collectEventScopes(judgment: ReadingJudgmentResult, referenceTime: string) {
  const scopes = new Map<string, EvaluatedEventScope>(judgment.judgmentCore.map(snapshot =>
    [snapshot.id, { snapshot, evaluatedAt: referenceTime }]))
  for (const month of judgment.luck.monthlyWindow ?? []) {
    const snapshot = month.judgmentCore
    if (snapshot && !scopes.has(snapshot.id)) {
      const parentPillar = month.parentSewoon?.pillar
      scopes.set(snapshot.id, {
        snapshot,
        evaluatedAt: month.referenceTime,
        scopeGanZhi: month.pillar,
        parentScopeGanZhi: typeof parentPillar === 'string' ? parentPillar : undefined,
      })
    }
  }
  return [...scopes.values()]
}
