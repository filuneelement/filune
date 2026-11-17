import { documentReferenceSchema, factStatusSchema, producerReferenceSchema } from '../../contracts'
import { array, enumeration, id, literal, nonEmptyIds, object, refine, union, uniqueIds } from '../../contracts/schema'
import type { Infer } from '../../contracts/schema'
import { PATTERN_RULE_IDS, tenGodSchema } from '../patternCandidates/types'
import type { PatternCandidate, PatternCandidateInput } from '../patternCandidates/types'

const rules = refine(array(enumeration(PATTERN_RULE_IDS)), (ids) => ids.length > 0 && new Set(ids).size === ids.length, 'document rule references required')
const decision = enumeration(['confirmed', 'rejected', 'deferred'] as const)
export const patternJudgmentSchema = refine(object({
  judgmentId: id, patternType: enumeration(['정격', '변격', '겸격', '미정'] as const), status: decision,
  monthPatternTenGod: union(tenGodSchema, literal(null)), componentTenGods: array(tenGodSchema),
  sourceCandidateIds: uniqueIds, supportingFactIds: uniqueIds, conflictingFactIds: uniqueIds,
  sourceRuleIds: rules, evidenceIds: uniqueIds, reasonCodes: nonEmptyIds, assessment: factStatusSchema,
  uncertainty: object({ blockingIds: uniqueIds, contextIds: uniqueIds }),
  contextFactIds: uniqueIds, contextEvidenceIds: uniqueIds,
  trace: array(object({ candidateId: id, patternType: id, status: decision, reasonCodes: nonEmptyIds,
    sourceRuleIds: rules, supportingFactIds: uniqueIds, conflictingFactIds: uniqueIds, evidenceIds: uniqueIds,
    contextFactIds: uniqueIds })),
  scopeId: id, sourceScope: literal('natal'), provenance: object({ producerRef: producerReferenceSchema,
    ruleVersion: literal('A179'), sourceDocument: documentReferenceSchema, method: id }),
}), (value) => value.status !== 'confirmed' || value.assessment === 'confirmed'
  && value.patternType !== '미정' && value.monthPatternTenGod !== null && value.componentTenGods.length > 0
  && value.sourceCandidateIds.length > 0 && value.supportingFactIds.length > 0
  && value.evidenceIds.length > 0 && value.uncertainty.blockingIds.length === 0,
'confirmed judgment requires assessed facts, evidence, candidates and no blocking uncertainty')
export type PatternJudgment = Infer<typeof patternJudgmentSchema>
/** Consumes an existing candidate list; never invokes its producer/evaluator. */
export type PatternJudgmentInput = PatternCandidateInput & { candidates: PatternCandidate[] }
