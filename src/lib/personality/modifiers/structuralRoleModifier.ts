import { canonicalIds, compareId } from '../facts/personalityFacts'
import { linkRoleToPersonalityFacts } from './linkRoleToPersonalityFacts'
import type {
  NatalPersonalityResult, NatalStructuralDamagePath, NatalStructuralPath, NatalStructuralReading, NatalStructuralRoleCurrent,
  StructuralRolePersonalityConflict, StructuralRolePersonalityDiagnostic, StructuralRolePersonalityModifier,
} from '../types'

const ROLE_ORDER = ['yongshen', 'sangshen', 'byeong', 'gueung'] as const
const PROTECTION_POLICIES = new Set(['OFF-02', 'food-god-wealth-protects-output'])
const ROLE_RULE = 'src/docs/rules/master/11-personality-master.md#L198-L229'
const live = (value?: string) => value === 'operating' || value === 'reduced'
const favorable = (path: NatalStructuralPath) =>
  ['favorable', 'favorable_candidate', 'favorable_auxiliary', 'favorable_priority'].includes(path.actual?.direction ?? '')
const adverse = (path: NatalStructuralPath) =>
  path.actual?.direction === 'unfavorable' || path.actual?.direction === 'unfavorable_candidate'

function roleStatus(
  current: NatalStructuralRoleCurrent | undefined,
  runtime: StructuralRolePersonalityModifier['runtimeState'],
  options: {
    contextual: boolean
    pathConfirmed: boolean
    pathReduced: boolean
    pathInactive: boolean
  },
): StructuralRolePersonalityModifier['status'] {
  if (runtime === 'stopped' || current?.currentState === 'stopped' || current?.currentState === 'inactive') return 'inactive'
  if (options.contextual) return 'contextual'
  if (current?.currentFunction === 'inactive' || options.pathInactive) return 'inactive'
  if (!options.pathConfirmed || !current || !live(current.currentFunction)
    || current.currentState === 'deferred' || current.currentState === 'conditional' || !runtime) return 'deferred'
  return runtime === 'weakened' || current.currentState === 'weakened' || current.currentFunction === 'reduced' || options.pathReduced
    ? 'reduced' : 'confirmed'
}

export function collectRoleConflicts(modifiers: readonly StructuralRolePersonalityModifier[]): StructuralRolePersonalityConflict[] {
  const supportive = modifiers.filter(item => item.status === 'confirmed' || item.status === 'reduced')
    .filter(item => item.sourceRole === 'yongshen' || item.sourceRole === 'sangshen' || item.sourceRole === 'gueung')
  const harmful = modifiers.filter(item => item.sourceRole === 'byeong'
    && (item.status === 'confirmed' || item.status === 'reduced' || item.status === 'contextual'))
  return supportive.flatMap(support => harmful.flatMap(damage => {
    const factIds = support.targetPersonalityFactIds.filter(id => damage.targetPersonalityFactIds.includes(id))
    if (!factIds.length) return []
    const conditional = damage.roleContext === 'conditional_byeong' && damage.status === 'contextual'
    return [{
      id: `conflict:structural_role:${JSON.stringify([support.sourceRoleId, damage.sourceRoleId])}`,
      factIds,
      modifierIds: [support.id, damage.id],
      conflictType: conditional ? 'conditional_role_shift' as const : 'structural_role_tension' as const,
      resolution: conditional ? 'context_split' as const : 'coexist' as const,
      explanationEvidence: canonicalIds([...support.provenanceIds, ...damage.provenanceIds]),
    }]
  })).sort((a, b) => compareId(a.id, b.id))
}

function matchesDamage(path: NatalStructuralPath, damage: NatalStructuralDamagePath): boolean {
  return damage.sourceEntityId === path.sourceEntityId && damage.targetEntityId === path.targetEntityId
    && damage.action === path.action && damage.relationFactIds.includes(path.id)
}

