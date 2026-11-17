import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
let checks = 0
const check = (fn) => { fn(); checks++ }
const clone = (value) => JSON.parse(JSON.stringify(value))
try {
  const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
  const r = await load('judgment/runtime/index')
  const p = await load('judgment/producers/index')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { HIDDEN_STEM_ROLE_TABLE } = await load('hiddenStemRoleTable')
  const { calculateTenGod } = await load('dayRelationships')
  const originals = JSON.stringify(HIDDEN_STEM_ROLE_TABLE)
  const birth = { date: { year: 1985, month: 1, day: 4 }, time: { known: true, value: { hour: 9, minute: 0 } }, gender: '男性', timeCorrectionMode: 'none' }
  const calculation = { referenceTime: '2026-06-01T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 }
  const chart = calculateCanonicalChart(birth, calculation)
  const produced = p.produceJudgmentFacts(chart)
  const saved = JSON.stringify(produced)
  const A = await readFile(new URL('../src/docs/source/A_rev179.md', import.meta.url), 'utf8')
  const C = await readFile(new URL('../src/docs/source/C_rev215.md', import.meta.url), 'utf8')
  const D = await readFile(new URL('../src/docs/source/D_rev152.md', import.meta.url), 'utf8')
  const audit = r.auditHiddenStemCompatibility()
  check(() => assert.equal(audit.classification, 'incompatible'))
  check(() => assert.equal(audit.rows.length, 12))
  check(() => assert.deepEqual(audit.rows.filter((row) => row.comparison === 'mismatch').map((row) => row.branch), ['子', '亥']))
  check(() => assert.deepEqual(audit.rows.find((row) => row.branch === '子').extra, ['壬']))
  check(() => assert.deepEqual(audit.rows.find((row) => row.branch === '亥').extra, ['戊']))
  check(() => assert.equal(r.auditHiddenStemCompatibility(['寅', '辰', '戌']).classification, 'compatible'))
  check(() => {
    const unknown = r.auditHiddenStemCompatibility(['酉'])
    assert.equal(unknown.classification, 'compatible-with-metadata')
    assert.equal(unknown.usableAsDocumentDefault, false)
  })
  check(() => assert.equal(JSON.stringify(HIDDEN_STEM_ROLE_TABLE), originals))
  // Compare actual document fact rows, without embedding any CS judgment expectations.
  const ntPillars = new Map(D.split('\n').filter((line) => /^NT-\d+\t/.test(line) && line.split('\t').length === 5)
    .map((line) => { const parts = line.split('\t'); return [parts[0], parts[2].split(' ')] }))
  const tenGodNames = { 比肩: '비견', 劫財: '겁재', 食神: '식신', 傷官: '상관', 偏財: '편재', 正財: '정재', 偏官: '편관', 正官: '정관', 偏印: '편인', 印綬: '정인' }
  const h31 = D.split('H-3-1.')[1].split('H-3-2.')[0]
  check(() => {
    let count = 0
    for (const line of h31.split('\n').filter((line) => /^NT-\d+\t/.test(line))) {
      const [id, hidden] = line.split('\t'), dayStem = ntPillars.get(id)[2][0]
      for (const match of hidden.matchAll(/([甲乙丙丁戊己庚辛壬癸])\s+(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)/g)) {
        assert.equal(tenGodNames[calculateTenGod(dayStem, match[1])], match[2]); count++
      }
    }
    assert.ok(count >= 20)
  })
  check(() => {
    const caseRow = C.split('\n').find((line) => line.startsWith('1 원국·출처\t'))
    const pillars = caseRow.split('\t')[1].split('(')[0].split(' ')
    const branches = pillars.map((pillar) => pillar[1])
    const caseAudit = r.auditHiddenStemCompatibility(branches)
    assert.equal(caseAudit.classification, 'incompatible')
    assert.ok(caseAudit.requiredBranches.includes('子'))
  })
  check(() => {
    for (const row of audit.rows.filter((row) => row.documented)) {
      const documentLine = h31.split('\n').find((line) => line.includes(`${row.branch}:`))
      assert.ok(documentLine, `document fact row exists for ${row.branch}`)
      const stems = [...documentLine.split('\t')[1].matchAll(/([甲乙丙丁戊己庚辛壬癸])\s+(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)/g)].map((match) => match[1])
      assert.deepEqual(row.documented.map((item) => item.stem), stems)
    }
    assert.ok(C.includes('亥 기본 체계에 戊가 없어'))
  })
  function periodAt(sourceScope, instant) {
    const refs = [...new Set(produced.entities.filter((entity) => entity.sourceScope === sourceScope).map((entity) => entity.periodRef))]
    const ref = refs.find((ref) => {
      const period = r.producerPeriod(produced, ref)
      return period.from.kind === 'exact' && period.to.kind === 'exact' && period.from.instant <= instant && instant < period.to.instant
    })
    assert.ok(ref, `test calculation supplies ${sourceScope} at ${instant}`)
    return ref
  }
  const at = calculation.referenceTime
  const greatRef = periodAt('greatLuck', at), yearRef = periodAt('yearlyLuck', at)
  const yearRequest = { executionId: 'synthetic-context-only', stage: 'yearlyLuck', referenceTime: at,
    selectedPeriodRefs: { greatLuck: greatRef, yearlyLuck: yearRef } }
  const year = r.createExecutionScopeContext(produced, yearRequest)
  const great = r.createExecutionScopeContext(produced, { ...yearRequest, stage: 'greatLuck', selectedPeriodRefs: { greatLuck: greatRef } })
  const january = '2027-01-15T00:00:00.000Z'
  const monthRequest = { executionId: 'synthetic-context-only', stage: 'monthlyLuck', referenceTime: january,
    selectedPeriodRefs: { yearlyLuck: periodAt('yearlyLuck', january), monthlyLuck: periodAt('monthlyLuck', january) } }
  const month = r.createExecutionScopeContext(produced, monthRequest)
  check(() => {
    const natal = r.createExecutionScopeContext(produced, { executionId: 'synthetic-natal-inspection', stage: 'natal',
      referenceTime: at, selectedPeriodRefs: {}, natalInspectionPeriod: { periodId: 'declared-inspection-window',
        from: { kind: 'exact', instant: at }, to: { kind: 'exact', instant: '2026-06-02T00:00:00.000Z' } } })
    assert.deepEqual(natal.includedScopes, ['natal'])
    assert.ok(natal.includedEntityIds.every((id) => produced.entities.find((entity) => entity.entityId === id).origin === 'natal'))
  })
  check(() => {
    const natal = r.createExecutionScopeContext(produced, { executionId: 'synthetic-unknown-inspection', stage: 'natal',
      referenceTime: at, selectedPeriodRefs: {}, natalInspectionPeriod: { periodId: 'unknown-window',
        from: { kind: 'unknown', reason: 'not-supplied' }, to: { kind: 'unknown', reason: 'not-supplied' } } })
    assert.equal(natal.periodSelectionStatus, 'unknown')
    assert.equal(r.selectExecutionCandidates(produced, natal).status, 'deferred')
    assert.deepEqual(r.selectExecutionCandidates(produced, natal).relations, [])
  })
  check(() => assert.deepEqual(year, r.createExecutionScopeContext(produced, clone(yearRequest))))
  check(() => assert.deepEqual(month.includedScopes, ['natal', 'yearlyLuck', 'monthlyLuck']))
  check(() => assert.deepEqual(month.excludedScopes, ['greatLuck']))
  check(() => assert.ok(month.excludedEntityIds.some((id) => produced.entities.find((entity) => entity.entityId === id)?.sourceScope === 'greatLuck')))
  check(() => {
    const selected = r.selectExecutionCandidates(produced, month)
    assert.equal(selected.status, 'selected')
    assert.ok(selected.relations.length > 0)
    assert.ok(selected.relations.every((fact) => fact.participantEntityIds.every((id) => month.includedEntityIds.includes(id))))
    assert.ok(selected.relations.every((fact) => fact.participantEntityIds.every((id) => produced.entities.find((entity) => entity.entityId === id).sourceScope !== 'greatLuck')))
  })
  check(() => assert.throws(() => r.createExecutionScopeContext(produced, { ...monthRequest,
    selectedPeriodRefs: { ...monthRequest.selectedPeriodRefs, greatLuck: greatRef } }), /Excluded/))
  check(() => assert.throws(() => r.createExecutionScopeContext(produced, { ...yearRequest, selectedPeriodRefs: {} }), /required/))
  check(() => assert.throws(() => r.createExecutionScopeContext(produced, { ...monthRequest,
    selectedPeriodRefs: { ...monthRequest.selectedPeriodRefs, yearlyLuck: periodAt('yearlyLuck', '2027-03-01T00:00:00.000Z') } }), /excludes/))
  check(() => {
    const ref = month.selectedPeriodRefs.yearlyLuck.slice('canonical-period:'.length)
    assert.equal(produced.facts.find((fact) => fact.canonicalPointer === `${ref}/year`).value, 2026)
  })
  check(() => {
    const altered = clone(month); altered.includedEntityIds.push(produced.entities.find((entity) => entity.origin === 'great').entityId)
    assert.throws(() => r.selectExecutionCandidates(produced, altered), /altered/)
  })
  const empty = r.adaptCarryContext(produced, month)
  check(() => { assert.equal(empty.status, 'empty'); assert.deepEqual(empty.carry.entries, []); assert.deepEqual(empty.incoming, []) })

  // Synthetic upstream state for adapter integrity only; no CS role or rule outcome is inferred.
  const byId = new Map(produced.entities.map((entity) => [entity.entityId, entity]))
  const relation = r.selectExecutionCandidates(produced, great).relations.find((fact) => fact.kind.startsWith('stem-')
    && fact.participantEntityIds.some((id) => byId.get(id).origin === 'natal')
    && fact.participantEntityIds.some((id) => byId.get(id).origin === 'great'))
  assert.ok(relation)
  const natalEntityId = relation.participantEntityIds.find((id) => byId.get(id).origin === 'natal')
  const luckEntityId = relation.participantEntityIds.find((id) => byId.get(id).origin === 'great')
  const application = { applicationId: 'synthetic-upstream-app', executionId: 'synthetic-context-only',
    scopeId: great.scopeId, ruleId: 'TEST-UPSTREAM-REFERENCE', ruleVersion: 'test-1' }
  const validity = great.effectivePeriod
  const evidenceIds = ['producer-evidence:canonical-projection']
  const sourceState = { contractVersion: '1', stateId: 'synthetic-upstream-state', targetEntityId: natalEntityId,
    scopeId: great.scopeId, functionalState: 'stopped', originMode: 'local', transition: 'established',
    causingApplicationRefs: [application], evidenceIds, uncertaintyIds: [], validity }
  const entry = { carryEntryId: 'synthetic-carry-entry', changeId: 'synthetic-change', natalEntityId,
    sourceStage: 'great', sourceScopeId: great.scopeId, sourceSnapshotRef: 'synthetic-snapshot', sourceStateRef: sourceState.stateId,
    causedByRuleIds: [application.ruleId], causedByApplicationRefs: [application], validity,
    inheritedIntoScopeId: year.scopeId, inheritedThrough: [], evidenceIds, uncertaintyIds: [] }
  const scopeEntities = [...new Set([...great.includedEntityIds, ...year.includedEntityIds])]
  const entities = scopeEntities.map((id) => {
    const { entityId, origin, part, canonicalFactRef, position, periodRef } = byId.get(id)
    return { entityId, origin, part, canonicalFactRef, ...(position ? { position } : {}), ...(periodRef ? { periodRef } : {}) }
  })
  const rawCoverage = produced.coverage.find((item) => item.coverageId === relation.coverageRef)
  const survey = { ...clone(rawCoverage), coverageId: 'synthetic-bound-coverage', scopeId: great.scopeId,
    universeEntityIds: relation.participantEntityIds, investigatedParticipantSets: [relation.participantEntityIds] }
  const boundRelation = { ...clone(relation), scopeId: great.scopeId, coverageRef: survey.coverageId, relationFactId: 'synthetic-bound-relation' }
  const upstream = { purpose: 'runtime-input', factIds: produced.facts.map((fact) => fact.id), structureIds: [], entities,
    scopes: [r.asContractScope(great, evidenceIds), { ...r.asContractScope(year, evidenceIds), inheritedChangeIds: [entry.changeId] }],
    periods: [...new Map([great.effectivePeriod, year.effectivePeriod].map((period) => [period.periodId, period])).values()],
    applications: [application], hiddenStemSystems: [], hiddenStemEntries: [], relations: [boundRelation], coverage: [survey],
    states: [sourceState], roles: [], evidence: produced.evidence,
    carry: { contractVersion: '1', carryStateId: 'synthetic-carry', entries: [entry],
      processedRelationRecords: [{ processingId: 'synthetic-processing', sourceScopeId: great.scopeId,
        relationFactRef: boundRelation.relationFactId, applicationRef: application, targetNatalEntityIds: [natalEntityId],
        affectedLuckEntityIds: [luckEntityId], effectClass: 'natal-change', sourcePeriodRef: validity.periodId, evidenceIds }],
      snapshots: [{ snapshotId: entry.sourceSnapshotRef, scopeId: great.scopeId, stage: 'great', natalStructureRefs: [],
        natalInternalStateRefs: [], inheritedNatalChangeRefs: [], currentLuckPairApplicationRefs: [],
        currentLuckNatalApplicationRefs: [application.applicationId], outgoingCarryEntryRefs: [entry.carryEntryId] }],
      consumedAtStage: [{ scopeId: year.scopeId, changeId: entry.changeId, consumptionRef: 'synthetic-consumption', sourceApplicationRef: application.applicationId }],
      priorProcessingRefs: [] } }
  check(() => assert.throws(() => r.adaptCarryContext(produced, year, { producerSnapshotIdentity: 'another-snapshot', bundle: upstream }), /snapshot/))
  const beforeUpstream = JSON.stringify(upstream)
  const supplied = { producerSnapshotIdentity: year.producerSnapshotIdentity, bundle: upstream }
  const carried = r.adaptCarryContext(produced, year, supplied)
  check(() => { assert.equal(carried.status, 'upstream-supplied'); assert.deepEqual(carried.carry, upstream.carry) })
  check(() => { assert.equal(carried.incoming[0].sourceStateId, sourceState.stateId); assert.equal(carried.incoming[0].provenance.kind, 'inherited') })
  check(() => { assert.deepEqual(carried.incoming[0].causedByRuleIds, [application.ruleId]); assert.equal(JSON.stringify(upstream), beforeUpstream) })
  check(() => {
    const bad = clone(upstream), repeated = { ...clone(entry), carryEntryId: 'wrapped', changeId: 'wrapped-change' }
    bad.carry.entries.push(repeated); bad.scopes[1].inheritedChangeIds.push(repeated.changeId)
    bad.carry.consumedAtStage.push({ ...clone(bad.carry.consumedAtStage[0]), consumptionRef: 'wrapped-consumption', changeId: repeated.changeId })
    assert.throws(() => r.adaptCarryContext(produced, year, { producerSnapshotIdentity: year.producerSnapshotIdentity, bundle: bad }), /duplicate original state\/provenance/)
  })
  check(() => assert.throws(() => r.adaptCarryContext(produced, month, supplied), /destination/))

  const sourceRecords = [['A', 179, 'A-8', A], ['C', 215, 'C-10', C], ['D', 152, 'H-5', D]].map(([documentId, documentRevision, section, content]) =>
    r.sourceDocumentEvidence({ documentId, documentRevision, path: `src/docs/source/${documentId}_rev${documentRevision}.md`, section, location: section }, content))
  const evidence = { ...clone(produced.evidence), records: [...clone(produced.evidence.records), ...sourceRecords] }
  const recordIds = evidence.records.map((item) => item.evidenceId)
  check(() => { assert.ok(sourceRecords.every((record) => record.sourceType === 'source-document' && record.status === 'provisional')); assert.equal(sourceRecords.length, 3) })
  check(() => assert.throws(() => r.sourceDocumentEvidence({ documentId: 'A', documentRevision: 180, path: 'A', section: 'A-8', location: 'A-8' }, A), /revision/))
  check(() => {
    const summary = r.evidenceAvailabilitySummary(evidence)
    assert.equal(summary.find((item) => item.sourceType === 'independent-cross-check').count, 0)
    assert.equal(summary.find((item) => item.sourceType === 'operator-confirmed').count, 0)
    assert.equal(summary.find((item) => item.sourceType === 'customer-input').count, 0)
  })
  check(() => {
    for (const rule of ['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-06', 'C-07', 'C-08', 'OP-P02', 'OP-P04']) {
      const availability = r.assessEvidenceAvailability(rule, evidence, recordIds)
      assert.equal(availability.status, 'deferred'); assert.ok(availability.reasons.includes('REQUIRED_INDEPENDENT_CROSS_CHECK_UNAVAILABLE'))
    }
  })
  check(() => assert.equal(r.assessEvidenceAvailability('C-11', evidence, recordIds).status, 'available'))
  check(() => assert.equal(r.assessEvidenceAvailability('C-11', evidence, ['not-supplied']).status, 'deferred'))
  check(() => assert.throws(() => r.ruleEvidenceRequirement('UNKNOWN-RULE'), /mapped/))
  const mapping = await readFile(new URL('../src/docs/rules/implementation-readiness.md', import.meta.url), 'utf8')
  check(() => {
    const expected = mapping.split('\n').find((line) => line.startsWith('C-01, C-02,')).split(', ')
    assert.deepEqual([...r.CS005_CANDIDATE_RULE_IDS].sort(), expected.sort())
    assert.equal(r.CS005_CANDIDATE_RULE_IDS.length, 57)
  })
  check(() => { assert.deepEqual(r.emptyRoleJudgmentOutput().roles, []); assert.equal(r.emptyRoleJudgmentOutput().status, 'not-evaluated'); assert.deepEqual(produced.roleStates, []) })
  check(() => assert.deepEqual(r.ROLE_RULE_BOUNDARIES.map((boundary) => boundary.role), ['격', '용신', '상신', '병', '구응']))
  check(() => assert.equal(JSON.stringify(produced), saved))
  console.log(`Judgment runtime context: ${checks} checks passed; compatibility ${audit.classification}; no role or state judgment generated.`)
} finally { await server.close() }
