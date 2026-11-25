import type { BirthInput } from '../canonical/types'
import type { EventDomain } from '../eventTiming'
import type { BirthReadingOptions } from './readBirthChart'
import type { CustomerReadingLocale } from '../reading/customer/customerLanguage'

export async function prepareProductResult(birth: BirthInput, options: {
  eventContext?: EventDomain
  customerContext?: BirthReadingOptions['customerContext']
  referenceTime?: string
  productScope?: BirthReadingOptions['productScope']
  monthlyWindowStart?: BirthReadingOptions['monthlyWindowStart']
  includeCustomerPlan?: boolean
  customerReadingLocales?: readonly CustomerReadingLocale[]
  workStudyTargets?: BirthReadingOptions['workStudyTargets']
} = {}) {
  const { calculateEightChar, calculateEightCharWithoutBirthTime } = await import('../calculateEightChar')
  const pillars = birth.time.known
    ? calculateEightChar({ ...birth.date, ...birth.time.value }, { mode: birth.timeCorrectionMode, birthplace: birth.birthplace })
    : calculateEightCharWithoutBirthTime(birth.date)

  if (options.eventContext === undefined && !options.includeCustomerPlan && !options.customerReadingLocales?.length) return { pillars }
  const { readBirthChart, readBirthCustomerPlan, readBirthCustomerReading } = await import('./readBirthChart')
  const readingOptions = {
    eventContext: options.eventContext,
    customerContext: options.customerContext,
    productScope: options.productScope ?? 'free',
    referenceTime: options.referenceTime ?? new Date().toISOString(),
    monthlyWindowStart: options.monthlyWindowStart,
    workStudyTargets: options.workStudyTargets,
  } satisfies BirthReadingOptions
  if (options.customerReadingLocales?.length) return { pillars, customerReading: readBirthCustomerReading(birth, readingOptions, options.customerReadingLocales) }
  if (options.includeCustomerPlan) return { pillars, customerPlan: readBirthCustomerPlan(birth, readingOptions) }
  const reading = readBirthChart(birth, readingOptions)
  return { pillars, reading }
}
