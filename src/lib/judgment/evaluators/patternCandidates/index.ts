import { evidenceContextSchema } from '../../contracts'
import type { RuntimeStateContract } from '../../contracts'
import type { ExposureFact } from '../../facts/exposureFact'
import { detach, recordId, sortedUnique } from '../../producers/shared'
import type { ValueStatus } from '../../../canonical/types'
import type { ProducedFact } from '../../producers/types'
import { patternCandidateSchema, tenGodSchema } from './types'
import type { PatternCandidate, PatternCandidateInput } from './types'
export * from './types'

type Component = PatternCandidate['basis']['components'][number]
const peer = (value: string) => value === '比肩' || value === '劫財'
// The paired supplied ten gods denote one element relative to the same day stem.
const elementGroup = (tenGod: Component['tenGod']) => ['比肩劫財', '食神傷官', '偏財正財', '偏官正官', '偏印印綬'].find((pair) => pair.includes(tenGod))!
const available = (fact: { assessment: string } | undefined) => fact && ['confirmed', 'provisional'].includes(fact.assessment)

/** Consumes supplied observations. Does not calculate hidden stems, ten gods, exposure, roots or combinations. */
export function evaluatePatternCandidates(input: PatternCandidateInput) {
  const { producer, derived, natalCombination: natal, context } = input
  if (context.stage !== 'natal' || derived.scopeId !== context.scopeId
    || natal.sourceScope !== 'natal' || natal.provenance.producerSnapshotIdentity !== context.producerSnapshotIdentity
    || JSON.stringify(natal.provenance.producerRef) !== JSON.stringify(producer.producerRef)) {
    throw new TypeError('Matching natal fact and combination context required')
  }
  const evidenceRecords = new Map<string, typeof derived.evidence.records[number]>()
  for (const record of [...derived.evidence.records, ...natal.bundle.evidence.records]) {
    const existing = evidenceRecords.get(record.evidenceId)
    if (existing && JSON.stringify(detach(existing)) !== JSON.stringify(detach(record))) {
      throw new TypeError('Conflicting evidence identity across fact handoff')
    }
    evidenceRecords.set(record.evidenceId, record)
  }
  if (new Set(natal.states.map((s) => s.targetEntityId)).size !== natal.states.length
    || natal.states.some((s) => s.scopeId !== context.scopeId)) throw new TypeError('Ambiguous natal functional states')
  const evidence = evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: recordId('pattern-candidate-evidence', [context.scopeId]),
    records: [...evidenceRecords.values()]
      .sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) })
  const ruleEvidence = evidence.records.find((e) => e.sourceRef.kind === 'source-document'
    && e.sourceRef.document.documentId === 'A' && e.documentRevision === 179
    && e.sourceRef.document.section.includes('A-8'))
  if (!ruleEvidence) throw new TypeError('A179 rule evidence required')
  if (derived.authority.hiddenStemSystemId !== 'filune-a179') throw new TypeError('Document hidden-stem authority required')
  const metadata = new Map<string, { assessment?: ValueStatus; evidenceIds: string[]; uncertaintyIds: string[] }>()
  for (const fact of [...producer.facts, ...derived.hiddenObservations, ...derived.exposures, ...derived.roots]) {
    if (metadata.has(fact.id)) throw new TypeError('Duplicate input fact ID')
    metadata.set(fact.id, fact)
  }
  for (const state of natal.states) metadata.set(state.stateId, state)
  for (const relation of natal.relations) metadata.set(relation.relationFactId, relation)
  const entities = producer.entities.filter((e) => e.origin === 'natal' && e.sourceScope === 'natal' && context.includedEntityIds.includes(e.entityId))
  const month = entities.find((e) => e.position === 'month' && e.part === 'branch')
  const branchFact = month && producer.facts.find((f) => f.id === month.canonicalFactRef)
  const observations = derived.hiddenObservations.filter((h) => h.branchEntityId === month?.entityId && h.sourceScope === 'natal')
  const main = observations.find((h) => h.role === 'main')
  const entry = derived.authority.entries.find((e) => e.branch === month?.value)
  const relevant = [...observations, ...derived.exposures.filter((f) => f.sourceBranchEntityId === month?.entityId),
    ...derived.roots.filter((f) => f.rootBranchEntityId === month?.entityId)]
  for (const fact of relevant) {
    if (fact.scopeId !== context.scopeId || fact.hiddenStemSystemId !== 'filune-a179'
      || JSON.stringify(fact.provenance.producerRef) !== JSON.stringify(producer.producerRef)) {
      throw new TypeError('Monthly derived fact lineage mismatch')
    }
  }
  const candidates: PatternCandidate[] = []
  function add(patternType: PatternCandidate['patternType'], status: PatternCandidate['status'], components: Component[],
    reasons: string[], ruleIds: PatternCandidate['sourceRuleIds'], conflicts: string[] = [], extra: string[] = []) {
    const exposureIds = sortedUnique(components.flatMap((c) => c.exposureFactIds))
    const stemIds = sortedUnique(components.flatMap((c) => c.stemEntityIds))
    const states = natal.states.filter((s) => stemIds.includes(s.targetEntityId)).sort((a, b) => a.stateId.localeCompare(b.stateId))
    const stopped = states.filter((s) => s.functionalState === 'stopped')
    const relations = natal.events.filter((e) => e.stopping && e.participantEntityIds.some((id) => stopped.some((s) => s.targetEntityId === id)))
    const rootIds = derived.roots.filter((r) => r.scopeId === context.scopeId && r.rootScope === 'natal'
      && r.rootBranchEntityId === month?.entityId && stemIds.includes(r.stemEntityId)).map((r) => r.id).sort()
    const supporting = sortedUnique([...(branchFact ? [branchFact.id] : []), ...(main ? [main.id] : []), ...extra,
      ...components.flatMap((c) => [...c.hiddenObservationIds, ...c.tenGodFactIds]), ...exposureIds,
      ...states.map((s) => s.stateId)])
    const conflicting = sortedUnique([...conflicts, ...stopped.map((s) => s.stateId), ...relations.map((r) => r.relationFactId)])
    const referenced = sortedUnique([...supporting, ...conflicting, ...rootIds])
    if (referenced.some((id) => !metadata.has(id))) throw new TypeError('Candidate references unavailable input fact')
    const records = referenced.map((id) => metadata.get(id)!)
    const ids = sortedUnique([ruleEvidence!.evidenceId, ...records.flatMap((r) => r.evidenceIds)])
    if (ids.some((id) => !evidence.records.some((r) => r.evidenceId === id))) throw new TypeError('Candidate evidence missing')
    candidates.push(patternCandidateSchema.parse({ candidateId: recordId('pattern-candidate', [context.scopeId, patternType,
      ...components.map((c) => c.tenGod), ...exposureIds]), patternType, status,
      basis: { monthBranchEntityId: month?.entityId ?? null, mainHiddenObservationId: main?.id ?? null, components,
        rootFactIds: rootIds, runtimeStates: states, combinationRelationFactIds: relations.map((e) => e.relationFactId).sort(),
        classificationRetainedAfterStop: stopped.length > 0,
        reasons: [...reasons, ...(stopped.length ? ['I-02a:exposure-classification-retained-current-function-stopped'] : [])] },
      supportingFactIds: supporting, conflictingFactIds: conflicting,
      sourceRuleIds: sortedUnique([...ruleIds, ...(stopped.length ? ['I-02a' as const] : [])]), evidenceIds: ids,
      inputAssessments: referenced.map((inputId) => {
        const fact = metadata.get(inputId)!
        return { inputId, assessment: fact.assessment ?? null, evidenceIds: [...fact.evidenceIds], uncertaintyIds: [...fact.uncertaintyIds] }
      }),
      evidenceAssessments: ids.map((evidenceId) => {
        const record = evidence.records.find((r) => r.evidenceId === evidenceId)!
        return { evidenceId, assessment: record.status, sourceType: record.sourceType, uncertaintyIds: [...record.uncertaintyIds] }
      }),
      uncertaintyIds: sortedUnique([...context.uncertaintyIds, ...records.flatMap((r) => r.uncertaintyIds),
        ...ids.flatMap((id) => evidence.records.find((r) => r.evidenceId === id)!.uncertaintyIds),
        ...(status === 'deferred' ? reasons : [])]), sourceScope: 'natal', scopeId: context.scopeId,
      hiddenStemSystemId: 'filune-a179', provenance: { producerRef: producer.producerRef, ruleVersion: 'A179',
        sourceDocument: { documentId: 'A', documentRevision: 179, path: 'src/docs/source/A_rev179.md', section: 'A-8-1', location: 'I-01 / I-02 / I-02a / C-10' },
        sourceDerivedScopeId: derived.scopeId, method: 'supplied-facts-only-pattern-candidates' } }))
  }
  const finish = () => detach({ scopeId: context.scopeId, sourceScope: 'natal' as const,
    candidates: candidates.sort((a, b) => a.candidateId.localeCompare(b.candidateId)), evidence, roleStates: [] })
  if (!month || !available(branchFact) || !main || !available(main) || entry?.completeness !== 'complete'
    || observations.length !== Object.keys(entry.roles).length
    || observations.some((h) => !h.role || entry.roles[h.role] !== h.hiddenStem)) {
    add('미정', 'deferred', [], ['month-command-or-complete-documented-hidden-facts-unavailable'], ['I-01', 'C-10'])
    return finish()
  }
  // Read projected ten-god facts ONLY after authority membership/role has been supplied.
  // Legacy rows can supply an existing ten-god value but cannot create a hidden stem or role.
  function hiddenTenGod(observation: typeof main): ProducedFact | undefined {
    if (!observation) return undefined
    const hits = producer.facts.filter((f) => /^\/chart\/basicRelations\/month\/value\/relationships\/hiddenStems\/\d+\/stem$/.test(f.canonicalPointer)
      && f.value === observation.hiddenStem && available(f))
    for (const stemFact of hits) {
      const prefix = stemFact.canonicalPointer.slice(0, -5)
      const roleFact = producer.facts.find((f) => f.canonicalPointer === prefix + '/role')
      const tenGodFact = producer.facts.find((f) => f.canonicalPointer === prefix + '/tenGod')
      if (available(roleFact) && roleFact?.value === observation.role && available(tenGodFact) && tenGodSchema.is(tenGodFact?.value)) return tenGodFact
    }
    return undefined
  }
  const mainTenGod = hiddenTenGod(main)
  if (!mainTenGod || !tenGodSchema.is(mainTenGod.value)) {
    add('미정', 'deferred', [], ['month-main-ten-god-fact-unavailable'], ['I-01', 'C-10']); return finish()
  }
  const base: Component = { tenGod: mainTenGod.value, hiddenObservationIds: [main.id], stemEntityIds: [], exposureFactIds: [], tenGodFactIds: [mainTenGod.id] }
  if (peer(base.tenGod)) {
    add('비겁월특수', 'deferred', [base], ['peer-month-special-provisions-require-separate-evaluation'], ['I-01', 'I-02', 'C-10'])
    return finish()
  }
  add('월령본기격', 'candidate', [base], ['I-01:month-main-centered-basic-pattern-only'], ['I-01', 'C-10'])
  const visible = entities.filter((e) => e.part === 'stem' && e.position !== 'day')
  const monthExposures = derived.exposures.filter((e) => e.sourceBranchEntityId === month.entityId && e.sourceBranchScope === 'natal'
    && e.sourceScope === 'natal' && e.scopeId === context.scopeId && e.monthCommand && !e.dayStemExcluded)
  const usable: { component: Component; exposure: ExposureFact; state?: RuntimeStateContract }[] = []
  const missing: string[] = []
  for (const observation of observations) for (const stem of visible) {
    const found = monthExposures.filter((e) => e.stemEntityId === stem.entityId && e.hiddenStem === observation.hiddenStem && e.hiddenStemRole === observation.role)
    if (found.length !== 1 || found[0].exposed === null || !available(found[0])) { missing.push('month-exposure-coverage-unavailable'); continue }
    const exposure = found[0]
    // Never infer exposure again from stems, roots or sameElementVisible.
    if (!exposure.exposed) continue
    // A non-main role may share the main element (e.g. 午 丙/丁). The supplied main exposure
    // already establishes its main-element classification; do not create a spurious 변격.
    if (observation.role !== 'main' && monthExposures.some((e) => e.stemEntityId === stem.entityId
      && e.hiddenStemRole === 'main' && e.exposed === true)) continue
    const fact = producer.facts.find((f) => f.canonicalPointer === `/chart/basicRelations/${stem.position}/value/stemTenGod`)
    if (!available(fact) || !tenGodSchema.is(fact?.value)) { missing.push('visible-ten-god-fact-unavailable'); continue }
    const component: Component = { tenGod: fact.value, hiddenObservationIds: [observation.id], stemEntityIds: [stem.entityId],
      exposureFactIds: [exposure.id], tenGodFactIds: [fact.id] }
    const state = natal.states.find((s) => s.targetEntityId === stem.entityId && s.scopeId === context.scopeId)
    if (peer(component.tenGod)) {
      add(observation.role === 'main' ? '정격' : '변격', 'rejected', [component], ['I-02:peer-exposure-is-not-independent-pattern-component'], ['I-02', 'C-10'])
    } else usable.push({ component, exposure, state })
  }
  if (visible.length !== 3) missing.push('three-natal-visible-stem-facts-required')
  if (natal.status !== 'evaluated' || context.periodSelectionStatus !== 'confirmed'
    || usable.some((item) => !item.state || item.state.functionalState === 'unknown')) missing.push('natal-functional-state-unavailable')
  if (missing.length) {
    add('미정', 'deferred', usable.map((u) => u.component), sortedUnique(missing), ['I-02', 'I-02a', 'C-10'])
    return finish()
  }
  for (const item of usable) {
    const others = usable.filter((u) => elementGroup(u.component.tenGod) !== elementGroup(item.component.tenGod)).map((u) => u.exposure.id)
    add(item.exposure.hiddenStemRole === 'main' ? '정격' : '변격', 'candidate', [item.component],
      [item.exposure.hiddenStemRole === 'main' ? 'I-02:main-element-exposure' : 'I-02:non-main-element-exposure-review'],
      ['I-02', 'I-02a', 'C-10'], others)
  }
  if (new Set(usable.map((u) => elementGroup(u.component.tenGod))).size > 1) {
    add('겸격', 'candidate', usable.map((u) => u.component), ['I-02:multiple-month-hidden-elements-exposed-review-only'], ['I-02', 'I-02a', 'C-10'])
  }
  if (!usable.length) add('미정', 'deferred', [base], ['no-independent-exposure-potential-pattern-treatment-not-supplied'], ['I-01', 'I-02', 'C-10'])
  return finish()
}
