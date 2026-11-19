import type { CurrentPersonalityResult } from '../current/types'
import type { NatalPersonalityResult } from '../types'

export interface RenderPersonalityKoInput {
  natal: NatalPersonalityResult
  current?: CurrentPersonalityResult
  name?: string
}

export type PersonalityKoSection = 'overview' | 'outward' | 'closeRelations' | 'decision'
  | 'emotion' | 'strengths' | 'cautions' | 'currentExpression'

export interface RenderProvenance {
  sourceFactIds: string[]
  sourceModifierIds: string[]
  sourceConflictIds: string[]
}

export interface RenderedPersonalityBlock extends RenderProvenance {
  heading: string
  text: string
  certainty: 'confirmed' | 'conditional' | 'mixed'
  paragraphs: Array<RenderProvenance & { text: string; certainty: 'confirmed' | 'conditional' | 'mixed' }>
}

export type RenderedPersonalityKo = Partial<Record<PersonalityKoSection, RenderedPersonalityBlock>>
  & { provenance: RenderProvenance[] }