/** Applies already evaluated natal role evidence without changing the base or the structural snapshot. */
export function applyStructuralRoleModifiers(base: NatalPersonalityResult, reading: NatalStructuralReading): NatalPersonalityResult {
  if (reading.scope !== 'natal') throw new TypeError('Personality role modifiers require natal structural evidence.')

  const actors = new Map(reading.actors.map(actor => [actor.entityId, actor]))
  const currents = new Map(reading.currentRoles.map(item => [item.roleId, item]))
  const runtime = new Map(reading.runtime.map(item => [item.entityId, item.state]))
  const paths = new Map(reading.paths.map(path => [path.id, path]))
  const damages = new Map(reading.damagePaths.map(path => [path.id, path]))
  const modifiers: StructuralRolePersonalityModifier[] = []
  const diagnostics: StructuralRolePersonalityDiagnostic[] = []

  for (const history of reading.roleHistory) {
    const { roleId, actorId, role } = history
    const diagnose = (code: StructuralRolePersonalityDiagnostic['code']) => {
      diagnostics.push({ sourceRoleId: roleId, sourceEntityId: actorId, code })
    }
    const actor = actors.get(actorId)
    if (!actor) {
      diagnose('ROLE_ACTOR_UNAVAILABLE')
      continue
    }
    const link = linkRoleToPersonalityFacts(base, actor)
    if (link.code) {
      diagnose(link.code)
      continue
    }

    const current = currents.get(roleId)
    const runtimeState = runtime.get(actorId)
    const standby = role === 'sangshen' && (current?.currentState === 'protective_standby'
      || Boolean(history.protectiveStandbyEligible && !live(current?.currentFunction)))
    const conditional = role === 'byeong' && history.conditional === true
    const refs = canonicalIds([...history.pathRefs, ...(current?.pathRefs ?? [])])
    const referencedPaths = refs.flatMap(id => {
      const path = paths.get(id)
      return path ? [path] : []
    })
    const actorPaths = referencedPaths.filter(path => [path.sourceEntityId, path.targetEntityId].includes(actorId))
    const currentActorPaths = actorPaths.filter(path => current?.pathRefs.includes(path.id))
    const damage = role === 'byeong' && history.damageId ? damages.get(history.damageId) : undefined
    const damageRelation = damage?.sourceEntityId === actorId ? actorPaths.find(path => matchesDamage(path, damage)) : undefined
    const remedyTarget = role === 'gueung' && history.targetByeongId ? damages.get(history.targetByeongId) : undefined

    // An actual Byeong needs a complete damage chain, while ConditionalByeong needs its recorded precursor.
    if (role === 'byeong' && (conditional ? !actorPaths.some(path => path.action === 'generate' && path.targetEntityId === actorId)
      : !damageRelation || !damage?.damagedFunction || !damage.structuralConsequence)) {
      diagnose('ROLE_PATH_UNCONFIRMED')
      continue
    }
    if (role === 'gueung' && (!remedyTarget?.damagedFunction || !remedyTarget.structuralConsequence
      || !actorPaths.length || !referencedPaths.some(path => matchesDamage(path, remedyTarget)))) {
      diagnose('ROLE_PATH_UNCONFIRMED')
      continue
    }

    // Role history supplies provenance. Only current path links can support current expression.
    const operative = currentActorPaths.filter(path => live(path.actual?.function)
      && (role === 'byeong' ? path.id === damageRelation?.id && adverse(path) : favorable(path)))
    const manifestation = role === 'yongshen' ? reading.manifestedYongShen.find(item =>
      item.entityId === actorId && current?.pathRefs.includes(item.patternContextId)) : undefined
    const pathConfirmed = Boolean(operative.length || manifestation)
      && (role !== 'gueung' || remedyTarget?.currentState === 'inactive')
    const status = roleStatus(current, runtimeState, {
      contextual: standby || conditional, pathConfirmed,
      pathReduced: damage?.currentState === 'weakened' || (!manifestation && operative.length > 0
        && operative.every(path => path.actual?.function === 'reduced')),
      pathInactive: !manifestation && (damage?.currentState === 'inactive' || currentActorPaths.length > 0
        && currentActorPaths.every(path => path.actual?.function === 'inactive')),
    })
    if (status === 'deferred' && !pathConfirmed) diagnose('ROLE_PATH_UNCONFIRMED')
    const protects = operative.some(path => PROTECTION_POLICIES.has(path.actual?.policyId ?? ''))
    const operation = standby || conditional || status === 'deferred' ? 'contextualizes'
      : role === 'byeong' ? 'distorts_expression'
        : role === 'gueung' ? 'resolves_tension'
          : role === 'sangshen' ? (protects ? 'protects_expression' : 'supports_expression') : 'channels_expression'

    const sourceFactIds = canonicalIds([...refs, ...(damage?.relationFactIds ?? []), ...(remedyTarget?.relationFactIds ?? [])])
    const actualFunctionRefs = canonicalIds(referencedPaths.flatMap(path => path.actual ? [path.actual.ref] : []))
    const provenanceIds = canonicalIds([
      ...link.facts.flatMap(fact => fact.provenanceIds), ROLE_RULE, roleId, reading.scopeId, ...sourceFactIds, ...actualFunctionRefs,
      ...(damage ? [damage.id, ...damage.evidenceIds] : []),
      ...(remedyTarget ? [remedyTarget.id, ...remedyTarget.evidenceIds] : []),
      ...(history.protectedEntityId ? [history.protectedEntityId] : []),
      ...referencedPaths.flatMap(path => path.actual?.evidenceIds ?? []),
    ])
    modifiers.push({
      id: `modifier:structural_role:${roleId}`, sourceRole: role, sourceRoleId: roleId, sourceEntityId: actorId,
      sourceScopeId: reading.scopeId, sourceFactIds, actualFunctionRefs,
      historyPathRefs: canonicalIds(history.pathRefs), currentPathRefs: canonicalIds(current?.pathRefs ?? []),
      targetPersonalityFactIds: canonicalIds(link.facts.map(fact => fact.id)), operation, status, provenanceIds,
      currentState: current?.currentState ?? 'deferred', currentFunction: current?.currentFunction ?? 'deferred',
      ...(runtimeState && { runtimeState }), roleContext: conditional ? 'conditional_byeong' : standby ? 'protective_standby' : 'assigned',
      ...(history.protectedEntityId && { protectedEntityId: history.protectedEntityId }),
      ...(remedyTarget && { targetByeongId: remedyTarget.id }),
      ...(damage && { damagePath: {
        id: damage.id, sourceEntityId: damage.sourceEntityId, targetEntityId: damage.targetEntityId, action: damage.action,
        damagedFunction: damage.damagedFunction, structuralConsequence: damage.structuralConsequence, currentState: damage.currentState,
      } }),
    })
  }
  modifiers.sort((a, b) => compareId(a.targetPersonalityFactIds[0], b.targetPersonalityFactIds[0])
    || ROLE_ORDER.indexOf(a.sourceRole) - ROLE_ORDER.indexOf(b.sourceRole) || compareId(a.sourceRoleId, b.sourceRoleId))
  diagnostics.sort((a, b) => compareId(a.sourceRoleId, b.sourceRoleId) || compareId(a.code, b.code))
  const roleConflicts = collectRoleConflicts(modifiers)
  const previousRoleConflictIds = new Set(base.roleConflicts.map(item => item.id))

  return {
    ...base,
    structuralRoleModifiers: modifiers,
    roleConflicts,
    structuralRoleDiagnostics: diagnostics,
    conflicts: [...base.conflicts.filter(item => !previousRoleConflictIds.has(item.id)), ...roleConflicts],
  }
}
