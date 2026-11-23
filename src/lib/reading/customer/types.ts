import type { ReadingCertainty, ReadingProvenance, ReadingScope } from '../types'
import type { CustomerReadingContext } from '../customerContext'

export type CustomerChapterId = 'CR-01' | 'CR-02' | 'CR-03' | 'CR-05' | 'CR-07'
export type ParagraphPurpose = 'conclusion' | 'cause' | 'life_expression' | 'condition' | 'contrast' | 'timing' | 'application'

export type PersonalityVoice = 'core' | 'outward' | 'decision' | 'information' | 'relationship' | 'stress'
  | 'problem' | 'collaboration' | 'ability' | 'pattern' | 'duality'

export type OutcomeVoice = 'earning' | 'skill' | 'expression' | 'retention' | 'capacity' | 'divisionRetention'
  | 'division' | 'protection' | 'sustainability' | 'pressure'
  | 'contact' | 'change' | 'formation' | 'relationshipPressure'

export type ParagraphExpression =
  | { readonly kind: 'personality'; readonly voice: PersonalityVoice; readonly traitFactIds: readonly string[];
      readonly scene?: CustomerReadingContext['relationshipStatus'] }
  | { readonly kind: 'outcome'; readonly voice: OutcomeVoice; readonly scene?: CustomerReadingContext['relationshipStatus'];
      readonly startsAt?: string; readonly endsBefore?: string; readonly timingOnly?: true }

export interface CustomerReadingParagraphPlan extends ReadingProvenance {
  readonly id: string
  readonly chapterId: CustomerChapterId
  readonly purpose: ParagraphPurpose
  readonly layer?: 'personality' | 'outcome'
  readonly emphasis?: 'key_conclusion' | 'key_contrast' | 'decision_criterion'
  readonly slots: readonly string[]
  readonly semanticUnitIds: readonly string[]
  readonly sourceOutcomeIds: readonly string[]
  readonly sourceMappingIds: readonly string[]
  readonly lifeMechanismIds: readonly string[]
  readonly contributionKeys: readonly string[]
  readonly scope: ReadingScope
  readonly periodRef?: string
  readonly certainty: ReadingCertainty
  readonly causeAvailable: boolean
  readonly lifeMappingAvailable: boolean
  readonly reasonStatus: 'complete' | 'partial'
  readonly expression: ParagraphExpression
}

export interface CustomerChapterGap {
  readonly type: 'ENGINE_GAP' | 'SOURCE_GAP' | 'ASSEMBLY_GAP' | 'RENDERER_GAP' | 'PARTIAL_LOOP'
  readonly slot: string
}

export interface CustomerChapterPlan {
  readonly chapterId: CustomerChapterId
  readonly titleKey: CustomerChapterId
  readonly readiness: 'ready' | 'partial' | 'deferred'
  readonly paragraphPlans: readonly CustomerReadingParagraphPlan[]
  readonly gaps: readonly CustomerChapterGap[]
  readonly provenance: ReadingProvenance
}

export const chapterTargets = {
  'CR-01': { characters: [900, 1400], paragraphs: [5, 7] },
  'CR-02': { characters: [800, 1300], paragraphs: [4, 6] },
  'CR-03': { characters: [900, 1400], paragraphs: [4, 6] },
  'CR-05': { characters: [1500, 2500], paragraphs: [7, 10] },
  'CR-07': { characters: [1500, 2500], paragraphs: [7, 10] },
} as const
