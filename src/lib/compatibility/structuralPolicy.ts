import { recordId, sortedUnique } from '../judgment/producers/shared'
import type { CompatibilityFacts, CrossParticipant, CrossPathEvidence, CrossRoleInteractionFact } from './types'

type Input = Pick<CompatibilityFacts, 'stemInteractions' | 'branchInteractions' | 'rootSupport' | 'roleInteractions'>
type EffectType = 'relieves_byeong' | 'weakens_byeong' | 'activates_byeong' | 'strengthens_harmful_path'
  | 'supports_required_function' | 'damages_required_function' | 'supports_required_root' | 'supports_harmful_root'

export type DirectionalVerdict = 'favorable' | 'favorable_dominant' | 'balanced_mixed' | 'minor_effect'
  | 'unfavorable_dominant' | 'unfavorable' | 'deferred'

const priorities = ['core', 'required', 'root', 'linked'] as const
type StructuralPriority = typeof priorities[number]

export interface CompatibilityStructuralEffect {
  readonly id: string
  readonly effectType: EffectType
  readonly source: CrossParticipant
  readonly target: CrossParticipant
  readonly crossFactId: string
  readonly roleInteractionId: string
  readonly targetByeongId?: string
  readonly targetPathId: string
  readonly patternContextId: string
  readonly priority: StructuralPriority
  readonly change: CrossPathEvidence['change']
  readonly contribution: CrossPathEvidence['contribution']
  readonly sourceFactIds: readonly string[]
  readonly provenance: readonly string[]
}

export interface DirectionalCompatibilityResult {
  readonly sourcePersonId: string
  readonly targetPersonId: string
  readonly verdict: DirectionalVerdict
  readonly supportEffects: readonly CompatibilityStructuralEffect[]
  readonly damageEffects: readonly CompatibilityStructuralEffect[]
  readonly deferredRoleIds: readonly string[]
}

function sameEndpoint(a: CrossParticipant, b: CrossParticipant) {
  return a.personId === b.personId && a.judgmentId === b.judgmentId && a.entityId === b.entityId
    && a.position === b.position && a.value === b.value
}

function classify(path: CrossPathEvidence, role: CrossRoleInteractionFact): readonly EffectType[] {
  if (path.change === 'weakened' && path.before !== 'operating') return []
  if (path.classification === 'required') {
    if (path.before === 'inactive' || !role.targetRoleId
      || (role.targetRole !== 'YongShen' && role.targetRole !== 'SangShen' && role.targetRole !== 'GuEung')) return []
    if (path.change === 'blocked' || path.change === 'weakened') return ['damages_required_function']
    if (path.change === 'supported') return path.contribution === 'root_supported'
      ? ['supports_required_root', 'supports_required_function'] : ['supports_required_function']
    return []
  }
  const knownByeong = (role.targetRole === 'Byeong' || role.targetRole === 'ConditionalByeong')
    && Boolean(role.targetByeongId) && role.targetByeongId === role.targetRoleId
  if (path.change === 'blocked' || path.change === 'weakened') {
    if (!knownByeong || path.before === 'inactive') return []
    return [path.change === 'blocked' ? 'relieves_byeong' : 'weakens_byeong']
  }
  const root: EffectType[] = path.contribution === 'root_supported' ? ['supports_harmful_root'] : []
  if (path.change === 'activated' && path.before === 'inactive' && knownByeong) return [...root, 'activates_byeong']
  if (path.change === 'supported' && path.before !== 'inactive') return [...root, 'strengthens_harmful_path']
  return []
}

function effectPriority(type: EffectType, path: CrossPathEvidence): StructuralPriority {
  if (type === 'supports_required_root' || type === 'supports_harmful_root') return 'root'
  if (type === 'weakens_byeong') return 'linked'
  return path.critical ? 'core' : path.classification === 'required' ? 'required' : 'linked'
}

function isSupport(type: EffectType) {
  return type === 'relieves_byeong' || type === 'weakens_byeong'
    || type === 'supports_required_function' || type === 'supports_required_root'
}

function verdict(support: readonly CompatibilityStructuralEffect[], damage: readonly CompatibilityStructuralEffect[],
  pending: boolean, observed: boolean): DirectionalVerdict {
  const pathKey = (effect: CompatibilityStructuralEffect) =>
    recordId('path', [effect.target.judgmentId, effect.patternContextId, effect.targetPathId])
  const relief = new Set(support.filter(effect => effect.effectType === 'relieves_byeong').map(pathKey))
  const stoppedRequired = new Set(damage.filter(effect => effect.effectType === 'damages_required_function'
    && effect.change === 'blocked').map(pathKey))
  const effectiveSupport = support.filter(effect => (effect.effectType !== 'supports_required_function'
    && effect.effectType !== 'supports_required_root') || !stoppedRequired.has(pathKey(effect)))
  const effectiveDamage = damage.filter(effect => effect.effectType === 'damages_required_function'
    || !relief.has(pathKey(effect)))
  const highest = priorities.find(priority => effectiveSupport.some(effect => effect.priority === priority)
    || effectiveDamage.some(effect => effect.priority === priority))
  if (highest === undefined) return pending || !observed ? 'deferred' : 'minor_effect'
  const supportWins = effectiveSupport.some(effect => effect.priority === highest)
  const damageWins = effectiveDamage.some(effect => effect.priority === highest)
  if (supportWins && damageWins) return highest === 'core' ? 'balanced_mixed' : 'minor_effect'
  if (supportWins && effectiveDamage.length) return 'favorable_dominant'
  if (damageWins && effectiveSupport.length) return 'unfavorable_dominant'
  if (highest !== 'core') return 'minor_effect'
  return supportWins ? 'favorable' : 'unfavorable'
}

