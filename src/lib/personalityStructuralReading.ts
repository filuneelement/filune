import type { LuckScopeState } from './judgment/core/luckScope'
import type { StemParticipant } from './judgment/core/types'
import type {
  NatalStructuralActor, NatalStructuralReading, NatalStructuralRoleHistory,
} from './personality/types'

const POSITIONS = {
  year: 'year_stem', month: 'month_stem', day: 'day_stem', time: 'hour_stem',
} as const

const ROLE_KIND = {
  YongShen: 'yongshen', SangShen: 'sangshen', Byeong: 'byeong',
  ConditionalByeong: 'byeong', GuEung: 'gueung',
} as const

/** Bridges the existing Judgment snapshot and the Personality input contract. */
export function projectNatalStructuralReading(snapshot: LuckScopeState): NatalStructuralReading {
  if (snapshot.scope !== 'natal') throw new TypeError('Personality role projection requires the natal Judgment snapshot.')

  const direct = new Set(snapshot.directEntityIds)
  const relationFacts = [...snapshot.stemFacts, ...snapshot.patternFacts].filter(fact =>
    fact.source.scope === 'natal' && fact.target.scope === 'natal'
    && direct.has(fact.source.id) && direct.has(fact.target.id))
  const actors = new Map<string, NatalStructuralActor>()
  const addActor = (actor: StemParticipant, monthBlade = false) => {
    if (actor.position === 'luck') return
    actors.set(actor.id, {
      entityId: actor.id, position: monthBlade ? 'month_branch' : POSITIONS[actor.position],
      stem: actor.stem, tenGod: actor.tenGod, ...(monthBlade && { hiddenStemRole: 'main' as const }),
    })
  }
  for (const fact of relationFacts) {
    addActor(fact.source)
    addActor(fact.target, 'basis' in fact && fact.basis === 'month_blade')
  }

  const functions = new Map(snapshot.actualFunctions.map(actual => [actual.relationFactId, actual]))
  const paths = relationFacts.map(fact => {
    const actual = functions.get(fact.id)
    return {
      id: fact.id, sourceEntityId: fact.source.id, targetEntityId: fact.target.id, action: fact.action,
      ...(actual && { actual: {
        ref: actual.relationFactId, function: actual.function, direction: actual.direction, policyId: actual.policyId,
        evidenceIds: [
          ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? []),
          ...actual.rootEvidence.flatMap(item => item.factIds), ...actual.formationEvidence,
          ...(actual.capacityEvidence ?? []),
        ],
      } }),
    }
  })
  const damagePaths = snapshot.policyRoles.byeong.filter(path => path.originScope === 'natal').map(path => ({
    id: path.id, sourceEntityId: path.sourceEntityId, targetEntityId: path.targetEntityId, action: path.action,
    damagedFunction: path.damagedFunction, structuralConsequence: path.structuralConsequence,
    relationFactIds: [...path.relationFactIds], evidenceIds: [...path.evidenceRefs], currentState: path.currentState,
  }))

  const roleHistory: NatalStructuralRoleHistory[] = snapshot.roleEngine.roleHistory.map(role => {
    // The native role history references the path by its evidence, while the policy list owns the damage ID.
    const damage = role.role === 'Byeong' ? damagePaths.filter(path =>
      path.sourceEntityId === role.entityId && path.relationFactIds.length === role.pathRefs.length
      && path.relationFactIds.every(ref => role.pathRefs.includes(ref))) : []
    const verifiedRemedy = role.role === 'GuEung' && snapshot.policyRoles.guEung.some(item =>
      item.entityId === role.entityId && item.targetByeongId === role.targetByeongId
      && item.supportingPath.every(ref => role.pathRefs.includes(ref)))
    return {
      roleId: role.roleId, role: ROLE_KIND[role.role], actorId: role.entityId, pathRefs: [...role.pathRefs],
      ...(role.role === 'ConditionalByeong' && { conditional: true as const }),
      ...(role.conditionalThreat && { protectiveStandbyEligible: true as const }),
      ...(role.protectedFunction && { protectedEntityId: role.protectedFunction.entityId }),
      ...(damage.length === 1 && { damageId: damage[0].id }),
      ...(verifiedRemedy && role.targetByeongId && { targetByeongId: role.targetByeongId }),
    }
  })

  return {
    scope: 'natal', scopeId: snapshot.id, actors: [...actors.values()], roleHistory, paths, damagePaths,
    currentRoles: snapshot.roleEngine.currentRoles.map(role => ({ ...role, pathRefs: [...role.pathRefs] })),
    runtime: snapshot.runtime.map(item => ({ ...item })),
    manifestedYongShen: snapshot.patternContext.effectiveManifestedYongShen.map(item => ({
      entityId: item.entityId, patternContextId: snapshot.patternContext.id,
    })),
  }
}
