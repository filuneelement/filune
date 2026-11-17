import type { SourceScope } from '../producers'
import type { DerivedStemFactBasis } from './exposureFact'
export type RootFact = DerivedStemFactBasis & {
  kind: 'root'; rootBranchEntityId: string; rootScope: SourceScope
  hiddenStemMatched: string | null; rootExistence: 'present' | 'absent' | 'unknown'
}
