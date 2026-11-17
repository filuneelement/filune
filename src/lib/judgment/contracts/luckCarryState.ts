import { applicationReferenceSchema, contractHeader, stageSchema, validitySchema } from './common'
import { array, enumeration, id, nonEmptyIds, object, optional, refine, uniqueIds } from './schema'
import type { Infer } from './schema'

const carryEntry = object({
  carryEntryId: id, changeId: id, natalEntityId: id,
  sourceStage: enumeration(['great', 'year'] as const), sourceScopeId: id, sourceSnapshotRef: id,
  sourceStateRef: id, causedByRuleIds: nonEmptyIds, causedByApplicationRefs: array(applicationReferenceSchema),
  validity: validitySchema, inheritedIntoScopeId: id, inheritedThrough: uniqueIds,
  evidenceIds: nonEmptyIds, uncertaintyIds: uniqueIds,
})
export const carryEntrySchema = refine(carryEntry, (value) => value.causedByApplicationRefs.length > 0
  && value.causedByRuleIds.every((rule) => value.causedByApplicationRefs.some((app) => app.ruleId === rule))
  && value.causedByApplicationRefs.every((app) => value.causedByRuleIds.includes(app.ruleId)
    && app.scopeId === value.sourceScopeId)
  && value.sourceScopeId !== value.inheritedIntoScopeId
  && !value.inheritedThrough.includes(value.inheritedIntoScopeId),
'carry must identify original cause, source scope and a distinct destination')
export type CarryEntry = Infer<typeof carryEntrySchema>
export const processingRecordSchema = refine(object({
  processingId: id, sourceScopeId: id, relationFactRef: id, applicationRef: applicationReferenceSchema,
  targetNatalEntityIds: uniqueIds, affectedLuckEntityIds: uniqueIds,
  effectClass: enumeration(['natal-change', 'luck-pair-weakening', 'processed-no-natal-change'] as const),
  sourcePeriodRef: id, evidenceIds: nonEmptyIds,
}), (value) => value.applicationRef.scopeId === value.sourceScopeId
  && (value.effectClass !== 'natal-change' || value.targetNatalEntityIds.length > 0)
  && (value.effectClass !== 'luck-pair-weakening' || value.targetNatalEntityIds.length === 0
    && value.affectedLuckEntityIds.length >= 2), 'invalid processing cause or target origins')
export const stageSnapshotSchema = object({
  snapshotId: id, scopeId: id, stage: stageSchema,
  natalStructureRefs: uniqueIds, natalInternalStateRefs: uniqueIds, inheritedNatalChangeRefs: uniqueIds,
  currentLuckPairApplicationRefs: uniqueIds, currentLuckNatalApplicationRefs: uniqueIds,
  outgoingCarryEntryRefs: uniqueIds,
})
export const luckCarryStateSchema = refine(object({
  ...contractHeader, carryStateId: id, entries: array(carryEntrySchema),
  processedRelationRecords: array(processingRecordSchema), snapshots: array(stageSnapshotSchema),
  consumedAtStage: array(object({ scopeId: id, changeId: id, consumptionRef: id, sourceApplicationRef: id })),
  /** Historical guards, never direct participants or inherited luck functional states (IR-01). */
  priorProcessingRefs: uniqueIds,
  note: optional(id),
}), (value) => {
  const unique = (items: string[]) => new Set(items).size === items.length
  return unique(value.entries.map((entry) => entry.carryEntryId))
    && unique(value.entries.map((entry) => `${entry.inheritedIntoScopeId}\0${entry.changeId}`))
    && unique(value.processedRelationRecords.map((record) => record.processingId))
    && unique(value.snapshots.map((snapshot) => snapshot.snapshotId))
    && unique(value.consumedAtStage.map((record) => record.consumptionRef))
    && unique(value.consumedAtStage.map((record) => `${record.scopeId}\0${record.changeId}`))
}, 'duplicate carry, snapshot, processing record or scope/change consumption')
export type LuckCarryStateContract = Infer<typeof luckCarryStateSchema>
