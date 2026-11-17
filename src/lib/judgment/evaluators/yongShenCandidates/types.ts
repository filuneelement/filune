import { documentReferenceSchema, evidenceContextSchema, factStatusSchema, producerReferenceSchema, runtimeStateSchema, stemSchema } from '../../contracts'
import { array, enumeration, id, literal, nonEmptyIds, object, refine, union, uniqueIds } from '../../contracts/schema'
import type { Infer } from '../../contracts/schema'
import type { PatternJudgment, PatternJudgmentInput } from '../patternJudgment/types'
import { tenGodSchema } from '../patternCandidates/types'

export const YONG_SHEN_CANDIDATE_RULE_IDS = ['I-01', 'I-02', 'I-02a', 'C-10', 'I-03', 'I-04-1'] as const
const rule = enumeration(YONG_SHEN_CANDIDATE_RULE_IDS)
const rules = refine(array(rule), (ids) => ids.length > 0 && new Set(ids).size === ids.length, 'unique document rules required')
export const yongShenCandidateDataSchema = object({
  candidateId: id, entityId: id, stem: stemSchema,
  roleBasis: object({ axis: literal('천간'), definition: literal('월령 투출 격국 구성'),
    sourceJudgmentId: id, sourcePatternCandidateIds: uniqueIds, tenGod: union(tenGodSchema, literal(null)),
    hiddenObservationIds: uniqueIds, exposureFactIds: uniqueIds, rootFactIds: uniqueIds,
    runtimeState: union(runtimeStateSchema, literal(null)),
    handlingRequirement: union(enumeration(['순용 구조 검토', '역용 구조 검토'] as const), literal(null)),
  }),
  status: enumeration(['candidate', 'rejected', 'deferred'] as const),
  supportingFactIds: uniqueIds, conflictingFactIds: uniqueIds, sourceRuleIds: rules, evidenceIds: uniqueIds,
  assessment: factStatusSchema, uncertainty: object({ blockingIds: uniqueIds, contextIds: uniqueIds }),
  trace: array(object({ ruleId: rule, outcome: enumeration(['satisfied', 'rejected', 'deferred', 'context-only'] as const),
    reasonCodes: nonEmptyIds, factIds: uniqueIds, evidenceIds: uniqueIds })),
  contextFactIds: uniqueIds, contextEvidenceIds: uniqueIds, scopeId: id, sourceScope: literal('natal'),
  provenance: object({ producerRef: producerReferenceSchema, ruleVersion: literal('A179'),
    sourceDocument: documentReferenceSchema, method: id }),
})
export const yongShenCandidateSchema = refine(yongShenCandidateDataSchema, (value) => value.status !== 'candidate' || value.assessment === 'confirmed'
  && value.uncertainty.blockingIds.length === 0 && value.evidenceIds.length > 0 && value.supportingFactIds.length > 0
  && value.roleBasis.tenGod !== null && value.roleBasis.sourcePatternCandidateIds.length > 0
  && value.roleBasis.exposureFactIds.length > 0 && value.roleBasis.handlingRequirement !== null
  && ['active', 'weakened'].includes(value.roleBasis.runtimeState?.functionalState ?? ''),
'candidate requires confirmed structural premises and available function; this is never final role confirmation')
export type YongShenCandidate = Infer<typeof yongShenCandidateSchema>
export type YongShenCandidateInput = PatternJudgmentInput & {
  patternJudgment: PatternJudgment; judgmentEvidence: Infer<typeof evidenceContextSchema>
}
