import type { ChapterId, ReadingAssemblyGap, SelectionKind } from './types'

type GapType = ReadingAssemblyGap['type']

export function gap(chapterId: ChapterId, code: string, type: GapType, description: string, ...provenance: string[]): ReadingAssemblyGap {
  return { id: `${chapterId}:${code}`, chapterId, type, description, blocking: true, provenance }
}

export const selectionKinds: Partial<Record<ChapterId, readonly SelectionKind[]>> = {
  'F-02': ['core_structure'],
  'F-04': ['strength', 'challenge'],
  'CH-03': ['strength', 'challenge'],
  'CH-10': ['best_month', 'worst_month'],
  'CH-11': ['remember'],
}

export const chapterGaps = [
  gap('F-01', 'birth-scene', 'engine_gap', 'Birth provenance, boundary publication policy and reading keys are incomplete.', 'B F-①', 'W-97'),
  gap('F-03', 'four-views', 'renderer_gap', 'The four natal views require chapter-specific evidence and wording.', 'B F-③'),
  gap('CH-01', 'natal-structure', 'engine_gap', 'General contact effects, final value directions and transition coverage are incomplete.', 'B CH-1', 'A I-06'),
  gap('CH-02', 'seven-views', 'source_gap', 'The seven views require supported responsibility, context and consequence.', 'B CH-2'),
  gap('CH-03', 'application', 'source_gap', 'Shared roots and practical applications require explicit support.', 'B CH-3', 'B-6'),
  gap('CH-04', 'work', 'outcome_layer_not_implemented', 'Work outcomes and work-related periods are unavailable.', 'B CH-4'),
  gap('CH-05', 'money', 'outcome_layer_not_implemented', 'Money outcomes and money-related periods are unavailable.', 'B CH-5'),
  gap('CH-06', 'relationship', 'outcome_layer_not_implemented', 'Relationship outcome and timing projections are unavailable.', 'B CH-6', 'OP-R03'),
  gap('CH-07', 'health', 'outcome_layer_not_implemented', 'The restricted health projection is unavailable.', 'B CH-7', 'A I-16'),
  gap('CH-08', 'daewoon-coverage', 'engine_gap', 'A complete evaluated past, current and next period collection is unavailable.', 'B CH-8'),
  gap('CH-09', 'annual-axes', 'engine_gap', 'A complete two-year judgment by axis is unavailable.', 'B CH-9', 'OP-L03'),
  gap('CH-10', 'monthly-axes', 'engine_gap', 'Final monthly judgment by axis is deferred.', 'B CH-10', 'OP-L03', 'W-93'),
  gap('CH-11', 'summary-context', 'engine_gap', 'Monthly rhythm and use of the current period require completed chapter judgments.', 'B CH-11'),
  gap('CH-Q', 'question-routing', 'engine_gap', 'Selection of an existing judgment for the supplied question is unavailable.', 'B CH-Q', 'W-99'),
] as const
