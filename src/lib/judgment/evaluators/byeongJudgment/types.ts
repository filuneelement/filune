import type { ApplicationReference, RoleStateContract, RuntimeStateContract } from '../../contracts'
import type { ByeongCandidate, ByeongCandidateInput, ByeongCandidateResult, ByeongRuleId } from '../byeongCandidates/types'

export type ByeongJudgmentInput = ByeongCandidateInput & {
  candidateResult: ByeongCandidateResult
  natalByeongRoles?: RoleStateContract[]
}

export type ByeongJudgment = {
  judgmentId: string
  candidateId: string
  entityId: string
  protectedEntityId: string | null
  status: 'confirmed' | 'rejected' | 'deferred'
  runtimeState: RuntimeStateContract | null
  natalRoleHistory: RoleStateContract[]
  currentRoleRef: string | null
  ruleIds: ByeongRuleId[]
  factIds: string[]
  relationCoverageRefs: string[]
  evidenceIds: string[]
  reasonCodes: string[]
  trace: {
    pathId: string
    outcome: 'damage' | 'excluded' | 'deferred' | 'stopped'
    relationFactId?: string
    evidenceIds: string[]
  }[]
  provenance: ByeongCandidate['provenance']
}

export type ByeongJudgmentResult = {
  scopeId: string
  status: 'has-byeong' | 'no-byeong' | 'deferred'
  judgments: ByeongJudgment[]
  roleStates: RoleStateContract[]
  applications: ApplicationReference[]
  removalEvidence: {
    entityId: string
    ruleId: 'I-04a' | 'I-04c'
    priorRoleIds: string[]
    stateId: string
    evidenceIds: string[]
  }[]
  otherDamageAssessment: 'unassessed'
  reasonCodes: string[]
}
