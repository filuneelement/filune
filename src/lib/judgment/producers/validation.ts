import { branchSchema, entityReferenceSchema, evidenceContextSchema, hiddenStemEntrySchema, hiddenStemSystemSchema,
  relationCoverageSchema, relationFactSchema, stemSchema } from '../contracts'
import type { JudgmentProducerOutput } from './types'
import { FILUNE_A179 } from '../systems/hiddenStemFiluneA179'
import { recordId } from './shared'

/** Observation-graph checks only. These scopes are not execution scopes for validateContractBundle. */
export function validateProducerOutput(output: JudgmentProducerOutput): void {
  const require = (condition: unknown, message: string): void => { if (!condition) throw new TypeError(message) }
  const unique = (items: string[], label: string): void => require(new Set(items).size === items.length, `Duplicate ${label}.`)
  unique(output.facts.map((fact) => fact.id), 'fact ID')
  unique(output.entities.map((entity) => entity.entityId), 'entity ID')
  unique(output.hiddenStems.map((fact) => fact.id), 'hidden-stem fact ID')
  unique(output.relations.map((fact) => fact.relationFactId), 'relation fact ID')
  unique(output.coverage.map((survey) => survey.coverageId), 'coverage ID')
  unique(output.observationScopes.map((scope) => scope.scopeId), 'scope ID')
  require(output.roleStates.length === 0, 'Fact producer cannot supply RoleState.')
  hiddenStemSystemSchema.parse(output.hiddenStemSystem)
  output.hiddenStemEntries.forEach((entry) => hiddenStemEntrySchema.parse(entry))
  evidenceContextSchema.parse(output.evidence)
  const facts = new Set(output.facts.map((fact) => fact.id))
  const entities = new Map(output.entities.map((entity) => [entity.entityId, entity]))
  const scopes = new Map(output.observationScopes.map((scope) => [scope.scopeId, scope]))
  const surveys = new Map(output.coverage.map((survey) => [survey.coverageId, survey]))
  const evidence = new Map(output.evidence.records.map((record) => [record.evidenceId, record]))
  const producerKey = JSON.stringify(output.producerRef)
  const checkProducer = (ref: typeof output.producerRef): void => require(JSON.stringify(ref) === producerKey, 'Producer provenance mismatch.')
  const useEvidence = (ids: string[]): void => {
    require(ids.length > 0 && ids.every((id) => evidence.has(id)), 'Evidence reference missing.')
    for (const id of ids) {
      const record = evidence.get(id)!
      require(record.sourceType === 'customer-input' || record.sourceType === 'deterministic-calculation'
        || (record.sourceType === 'source-document' && record.evidenceId === FILUNE_A179.evidenceId
          && record.sourceRef.kind === 'source-document' && record.sourceRef.document.documentId === 'A'
          && record.documentRevision === 179 && output.hiddenStemSystem.systemId === FILUNE_A179.id), 'Unsupported generated evidence sourceType.')
      if (record.sourceRef.kind === 'deterministic-calculation') checkProducer(record.sourceRef.producer)
    }
  }
  for (const entity of output.entities) {
    const { entityId, origin, part, canonicalFactRef, position, periodRef } = entity
    entityReferenceSchema.parse({ entityId, origin, part, canonicalFactRef, position, periodRef })
    const valueSchema = part === 'stem' ? stemSchema : branchSchema
    valueSchema.parse(entity.value)
    require(facts.has(entity.canonicalFactRef), 'Entity canonical fact missing.'); useEvidence(entity.evidenceIds)
    require(entity.assessment === 'confirmed' || entity.assessment === 'provisional', 'Unavailable entity must not be synthesized.')
  }
  for (const scope of output.observationScopes) {
    require(scope.purpose === 'unselected-candidates', 'Producer cannot select an execution scope.')
    unique(scope.entityIds, 'scope participant')
    require(scope.entityIds.every((id) => entities.has(id)), 'Scope entity missing.')
  }
  for (const survey of output.coverage) {
    relationCoverageSchema.parse(survey); checkProducer(survey.producerRef); useEvidence(survey.evidenceIds)
    require(survey.universeEntityIds.every((id) => scopes.get(survey.scopeId)?.entityIds.includes(id)), 'Coverage entity outside observation scope.')
  }
  for (const relation of output.relations) {
    relationFactSchema.parse(relation); checkProducer(relation.producerRef); useEvidence(relation.evidenceIds)
    const survey = surveys.get(relation.coverageRef)
    require(survey?.scopeId === relation.scopeId && survey.kind === relation.kind, 'Relation coverage mismatch.')
    require(relation.participantEntityIds.every((id) => survey?.universeEntityIds.includes(id)), 'Relation entity outside coverage.')
    const set = JSON.stringify([...relation.participantEntityIds].sort())
    require(survey?.investigatedParticipantSets.some((ids) => JSON.stringify([...ids].sort()) === set), 'Relation was not investigated.')
    require(relation.inputFactIds.every((id) => facts.has(id)), 'Relation source fact missing.')
  }
  for (const fact of output.facts) { checkProducer(fact.provenance.producerRef); useEvidence(fact.evidenceIds) }
  for (const fact of output.hiddenStems) {
    require(entities.get(fact.branchEntityId)?.part === 'branch', 'Hidden stem branch entity missing.')
    require(fact.sourceSystemId === output.hiddenStemSystem.systemId && fact.inputFactIds.every((id) => facts.has(id)), 'Hidden stem source missing.')
    checkProducer(fact.provenance.producerRef); useEvidence(fact.evidenceIds)
    require(fact.id === recordId('hidden-stem', [fact.branchEntityId, fact.role]), 'Unstable hidden-stem identity.')
  }
  useEvidence(output.hiddenStemSystem.sourceRefs)
}
