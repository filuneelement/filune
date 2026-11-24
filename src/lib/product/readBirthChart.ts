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

const contextKeys = {
  contract: 'event.contract.process',
  business_start: 'event.business.startGoal',
  business_expansion: 'event.business.operating',
  business_adjustment: 'event.business.adjustment',
  business_restructure: 'event.business.restructure',
} as const satisfies Record<EventDomain, keyof EventKnownFacts>

export interface BirthReadingOptions {
  eventContext?: EventDomain
  customerContext?: ReadingAssemblyInput['customerContext']
  productScope: ReadingAssemblyInput['productScope']
  referenceTime: string
  monthlyWindowStart?: InternalReadingInput['monthlyWindowStart']
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
  const { eventContext, customerContext, referenceTime, productScope, monthlyWindowStart } = options
  if (eventContext !== undefined && (typeof eventContext !== 'string' || !Object.hasOwn(contextKeys, eventContext))) {
    throw new TypeError('Unsupported event context')
  }

  const context = birthReadingContext(referenceTime)
  const instant = context.calculation.referenceTime
  const evaluated = runInternalReading({
    ...context, birth, executionId: 'product-birth-reading', monthlyWindowStart,
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

  const adjacent = productScope === 'premium' ? evaluateNextDaewoon(birth, judgment) : []
  const transitionOutcomes = adjacent.length ? [
    ...moneyOutcomeFromReading({ judgment, evaluatedLuckScopes: adjacent }),
    ...relationshipOutcomeFromReading({ judgment, evaluatedLuckScopes: adjacent }),
  ].filter(fact => adjacent.some(({ snapshot }) => snapshot.id === fact.scopeId)) : undefined

  return assembleReading({
    ...(adjacent.length && { evaluatedLuckScopes: adjacent, transitionOutcomes }),
    judgment, moneyOutcomes, healthOutcomes, relationshipOutcomes, productScope, customerContext,
    ...(eventTiming && { eventTimingFacts: eventTiming.facts }),
  })
}

function evaluateNextDaewoon(birth: BirthInput, judgment: ReadingJudgmentResult) {
  const great = judgment.canonical.greatLuck
  const current = judgment.judgmentCore.find(snapshot => snapshot.scope === 'greatLuck' && snapshot.runtimeStatus === 'resolved')
  if (!current || great.status !== 'available' || great.value.currentIndex == null) return []
  const next = great.value.cards[great.value.currentIndex + 1]
  if (!next?.startInstant || !next.endInstant || bounds(current.validity)?.[1] !== next.startInstant) return []
  const result = runInternalReading({
    ...birthReadingContext(next.startInstant), birth, executionId: 'product-next-daewoon', daewoonOnly: true,
  })
  const snapshot = result.judgmentCore.find(value => value.scope === 'greatLuck' && value.runtimeStatus === 'resolved'
    && bounds(value.validity)?.[0] === next.startInstant && bounds(value.validity)?.[1] === next.endInstant)
  return snapshot ? [{ snapshot, evaluatedAt: next.startInstant }] : []
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
