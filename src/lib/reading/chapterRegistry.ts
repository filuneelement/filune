import type { ChapterId, ChapterReadiness, ReadingScope, RepetitionRole } from './types'

interface ChapterDefinition {
  readonly id: ChapterId
  readonly access: 'free' | 'premium'
  readonly sourceSection: string
  readonly readiness: ChapterReadiness
  readonly scopes: readonly ReadingScope[]
}

export const chapterRegistry = [
  { id: 'F-01', access: 'free', sourceSection: 'F-①', readiness: 'partial', scopes: ['natal'] },
  { id: 'F-02', access: 'free', sourceSection: 'F-②', readiness: 'source_gap', scopes: ['natal'] },
  { id: 'F-03', access: 'free', sourceSection: 'F-③', readiness: 'partial', scopes: ['natal'] },
  { id: 'F-04', access: 'free', sourceSection: 'F-④', readiness: 'source_gap', scopes: ['natal'] },
  { id: 'F-LINK', access: 'free', sourceSection: 'F-링크', readiness: 'ready', scopes: [] },
  { id: 'CH-01', access: 'premium', sourceSection: 'CH-1', readiness: 'partial', scopes: ['natal', 'daewoon'] },
  { id: 'CH-02', access: 'premium', sourceSection: 'CH-2', readiness: 'partial', scopes: ['natal'] },
  { id: 'CH-03', access: 'premium', sourceSection: 'CH-3', readiness: 'partial', scopes: ['natal'] },
  { id: 'CH-04', access: 'premium', sourceSection: 'CH-4', readiness: 'outcome_not_implemented', scopes: ['natal', 'daewoon', 'month'] },
  { id: 'CH-05', access: 'premium', sourceSection: 'CH-5', readiness: 'outcome_not_implemented', scopes: ['natal', 'month'] },
  { id: 'CH-06', access: 'premium', sourceSection: 'CH-6', readiness: 'outcome_not_implemented', scopes: ['natal', 'daewoon', 'sewoon', 'month'] },
  { id: 'CH-07', access: 'premium', sourceSection: 'CH-7', readiness: 'outcome_not_implemented', scopes: ['natal', 'daewoon', 'sewoon', 'month'] },
  { id: 'CH-08', access: 'premium', sourceSection: 'CH-8', readiness: 'partial', scopes: ['daewoon'] },
  { id: 'CH-09', access: 'premium', sourceSection: 'CH-9', readiness: 'partial', scopes: ['sewoon', 'month'] },
  { id: 'CH-10', access: 'premium', sourceSection: 'CH-10', readiness: 'partial', scopes: ['month'] },
  { id: 'CH-11', access: 'premium', sourceSection: 'CH-11', readiness: 'source_gap', scopes: ['natal', 'daewoon', 'month'] },
  { id: 'CH-Q', access: 'premium', sourceSection: 'CH-Q', readiness: 'engine_gap', scopes: ['natal', 'daewoon', 'sewoon', 'month'] },
] as const satisfies readonly ChapterDefinition[]

export interface UnitRoute {
  readonly chapterId: ChapterId
  readonly role: RepetitionRole
  readonly candidate?: boolean
  readonly contextIds?: readonly string[]
}

// B-6 shared units have one conclusion owner. Later placements require actual context.
export const conclusionRoutes = {
  birth: { chapterId: 'F-01', role: 'conclusion' },
  structure: { chapterId: 'F-02', role: 'conclusion', candidate: true },
  personality: { chapterId: 'F-03', role: 'conclusion' },
  traits: { chapterId: 'F-04', role: 'conclusion', candidate: true },
  daewoon: { chapterId: 'CH-01', role: 'conclusion' },
  sewoon: { chapterId: 'CH-09', role: 'conclusion' },
  month: { chapterId: 'CH-10', role: 'conclusion' },
} as const satisfies Record<string, UnitRoute>

export const contextRoutes = {
  structure: { chapterId: 'CH-01', role: 'evidence' },
  personality: { chapterId: 'CH-02', role: 'context' },
  traits: { chapterId: 'CH-03', role: 'context', candidate: true },
  daewoon: { chapterId: 'CH-08', role: 'context' },
} as const satisfies Record<string, UnitRoute>
