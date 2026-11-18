import { roleStateSchema } from '../../contracts'
import { foodDamagePathClaim, inspectByeongInputs, projectByeongCandidates, sameByeongInput } from '../byeongCandidates'
import { detach, recordId, sortedUnique } from '../../producers/shared'
import type { ByeongJudgment, ByeongJudgmentInput, ByeongJudgmentResult } from './types'

export * from './types'

export function evaluateByeongJudgment(input: ByeongJudgmentInput): ByeongJudgmentResult {
  const checked = inspectByeongInputs(input)
  const { context } = input
  // Revalidate only the candidate projection. Never rerun an upstream evaluator or calculate relationships.
  const validated = projectByeongCandidates(input, checked)
  const handoffValid = sameByeongInput(validated, input.candidateResult)
  const reasonCodes = sortedUnique([...validated.reasonCodes, ...(!handoffValid ? ['CANDIDATE_HANDOFF_MISMATCH'] : [])])
  const roleStates: ByeongJudgmentResult['roleStates'] = []
  const applications: ByeongJudgmentResult['applications'] = []
  const removalEvidence: ByeongJudgmentResult['removalEvidence'] = []
  const judgments: ByeongJudgment[] = validated.candidates.map((candidate) => {
    const { entity, runtimeState, protectedEntityId } = candidate
    const entityId = entity.entityId
    const natalRoleHistory = (input.natalByeongRoles ?? []).filter((item) => item.role === '병'
      && item.entityId === entityId && entity.origin === 'natal' && roleStateSchema.is(item)
      && item.validScopeId === input.natalScopeId).sort((a, b) => a.roleStateId.localeCompare(b.roleStateId))
    const priorRoles = natalRoleHistory.filter((item) => checked.validRole(item, input.natalScopeId))
    const blocks = sortedUnique([...reasonCodes, ...candidate.reasonCodes])
    const targetState = protectedEntityId ? checked.stateFor(protectedEntityId) : null
    const stopped = runtimeState?.functionalState === 'stopped'
    const targetStopped = targetState?.functionalState === 'stopped'
    const uniquePaths = new Set(candidate.paths.map((path) => path.pathId)).size === candidate.paths.length
    const trace: ByeongJudgment['trace'] = candidate.paths.map((path) => {
      const isVerified = uniquePaths && !!path.pathId && path.relation === 'controls' && path.pathId !== candidate.reviewIds[0]
        && checked.verified(path.evidenceIds, foodDamagePathClaim(candidate.reviewIds[0], path))
        && (!path.relationFactId || checked.validRelation(path.relationFactId, entityId, protectedEntityId ?? '', path.existence))
        && (path.existence === 'absent' || !!runtimeState && !!targetState
          && path.sourceStateId === runtimeState.stateId && path.targetStateId === targetState.stateId)
      let outcome: ByeongJudgment['trace'][number]['outcome'] = 'deferred'
      if (stopped || targetStopped) outcome = 'stopped'
      else if (isVerified && path.existence !== 'unknown' && path.effect === 'excluded') outcome = 'excluded'
      else if (isVerified && path.existence === 'present' && path.effect === 'damage'
        && (runtimeState?.functionalState === 'active' || runtimeState?.functionalState === 'weakened')
        && (targetState?.functionalState === 'active' || targetState?.functionalState === 'weakened')) outcome = 'damage'
      return { pathId: path.pathId, outcome, ...(path.relationFactId ? { relationFactId: path.relationFactId } : {}), evidenceIds: path.evidenceIds }
    })

    let status: ByeongJudgment['status'] = 'deferred'
    if (!blocks.length && candidate.status !== 'deferred') {
      if (candidate.status === 'candidate' && !stopped && !targetStopped && trace.some((path) => path.outcome === 'damage')) status = 'confirmed'
      else if (candidate.coverage === 'complete' && (candidate.status === 'rejected' || stopped || targetStopped
        || trace.length > 0 && trace.every((path) => path.outcome === 'excluded'))) status = 'rejected'
    }
    if (status === 'deferred' && !blocks.length) blocks.push('ACTUAL_DAMAGE_OR_COVERAGE_UNRESOLVED')
    const evidenceIds = sortedUnique([...candidate.evidenceIds, ...(targetState?.evidenceIds ?? []),
      ...trace.filter((path) => path.outcome !== 'deferred' && path.outcome !== 'stopped').flatMap((path) => path.evidenceIds)])
    const judgmentId = recordId('byeong-judgment', [context.scopeId, entityId])
    let currentRoleRef: string | null = null
    if (status === 'confirmed') {
      const application = { applicationId: recordId('byeong-application', [context.scopeId, entityId]),
        executionId: context.executionId, scopeId: context.scopeId, ruleId: 'I-04-2', ruleVersion: 'A179' }
      currentRoleRef = recordId('byeong-role', [context.scopeId, entityId])
      applications.push(application)
      roleStates.push(roleStateSchema.parse({
        contractVersion: '1', roleStateId: currentRoleRef, subjectKind: 'entity', entityId, structureRef: null,
        role: '병', status: 'evaluated', sourceRuleIds: candidate.ruleIds, evidenceIds, validScopeId: context.scopeId,
        provisional: false, uncertaintyIds: [], origin: 'rule-result', applicationRef: application, usage: 'runtime-result',
      }))
    }

    const addRemoval = (ruleId: 'I-04a' | 'I-04c', controlEvidence: string[] = []) => {
      const receipt = checked.receipt(ruleId)
      if (receipt && runtimeState && handoffValid && !checked.blocks.includes('EXECUTION_SCOPE_INCOMPLETE') && priorRoles.length) {
        removalEvidence.push({ entityId, ruleId, priorRoleIds: priorRoles.map((item) => item.roleStateId),
          stateId: runtimeState.stateId, evidenceIds: sortedUnique([receipt, ...runtimeState.evidenceIds, ...controlEvidence,
            ...priorRoles.flatMap((item) => item.evidenceIds)]) })
      }
    }
    if (stopped && runtimeState.causingApplicationRefs.some((app) => ['OP-T01', 'OP-T07', 'OP-T09', 'OP-T12'].includes(app.ruleId))) {
      addRemoval('I-04a')
    }
    // A supplied control witness must demonstrate the loss of this damage path in the current scope.
    if (!stopped && !targetStopped && status === 'rejected' && candidate.status === 'candidate') {
      const controlled = candidate.paths.filter((path) => path.existence === 'present' && path.effect === 'excluded'
        && trace.some((entry) => entry.pathId === path.pathId && entry.outcome === 'excluded')
        && !!path.controlRelationFactId && checked.entities.some((actor) => {
          const state = checked.stateFor(actor.entityId)
          return checked.entityConfirmed(actor) && state?.functionalState === 'active'
            && checked.validRelation(path.controlRelationFactId!, actor.entityId, entityId, 'present')
        }))
      if (controlled.length) addRemoval('I-04c', controlled.flatMap((path) => path.evidenceIds))
    }
    return { judgmentId, candidateId: candidate.candidateId, entityId, protectedEntityId, status, runtimeState, natalRoleHistory,
      currentRoleRef, ruleIds: candidate.ruleIds, factIds: candidate.factIds, relationCoverageRefs: candidate.relationCoverageRefs,
      evidenceIds, reasonCodes: blocks, trace, provenance: candidate.provenance }
  })
  const status = judgments.some((item) => item.status === 'confirmed') ? 'has-byeong'
    : !reasonCodes.length && judgments.length > 0 && judgments.every((item) => item.status === 'rejected') ? 'no-byeong' : 'deferred'
  return detach({ scopeId: context.scopeId, status, judgments, roleStates, applications, removalEvidence,
    otherDamageAssessment: 'unassessed', reasonCodes })
}
