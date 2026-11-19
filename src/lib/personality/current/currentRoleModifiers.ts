import { canonicalIds } from '../facts/personalityFacts'
import type { StructuralRolePersonalityModifier } from '../types'
import type { CurrentStructuralRoleState, PersonalityStructuralEffect, PersonalityStructuralScope } from './types'

const ROLE_EVENTS = {
  yongshen: ['attacks_yongshen', 'protects_yongshen'],
  sangshen: ['activates_sangshen_function', 'weakens_sangshen'],
  byeong: ['activates_byeong', 'relieves_byeong', 'weakens_byeong', 'strengthens_byeong'],
  gueung: ['relieves_byeong'],
} as const

export const ROLE_EFFECT_TYPES = new Set<string>(Object.values(ROLE_EVENTS).flat())

export function relatedRoleEffects(
  modifier: StructuralRolePersonalityModifier, effects: readonly PersonalityStructuralEffect[],
): PersonalityStructuralEffect[] {
  const subjects = [modifier.sourceRoleId, modifier.sourceEntityId, modifier.targetByeongId, modifier.damagePath?.id]
  const types: readonly string[] = ROLE_EVENTS[modifier.sourceRole]
  return effects.filter(effect => types.includes(effect.effectType) && subjects.includes(effect.subjectId))
}

function currentStatus(
  role: StructuralRolePersonalityModifier, current?: CurrentStructuralRoleState,
): StructuralRolePersonalityModifier['status'] {
  if (!current) return 'deferred'
  const { currentState, currentFunction, runtimeState } = current
  if (currentState === 'stopped' || runtimeState === 'stopped' || currentState === 'inactive' || current.damageState === 'inactive') return 'inactive'
  if (currentState === 'protective_standby' || currentState === 'conditional') return 'contextual'
  if (currentFunction === 'inactive') return 'inactive'
  if (currentState === 'deferred' || !['operating', 'reduced'].includes(currentFunction)) return 'deferred'
  if (role.roleContext === 'conditional_byeong' && !current.activeTriggerRef) return 'deferred'
  return currentFunction === 'reduced' || current.activeTriggerFunction === 'reduced' || runtimeState === 'weakened' || current.damageState === 'weakened' || currentState === 'weakened' ? 'reduced' : 'confirmed'
}

export function projectRoleModifiers(
  natal: readonly StructuralRolePersonalityModifier[], scope: PersonalityStructuralScope,
  effects: readonly PersonalityStructuralEffect[],
): StructuralRolePersonalityModifier[] {
  if (scope.scope === 'natal') return [...natal]
  const currentById = new Map(scope.roles.map(role => [role.roleId, role]))
  return natal.map(role => {
    const current = currentById.get(role.sourceRoleId)
    const status = currentStatus(role, current)
    const operating = status === 'confirmed' || status === 'reduced'
    const operation = !operating ? 'contextualizes' : role.sourceRole === 'byeong' ? 'distorts_expression'
      : role.sourceRole === 'gueung' ? 'resolves_tension' : role.sourceRole === 'yongshen' ? 'channels_expression'
        : role.roleContext === 'protective_standby' || role.operation === 'protects_expression' ? 'protects_expression' : 'supports_expression'
    const currentPathRefs = canonicalIds(current?.pathRefs ?? [])
    const actualFunctionRefs = canonicalIds([...(current?.actualFunctionRefs ?? []), ...(current?.activeTriggerRef ? [current.activeTriggerRef] : [])])
    const related = relatedRoleEffects(role, effects)
    return {
      ...role, sourceScopeId: scope.id, status, operation, currentPathRefs, actualFunctionRefs,
      currentState: current?.currentState ?? 'deferred', currentFunction: current?.currentFunction ?? 'deferred',
      runtimeState: current?.runtimeState,
      ...(role.damagePath && current?.damageState && { damagePath: { ...role.damagePath, currentState: current.damageState } }),
      sourceFactIds: canonicalIds([...role.historyPathRefs, ...currentPathRefs]),
      provenanceIds: canonicalIds([...role.provenanceIds, scope.id, ...currentPathRefs, ...actualFunctionRefs,
        ...related.flatMap(effect => [effect.id, ...effect.sourceIds])]),
    }
  })
}
