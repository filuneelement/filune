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
  const { eventContext, referenceTime, productScope, monthlyWindowStart } = options
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

  return assembleReading({
    judgment, moneyOutcomes, healthOutcomes, relationshipOutcomes, productScope,
    ...(eventTiming && { eventTimingFacts: eventTiming.facts }),
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
