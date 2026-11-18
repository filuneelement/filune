import { evidenceRecordSchema, validateContractBundle } from '../contracts'
import type { EvidenceRecord } from '../contracts'
import { damageSourceDependencySchema, guEungEffectSchema } from '../contracts/guEungEffect'
import type { DamageSourceDependency, GuEungEffectFact } from '../contracts/guEungEffect'
import type { GuEungInput } from '../contracts/guEung'
import type { StemCombinationResult } from '../evaluators/stemCombination/types'
import { prepareGuEungBoundary } from '../runtime/guEungBoundary'
import { containsTime, effectEvidence, guEungFactClaim, sameValue } from '../runtime/guEungEffectEvidence'
import { detach, recordId } from './shared'

/** Turns a verified stopping transition and an independent necessary-source dependency into a path effect. */
export function produceStemPathEffects(input: GuEungInput, combination: StemCombinationResult, dependencies: DamageSourceDependency[]) {
  const paths = prepareGuEungBoundary(input).damagePaths
  const effects: GuEungEffectFact[] = []
  const evidence: EvidenceRecord[] = []
  if (!paths.length || combination.status !== 'evaluated') return { effects, evidence }
  if (combination.context.scopeId !== input.scopeId || combination.context.referenceTime !== input.referenceTime) {
    throw new TypeError('stem path effect scope mismatch')
  }
  const bundle = validateContractBundle(combination.bundle)
  const basis = effectEvidence(input.evidence.records)
  for (const path of paths) {
    const matches = dependencies.map((dependency) => damageSourceDependencySchema.parse(dependency)).filter((item) =>
      item.byeongJudgmentId === path.byeongJudgmentId && item.damagePathId === path.damagePathId)
    if (matches.length !== 1) continue
    const dependency = matches[0]
    if (dependency.scopeId !== input.scopeId || dependency.dependency !== 'required'
      || dependency.sourceEntityId !== path.byeongEntityId || dependency.sourceStateRef !== path.runtimeStateRef
      || !sameValue(dependency.producerRef, path.provenance.producerRef)
      || !basis.attested(dependency, dependency.dependencyId, dependency.producerRef)) continue
    const stops = combination.events.filter((event) => event.effect === 'stopping' && event.participantEntityIds.includes(path.byeongEntityId))
    if (stops.length !== 1) continue
    const event = stops[0]
    const relation = bundle.relations.find((item) => item.relationFactId === event.relationFactId)
    if (!relation || relation.scopeId !== input.scopeId || relation.kind !== 'stem-combination'
      || relation.assessment !== 'confirmed' || relation.existence !== 'present' || relation.uncertaintyIds.length
      || !sameValue(relation.producerRef, path.provenance.producerRef)
      || !sameValue([...relation.participantEntityIds].sort(), [...event.participantEntityIds].sort())) continue
    const actor = relation.participantEntityIds.find((id) => id !== path.byeongEntityId)!
    const source = combination.states.find((state) => state.targetEntityId === path.byeongEntityId)
    const candidate = combination.states.find((state) => state.targetEntityId === actor)
    if (!source || !candidate || source.priorStateRef !== path.runtimeStateRef || ![source, candidate].every((state) =>
      state.scopeId === input.scopeId && state.functionalState === 'stopped' && state.originMode === 'local'
      && !state.uncertaintyIds.length && containsTime(state.validity, input.referenceTime)
      && bundle.states.some((registered) => sameValue(registered, state)))) continue
    const application = event.applicationRefs.find((app) => app.ruleId === 'OP-T07'
      && app.scopeId === input.scopeId && event.ruleIds.includes(app.ruleId)
      && bundle.applications.some((registered) => sameValue(registered, app))
      && [source, candidate].every((state) => state.causingApplicationRefs.some((cause) => sameValue(cause, app))))
    const prior = bundle.states.find((state) => state.stateId === path.runtimeStateRef)
    const baseline = input.byeong.judgments.find((item) => item.judgmentId === path.byeongJudgmentId)?.runtimeState
    if (!application || !prior || !sameValue(prior, baseline)
      || !bundle.carry.processedRelationRecords.some((item) => item.sourceScopeId === input.scopeId
        && item.relationFactRef === relation.relationFactId && sameValue(item.applicationRef, application)
        && item.effectClass === 'natal-change' && item.targetNatalEntityIds.includes(source.targetEntityId)
        && item.affectedLuckEntityIds.includes(candidate.targetEntityId))
      || !sameValue(source.validity, candidate.validity)) continue
    const effectId = recordId('stem-path-effect', [input.scopeId, path.byeongJudgmentId, path.damagePathId, actor, application.applicationId])
    const producerRef = { producerId: 'filune-stem-path-effect', version: '1', sourceRef: 'stemPathEffectProducer',
      inputFactIds: [dependency.dependencyId, relation.relationFactId, source.stateId, candidate.stateId] }
    const receiptId = recordId('stem-path-effect-receipt', [effectId])
    const fact = guEungEffectSchema.parse({ contractVersion: '1', effectId, scopeId: input.scopeId, candidateEntityId: actor,
      byeongJudgmentId: path.byeongJudgmentId, damagePathId: path.damagePathId, effectType: 'complete-relief',
      sourceMechanism: 'stem-combination', target: 'byeong-source', targetEntityId: path.byeongEntityId,
      relationFactIds: [relation.relationFactId], runtimeStateRefs: [source.stateId, candidate.stateId], ruleIds: [application.ruleId],
      evidenceIds: [receiptId], provenance: { producerRef, ruleVersion: application.ruleVersion, causeEntityId: actor, attribution: 'individual' },
      coverage: 'complete', effectivePeriod: source.validity })
    evidence.push(evidenceRecordSchema.parse({ evidenceId: receiptId, sourceType: 'deterministic-calculation', documentRevision: null,
      sourceRef: { kind: 'deterministic-calculation', producer: producerRef, outputRefs: [effectId], timePolicyRef: 'OP-L01' },
      ruleId: application.ruleId, status: 'confirmed', usage: 'runtime-evidence', uncertaintyIds: [], note: 'Verified stopping event and necessary path dependency.',
      verification: { claimRef: guEungFactClaim(fact), method: 'stopping-and-necessary-source', checkedByRef: producerRef.sourceRef,
        basisEvidenceIds: dependency.evidenceIds } }))
    effects.push(fact)
  }
  return detach({ effects, evidence })
}
