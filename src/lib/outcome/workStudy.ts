import { isGod } from '../judgment/core/patternPolicyRegistry'
import { functionDamageEstablished } from '../judgment/core/policies'
import { luckPeriodStatus } from '../judgment/core/luckValidity'
import type { LuckScopeState } from '../judgment/core/luckScope'
import { recordId, sortedUnique } from '../judgment/producers/shared'
import type { OutcomeFact } from './types'

export type WorkStudySemantic = 'work_capacity' | 'work_difficulty' | 'work_resolution' | 'role_acquisition'
  | 'organizational_pressure' | 'study_capacity' | 'study_difficulty' | 'learning_accumulation'
  | 'distraction_pressure' | 'expression_vs_formal_learning_conflict'

/** Independently reviewed target linkage. Customer profile and event context do not supply these references. */
export type WorkStudyTarget = {
  readonly assessment: 'confirmed'
  readonly scopeId: string
  readonly targetId: string
  readonly kind: 'work_task' | 'existing_role' | 'organization' | 'role_opportunity' | 'learning' | 'peer_learning' | 'formal_learning'
  readonly entityId: string
  readonly relationId: string
  readonly evidenceIds: readonly string[]
  readonly opportunityEvidenceIds?: readonly string[]
}

export type WorkStudyOutcomeFact = OutcomeFact & {
  readonly domain: 'work' | 'study'
  readonly semanticType: WorkStudySemantic
  readonly target: WorkStudyTarget
  readonly direction: 'favorable' | 'unfavorable'
  readonly mappingId: string
  readonly publicationEvidenceIds: readonly string[]
}

const scopeNames = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon' } as const

