import { documentReferenceSchema, evidenceContextSchema, factStatusSchema, producerReferenceSchema, runtimeStateSchema, stemSchema } from '../../contracts'
import { array, enumeration, id, literal, nonEmptyIds, object, refine, union, uniqueIds } from '../../contracts/schema'
import type { Infer } from '../../contracts/schema'
import { tenGodSchema } from '../patternCandidates/types'
import { SANG_SHEN_RULE_IDS } from '../sangShenCandidates/types'
import type { SangShenCandidate, SangShenCandidateInput } from '../sangShenCandidates/types'
const rule = enumeration(SANG_SHEN_RULE_IDS)
const rules = refine(array(rule), (ids) => ids.length > 0 && new Set(ids).size === ids.length, 'document rules required')
export const sangShenJudgmentSchema = refine(object({
  judgmentId: id, entityId: id, stem: stemSchema, tenGod: union(tenGodSchema, literal(null)),
  status: enumeration(['confirmed', 'rejected', 'deferred'] as const), relatedYongShenIds: uniqueIds, sourceCandidateIds: nonEmptyIds,
  supportingFactIds: uniqueIds, conflictingFactIds: uniqueIds, sourceRuleIds: rules, evidenceIds: uniqueIds,
  reasonCodes: nonEmptyIds, assessment: factStatusSchema, uncertainty: object({ blockingIds: uniqueIds, contextIds: uniqueIds }),
  trace: array(object({ ruleId: rule, outcome: enumeration(['satisfied', 'rejected', 'deferred', 'context-only'] as const),
    reasonCodes: nonEmptyIds, candidateIds: uniqueIds, factIds: uniqueIds, evidenceIds: uniqueIds })),
  sourcePatternJudgmentId: id, runtimeStates: array(runtimeStateSchema), roleStateRef: union(id, literal(null)),
  functionBasis: object({ relationFactIds: uniqueIds, rootFactIds: uniqueIds, coverageRefs: uniqueIds }),
  contextFactIds: uniqueIds, contextEvidenceIds: uniqueIds, sourceScope: literal('natal'), scopeId: id,
  provenance: object({ producerRef: producerReferenceSchema, ruleVersion: literal('A179'), sourceDocument: documentReferenceSchema, method: id }),
}), (v) => v.status !== 'confirmed' || v.assessment === 'confirmed' && v.tenGod !== null && v.roleStateRef !== null
  && v.relatedYongShenIds.length > 0 && v.supportingFactIds.length > 0 && v.evidenceIds.length > 0 && !v.uncertainty.blockingIds.length
  && v.functionBasis.relationFactIds.length >= 2 && v.functionBasis.rootFactIds.length > 0
  && v.runtimeStates.some((s) => s.targetEntityId === v.entityId) && v.runtimeStates.every((s) => ['active', 'weakened'].includes(s.functionalState)),
'confirmed helper requires confirmed linked functional premises and usable current function')
export type SangShenJudgment = Infer<typeof sangShenJudgmentSchema>
export type SangShenJudgmentInput = SangShenCandidateInput & {
  sangShenCandidates: SangShenCandidate[]; sangShenEvidence: Infer<typeof evidenceContextSchema>
}
