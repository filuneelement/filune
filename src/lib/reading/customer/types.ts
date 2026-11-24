import type { TemporalContribution, TemporalQuality, TimingCard } from './timingChapters'
import type { MoneyContrast } from './moneyExplanation'
import type { MoneyAxis } from '../../outcome'
import type { CustomerBehaviorPattern } from './behaviorLoops'
import type { ReadingCertainty, ReadingProvenance, ReadingScope } from '../types'
import type { CustomerReadingContext } from '../customerContext'

export type CustomerChapterId = 'CR-01' | 'CR-02' | 'CR-03' | 'CR-04' | 'CR-05' | 'CR-07' | 'CR-08' | 'CR-09'
export type SemanticReadiness = 'ready' | 'partial' | 'deferred'
export type PublicationReadiness = 'ready' | 'partial' | 'deferred'
export type RelationshipTimingAvailability = 'available' | 'partial' | 'none'
export type RelationshipAxis = 'approach' | 'closeness' | 'trust' | 'communication' | 'boundary' | 'conflict' | 'distance'

export const customerChapterTitleKeys = {
  'CR-01': 'basic_temperament',
  'CR-02': 'personal_strengths',
  'CR-03': 'situational_responses',
  'CR-04': 'current_life_changes',
  'CR-05': 'relationship_style',
  'CR-07': 'earning_and_retention',
  'CR-08': 'long_term_transitions',
  'CR-09': 'opportunity_and_caution_windows',
} as const satisfies Record<CustomerChapterId, string>

export type CustomerChapterTitleKey = typeof customerChapterTitleKeys[CustomerChapterId]

export interface CustomerChapterQuality {
  readonly semanticReadiness: SemanticReadiness
  readonly publicationReadiness: PublicationReadiness
  readonly characterCount: number
  readonly paragraphCount: number
  readonly unsupportedClaimCount: number
  readonly duplicateMeaningCount: number
  readonly densityGap: boolean
}

export type ParagraphPurpose = 'conclusion' | 'cause' | 'life_expression' | 'condition' | 'contrast' | 'timing' | 'application'

export type PersonalityVoice = 'core' | 'outward' | 'decision' | 'information' | 'relationship' | 'stress'
  | 'problem' | 'collaboration' | 'ability' | 'pattern' | 'duality'

export type OutcomeVoice = 'earning' | 'skill' | 'expression' | 'retention' | 'capacity' | 'divisionRetention'
  | 'division' | 'protection' | 'sustainability' | 'pressure' | 'supportPressure'
  | 'contact' | 'change' | 'formation' | 'relationshipPressure'

export type ParagraphExpression =
  | { readonly kind: 'temporal'; readonly contribution: TemporalContribution }
  | { readonly kind: 'personality'; readonly voice: PersonalityVoice; readonly traitFactIds: readonly string[];
      readonly scene?: CustomerReadingContext['relationshipStatus'];
      readonly composite?: 'outward_decision' | 'relation_sequence'; readonly pattern?: CustomerBehaviorPattern;
      readonly limitationFactId?: string }
  | { readonly kind: 'outcome'; readonly voice: OutcomeVoice; readonly scene?: CustomerReadingContext['relationshipStatus'];
      readonly startsAt?: string; readonly endsBefore?: string }

export interface OutcomeActivation {
  readonly semanticUnitId: string
  readonly sourceOutcomeId: string
  readonly scope: ReadingScope
  readonly periodRef?: string
  readonly certainty: ReadingCertainty
  readonly startsAt?: string
  readonly endsBefore?: string
}

export type RelationshipSection = 'natal_relationship' | 'relationship_outcome'

export interface CustomerRelationshipSequence {
  readonly sourcePersonalityFactIds: readonly string[]
  readonly relationshipStyle: readonly string[]
  readonly communication: readonly string[]
  readonly conflictResponse: readonly string[]
}

export interface CustomerReadingParagraphPlan extends ReadingProvenance {
  readonly id: string
  readonly chapterId: CustomerChapterId
  readonly purpose: ParagraphPurpose
  readonly section?: RelationshipSection
  readonly moneyContrasts?: readonly MoneyContrast[]
  readonly moneyAxes?: readonly MoneyAxis[]
  readonly relationshipAxes?: readonly RelationshipAxis[]
  readonly layer?: 'personality' | 'outcome'
  readonly emphasis?: 'key_conclusion' | 'key_contrast' | 'decision_criterion'
  readonly slots: readonly string[]
  readonly semanticUnitIds: readonly string[]
  readonly sourceOutcomeIds: readonly string[]
  readonly sourceMappingIds: readonly string[]
  readonly lifeMechanismIds: readonly string[]
  readonly activations?: readonly OutcomeActivation[]
  readonly contextKeys: readonly string[]
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
  readonly type: 'ENGINE_GAP' | 'SOURCE_GAP' | 'ASSEMBLY_GAP' | 'RENDERER_GAP'
  readonly slot: string
}

export interface CustomerChapterPlan {
  readonly chapterId: CustomerChapterId
  readonly titleKey: CustomerChapterTitleKey
  readonly semanticReadiness: SemanticReadiness
  readonly paragraphPlans: readonly CustomerReadingParagraphPlan[]
  readonly gaps: readonly CustomerChapterGap[]
  readonly temporalQuality?: TemporalQuality
  readonly timingCards?: readonly TimingCard[]
  readonly behaviorPatterns?: readonly CustomerBehaviorPattern[]
  readonly relationshipSequence?: CustomerRelationshipSequence
  readonly relationshipRecurrence?: readonly string[]
  readonly provenance: ReadingProvenance
}

export const chapterTargets = {
  'CR-01': { characters: [900, 1400], paragraphs: [5, 7] },
  'CR-02': { characters: [800, 1300], paragraphs: [4, 6] },
  'CR-03': { characters: [800, 1300], paragraphs: [4, 6] },
  'CR-04': { characters: [1500, 2400], paragraphs: [7, 10] },
  'CR-08': { characters: [1300, 2200], paragraphs: [6, 9] },
  'CR-09': { characters: [1700, 2800], paragraphs: [8, 12] },
  'CR-07': { characters: [1500, 2500], paragraphs: [7, 10] },
} as const
