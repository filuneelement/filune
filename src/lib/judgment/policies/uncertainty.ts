import type { UncertaintyPolicy } from '../registry/types'

/** Conservative execution default, not a mapped FILUNE interpretation rule. */
export const CONFIRMED_INPUTS_ONLY: UncertaintyPolicy = {
  id: 'confirmed-inputs-only-1',
  defer: (facts) => facts.some(({ assessment }) => assessment !== 'confirmed'),
}
