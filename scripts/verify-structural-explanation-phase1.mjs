import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })

try {
  const { buildStructuralExplanationUnits } = await server.ssrLoadModule('/src/lib/reading/structuralExplanation.ts')
  const period = { periodId: 'EX-period', from: { kind: 'exact', instant: '2026-01-01T00:00:00.000Z' },
    to: { kind: 'exact', instant: '2027-01-01T00:00:00.000Z' } }
  const relation = (id, action, sourceId, sourceGod, targetId, targetGod) => ({ id, action,
    source: { id: sourceId, stem: '甲', scope: 'natal', position: 'year', tenGod: sourceGod, dayMaster: false },
    target: { id: targetId, stem: '乙', scope: 'natal', position: 'day', tenGod: targetGod, dayMaster: false } })
  const relations = [
    relation('R-food-wealth', 'generate', 'food', '食神', 'wealth', '正財'),
    relation('R-wealth-killing', 'generate', 'wealth', '正財', 'killing', '七殺'),
    relation('R-food-killing', 'control', 'food', '食神', 'killing', '七殺'),
    relation('R-wealth-resource', 'control', 'wealth', '正財', 'resource', '正印'),
    relation('R-peer-wealth', 'control', 'peer', '比肩', 'wealth', '正財'),
  ]
  const actual = (id, direction = 'favorable', fn = 'operating', extra = {}) => ({
    relationFactId: id, patternContextId: 'PC-EX', policyId: `POL-${id}`, ruleId: `RULE-${id}`,
    direction, evidenceStatus: 'SOURCE_EXPLICIT', matchedPolicies: [], selectedPolicy: `POL-${id}`,
    selectionReason: 'specific_conditions', byeongCandidate: direction === 'unfavorable', runtimeEvidence: [],
    rootEvidence: [], formationEvidence: [], function: fn, ...extra,
  })
  const makeSnapshot = ({ id = 'J-EX', stemFacts = relations, branchFacts = [], formationBranchPool = [], actualFunctions, roles = [], history = [], effects = [], byeong = [] } = {}) => ({
    id, scope: 'natal', validity: period, stemFacts, patternFacts: [], branchFacts, formationFacts: [],
    formationBranchPool, actualFunctions: actualFunctions ?? stemFacts.map(item => actual(item.id)),
    roleEngine: { currentRoles: roles, roleHistory: history },
    policyRoles: { sangShen: [], byeong, guEung: [] },
    luckEffectStates: effects,
  })
  const base = { domain: 'money', scope: 'natal', scopeId: 'J-EX', certainty: 'confirmed', lifecycle: 'active',
    currentlyEffective: true, temporalStatus: 'baseline', period, sourceJudgmentIds: ['J-EX'], sourceRoleIds: [],
    sourceLuckEffectIds: [], sourceParticipantIds: [], provenance: ['OUT-MONEY-01', '07:L1256'],
    semanticType: 'money_acquisition', result: 'can_earn', conditionId: 'EX-condition', wealthEntityId: 'wealth', direction: 'favorable' }

  // EX-01: source-backed 食神 → 財 production path.
  const ex01 = buildStructuralExplanationUnits([{ ...base, id: 'EX-01', sourceRelationIds: ['R-food-wealth'] }], [makeSnapshot()])[0]
  assert.equal(ex01.direction, 'favorable')
  assert.deepEqual(ex01.primaryCauseRefs, ['R-food-wealth'])
  assert(ex01.functionalChanges.some(item => item.relationId === 'R-food-wealth' && item.actualEffect === 'operating'))
  assert(ex01.provenanceIds.includes('J-EX') && ex01.provenanceIds.includes('RULE-R-food-wealth'))

  // EX-02: damaging 財→印 plus explicit protective evidence on 比劫→財.
  const protection = actual('R-peer-wealth', 'favorable', 'reduced', { structuralEffect: {
    originScope: 'natal', relationOriginFactId: 'R-peer-wealth', inherited: false, currentlyEffective: true,
    blockedBy: { kind: 'active_protection', protectorId: 'peer', evidenceRefs: ['R-peer-wealth', 'R-wealth-resource'] },
  } })
  const ex02Outcome = { ...base, id: 'EX-02', semanticType: 'money_related_problem', result: 'wealth_can_weaken_needed_support',
    direction: 'unfavorable', sourceRelationIds: ['R-wealth-resource', 'R-peer-wealth'],
    provenance: ['OUT-MONEY-04', 'Judgment:HO-06'] }
  const ex02 = buildStructuralExplanationUnits([ex02Outcome], [makeSnapshot({ actualFunctions: relations.map(item =>
    item.id === 'R-peer-wealth' ? protection : actual(item.id)) })])[0]
  assert.deepEqual(ex02.primaryCauseRefs, ['R-peer-wealth', 'R-wealth-resource'])
  assert(ex02.functionalChanges.some(item => item.relationId === 'R-peer-wealth' && item.protectionRefs.includes('R-wealth-resource')))

  // EX-03: connected three-path graph stays three separately addressable relations.
  const ex03 = buildStructuralExplanationUnits([{ ...base, id: 'EX-03', sourceRelationIds: ['R-food-wealth'] }],
    [makeSnapshot({ actualFunctions: [actual('R-food-wealth', 'favorable'), actual('R-wealth-killing', 'unfavorable'),
      actual('R-food-killing', 'favorable')] })])[0]
  assert.deepEqual(ex03.causePaths.map(item => item.relationIds[0]).sort(), ['R-food-killing', 'R-food-wealth', 'R-wealth-killing'])
  assert.deepEqual(ex03.competingCauseRefs, ['R-wealth-killing'])
  assert.deepEqual(ex03.supportingCauseRefs, ['R-food-killing'])

  // EX-04: only approved relationship-formation provenance plus the palace relation permits candidate attribution.
  const palace = { id: 'PALACE-DAY', scope: 'natal', branch: '卯' }
  const branchRelation = { id: 'BR-PALACE', kind: 'six_combination', participants: ['PALACE-DAY', 'BR-INCOMING'] }
  const relationship = { id: 'EX-04', domain: 'relationship', semanticType: 'relationship_formation',
    result: 'opportunity_to_form_close_relationship', scope: 'sewoon', scopeId: 'J-EX', period,
    certainty: 'confirmed', lifecycle: 'active', temporalStatus: 'current', currentlyEffective: true,
    sourceJudgmentIds: ['J-EX'], sourceRelationIds: ['BR-PALACE'], sourceRoleIds: [], sourceLuckEffectIds: [],
    sourceParticipantIds: ['PALACE-DAY', 'BR-INCOMING', 'STEM-PARTNER'], provenance: ['A:I-22', 'A:OP-R03'] }
  const partnerPath = relation('R-partner-favorable', 'generate', 'STEM-PARTNER', '正官', 'BR-INCOMING', '正財')
  const partnerActual = actual(partnerPath.id, 'favorable', 'operating', { structuralEffect: {
    originScope: 'natal', relationOriginFactId: partnerPath.id, inherited: false, currentlyEffective: true,
  } })
  const ex04 = buildStructuralExplanationUnits([relationship], [makeSnapshot({ branchFacts: [branchRelation],
    formationBranchPool: [palace], stemFacts: [partnerPath], actualFunctions: [partnerActual], })])[0]
  assert(ex04.palaceAttribution?.sourceIds.includes(partnerPath.id))
  assert(ex04.palaceAttribution?.sourceIds.includes('A:I-22') && ex04.palaceAttribution.sourceIds.includes('A:OP-R03'))
  const palaceOnly = buildStructuralExplanationUnits([{ ...relationship, id: 'EX-04-palace-only', provenance: ['OUT-REL-01'] }],
    [makeSnapshot({ branchFacts: [branchRelation], formationBranchPool: [palace], stemFacts: [partnerPath], actualFunctions: [partnerActual] })])[0]
  assert.equal(palaceOnly.palaceAttribution, undefined)

  // EX-05: relationship source, exact period and its own Outcome ID survive projection.
  const ex05 = buildStructuralExplanationUnits([{ ...relationship, id: 'EX-05', semanticType: 'relationship_pressure',
    result: 'close_relationship_can_face_strain', provenance: ['A:I-15', 'A:OP-R03'], sourceRelationIds: ['R-food-wealth'] }],
    [makeSnapshot()])[0]
  assert.equal(ex05.scope, 'sewoon')
  assert.deepEqual(ex05.period, period)
  assert.equal(ex05.outcomeFactId, 'EX-05')

  // Stable ID, ordering, provenance and deduplication under reversed input order.
  const outcomes = [{ ...base, id: 'EX-01', sourceRelationIds: ['R-food-wealth'] }, ex02Outcome,
    { ...base, id: 'EX-03', sourceRelationIds: ['R-food-wealth'] }]
  const forward = buildStructuralExplanationUnits(outcomes, [makeSnapshot()])
  const reversed = buildStructuralExplanationUnits([...outcomes].reverse(), [makeSnapshot({ stemFacts: [...relations].reverse(),
    actualFunctions: [...relations].reverse().map(item => actual(item.id)) })])
  assert.deepEqual(reversed, forward)
  assert.equal(buildStructuralExplanationUnits([outcomes[0], outcomes[0]], [makeSnapshot()]).length, 1)

  console.log('Structural Explanation Projection Phase 1: 5 fixtures passed; input order invariant; exact duplicate deduped.')
} finally {
  await server.close()
}
