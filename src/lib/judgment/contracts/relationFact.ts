import { contractHeader, factStatusSchema, producerReferenceSchema } from './common'
import { array, enumeration, id, nonEmptyIds, object, optional, refine, uniqueIds } from './schema'
import type { Infer } from './schema'

export const RELATION_KINDS = ['stem-combination', 'stem-generates', 'stem-controls',
  'branch-six-combination', 'branch-half-combination', 'branch-three-combination',
  'branch-season-combination', 'branch-clash', 'branch-punishment', 'branch-harm',
  'branch-break', 'branch-wonjin'] as const
export const relationKindSchema = enumeration(RELATION_KINDS)
export const relationCoverageSchema = refine(object({
  ...contractHeader, coverageId: id, scopeId: id, kind: relationKindSchema,
  universeEntityIds: nonEmptyIds, investigatedParticipantSets: array(nonEmptyIds),
  completion: enumeration(['complete', 'partial', 'unknown'] as const),
  producerRef: producerReferenceSchema, evidenceIds: nonEmptyIds, uncertaintyIds: uniqueIds,
  producerHandoffRefs: optional(uniqueIds),
}), (value) => {
  const sets = value.investigatedParticipantSets
  return sets.every((set) => set.length >= 2 && set.every((item) => value.universeEntityIds.includes(item)))
    && new Set(sets.map((set) => [...set].sort().join('\0'))).size === sets.length
    && (value.completion !== 'unknown' || sets.length === 0)
}, 'invalid/duplicate investigated set or unknown coverage asserts investigations')
export type RelationCoverage = Infer<typeof relationCoverageSchema>
/** Presence, absence or unknown only. No action, role, strength or auspiciousness fields. */
export const relationFactSchema = refine(object({
  ...contractHeader, relationFactId: id, kind: relationKindSchema, participantEntityIds: nonEmptyIds,
  sourceEntityId: optional(id), targetEntityId: optional(id), scopeId: id,
  existence: enumeration(['present', 'absent', 'unknown'] as const), coverageRef: id,
  producerRef: producerReferenceSchema, inputFactIds: nonEmptyIds,
  producerHandoffRefs: optional(uniqueIds),
  assessment: factStatusSchema, evidenceIds: nonEmptyIds, uncertaintyIds: uniqueIds,
  natalPositionRefs: optional(uniqueIds),
}), (value) => {
  const directed = value.kind === 'stem-generates' || value.kind === 'stem-controls'
  const n = value.participantEntityIds.length
  return (value.kind === 'branch-punishment' ? n === 2 || n === 3
    : ['branch-three-combination', 'branch-season-combination'].includes(value.kind) ? n === 3 : n === 2)
    && (directed ? value.sourceEntityId !== undefined && value.targetEntityId !== undefined
      && value.sourceEntityId !== value.targetEntityId
      && value.participantEntityIds.includes(value.sourceEntityId) && value.participantEntityIds.includes(value.targetEntityId)
      : value.sourceEntityId === undefined && value.targetEntityId === undefined)
    && (value.existence === 'unknown' ? value.assessment === 'unknown' || value.assessment === 'unsupported'
      : value.assessment === 'confirmed' || value.assessment === 'provisional')
}, 'invalid participant count, direction or existence assessment')
export type RelationFactContract = Infer<typeof relationFactSchema>
