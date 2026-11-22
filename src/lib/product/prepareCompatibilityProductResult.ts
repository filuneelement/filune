import type { BirthInput } from '../canonical/types'
import type { FinalCompatibilityResult } from '../compatibility/final/assembleFinalCompatibility'
import type { CompatibilityCustomerResultKO } from '../compatibility/customer/renderCompatibilityKo'
import type { CompatibilityCustomerResultJA } from '../compatibility/customer/renderCompatibilityJa'
import type { CompatibilityCustomerResultEN } from '../compatibility/customer/renderCompatibilityEn'
import type { Locale } from '../../i18n'

export type CompatibilityPersonInput = {
  readonly name?: string
  readonly birth: BirthInput
}

export type PrepareCompatibilityProductInput = {
  readonly first: CompatibilityPersonInput
  readonly second: CompatibilityPersonInput
  readonly locale: Locale
  readonly relationshipStatus?: 'single' | 'dating' | 'partnered' | 'married'
  readonly referenceTime?: string
}

export type CompatibilityCustomerResult = CompatibilityCustomerResultKO
  | CompatibilityCustomerResultJA
  | CompatibilityCustomerResultEN

export type CompatibilityProductResult = {
  readonly kind: 'compatibility'
  readonly locale: Locale
  readonly referenceTime: string
  readonly final: FinalCompatibilityResult
  readonly customerResult: CompatibilityCustomerResult
}

export type CompatibilityRouteHistoryData = {
  readonly version: 1
  readonly kind: 'compatibility'
  readonly first: CompatibilityPersonInput
  readonly second: CompatibilityPersonInput
  readonly relationshipStatus?: 'single' | 'dating' | 'partnered' | 'married'
  readonly locale: Locale
  readonly referenceTime: string
  readonly customerResult: CompatibilityCustomerResult
}

const firstExecutionId = 'compatibility:first'
const secondExecutionId = 'compatibility:second'

/** Product orchestration only: the existing public engine evaluates and assembles all compatibility semantics. */
export async function prepareCompatibilityProductResult(input: PrepareCompatibilityProductInput): Promise<CompatibilityProductResult> {
  if (!['ko', 'ja', 'en'].includes(input.locale)) throw new TypeError('Unsupported compatibility locale')

  const referenceTime = input.referenceTime ?? new Date().toISOString()
  const { readBirthCompatibility } = await import('./readBirthCompatibility')
  const final = readBirthCompatibility(
    { birth: input.first.birth, executionId: firstExecutionId },
    { birth: input.second.birth, executionId: secondExecutionId },
    referenceTime,
    input.relationshipStatus === undefined ? {} : { userContext: { relationshipStatus: input.relationshipStatus } },
  )

  const displayNames = {
    ...(input.first.name?.trim() && { [firstExecutionId]: input.first.name.trim() }),
    ...(input.second.name?.trim() && { [secondExecutionId]: input.second.name.trim() }),
  }
  const rendererInput = {
    ...final,
    userContext: { ...final.userContext, displayNames },
  }

  let customerResult: CompatibilityCustomerResult
  switch (input.locale) {
    case 'ko': {
      const { renderCompatibilityKo } = await import('../compatibility/customer/renderCompatibilityKo')
      customerResult = renderCompatibilityKo(rendererInput)
      break
    }
    case 'ja': {
      const { renderCompatibilityJa } = await import('../compatibility/customer/renderCompatibilityJa')
      customerResult = renderCompatibilityJa(rendererInput)
      break
    }
    case 'en': {
      const { renderCompatibilityEn } = await import('../compatibility/customer/renderCompatibilityEn')
      customerResult = renderCompatibilityEn(rendererInput)
      break
    }
  }

  return { kind: 'compatibility', locale: input.locale, referenceTime: final.referenceTime, final, customerResult }
}
