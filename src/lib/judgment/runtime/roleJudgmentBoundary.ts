import type { ApplicationReference, RoleStateContract } from '../contracts'
import type { ExecutionScopeContext } from './executionScopeContext'

/** Interfaces for a future evaluator only. No role assignment algorithm or case values. */
export type RoleJudgmentInput = {
  context: ExecutionScopeContext; factIds: string[]; relationFactIds: string[]; evidenceIds: string[]
  upstreamApplicationRefs: ApplicationReference[]; requestedRoles: RoleStateContract['role'][]
}
export type RoleJudgmentOutput = {
  status: 'not-evaluated' | 'deferred' | 'evaluated'; roles: RoleStateContract[]
  applicationRefs: ApplicationReference[]; evidenceIds: string[]; uncertaintyIds: string[]
}
export const ROLE_RULE_BOUNDARIES = [
  { role: '격', sourceRuleIds: ['I-01', 'I-02'], source: 'A rev179 A-8-1' },
  { role: '용신', sourceRuleIds: ['I-02', 'I-03'], source: 'A rev179 A-8-1 / A-8-2 steps 2-3' },
  { role: '상신', sourceRuleIds: ['I-03', 'I-04', 'I-04-1'], source: 'A rev179 A-8-2 steps 4-5' },
  { role: '병', sourceRuleIds: ['I-03', 'I-04'], source: 'A rev179 A-8-2 step 6; I-04-2 only where applicable' },
  { role: '구응', sourceRuleIds: ['I-03', 'I-04'], source: 'A rev179 A-8-2 step 7' },
] as const
export function emptyRoleJudgmentOutput(): RoleJudgmentOutput {
  return { status: 'not-evaluated', roles: [], applicationRefs: [], evidenceIds: [], uncertaintyIds: [] }
}
