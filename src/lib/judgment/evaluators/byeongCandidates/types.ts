import type { BranchMainRelationInput } from '../../producers/branchMainRelationProducer'
import type { ValueStatus } from '../../../canonical/types'
import type { EvidenceContextContract, RoleStateContract, RuntimeStateContract } from '../../contracts'
import type { FactEntity, JudgmentProducerOutput, ProducerReference } from '../../producers/types'
import type { ExecutionScopeContext } from '../../runtime/executionScopeContext'
import type { PatternJudgment } from '../patternJudgment/types'
import type { SangShenJudgment } from '../sangShenJudgment/types'
import type { YongShenJudgment } from '../yongShenJudgment/types'

export const BYEONG_RULE_SECTIONS = { 'I-03': 'A-2-2.', 'I-04-2': 'A-8-2.', 'I-04a': 'A-8-2.', 'I-04c': 'A-8-2.' } as const
export type ByeongRuleId = keyof typeof BYEONG_RULE_SECTIONS

/** A scoped functional observation, supplied by the caller. A raw relation is not a damage observation. */
export type FoodDamagePath = {
  pathId: string
  relation: 'controls'
  existence: 'present' | 'absent' | 'unknown'
  effect: 'damage' | 'excluded' | 'unknown'
  sourceStateId?: string
  targetStateId?: string
  relationFactId?: string
  controlRelationFactId?: string
  evidenceIds: string[]
}

/** Required for directed branch observations as the existing RelationFact catalog has no branch-controls kind. */
export type FoodDamageReview = {
  reviewId: string
  ruleId: 'I-04-2'
  sourceEntityId: string
  targetEntityId: string
  scopeId: string
  producerRef: ProducerReference
  resource: '印綬' | '偏印' | 'excluded' | 'unknown'
  assessment: ValueStatus
  uncertaintyIds: string[]
  factIds: string[]
  evidenceIds: string[]
  completion: 'complete' | 'partial' | 'unknown'
  paths: FoodDamagePath[]
}

export type ByeongCandidateInput = {
  producer: JudgmentProducerOutput
  context: ExecutionScopeContext
  natalScopeId: string
  patternJudgment: PatternJudgment
  yongShenJudgments: YongShenJudgment[]
  sangShenJudgments: SangShenJudgment[]
  /** Supports an upstream evaluated branch role before a branch-specific judgment schema exists. */
  upstreamRoles: RoleStateContract[]
  runtimeStates: RuntimeStateContract[]
  evidence: EvidenceContextContract
  reviews: FoodDamageReview[]
  /** Select the draft independent path; synthetic functional reviews are rejected in this mode. */
  draftRuleSource?: string
  branchMainBasis?: BranchMainRelationInput['derived']
}

export type ByeongCandidate = {
  candidateId: string
  entity: FactEntity
  scopeId: string
  patternJudgmentId: string
  protectedEntityId: string | null
  status: 'candidate' | 'rejected' | 'deferred'
  runtimeState: RuntimeStateContract | null
  reviewIds: string[]
  paths: FoodDamagePath[]
  factIds: string[]
  evidenceIds: string[]
  relationCoverageRefs: string[]
  coverage: FoodDamageReview['completion']
  ruleIds: ByeongRuleId[]
  reasonCodes: string[]
  provenance: { producerRef: ProducerReference; ruleVersion: 'A179' | 'A180-draft' }
}

export type ByeongCandidateResult = {
  scopeId: string
  candidates: ByeongCandidate[]
  reasonCodes: string[]
}
