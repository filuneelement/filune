import { documentReferenceSchema, factStatusSchema, producerReferenceSchema, runtimeStateSchema, stemSchema } from '../../contracts'
import { array, enumeration, id, literal, nonEmptyIds, object, refine, union, uniqueIds } from '../../contracts/schema'
import type { Infer } from '../../contracts/schema'
import { tenGodSchema } from '../patternCandidates/types'
import type { JudgmentProducerOutput } from '../../producers/types'
import type { YongShenJudgmentInput } from '../yongShenJudgment/types'
import type { evaluateYongShenJudgment } from '../yongShenJudgment'
export const SANG_SHEN_RULE_IDS = ['I-01', 'I-03', 'I-04-1', 'I-05', 'I-07', 'I-02a'] as const
const rule = enumeration(SANG_SHEN_RULE_IDS)
const rules = refine(array(rule), (ids) => ids.length > 0 && new Set(ids).size === ids.length, 'document rules required')
export const sangShenCandidateDataSchema = object({
  candidateId: id, entityId: id, stem: stemSchema, tenGod: union(tenGodSchema, literal(null)), relatedYongShenIds: uniqueIds,
  status: enumeration(['candidate', 'rejected', 'deferred'] as const),
  supportingFactIds: uniqueIds, conflictingFactIds: uniqueIds, sourceRuleIds: rules, evidenceIds: uniqueIds,
  assessment: factStatusSchema, uncertainty: object({ blockingIds: uniqueIds, contextIds: uniqueIds }),
  functionBasis: object({ mechanism: literal('칠살 역용의 설·일간 생조 검토'), relatedYongEntityIds: uniqueIds,
    relationFactIds: uniqueIds, coverageRefs: uniqueIds, rootFactIds: uniqueIds, existingYongRoleIds: uniqueIds }),
  runtimeStates: array(runtimeStateSchema), sourcePatternJudgmentId: id,
  trace: array(object({ ruleId: rule, outcome: enumeration(['satisfied', 'rejected', 'deferred', 'context-only'] as const),
    reasonCodes: nonEmptyIds, factIds: uniqueIds, evidenceIds: uniqueIds })),
  contextFactIds: uniqueIds, contextEvidenceIds: uniqueIds, sourceScope: literal('natal'), scopeId: id,
  provenance: object({ producerRef: producerReferenceSchema, ruleVersion: literal('A179'), sourceDocument: documentReferenceSchema, method: id }),
})
export const sangShenCandidateSchema = refine(sangShenCandidateDataSchema, (value) => value.status !== 'candidate' || value.assessment === 'confirmed' && value.tenGod !== null
  && value.uncertainty.blockingIds.length === 0 && value.relatedYongShenIds.length > 0 && value.evidenceIds.length > 0
  && value.functionBasis.relationFactIds.length >= 2 && value.functionBasis.rootFactIds.length > 0,
'candidate needs confirmed two-edge functional premises and roots, never a final role')
export type SangShenCandidate = Infer<typeof sangShenCandidateSchema>
export type SangShenCandidateInput = Pick<YongShenJudgmentInput, 'producer' | 'context' | 'derived' | 'natalCombination' | 'patternJudgment'> & {
  producer: YongShenJudgmentInput['producer'] & Pick<JudgmentProducerOutput, 'relations' | 'coverage' | 'observationScopes'>
  yongShenResult: ReturnType<typeof evaluateYongShenJudgment>
}
