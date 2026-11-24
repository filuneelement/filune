import { hasBehaviorStages } from './customer/behaviorLoops'
import { uniqueIds } from './semanticUnit'
import type { NatalPersonalityResult, PersonalityFact } from '../personality/types'

type Gap = 'KNOWLEDGE_GAP' | 'ADAPTER_GAP' | 'ASSEMBLY_GAP' | 'SOURCE_GAP' | 'NOT_APPLICABLE'
type SlotEvidence = {
  readonly sourcePersonalityFactIds: readonly string[]
  readonly evidenceIds: readonly string[]
  readonly sourceConflictIds: readonly string[]
  readonly status: 'covered' | 'candidate' | Gap
}

// Explicit source-backed tags for fields whose trait type is broader than the slot.
const information = new Set(['학습', '정보를 비판적으로 선별함', '집단에 적응하면서도 필요하면 새로운 방식으로 움직이는 편'])
const problemSolving = new Set(['분석력', '위기 돌파', '위기 돌파 지향', '결과에 집중하며 난관을 돌파함',
  '기존 방식에 얽매이지 않고 새로운 방식을 적용함', '다른 분야의 아이디어를 결합함'])
const collaboration = new Set(['협동', '다른 사람을 돕고 협력하며 그 안에서 자신의 역량을 발휘할 길을 찾음',
  '치열하게 경쟁하거나 동료와 강하게 연대함'])
const documentedConsequences = new Set([
  '검토가 길어지면 시도하기 전에 스스로 포기할 수 있음',
  '빠른 결단이 성급해지면 실수가 늘어날 수 있음',
  '버팀을 뒷받침할 여유가 부족할 때 책임 부담에 쉽게 지침',
])
const overuse = new Set([
  '빠른 결단이 성급해지면 실수가 늘어날 수 있음',
  '자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함',
])

export function projectNatalPersonalityChapters(natal: Readonly<NatalPersonalityResult>, unknownHour: boolean) {
  const provenance = new Map(natal.provenance.map(item => [item.id, item]))
  const facts = natal.facts.filter(fact => fact.status !== 'deferred'
    && (!unknownHour || !fact.sourcePosition?.startsWith('hour_'))
    && fact.provenanceIds.some(id => {
      const record = provenance.get(id)
      return record?.sourceType === fact.sourceType && record.sourceRefs.length > 0
    }))
  const byId = new Map(facts.map(fact => [fact.id, fact]))
  const byType = (...types: PersonalityFact['traitType'][]) => facts.filter(fact => types.includes(fact.traitType))
  const tagged = (terms: Set<string>, ...types: PersonalityFact['traitType'][]) =>
    byType(...types).filter(fact => terms.has(fact.trait))
  function slot(items: readonly PersonalityFact[], fallback: Gap, candidate = false,
    conflictIds: readonly string[] = []): SlotEvidence {
    return {
      status: items.length ? candidate ? 'candidate' : 'covered' : fallback,
      sourcePersonalityFactIds: uniqueIds(items.map(fact => fact.id)),
      evidenceIds: uniqueIds(items.flatMap(fact => fact.provenanceIds.filter(id => provenance.get(id)?.sourceRefs.length))),
      sourceConflictIds: uniqueIds(conflictIds),
    }
  }
  const conflicts = [...natal.conflicts, ...natal.roleConflicts].filter(conflict =>
    conflict.resolution !== 'deferred' && conflict.factIds.length > 1 && conflict.factIds.every(id => byId.has(id)))
  const strengths = byType('strength')
  // A second trait from the same profile does not establish a second independent mechanism.
  const strengthGroups = new Set(strengths.flatMap(fact => fact.provenanceIds.flatMap(id => {
    const record = provenance.get(id)
    return record?.sourceRefs.length && record.sourceType === fact.sourceType
      ? [`${record.sourceType}:${record.profileId}`] : []
  })))
  const behavior = byType('stress', 'shadow', 'strength').filter(fact => hasBehaviorStages(fact.trait))
  const outwardPositions = new Set(natal.positionExpressions.filter(item => item.expressionMode === 'outward')
    .map(item => item.position))
  return {
    'CR-01': {
      coreNature: slot(byType('core').filter(fact => fact.sourceType !== 'ten_god'), 'KNOWLEDGE_GAP'),
      externalExpression: slot(byType('social', 'expression').filter(fact => fact.sourceType !== 'ten_god'
        || (fact.sourcePosition && fact.sourcePosition !== 'day_stem' && outwardPositions.has(fact.sourcePosition))), 'KNOWLEDGE_GAP'),
      internalDecisionStyle: slot(byType('decision'), 'KNOWLEDGE_GAP'),
      practicalDecision: slot(byType('decision').filter(fact => fact.trait === '실리를 따져 신속하게 판단함'), 'NOT_APPLICABLE'),
      judgmentBoundary: slot(byType('shadow').filter(fact => fact.trait === '자기 판단을 유일한 기준으로 삼기 쉬움'
        || fact.trait === '자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함'), 'NOT_APPLICABLE'),
      informationAdaptationStyle: slot(tagged(information, 'strength', 'inner', 'expression'), 'KNOWLEDGE_GAP'),
      relationshipSocialExpression: slot(byType('interpersonal', 'social'), 'KNOWLEDGE_GAP'),
      stressResponse: slot(byType('stress'), 'KNOWLEDGE_GAP'),
      internalContradiction: slot(conflicts.flatMap(conflict => conflict.factIds.map(id => byId.get(id)!)),
        'NOT_APPLICABLE', false, conflicts.map(conflict => conflict.id)),
    },
    'CR-02': {
      primaryStrength: slot(strengths, 'KNOWLEDGE_GAP', true),
      secondaryStrength: slot(strengthGroups.size > 1 ? strengths : [], 'SOURCE_GAP', true),
      problemSolving: slot(tagged(problemSolving, 'strength', 'work'), 'KNOWLEDGE_GAP'),
      socialCollaboration: slot(tagged(collaboration, 'strength', 'interpersonal'), 'KNOWLEDGE_GAP'),
      workApplication: slot(byType('work'), 'SOURCE_GAP', true),
      overuseRisk: slot(tagged(overuse, 'shadow'), 'SOURCE_GAP', true),
    },
    'CR-03': {
      behaviorContext: slot(behavior, 'KNOWLEDGE_GAP'),
      behaviorConflict: slot(conflicts.flatMap(conflict => conflict.factIds.map(id => byId.get(id)!)),
        'NOT_APPLICABLE', false, conflicts.map(conflict => conflict.id)),
      trigger: slot(behavior, 'KNOWLEDGE_GAP'),
      internalResponse: slot(byType('inner', 'stress'), 'KNOWLEDGE_GAP', true),
      judgment: slot(byType('decision'), 'KNOWLEDGE_GAP', true),
      behavior: slot(behavior, 'KNOWLEDGE_GAP'),
      result: slot(tagged(documentedConsequences, 'shadow'), 'SOURCE_GAP', true),
      repetitionMechanism: slot([], 'SOURCE_GAP'),
    },
  }
}

export type NatalPersonalityChapterProjection = ReturnType<typeof projectNatalPersonalityChapters>
