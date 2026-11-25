import type { RoleEngineState } from './roleEngine'
import type { CapacityEvidence, FinalPatternContext, RootState } from './types'

export type StructuralGrade = '成' | '有利優勢' | '不利優勢' | '敗'
type Axis = { grade: StructuralGrade | null; reasonCodes: string[] }
const result = (grade: Axis['grade'], ...reasonCodes: string[]): Axis => ({ grade, reasonCodes })

export function evaluateStructuralSuccess(pattern: FinalPatternContext, roles: RoleEngineState,
  roots: readonly { entityId: string; state: RootState; factIds: readonly string[]; formationIds: readonly string[] }[],
  capacity: CapacityEvidence | null, branchCommandDamaged: boolean, runtimeResolved: boolean,
  branchDisruptionRefs: readonly string[] = [], supportedResource?: { stemRefs: readonly string[]; branchRefs: readonly string[] },
  branchRecoveryRefs: readonly string[] = []) {
  const byRoleId = new Map(roles.currentRoles.map((role) => [role.roleId, role]))
  const main = roles.roleHistory.filter(({ role }) => role === 'YongShen')
  const effectiveIds = new Set(pattern.effectiveManifestedYongShen.map(({ entityId }) => entityId))
  const mainFunctions = main.map(({ roleId }) => byRoleId.get(roleId)?.currentFunction)
  const helpers = roles.roleHistory.filter(({ role, conditionalThreat }) => role === 'SangShen' && !conditionalThreat)
    .map(({ roleId }) => byRoleId.get(roleId)?.currentFunction)
  const functioning = mainFunctions.some((status) => status === 'operating' || status === 'reduced')
    || effectiveIds.size > 0 || Boolean(supportedResource?.stemRefs.length)
  const damage = roles.damagePaths.filter(({ state }) => state === 'active' || state === 'weakened')
  const branchDamage = damage.filter(({ damagedFunction }) => damagedFunction.startsWith('branch_'))
  const stemDamage = damage.filter((path) => !branchDamage.includes(path))
  const essentialIds = new Set([...main.map(({ entityId }) => entityId), ...effectiveIds])
  const severeDamage = stemDamage.some(({ state, targetEntityId, damagedFunction }) => state === 'active'
    && (essentialIds.has(targetEntityId) || ['day_master', 'day_master_capacity', 'officer_protection', 'killing_control'].includes(damagedFunction)))
    || stemDamage.some(({ state, relationRefs }) => state === 'active' && relationRefs.some((id) => supportedResource?.stemRefs.includes(id)))
  const conflict = pattern.yongShenRelations.some(({ relationQuality }) => relationQuality === 'unfavorable_conflict' || relationQuality === 'mixed')
  const unsettled = pattern.yongShenRelations.some(({ relationQuality }) => relationQuality === 'deferred')
  const capacityBurden = capacity?.state === 'output_capacity_insufficient' || capacity?.state === 'killing_capacity_insufficient'
  const capacityAdequate = capacity?.state === 'killing_capacity_adequate' || capacity?.state === 'output_capacity_adequate'
  const relievedIds = new Set(roles.relievedYongShenStops.map(({ entityId }) => entityId))
  const requiredPathLost = !effectiveIds.size && mainFunctions.length > 0 && mainFunctions.every((status) => status === 'inactive')
    && main.some(({ entityId }) => !relievedIds.has(entityId))
    || functioning && helpers.length > 0 && helpers.every((status) => status === 'inactive')
      && stemDamage.some(({ damagedFunction }) => damagedFunction === 'officer_protection' || damagedFunction === 'killing_control')
  const stem = !runtimeResolved ? result(null, 'STEM_RUNTIME_UNRESOLVED')
    : requiredPathLost && roles.guEungStatus !== 'confirmed' && roles.guEungStatus !== 'deferred'
      ? result('敗', 'REQUIRED_STEM_PATH_LOST')
      : severeDamage ? result('不利優勢', 'ACTIVE_STEM_FUNCTION_DAMAGE')
      : !functioning && !requiredPathLost && relievedIds.size && !stemDamage.length && !capacityBurden
        ? result('有利優勢', 'ADVERSE_STEM_FUNCTION_RELIEVED')
      : !functioning ? result(null, 'YONGSHEN_FUNCTION_UNRESOLVED')
        : capacityBurden || conflict && stemDamage.length > 0
          ? result('不利優勢', 'OPERATING_STEM_PATH_WITH_ACTIVE_DAMAGE_OR_BURDEN')
          : stemDamage.length || conflict || mainFunctions.includes('reduced') || helpers.includes('reduced')
            ? result('有利優勢', 'OPERATING_STEM_PATH_WITH_LIMITATIONS')
            : roles.byeongStatus === 'deferred' || unsettled || helpers.some((status) => status === 'deferred') || !capacityAdequate
              ? result(null, 'STEM_REQUIREMENTS_UNRESOLVED')
              : result('成', 'STEM_PATH_REQUIREMENTS_SATISFIED')
  const coreRoots = roots.filter(({ entityId }) => effectiveIds.has(entityId) || main.some((role) => role.entityId === entityId))
  const grounded = coreRoots.some(({ state }) => state === 'present' || state === 'strengthened')
    || Boolean(supportedResource?.branchRefs.length)
  const branch = !runtimeResolved || !pattern.branchPattern ? result(null, 'BRANCH_STRUCTURE_UNRESOLVED')
    : branchDamage.some(({ state }) => state === 'active') ? result('不利優勢', 'ACTIVE_BRANCH_FUNCTION_DAMAGE')
      : branchRecoveryRefs.length ? result('有利優勢', 'BRANCH_COMMAND_RECOVERED_WITH_RESIDUAL_DAMAGE')
      : branchDamage.length ? result('有利優勢', 'BRANCH_FUNCTION_PROTECTED_WITH_RESIDUAL_DAMAGE')
    : branchCommandDamaged ? result(grounded ? '有利優勢' : '不利優勢', 'MONTH_COMMAND_CLASH')
      : coreRoots.some(({ state }) => state === 'weakened') ? result(grounded ? '有利優勢' : '不利優勢', 'CORE_ROOT_WEAKENED')
        : !grounded ? result(null, 'BRANCH_FUNCTION_UNRESOLVED')
          : capacityBurden ? result('不利優勢', 'CAPACITY_LIMITS_BRANCH_FUNCTION')
            : branchDisruptionRefs.length ? result('有利優勢', 'ROOT_FUNCTION_SURVIVES_BRANCH_DISRUPTION')
            : capacityAdequate ? result('成', 'BRANCH_FUNCTION_SUPPORTED')
              : result(null, 'BRANCH_CAPACITY_UNRESOLVED')
  const overall = stem.grade === '敗' ? result('敗', 'CORE_STEM_PATH_COLLAPSED')
    : !stem.grade || !branch.grade ? result(null, 'STRUCTURAL_AXIS_UNRESOLVED')
      : stem.grade === '不利優勢' || branch.grade === '不利優勢' ? result('不利優勢', 'ACTIVE_STRUCTURAL_LIMITATION')
        : stem.grade === '有利優勢' || branch.grade === '有利優勢' ? result('有利優勢', 'OPERATING_STRUCTURE_WITH_LIMITATIONS')
          : result('成', 'STRUCTURAL_REQUIREMENTS_SATISFIED')
  return { stem, branch, overall, ruleIds: ['SG-121', 'SG-122', 'SG-123', 'SG-124', 'SG-125', 'SG-126', 'SG-127', 'EX-120', 'EX-121', 'EX-122'],
    evidenceRefs: [...new Set([pattern.id, ...roles.currentRoles.flatMap(({ pathRefs }) => pathRefs),
      ...damage.flatMap(({ relationRefs }) => relationRefs), ...roles.resolutionPaths.flatMap(({ relationRefs }) => relationRefs),
      ...roles.relievedYongShenStops.map(({ relationId }) => relationId),
      ...coreRoots.flatMap(({ factIds, formationIds }) => [...factIds, ...formationIds]),
      ...branchDisruptionRefs, ...branchRecoveryRefs, ...(supportedResource?.stemRefs ?? []), ...(supportedResource?.branchRefs ?? []),
      ...(capacity?.evidenceIds ?? [])])] }
}
