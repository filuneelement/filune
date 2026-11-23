import type { CustomerContext } from './types'

export const careerStatuses = ['job_seeking', 'employed', 'business'] as const
export const relationshipStatuses = ['single', 'dating', 'married'] as const

export interface CustomerReadingContext {
  readonly careerStatus?: typeof careerStatuses[number]
  readonly relationshipStatus?: typeof relationshipStatuses[number]
  readonly lifeStage?: 'student'
}

function member<const T extends string>(values: readonly T[], value: unknown): T | undefined {
  return values.find(item => item === value)
}

function normalizeContext(input: {
  readonly careerStatus?: unknown
  readonly relationshipStatus?: unknown
  readonly lifeStage?: unknown
}): CustomerReadingContext {
  const careerStatus = member(careerStatuses, input.careerStatus === 'job-seeking' ? 'job_seeking'
    : input.careerStatus === 'business-owner' ? 'business' : input.careerStatus)
  const relationshipStatus = member(relationshipStatuses, input.relationshipStatus)
  return {
    ...(careerStatus && { careerStatus }),
    ...(relationshipStatus && { relationshipStatus }),
    ...(input.lifeStage === 'student' && { lifeStage: 'student' }),
  }
}

export function customerContextFromSingleResult(input: Parameters<typeof normalizeContext>[0]): CustomerContext {
  return { knownFacts: { ...normalizeContext(input) } }
}

export function resolveCustomerReadingContext(context?: CustomerContext): CustomerReadingContext {
  return normalizeContext(context?.knownFacts ?? {})
}

const competitionScenes = {
  study: {
    student: ['peers', 'friends', 'academic_competition', 'learning_environment'],
  },
  work: {
    employed: ['colleagues', 'performance_evaluation', 'work_allocation'],
    business: ['competitors', 'business_partners'],
  },
  money: {
    business: ['competitors', 'business_partners', 'revenue_sharing'],
  },
} as const

export type CompetitionScene = 'peers' | 'friends' | 'academic_competition' | 'learning_environment'
  | 'colleagues' | 'performance_evaluation' | 'work_allocation' | 'competitors' | 'business_partners' | 'revenue_sharing'

export function selectCompetitionScenes(
  context: CustomerReadingContext, target: keyof typeof competitionScenes,
  allowedScenes: readonly CompetitionScene[],
): readonly CompetitionScene[] {
  const scenes = target === 'study' && context.lifeStage === 'student' ? competitionScenes.study.student
    : target === 'work' && context.careerStatus === 'employed' ? competitionScenes.work.employed
    : target !== 'study' && context.careerStatus === 'business' ? competitionScenes[target].business
    : []
  return scenes.filter(scene => allowedScenes.includes(scene))
}