/** Consumes the four C1 Fact families. Personal runtime is never evaluated here. */
export function buildStructuralCompatibility(input: Input): readonly DirectionalCompatibilityResult[] {
  const { stemInteractions, branchInteractions, rootSupport, roleInteractions } = input
  const stems = new Map(stemInteractions.map(fact => [fact.id, fact]))
  const roots = new Map(rootSupport.map(fact => [fact.id, fact]))
  const people = sortedUnique([
    ...stemInteractions.flatMap(fact => fact.participants.map(part => part.personId)),
    ...branchInteractions.flatMap(fact => fact.participants.map(part => part.personId)),
    ...rootSupport.flatMap(fact => [fact.provider.personId, fact.receiver.personId]),
    ...roleInteractions.flatMap(fact => [fact.source.personId, fact.target.personId]),
  ])
  if (people.length > 2) throw new TypeError('Structural Compatibility requires Facts for one pair')
  if (people.length < 2) return []

  function validatedChange(role: CrossRoleInteractionFact, path: CrossPathEvidence) {
    const matches = (source: CrossParticipant, target: CrossParticipant) =>
      sameEndpoint(source, role.source) && sameEndpoint(target, role.target)
    if (path.sourceEntityId !== role.target.entityId || !role.targetPathIds.includes(path.pathId)
      || ![path.pathId, path.patternContextId, role.target.judgmentId, role.sourceInteractionId]
        .every(id => path.sourceFactIds.includes(id)) || !path.targetEntityId || !path.policyId
      || (role.targetRoleId && !path.sourceFactIds.includes(role.targetRoleId))) return false
    if (path.contribution === 'root_supported') {
      const root = roots.get(role.sourceInteractionId)
      return role.action === 'root_support' && root !== undefined && matches(root.provider, root.receiver)
        && (path.change === 'supported' || path.change === 'activated')
    }
    const stem = stems.get(role.sourceInteractionId)
    if (!stem || stem.action !== role.action) return false
    if (path.contribution === 'generated') {
      return stem.action === 'generate' && stem.direction !== undefined && matches(stem.direction.source, stem.direction.target)
        && (path.change === 'supported' || path.change === 'activated')
    }
    const stopping = path.contribution === 'stopped'
    return stem.action === (stopping ? 'combine' : 'control') && path.change === (stopping ? 'blocked' : 'weakened')
      && stem.compatibilityRuntimeEffects.some(effect => effect.state === path.contribution && matches(effect.source, effect.target))
  }

  return [[people[0], people[1]], [people[1], people[0]]].map(([sourcePersonId, targetPersonId]) => {
    const effects = new Map<string, CompatibilityStructuralEffect>()
    const pending: string[] = []
    const matchesDirection = (source: CrossParticipant, target: CrossParticipant) =>
      source.personId === sourcePersonId && target.personId === targetPersonId
    const roles = roleInteractions.filter(role => matchesDirection(role.source, role.target))
    for (const role of roles) {
      let confirmed = false
      for (const path of role.pathEvidence ?? []) {
        if (!validatedChange(role, path)) continue
        for (const type of classify(path, role)) {
          const id = recordId('compatibility-effect', [role.id, path.pathId, type])
          const effect = {
            id, effectType: type, source: role.source, target: role.target, crossFactId: role.sourceInteractionId,
            roleInteractionId: role.id, ...(role.targetByeongId && { targetByeongId: role.targetByeongId }),
            targetPathId: path.pathId, patternContextId: path.patternContextId, priority: effectPriority(type, path),
            change: path.change, contribution: path.contribution,
            sourceFactIds: sortedUnique([role.id, ...role.sourceFactIds, ...path.sourceFactIds]),
            provenance: sortedUnique([...role.provenance, 'Master16']),
          }
          const prior = effects.get(id)
          if (prior && JSON.stringify(prior) !== JSON.stringify(effect)) throw new TypeError('Conflicting structural path evidence')
          effects.set(id, effect)
          confirmed = true
        }
      }
      if ((!confirmed && (role.interactionType !== 'role_contact' || !role.currentFunction
        || role.currentFunction === 'deferred')) || role.targetPathIds.some(pathId =>
        !role.pathEvidence?.some(path => path.pathId === pathId && validatedChange(role, path) && classify(path, role).length))) {
        pending.push(role.id)
      }
    }
    const ordered = [...effects.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    const supportEffects = ordered.filter(effect => isSupport(effect.effectType))
    const damageEffects = ordered.filter(effect => !isSupport(effect.effectType))
    const observed = branchInteractions.length > 0 || roles.length > 0
      || rootSupport.some(root => matchesDirection(root.provider, root.receiver))
      || stemInteractions.some(stem => stem.action === 'combine'
        || (stem.direction && matchesDirection(stem.direction.source, stem.direction.target)))
    return { sourcePersonId, targetPersonId, supportEffects, damageEffects,
      deferredRoleIds: sortedUnique(pending), verdict: verdict(supportEffects, damageEffects, pending.length > 0, observed) }
  })
}
