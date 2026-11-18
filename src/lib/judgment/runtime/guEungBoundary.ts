import { guEungInputSchema, guEungJudgmentSchema } from '../contracts/guEung'
import type { GuEungDamagePath, GuEungInput, GuEungJudgment } from '../contracts/guEung'
import { detach, sortedUnique } from '../producers/shared'

/** Opens only the existing current 병 damage paths for future investigation. */
export function prepareGuEungBoundary(input: GuEungInput): GuEungJudgment {
  const { scopeId, referenceTime, byeong, evidence } = guEungInputSchema.parse(input)
  if (byeong.scopeId !== scopeId || byeong.roleStates.some((role) => role.validScopeId !== scopeId)
    || byeong.applications.some((application) => application.scopeId !== scopeId)
    || byeong.judgments.some(({ runtimeState }) => runtimeState && runtimeState.scopeId !== scopeId)) {
    throw new TypeError('구응 input scope does not match the 병 result')
  }
  if (byeong.roleStates.some((role) => role.role !== '병') || evidence.records.some((record) => record.usage === 'regression-expectation')) {
    throw new TypeError('구응 input requires 병 roles and evidence independent of regression expectations')
  }

  const confirmed = byeong.judgments.filter((judgment) => judgment.status === 'confirmed')
  const damagePaths: GuEungDamagePath[] = []
  const reasonCodes = [...byeong.reasonCodes]
  if (byeong.status !== 'has-byeong') {
    if (confirmed.length || byeong.roleStates.some((role) => role.status === 'evaluated' && !role.provisional)
      || (byeong.status === 'no-byeong' && byeong.judgments.some((judgment) => judgment.status !== 'rejected'))) {
      throw new TypeError('병 result status contradicts its judgments or roles')
    }
  } else {
    if (!confirmed.length) throw new TypeError('has-byeong requires a confirmed 병 judgment')
    const roles = new Map(byeong.roleStates.map((role) => [role.roleStateId, role]))
    const applications = new Map(byeong.applications.map((app) => [app.applicationId, app]))
    const evidenceById = new Map(evidence.records.map((record) => [record.evidenceId, record]))
    for (const judgment of confirmed) {
      const { runtimeState: state } = judgment
      const role = judgment.currentRoleRef ? roles.get(judgment.currentRoleRef) : undefined
      if (role?.entityId !== judgment.entityId || role.status !== 'evaluated' || role.provisional
        || role.uncertaintyIds.length || role.usage !== 'runtime-result' || !role.applicationRef
        || JSON.stringify(role.applicationRef) !== JSON.stringify(applications.get(role.applicationRef.applicationId))
        || !state || state.targetEntityId !== judgment.entityId || state.uncertaintyIds.length
        || !['active', 'weakened'].includes(state.functionalState) || !judgment.protectedEntityId) {
        reasonCodes.push('BYEONG_CURRENT_ROLE_OR_STATE_UNAVAILABLE')
        continue
      }
      const { from, to } = state.validity
      const start = from.kind === 'exact' ? from.instant : from.kind === 'range' ? from.latest : undefined
      const end = to.kind === 'exact' ? to.instant : to.kind === 'range' ? to.earliest : undefined
      if (!start || !end || referenceTime < start || referenceTime >= end) {
        reasonCodes.push('BYEONG_STATE_OUTSIDE_CONFIRMED_VALIDITY')
        continue
      }
      for (const path of judgment.trace.filter((item) => item.outcome === 'damage')) {
        if (!path.evidenceIds.length || path.evidenceIds.some((id) => {
          const record = evidenceById.get(id)
          return record?.status !== 'confirmed' || record.usage !== 'runtime-evidence' || record.uncertaintyIds.length > 0
            || (record.sourceRef.kind === 'source-document' && ['C', '25-7'].includes(record.sourceRef.document.documentId))
        })) {
          reasonCodes.push('BYEONG_DAMAGE_EVIDENCE_UNAVAILABLE')
          continue
        }
        damagePaths.push({ byeongJudgmentId: judgment.judgmentId, damagePathId: path.pathId,
          byeongEntityId: judgment.entityId, protectedEntityId: judgment.protectedEntityId, roleStateRef: role.roleStateId,
          runtimeStateRef: state.stateId, ...(path.relationFactId ? { relationFactId: path.relationFactId } : {}),
          evidenceIds: sortedUnique(path.evidenceIds), provenance: judgment.provenance })
      }
    }
    reasonCodes.push('GUEUNG_RULE_NOT_IMPLEMENTED')
  }
  damagePaths.sort((a, b) => a.byeongJudgmentId.localeCompare(b.byeongJudgmentId)
    || a.damagePathId.localeCompare(b.damagePathId))
  return detach(guEungJudgmentSchema.parse({
    contractVersion: '1', scopeId, status: byeong.status === 'no-byeong' ? 'not-applicable' : 'deferred',
    damagePaths, coverage: 'unknown', candidates: [], effectLinks: [], roleStates: [], applications: [],
    reasonCodes: sortedUnique(reasonCodes),
  }))
}
