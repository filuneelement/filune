import type { BirthInput } from '../canonical/types'
import type { EventDomain } from '../eventTiming'
import type { BirthReadingOptions } from './readBirthChart'

export async function prepareProductResult(birth: BirthInput, options: {
  eventContext?: EventDomain
  customerContext?: BirthReadingOptions['customerContext']
  referenceTime?: string
  productScope?: BirthReadingOptions['productScope']
  monthlyWindowStart?: BirthReadingOptions['monthlyWindowStart']
} = {}) {
  const { calculateEightChar, calculateEightCharWithoutBirthTime } = await import('../calculateEightChar')
  const pillars = birth.time.known
    ? calculateEightChar({ ...birth.date, ...birth.time.value }, { mode: birth.timeCorrectionMode, birthplace: birth.birthplace })
    : calculateEightCharWithoutBirthTime(birth.date)

  if (options.eventContext === undefined) return { pillars }
  const { readBirthChart } = await import('./readBirthChart')
  const reading = readBirthChart(birth, {
    eventContext: options.eventContext,
    customerContext: options.customerContext,
    productScope: options.productScope ?? 'free',
    referenceTime: options.referenceTime ?? new Date().toISOString(),
    monthlyWindowStart: options.monthlyWindowStart,
  })
  return { pillars, reading }
}
