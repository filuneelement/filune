import { documentReferenceSchema, evidenceContextSchema, factStatusSchema, producerReferenceSchema, runtimeStateSchema, stemSchema } from '../../contracts'
import { array, enumeration, id, literal, nonEmptyIds, object, refine, union, uniqueIds } from '../../contracts/schema'
import type { Infer } from '../../contracts/schema'
import { tenGodSchema } from '../patternCandidates/types'
import { YONG_SHEN_CANDIDATE_RULE_IDS } from '../yongShenCandidates/types'
import type { YongShenCandidate, YongShenCandidateInput } from '../yongShenCandidates/types'
const rule = enumeration(YONG_SHEN_CANDIDATE_RULE_IDS)
const rules = refine(array(rule), (ids) => ids.length > 0 && new Set(ids).size === ids.length, 'document rules required')
export const yongShenJudgmentSchema = refine(object({
  judgmentId: id, entityId: id, stem: stemSchema, tenGod: union(tenGodSchema, literal(null)),
  status: enumeration(['confirmed', 'rejected', 'deferred'] as const), sourceCandidateIds: nonEmptyIds,
  supportingFactIds: uniqueIds, conflictingFactIds: uniqueIds, sourceRuleIds: rules, evidenceIds: uniqueIds,
  reasonCodes: nonEmptyIds, assessment: factStatusSchema,
  uncertainty: object({ blockingIds: uniqueIds, contextIds: uniqueIds }),
  trace: array(object({ ruleId: rule, outcome: enumeration(['satisfied', 'rejected', 'deferred', 'context-only'] as const),
    reasonCodes: nonEmptyIds, candidateIds: uniqueIds, factIds: uniqueIds, evidenceIds: uniqueIds })),
  sourcePatternJudgmentId: id, functionBasis: object({ axis: literal('천간'), monthBranchEntityId: union(id, literal(null)),
    sourcePatternCandidateIds: uniqueIds, hiddenObservationIds: uniqueIds, exposureFactIds: uniqueIds,
    handlingRequirement: union(enumeration(['순용 구조 검토', '역용 구조 검토'] as const), literal(null)) }),
  runtimeState: union(runtimeStateSchema, literal(null)), roleStateRef: union(id, literal(null)),
  contextFactIds: uniqueIds, contextEvidenceIds: uniqueIds, scopeId: id, sourceScope: literal('natal'),
  provenance: object({ producerRef: producerReferenceSchema, ruleVersion: literal('A179'),
    sourceDocument: documentReferenceSchema, method: id }),
}), (value) => value.status !== 'confirmed' || value.assessment === 'confirmed' && value.tenGod !== null
  && value.supportingFactIds.length > 0 && value.evidenceIds.length > 0 && value.uncertainty.blockingIds.length === 0
  && value.functionBasis.exposureFactIds.length > 0 && value.functionBasis.sourcePatternCandidateIds.length > 0
  && value.roleStateRef !== null && ['active', 'weakened'].includes(value.runtimeState?.functionalState ?? ''),
'confirmed role requires confirmed structural premises, evidence, usable supplied function and a role reference')
export type YongShenJudgment = Infer<typeof yongShenJudgmentSchema>
export type YongShenJudgmentInput = YongShenCandidateInput & {
  yongShenCandidates: YongShenCandidate[]; candidateEvidence: Infer<typeof evidenceContextSchema>
}