export function buildWorkStudyOutcomes(snapshots: readonly LuckScopeState[], targets: readonly WorkStudyTarget[], referenceTime: string) {
  const outcomes = new Map<string, WorkStudyOutcomeFact>()
  for (const target of targets) {
    const snapshot = snapshots.find(({ id }) => id === target.scopeId)
    if (!snapshot || snapshot.runtimeStatus !== 'resolved' || snapshot.scope !== snapshot.patternContext.scope
      || snapshot.scope === 'monthlyLuck' || snapshot.scope === 'dailyLuck' || target.assessment !== 'confirmed' || !target.targetId.trim()
      || !target.evidenceIds.some(id => id.trim())) continue
    const scope = scopeNames[snapshot.scope]
    const time = scope === 'natal' ? 'baseline' : luckPeriodStatus(snapshot.validity, referenceTime)
    if (time !== 'baseline' && time !== 'effective' && time !== 'expired' && time !== 'unknown') continue
    const local = snapshot.stemFacts.find(({ id }) => id === target.relationId)
    const inherited = snapshot.inheritedRoleFunctions.find(({ fact }) => fact.id === target.relationId)
    const branch = snapshot.branchDamage.relations.find(({ id }) => id === target.relationId)
    const relation = local ?? inherited?.fact ?? (branch && {
      id: branch.id, action: branch.action,
      source: { id: branch.source.id, tenGod: branch.source.god },
      target: { id: branch.target.id, tenGod: branch.target.god, dayMaster: false },
    })
    const actual = local ? snapshot.actualFunctions.find(({ relationFactId }) => relationFactId === local.id) : inherited?.actual
    if (!relation || !actual && !branch || ![relation.source.id, relation.target.id].includes(target.entityId)) continue
    const branchDamage = branch && snapshot.branchDamage.paths.find(path => path.relationRefs[0] === branch.id
      && ['active', 'weakened'].includes(path.state)
      && path.targetEntityId === target.entityId && path.sourceEntityId === branch.source.id)

    const damage = actual && (functionDamageEstablished(actual) || actual.byeongCandidate
      && ['PEER-06', 'ROB-03'].includes(actual.policyId ?? '')) ? snapshot.roleEngine.damagePaths.find(path => path.targetEntityId === target.entityId
      && path.sourceEntityId === relation.source.id && path.relationRefs.includes(relation.id)
      && (path.state === 'active' || path.state === 'weakened')) : undefined
    const favorable = actual && (['favorable', 'favorable_auxiliary', 'favorable_priority'].includes(actual.direction)
      || actual.direction === 'favorable_candidate' && Boolean(actual.conditionEvidence?.length))
    const live = actual?.structuralEffect?.currentlyEffective === true
    const policyDamage = snapshot.policyRoles.byeong.find(path => path.targetEntityId === target.entityId
      && path.sourceEntityId === relation.source.id && path.relationFactIds.includes(relation.id))
    const resolution = policyDamage?.currentState === 'inactive' ? snapshot.roleEngine.resolutionPaths.find(
      ({ targetByeongId }) => targetByeongId === policyDamage.id) : undefined
    const source = relation.source.tenGod, affected = relation.target.tenGod

    function emit(semanticType: WorkStudySemantic, mappingId: string, sourceRef: string,
      direction: WorkStudyOutcomeFact['direction'], refs: readonly string[] = [relation!.id]) {
      const study = ['learning', 'formal_learning', 'peer_learning'].includes(target.kind)
      const id = recordId('work-study-outcome', [snapshot!.id, target.targetId, target.entityId, relation!.id, semanticType])
      const participantIds = sortedUnique([relation!.source.id, relation!.target.id,
        ...(resolution && refs.some(ref => resolution.relationRefs.includes(ref) && ref !== relation!.id)
          ? [resolution.remedyEntityId] : [])])
      const effectIds = snapshot!.luckEffectStates.filter(({ event, currentlyEffective }) => currentlyEffective
        && event.evidenceRefs.some(ref => refs.includes(ref))).map(({ event }) => event.id)
      outcomes.set(id, { id, domain: study ? 'study' : 'work', semanticType, target, direction, mappingId,
        certainty: 'conditional', currentlyEffective: time === 'baseline' || time === 'effective',
        temporalStatus: time === 'baseline' ? 'baseline' : time === 'expired' ? 'expired' : time === 'unknown' ? 'undated' : 'current',
        lifecycle: actual?.function === 'reduced' || damage?.state === 'weakened' || branchDamage?.state === 'weakened' ? 'reduced' : 'active',
        scope, scopeId: snapshot!.id, ...(scope !== 'natal' && { period: snapshot!.validity }),
        sourceJudgmentIds: [snapshot!.id, snapshot!.patternContext.id], sourceRelationIds: sortedUnique(refs),
        sourceRoleIds: snapshot!.roleEngine.roleHistory.filter(({ entityId }) => participantIds.includes(entityId)).map(({ roleId }) => roleId),
        sourceLuckEffectIds: sortedUnique(effectIds), sourceParticipantIds: participantIds,
        publicationEvidenceIds: luckPeriodStatus(snapshot!.validity, referenceTime) === 'effective'
          ? sortedUnique([...target.evidenceIds.filter(id => id.trim()),
            ...(semanticType === 'role_acquisition' ? target.opportunityEvidenceIds ?? [] : [])]) : [],
        provenance: [mappingId, 'Master 21', sourceRef],
      })
    }

    if (branch && !actual) {
      if (!branchDamage) continue
      if (branchDamage.damagedFunction === 'branch_officer' && (target.kind === 'existing_role' || target.kind === 'organization')) {
        emit(target.kind === 'organization' ? 'organizational_pressure' : 'work_difficulty', 'OUT-WORK-01',
          '07:L145–146,L821–827,L892–895', 'unfavorable', branchDamage.relationRefs)
      }
      if (branchDamage.damagedFunction === 'branch_officer' && target.kind === 'formal_learning') {
        emit('expression_vs_formal_learning_conflict', 'CL-S03', '07:L892–895,L1429', 'unfavorable', branchDamage.relationRefs)
      }
      if (branchDamage.damagedFunction === 'branch_wealth' && target.kind === 'peer_learning' && scope !== 'sewoon') {
        emit('distraction_pressure', 'CL-S01', '07:L134–144', 'unfavorable', branchDamage.relationRefs)
      }
      continue
    }
    const usefulOutput = live && favorable && isGod(source, 'output') && relation.source.id === target.entityId
      && (relation.action === 'generate' && isGod(affected, 'wealth') || relation.action === 'control' && isGod(affected, 'killing'))
    const resourceSupport = live && favorable && relation.action === 'generate' && relation.target.dayMaster
      && isGod(source, 'resource') && relation.source.id === target.entityId
    const officerDamage = live && damage && isGod(affected, 'officer') && relation.action === 'control'
    if (target.kind === 'work_task' && usefulOutput) {
      emit('work_capacity', 'Master 21:work_capacity', '07:L600–604,L762–774,L1013–1017', 'favorable')
    }
    if ((target.kind === 'existing_role' || target.kind === 'organization') && officerDamage) {
      emit(target.kind === 'organization' ? 'organizational_pressure' : 'work_difficulty',
        'OUT-WORK-01', '07:L145–146,L821–827,L892–895', 'unfavorable')
    }
    if (resolution && (target.kind === 'work_task' || target.kind === 'existing_role')) {
      emit('work_resolution', 'Master 21:work_resolution', '07:L593,L648–653,L1074–1079', 'favorable', [relation.id, ...resolution.relationRefs])
    }
    if (target.kind === 'role_opportunity' && scope !== 'natal' && resolution && isGod(affected, 'officer')
      && target.opportunityEvidenceIds?.some(id => id.trim()) && snapshot.runtime.some(({ entityId, state }) => entityId === target.entityId && state !== 'stopped')) {
      emit('role_acquisition', 'Master 21:role_acquisition', '07:L648–653,L960–963,L1080–1084', 'favorable', [relation.id, ...resolution.relationRefs])
    }
    if (target.kind === 'learning' && (usefulOutput || resourceSupport)) {
      emit(resourceSupport ? 'learning_accumulation' : 'study_capacity', resourceSupport ? 'CL-S02' : 'Master 21:study_capacity',
        '07:L691,L1013–1024,L1424–1427', 'favorable')
    }
    if (target.kind === 'learning' && usefulOutput && relation.action === 'control' && isGod(affected, 'killing')) {
      const capacity = snapshot.capacity
      const residual = snapshot.policyRoles.byeong.find(path => path.policyId === 'killing-pressure-after-protection'
        && path.sourceEntityId === relation.target.id && path.currentState === 'weakened'
        && path.relationFactIds.some(id => snapshot.stemFacts.some(feed => feed.id === id
          && feed.action === 'generate' && feed.target.id === relation.target.id && isGod(feed.source.tenGod, 'wealth'))))
      if (residual && capacity && ['killing_capacity_insufficient', 'output_capacity_insufficient'].includes(capacity.state)) {
        const capacityRelations = capacity.evidenceIds.filter(id =>
          snapshot.stemFacts.some(fact => fact.id === id) || snapshot.branchDamage.relations.some(fact => fact.id === id))
        emit('study_difficulty', 'Master 21:study_difficulty', '07:L1018–1024', 'unfavorable',
          [relation.id, ...residual.relationFactIds, ...capacityRelations])
      }
    }
    if (target.kind === 'learning' && live && damage && isGod(affected, 'resource')) {
      emit('study_difficulty', isGod(source, 'wealth') ? 'CL-S04' : 'CL-S02', '07:L574–577,L610–624,L1427', 'unfavorable')
    }
    if (target.kind === 'learning' && resolution && isGod(affected, 'resource')
      && snapshot.runtime.some(({ entityId, state }) => entityId === target.entityId && state !== 'stopped')) {
      emit('learning_accumulation', 'CL-S02', '07:L619–623,L1424–1427', 'favorable', [relation.id, ...resolution.relationRefs])
    }
    if (target.kind === 'peer_learning' && scope !== 'sewoon' && live && damage && isGod(source, 'peer') && isGod(affected, 'wealth')) {
      emit('distraction_pressure', 'CL-S01', '07:L134–144', 'unfavorable')
    }
    if (target.kind === 'formal_learning' && officerDamage && source === '傷官') {
      emit('expression_vs_formal_learning_conflict', 'CL-S03', '07:L892–895,L1013–1024,L1429', 'unfavorable')
    }
  }
  return [...outcomes.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}
