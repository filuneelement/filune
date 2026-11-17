import { documentReferenceSchema, factStatusSchema, producerReferenceSchema, runtimeStateSchema } from '../../contracts'
import { array, boolean, enumeration, id, literal, nonEmptyIds, object, refine, union, uniqueIds } from '../../contracts/schema'
import type { Infer } from '../../contracts/schema'
import type { JudgmentProducerOutput } from '../../producers/types'
import type { produceExposureRootFacts } from '../../producers/exposureRootProducer'
import type { evaluateNatalStemCombination } from '../natalStemCombination'
import type { ExecutionScopeContext } from '../../runtime'

export const PATTERN_RULE_IDS = ['I-01', 'I-02', 'I-02a', 'C-10'] as const
export const tenGodSchema = enumeration(['比肩', '劫財', '食神', '傷官', '偏財', '正財', '偏官', '正官', '偏印', '印綬'] as const)
const sourceRuleIds = refine(array(enumeration(PATTERN_RULE_IDS)),
  (ids) => ids.length > 0 && new Set(ids).size === ids.length, 'documented unique rules required')
/** Candidate classification only. No confirmed variant, rank, strength, role or final verdict. */
export const patternCandidateSchema = object({
  candidateId: id, patternType: enumeration(['월령본기격', '정격', '변격', '겸격', '비겁월특수', '미정'] as const),
  status: enumeration(['candidate', 'deferred', 'rejected'] as const),
  basis: object({
    monthBranchEntityId: union(id, literal(null)), mainHiddenObservationId: union(id, literal(null)),
    components: array(object({ tenGod: tenGodSchema, hiddenObservationIds: uniqueIds,
      stemEntityIds: uniqueIds, exposureFactIds: uniqueIds, tenGodFactIds: nonEmptyIds })),
    rootFactIds: uniqueIds, runtimeStates: array(runtimeStateSchema), combinationRelationFactIds: uniqueIds,
    classificationRetainedAfterStop: boolean, reasons: nonEmptyIds,
  }),
  supportingFactIds: uniqueIds, conflictingFactIds: uniqueIds, sourceRuleIds, evidenceIds: nonEmptyIds,
  inputAssessments: array(object({ inputId: id, assessment: union(factStatusSchema, literal(null)),
    evidenceIds: uniqueIds, uncertaintyIds: uniqueIds })),
  evidenceAssessments: array(object({ evidenceId: id, assessment: factStatusSchema, sourceType: id, uncertaintyIds: uniqueIds })),
  uncertaintyIds: uniqueIds, sourceScope: literal('natal'), scopeId: id, hiddenStemSystemId: literal('filune-a179'),
  provenance: object({ producerRef: producerReferenceSchema, ruleVersion: literal('A179'),
    sourceDocument: documentReferenceSchema, sourceDerivedScopeId: id, method: id }),
})
export type PatternCandidate = Infer<typeof patternCandidateSchema>
export type PatternCandidateInput = {
  producer: Pick<JudgmentProducerOutput, 'facts' | 'entities' | 'producerRef'>
  derived: ReturnType<typeof produceExposureRootFacts>
  natalCombination: ReturnType<typeof evaluateNatalStemCombination>
  context: ExecutionScopeContext
}
