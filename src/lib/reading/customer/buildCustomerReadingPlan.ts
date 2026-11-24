import { buildTimingChapters, timingOverlapQuality } from './timingChapters'
import { planMoneyContrasts } from './moneyExplanation'
import type { MoneyOutcomeFact, RelationshipOutcomeFact } from '../../outcome'
import type { NatalPersonalityResult, PersonalityFact } from '../../personality/types'
import { activeCertainty, bounds, compare, compareUnits, makeUnit, uniqueIds } from '../semanticUnit'
import type { ReadingAssembly, ReadingProvenance, ReadingSemanticUnit } from '../types'
import { buildBehaviorPatterns, hasBehaviorStages, type CustomerBehaviorPattern } from './behaviorLoops'
import { mapMoney, mapRelationship, outcomeMeaningKey, outcomeSlots, outcomeTargetKey } from './outcomeMapping'
import { customerChapterTitleKeys } from './types'
import { buildCustomerEvidenceContext } from './evidenceContext'
import type {
  RelationshipAxis, CustomerRelationshipSequence, CustomerChapterGap, CustomerChapterId, CustomerChapterPlan, CustomerReadingParagraphPlan,
  OutcomeActivation, OutcomeVoice, ParagraphExpression, ParagraphPurpose, PersonalityVoice,
} from './types'

const provenanceFrom = (units: readonly ReadingProvenance[]): ReadingProvenance => ({
  sourceFactIds: uniqueIds(units.flatMap(unit => unit.sourceFactIds)),
  sourceRoleIds: uniqueIds(units.flatMap(unit => unit.sourceRoleIds)),
  sourceEffectIds: uniqueIds(units.flatMap(unit => unit.sourceEffectIds)),
  sourcePersonalityFactIds: uniqueIds(units.flatMap(unit => unit.sourcePersonalityFactIds)),
  sourceConflictIds: uniqueIds(units.flatMap(unit => unit.sourceConflictIds)),
  evidenceIds: uniqueIds(units.flatMap(unit => unit.evidenceIds)),
})

const cr01Slots = [
  ['coreNature', 'core', 'conclusion'], ['externalExpression', 'outward', 'life_expression'],
  ['internalDecisionStyle', 'decision', 'condition'], ['informationAdaptationStyle', 'information', 'cause'],
  ['relationshipSocialExpression', 'relationship', 'life_expression'], ['stressResponse', 'stress', 'condition'],
] as const satisfies readonly (readonly [string, PersonalityVoice, ParagraphPurpose])[]

const aliases = new Map([
  ['깐깐하게 인식되기 쉬움', 'precision'], ['자기 결과물에 엄격함', 'precision'],
  ['자신의 결과물에 타인의 결과물보다 높은 기준을 적용함', 'precision'],
  ['완료한 작업도 다시 점검함', 'precision'], ['정확성', 'precision'], ['꼼꼼함', 'precision'], ['치밀함', 'precision'],
  ['타당성을 스스로 확인하고 움직임', 'verify_before_acting'], ['조언을 들어도 스스로 납득한 뒤 움직임', 'verify_before_acting'],
  ['신속한 판단', 'fast_judgment'], ['빠른 판단', 'fast_judgment'],
  ['기회를 놓치지 않음', 'opportunity_detection'], ['기회 포착', 'opportunity_detection'],
  ['넓은 교류', 'broad_contact'], ['넓고 활발한 교류', 'broad_contact'],
  ['위기 돌파', 'overcome_obstacles'], ['위기 돌파 지향', 'overcome_obstacles'],
  ['결과에 집중하며 난관을 돌파함', 'overcome_obstacles'],
  ['다른 사람을 돕고 협력하며 그 안에서 자신의 역량을 발휘할 길을 찾음', 'collaborate'],
  ['완성도를 높이기 위해 세부를 확인함', 'precision'],
  ['협동', 'collaborate'], ['치열하게 경쟁하거나 동료와 강하게 연대함', 'collaborate'],
])

const strengthPositions: readonly PersonalityFact['sourcePosition'][] = [
  'day_stem', undefined, 'month_branch', 'day_branch', 'month_stem', 'hour_branch', 'hour_stem', 'year_stem', 'year_branch',
]
const byStrengthPosition = (facts: PersonalityFact[]) => facts.sort((a, b) =>
  Number(b.status === 'active') - Number(a.status === 'active')
  || strengthPositions.indexOf(a.sourcePosition) - strengthPositions.indexOf(b.sourcePosition) || compare(a.id, b.id))

const relationshipBehavior = new Map([
  ['때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함', 'communication'],
  ['수평적인 대화와 동등한 대우를 중시함', 'communication'],
  ['배려와 재능 나눔이 가까운 범위에 집중됨', 'afterCloseness'],
  ['가까운 사람과 신뢰를 차곡차곡 쌓음', 'afterCloseness'],
  ['가까운 사람을 포용하되 자신이 돌볼 범위를 주도적으로 정하려 함', 'afterCloseness'],
  ['정인 성향이 과할 때 겉으로 원만해 보여도 주위 사람들과 거리감을 느낄 수 있음', 'emotionalDistance'],
  ['갈등을 우회하기보다 자기 뜻을 지키며 부딪히는 편', 'conflictMechanism'],
  ['교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음', 'conflictMechanism'],
])

const relationshipAxisByTrait = new Map<string, RelationshipAxis>([
  ['가까운 사람과 신뢰를 차곡차곡 쌓음', 'trust'],
  ['교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음', 'boundary'],
])

function relationshipAxis(fact: PersonalityFact): RelationshipAxis {
  const explicit = relationshipAxisByTrait.get(fact.trait)
  if (explicit) return explicit
  switch (relationshipBehavior.get(fact.trait)) {
    case 'communication': return 'communication'
    case 'afterCloseness': return 'closeness'
    case 'conflictMechanism': return 'conflict'
    case 'emotionalDistance': return 'distance'
    default: return 'approach'
  }
}

function relationshipMapping(trait: string) {
  if (trait === '수평적인 대화와 동등한 대우를 중시함' || trait === '갈등을 우회하기보다 자기 뜻을 지키며 부딪히는 편') return 'CL-R04'
  if (trait === '교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음') return 'CL-R05'
  return 'CL-P01'
}

const strengthContexts = new Map([
  ['분석력', 'conflicting_evidence'], ['협동', 'shared_task_handoff'],
  ['완료한 작업도 다시 점검함', 'final_review'], ['기회 포착', 'changed_options'],
  ['빠른 판단', 'limited_decision_time'], ['신속한 판단', 'limited_decision_time'],
])

const moneyOrder: readonly OutcomeVoice[] = ['skill', 'expression', 'earning', 'retention', 'capacity',
  'division', 'divisionRetention', 'sustainability', 'protection', 'pressure', 'supportPressure']
const relationshipOrder: readonly OutcomeVoice[] = ['contact', 'change', 'formation', 'relationshipPressure']
const relationshipLayer = (chapterId: CustomerChapterId, layer: 'personality' | 'outcome') =>
  chapterId === 'CR-05' ? { layer, section: layer === 'personality'
    ? 'natal_relationship' as const : 'relationship_outcome' as const } : {}

interface BuildInput {
  readonly assembly: ReadingAssembly
  readonly natal?: NatalPersonalityResult
  readonly referenceTime?: string
  readonly moneyOutcomes?: readonly MoneyOutcomeFact[]
  readonly relationshipOutcomes?: readonly RelationshipOutcomeFact[]
}

export function buildCustomerReadingPlan({ assembly, natal, moneyOutcomes, relationshipOutcomes, referenceTime = assembly.referenceTime }: BuildInput) {
  const projection = assembly.natalPersonalityChapters
  const unitsByRecord = new Map(assembly.semanticUnits.map(unit => [unit.meaningRef.recordId, unit]))
  const usedUnits = new Map<string, ReadingSemanticUnit>()
  const knowledge = new Map(natal?.provenance.map(item => [item.id, item]))
  const facts = new Map(natal?.facts.map(fact => [fact.id, fact]))
  const conflicts = new Map([...(natal?.conflicts ?? []), ...(natal?.roleConflicts ?? [])].map(conflict => [conflict.id, conflict]))
  // The free B registry omits some approved natal facts. Customer projection exposes only
  // facts referenced by its audited slots, using the same semantic identity as the B registry.
  function unitFor(fact: PersonalityFact) {
    return unitsByRecord.get(fact.id) ?? makeUnit({
      topic: fact.traitType === 'strength' ? 'strength' : fact.traitType === 'shadow' ? 'challenge' : 'personality',
      scope: 'natal', certainty: activeCertainty(fact.status), sourceStatus: fact.status,
      meaningRef: { producer: 'personality', kind: 'personality_fact', recordId: fact.id },
      sourcePersonalityFactIds: [fact.id], evidenceIds: fact.provenanceIds,
    }, [{ chapterId: 'CH-02', role: 'conclusion' }])
  }

  function fromIds(ids: readonly string[] = []) {
    return ids.flatMap(id => {
      const fact = facts.get(id)
      return fact && fact.status !== 'deferred' ? [fact] : []
    }).sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active')
      || compare(a.id, b.id))
  }

  const chapterIds: Exclude<CustomerChapterId, 'CR-04' | 'CR-08' | 'CR-09'>[] = ['CR-01', 'CR-02', 'CR-03']
  if (assembly.productScope === 'premium') chapterIds.push('CR-05', 'CR-07')

  const chapters = chapterIds.map((chapterId): CustomerChapterPlan => {
    const paragraphs: CustomerReadingParagraphPlan[] = []
    const gaps: CustomerChapterGap[] = []
    const contributions = new Set<string>()
    const selectedTraits = new Set<string>()
    const scene = assembly.customerReadingContext?.relationshipStatus
    const selectedProfiles = new Set<string>()
    let usedScene = false
    let relationshipSequence: CustomerRelationshipSequence | undefined
    let behaviorPatterns: readonly CustomerBehaviorPattern[] | undefined

    function add(purpose: ParagraphPurpose, slots: readonly string[], expression: Exclude<ParagraphExpression, { kind: 'temporal' }>,
      units: readonly ReadingSemanticUnit[], keys: readonly string[], mapping?: string | readonly string[], mechanism?: string,
      conflictIds: readonly string[] = [], hasOutcomePath = false, activations?: readonly OutcomeActivation[]) {
      if (!units.length || keys.some(key => contributions.has(key))) return
      keys.forEach(key => contributions.add(key))
      const references = [...units].sort(compareUnits)
      references.forEach(unit => usedUnits.set(unit.id, unit))
      const provenance = provenanceFrom(references)
      const explanationEvidence = conflictIds.flatMap(id => conflicts.get(id)?.explanationEvidence ?? [])
      const first = units[0]
      const contextKeys = uniqueIds([
        ...(expression.kind === 'personality' ? slots
          .filter(slot => !['coreNature', 'independentAbility', 'additionalAbility', 'recurrence'].includes(slot))
          .map(slot => `context:${slot}`) : []),
        ...(chapterId === 'CR-02' && expression.kind === 'personality' ? expression.traitFactIds.flatMap(id => {
          const context = strengthContexts.get(facts.get(id)?.trait ?? '')
          return context ? [`context:${context}`] : []
        }) : []),
        ...(expression.scene ? [`scene:${expression.scene}`] : []),
        ...(activations ?? []).flatMap(activation => activation.periodRef ? [`period:${activation.periodRef}`] : []),
      ])
      const certainty = units.some(unit => unit.certainty === 'conditional') ? 'conditional'
        : units.some(unit => unit.certainty !== 'confirmed') ? 'contextual' : 'confirmed'
      const explanationIds = uniqueIds(units.flatMap(unit => unit.structuralExplanationUnitIds ?? []))
      const projectedExpression = expression.kind === 'outcome'
        ? { ...expression, structuralExplanationUnitIds: explanationIds } : expression
      const causeAvailable = expression.kind === 'personality'
        ? Boolean(mapping && mechanism) : hasOutcomePath
      const lifeMappingAvailable = Boolean(mapping && mechanism)
      paragraphs.push({
        ...provenance, evidenceIds: uniqueIds([...provenance.evidenceIds, ...explanationEvidence]), sourceConflictIds: uniqueIds([...provenance.sourceConflictIds, ...conflictIds]),
        id: `${chapterId}:${JSON.stringify(keys)}`, chapterId, purpose, slots,
        ...relationshipLayer(chapterId, expression.kind),
        ...(chapterId === 'CR-07' && { moneyAxes: [...new Set(references.flatMap(unit => unit.moneyAxis ?? []))].sort(compare) }),
        ...(chapterId === 'CR-05' && expression.kind === 'personality' && {
          relationshipAxes: [...new Set(fromIds(expression.traitFactIds).map(relationshipAxis))].sort(compare),
        }),
        ...(!paragraphs.length && { emphasis: 'key_conclusion' as const }),
        semanticUnitIds: uniqueIds(references.map(unit => unit.id)),
        sourceOutcomeIds: uniqueIds(units.filter(unit => unit.meaningRef.kind === 'outcome_fact')
          .map(unit => unit.meaningRef.recordId)),
        sourceMappingIds: typeof mapping === 'string' ? [mapping] : mapping ?? [], lifeMechanismIds: mechanism ? [mechanism] : [],
        activations, contextKeys, contributionKeys: keys, scope: first.scope, periodRef: first.period?.periodId, certainty,
        causeAvailable, lifeMappingAvailable, reasonStatus: causeAvailable && lifeMappingAvailable ? 'complete' : 'partial',
        expression: projectedExpression,
      })
    }

    function personality(slot: string, voice: PersonalityVoice, purpose: ParagraphPurpose,
      candidates: readonly PersonalityFact[], mechanism = voice as string, preferredSource?: PersonalityFact['sourceType'],
      independent = false) {
      const sorted = preferredSource ? [...candidates].sort((a, b) =>
        Number(b.sourceType === preferredSource) - Number(a.sourceType === preferredSource)) : candidates
      const profiles = (item: PersonalityFact) => item.provenanceIds.flatMap(id => {
        const record = knowledge.get(id)
        return record?.sourceType === item.sourceType ? [`${record.sourceType}:${record.profileId}`] : []
      })
      const unused = sorted.filter(item => !selectedTraits.has(aliases.get(item.trait) ?? item.trait))
      const fact = (independent && unused.find(item => profiles(item).every(profile => !selectedProfiles.has(profile)))) || unused[0]
      if (!fact) return undefined
      const key = aliases.get(fact.trait) ?? fact.trait
      selectedTraits.add(key)
      profiles(fact).forEach(profile => selectedProfiles.add(profile))
      const applicableScene = chapterId === 'CR-05' && ['communication', 'conflictMechanism'].includes(slot) && !usedScene ? scene : undefined
      if (applicableScene) usedScene = true
      const limitation = chapterId === 'CR-02' && key === 'fast_judgment'
        ? fromIds(projection?.['CR-02'].overuseRisk.sourcePersonalityFactIds).find(item =>
          item.trait === '빠른 결단이 성급해지면 실수가 늘어날 수 있음'
          && profiles(item).some(profile => profiles(fact).includes(profile))) : undefined
      add(purpose, limitation ? [slot, 'overuseRisk'] : [slot], {
        kind: 'personality', voice, traitFactIds: [fact.id, ...(limitation ? [limitation.id] : [])],
        ...(applicableScene && { scene: applicableScene }), ...(limitation && { limitationFactId: limitation.id }),
      }, [unitFor(fact), ...(limitation ? [unitFor(limitation)] : [])],
      [`trait:${key}`, ...(limitation ? [`limitation:${limitation.trait}`] : [])],
      chapterId === 'CR-05' ? relationshipMapping(fact.trait) : 'CL-P01', chapterId === 'CR-02' ? `strength:${key}` : `${mechanism}:${key}`)
      return fact
    }

    if (chapterId === 'CR-01') {
      for (const [slot, voice, purpose] of cr01Slots) {
        const candidates = fromIds(projection?.['CR-01'][slot].sourcePersonalityFactIds)
        const qualified = voice === 'outward' ? candidates.filter(fact => fact.traitType === 'social'
          || fact.sourceType === 'day_pillar') : voice === 'stress'
          ? candidates.filter(fact => !hasBehaviorStages(fact.trait)) : candidates
        personality(slot, voice, purpose, qualified, voice, voice === 'decision' || voice === 'relationship' ? 'day_pillar' : undefined)
      }
      const outward = paragraphs.find(paragraph => paragraph.slots.includes('externalExpression'))
      const decision = paragraphs.find(paragraph => paragraph.slots.includes('internalDecisionStyle'))
      if (outward?.expression.kind === 'personality' && decision?.expression.kind === 'personality') {
        const [external] = fromIds(outward.expression.traitFactIds)
        const [internal] = fromIds(decision.expression.traitFactIds)
        if (external && internal && aliases.get(external.trait) === 'broad_contact'
          && aliases.get(internal.trait) === 'verify_before_acting') {
          const position = paragraphs.indexOf(outward)
          for (const paragraph of [decision, outward]) {
            paragraphs.splice(paragraphs.indexOf(paragraph), 1)
            paragraph.contributionKeys.forEach(key => contributions.delete(key))
          }
          add('contrast', [...outward.slots, ...decision.slots], {
            kind: 'personality', voice: 'duality', composite: 'outward_decision', traitFactIds: [external.id, internal.id],
          }, [unitFor(external), unitFor(internal)], [...outward.contributionKeys, ...decision.contributionKeys],
          'CL-P01', 'outward_contact_internal_verification')
          paragraphs.splice(position, 0, paragraphs.pop()!)
          personality('additionalExpression', 'outward', 'life_expression',
            fromIds(projection?.['CR-01'].externalExpression.sourcePersonalityFactIds)
              .filter(fact => fact.traitType === 'expression' && fact.sourceType === 'day_pillar'))
        }
      }
      if (!paragraphs.some(paragraph => paragraph.purpose === 'contrast')) {
        const explicit = projection?.['CR-01'].internalContradiction.sourceConflictIds
          .flatMap(id => conflicts.get(id) ?? []).find(item => item.conflictType === 'source_explicit')
        const expression = explicit && fromIds(explicit.factIds).find(fact => fact.traitType === 'expression'
          && !selectedTraits.has(aliases.get(fact.trait) ?? fact.trait))
        if (explicit && expression) {
          add('condition', ['internalContradiction'], { kind: 'personality', voice: 'outward',
            traitFactIds: [expression.id] }, [unitFor(expression)], [`trait:${expression.trait}`],
          'CL-P01', 'source_conflict_expression', [explicit.id])
        }
      }
      if (paragraphs.length < 6) {
        personality('practicalDecision', 'decision', 'condition', fromIds(projection?.['CR-01'].practicalDecision?.sourcePersonalityFactIds))
      }
      if (paragraphs.length < 7 && !paragraphs.some(paragraph => paragraph.slots.includes('stressResponse'))) {
        personality('judgmentBoundary', 'stress', 'condition', fromIds(projection?.['CR-01'].judgmentBoundary?.sourcePersonalityFactIds))
      }
    } else if (chapterId === 'CR-02') {
      const strength = projection?.['CR-02']
      personality('problemSolving', 'problem', 'conclusion', byStrengthPosition(fromIds(strength?.problemSolving.sourcePersonalityFactIds)))
      personality('socialCollaboration', 'collaboration', 'life_expression', byStrengthPosition(fromIds(strength?.socialCollaboration.sourcePersonalityFactIds)))
      const abilities = byStrengthPosition(fromIds(strength?.primaryStrength.sourcePersonalityFactIds))
      personality('independentAbility', 'ability', 'application', abilities, 'independent_ability', 'day_stem', true)
      personality('additionalAbility', 'ability', 'application', abilities, 'independent_ability', 'day_pillar', true)
    } else if (chapterId === 'CR-03') {
      const slots = projection?.['CR-03']
      const linked = (slots?.behaviorConflict?.sourceConflictIds ?? []).flatMap(id => conflicts.get(id) ?? [])
      behaviorPatterns = buildBehaviorPatterns(fromIds(uniqueIds([
        ...(slots?.behaviorContext?.sourcePersonalityFactIds ?? []),
        ...(slots?.judgment.sourcePersonalityFactIds ?? []),
        ...linked.flatMap(conflict => conflict.factIds),
      ])), linked, fact => fact.provenanceIds.flatMap(id => {
        const record = knowledge.get(id)
        return record?.sourceType === fact.sourceType ? record.sourceRefs : []
      }))
      for (const pattern of behaviorPatterns.filter(item => item.status === 'ready')) {
        const ids = uniqueIds([...pattern.context, ...pattern.trigger, ...pattern.response, ...pattern.judgment,
          ...pattern.behavior, ...pattern.result, ...pattern.recurrence])
        const covered = ['context', 'response_or_judgment', 'behavior_or_expression',
          ...(pattern.trigger.length ? ['trigger'] : []), ...(pattern.result.length ? ['result'] : []),
          ...(pattern.recurrence.length ? ['recurrence'] : [])]
        const contextSplit = !pattern.trigger.length
        add('condition', covered, { kind: 'personality', voice: contextSplit ? 'duality' : 'pattern',
          traitFactIds: contextSplit ? [...pattern.behavior, ...pattern.judgment] : uniqueIds(pattern.behavior), pattern },
          fromIds(ids).map(unitFor), [`reaction:${pattern.mechanism}`], pattern.mappingIds, pattern.mechanism,
          pattern.conflictId ? [pattern.conflictId] : [])
      }
      if (paragraphs.length < 2) gaps.push({ type: 'SOURCE_GAP', slot: 'independentResponsePatterns' })
    } else if (chapterId === 'CR-05') {
      const social = fromIds(projection?.['CR-01'].relationshipSocialExpression.sourcePersonalityFactIds)
      const outward = new Set(projection?.['CR-01'].externalExpression.sourcePersonalityFactIds)
      personality('socialExpression', 'outward', 'conclusion',
        social.filter(fact => fact.traitType === 'social' && outward.has(fact.id)))
      const interpersonal = social.filter(fact => fact.traitType === 'interpersonal')
      const style = personality('relationshipStyle', 'relationship', 'life_expression',
        interpersonal.filter(fact => !relationshipBehavior.has(fact.trait)), 'relationship_style', 'day_pillar')
      for (const slot of ['afterCloseness', 'communication', 'conflictMechanism']) {
        personality(slot, 'relationship', 'condition',
          interpersonal.filter(fact => relationshipBehavior.get(fact.trait) === slot), slot, 'day_pillar')
      }
      const sequence = ['relationshipStyle', 'communication', 'conflictMechanism']
        .map(slot => paragraphs.find(paragraph => paragraph.slots.includes(slot)))
      if (style && sequence.every(paragraph => paragraph?.expression.kind === 'personality')) {
        const parts = sequence.filter(paragraph => paragraph !== undefined)
        const ids = parts.flatMap(paragraph =>
          paragraph.expression.kind === 'personality' ? paragraph.expression.traitFactIds : [])
        for (const paragraph of parts.slice(1)) {
          paragraphs.splice(paragraphs.indexOf(paragraph), 1)
          paragraph.contributionKeys.forEach(key => contributions.delete(key))
        }
        relationshipSequence = {
          sourcePersonalityFactIds: uniqueIds(ids),
          relationshipStyle: parts[0].sourcePersonalityFactIds,
          communication: parts[1].sourcePersonalityFactIds,
          conflictResponse: parts[2].sourcePersonalityFactIds,
        }
        add('contrast', [...parts.slice(1).flatMap(paragraph => paragraph.slots), 'relationshipSequence'], {
          kind: 'personality', voice: 'relationship', composite: 'relation_sequence', traitFactIds: ids, scene,
        }, fromIds(ids).map(unitFor), parts.slice(1).flatMap(paragraph => paragraph.contributionKeys), uniqueIds(parts.flatMap(p => p.sourceMappingIds)), 'relationship_sequence')
      }
      personality('emotionalDistance', 'relationship', 'condition',
        interpersonal.filter(fact => relationshipBehavior.get(fact.trait) === 'emotionalDistance'))
    }

    if (chapterId === 'CR-05' || chapterId === 'CR-07') {
      const outcomes = chapterId === 'CR-05' ? relationshipOutcomes : moneyOutcomes
      if (!outcomes && chapterId === 'CR-07') gaps.push({ type: 'ENGINE_GAP', slot: 'outcome' })
      const candidates = (outcomes ?? []).flatMap(fact => {
        const unit = unitsByRecord.get(fact.id)
        const slots = outcomeSlots(fact)
        if (!unit || unit.meaningRef.kind !== 'outcome_fact' || unit.meaningRef.scopeId !== fact.scopeId
          || unit.topic !== fact.domain || unit.scope !== fact.scope || unit.status === 'deferred'
          || !slots.length || (fact.scope !== 'natal' && !bounds(unit.period))
          || (chapterId === 'CR-05' && unit.sourceStatus === 'future')) return []
        const mapping = fact.domain === 'relationship' ? mapRelationship(fact as RelationshipOutcomeFact) : mapMoney(fact as MoneyOutcomeFact)
        const fallback = fact.semanticType === 'money_retention' && 'result' in fact && fact.result === 'harder_to_retain' ? 'retention'
          : fact.semanticType === 'money_acquisition' ? 'earning' : undefined
        const voice = mapping?.voice ?? fallback
        if (!voice) {
          gaps.push({ type: 'SOURCE_GAP', slot: slots[0] })
          if (chapterId === 'CR-05' && fact.scope !== 'natal') {
            gaps.push({ type: 'SOURCE_GAP', slot: 'relationshipTiming' })
          }
          return []
        }
        return [{ fact, unit, mapping, voice, slots }]
      }).sort((a, b) => {
        const order = chapterId === 'CR-05' ? relationshipOrder : moneyOrder
        return compareUnitsByPeriod(a.unit, b.unit) || order.indexOf(a.voice) - order.indexOf(b.voice)
          || Number(b.fact.semanticType === 'money_generation_method') - Number(a.fact.semanticType === 'money_generation_method')
          || compareUnits(a.unit, b.unit)
      })
      const grouped = new Set<string>()
      const buckets = new Map<string, { item: typeof candidates[number]; entries: typeof candidates }>()
      for (const item of candidates) {
        const { fact, unit, mapping, voice } = item
        if (grouped.has(fact.id)) continue
        // Preserve independent Outcome IDs for a shared explanation and interval.
        const companionType = fact.semanticType === 'money_generation_method' ? 'money_acquisition'
          : voice === 'division' ? 'money_retention' : undefined
        const companion = mapping && companionType && 'conditionId' in fact
          ? candidates.find(other => other.fact.semanticType === companionType && 'conditionId' in other.fact
            && !grouped.has(other.fact.id) && other.fact.conditionId === fact.conditionId && other.fact.scopeId === fact.scopeId
            && other.mapping?.id === mapping.id && other.unit.certainty === unit.certainty) : undefined
        grouped.add(fact.id)
        if (companion) grouped.add(companion.fact.id)
        // Within one period, identical customer-facing meaning can cite
        // parallel paths. Cross-scope compression still compares target sets.
        const signature = JSON.stringify([voice, mapping?.mechanism,
          'direction' in fact ? fact.direction : null, unit.scope, unit.period?.periodId, bounds(unit.period)])
        const bucket = buckets.get(signature) ?? { item, entries: [] }
        bucket.entries.push(item, ...(companion ? [companion] : []))
        buckets.set(signature, bucket)
      }
      const progressions: { item: typeof candidates[number]; entries: typeof candidates; last: ReadingSemanticUnit; key: string }[] = []
      for (const { item, entries } of buckets.values()) {
        const { unit, mapping } = item
        const interval = bounds(unit.period)
        const key = JSON.stringify([
          item.voice, mapping?.mechanism,
          uniqueIds(entries.map(({ fact }) => outcomeMeaningKey(fact))),
          uniqueIds(entries.map(({ fact }) => outcomeTargetKey(fact))),
        ])
        // Require containment for a scope progression. Partial overlaps and
        // disjoint sibling periods each retain their own conclusion.
        const progression = mapping && progressions.find(group => {
          const outer = bounds(group.last.period)
          return group.key === key && group.last.scope !== unit.scope
            && (group.last.scope === 'natal' || outer && interval && outer[0] <= interval[0] && interval[1] <= outer[1])
        })
        if (progression) {
          progression.entries.push(...entries)
          progression.last = unit
        } else progressions.push({ item, entries, last: unit, key })
      }

      if (chapterId === 'CR-07') {
        const narrativeOrder: readonly OutcomeVoice[] = ['skill', 'expression', 'earning', 'retention', 'capacity',
          'divisionRetention', 'sustainability', 'division', 'protection', 'pressure', 'supportPressure']
        progressions.sort((a, b) => narrativeOrder.indexOf(a.item.voice) - narrativeOrder.indexOf(b.item.voice))
      }
      for (const { item, entries } of progressions) {
        const { unit, mapping, voice } = item
        const interval = bounds(unit.period)
        const activations = entries.map(({ fact, unit }): OutcomeActivation => {
          const interval = bounds(unit.period)
          return { semanticUnitId: unit.id, sourceOutcomeId: fact.id, scope: unit.scope,
            periodRef: unit.period?.periodId, certainty: unit.certainty, startsAt: interval?.[0], endsBefore: interval?.[1] }
        })
        add(unit.scope !== 'natal' && chapterId === 'CR-05' ? 'timing' : mapping ? 'cause' : 'conclusion',
          uniqueIds(entries.flatMap(entry => [...entry.slots, ...(entry.mapping?.slots ?? [])])),
          { kind: 'outcome', voice,
            ...(interval && { startsAt: interval[0], endsBefore: interval[1] }) },
          entries.map(entry => entry.unit), uniqueIds(entries.map(entry => `outcome:${entry.unit.id}`)),
          mapping?.id, mapping?.mechanism, [], entries.every(entry => entry.fact.sourceRelationIds.length > 0), activations)
      }
    }

    if (chapterId === 'CR-07') planMoneyContrasts(paragraphs, usedUnits)

    const required: Record<typeof chapterId, readonly string[]> = {
      'CR-01': ['coreNature', 'externalExpression', 'internalDecisionStyle', 'relationshipSocialExpression'],
      'CR-02': ['strengthFamilies'],
      'CR-03': [],
      'CR-05': [],
      'CR-07': ['earning', 'earning_method', 'retention', 'accumulation', 'loss', 'division', 'competition', 'cost', 'sustainability'],
    }
    if (chapterId !== 'CR-07' && natal && !projection) gaps.push({ type: 'ASSEMBLY_GAP', slot: 'personality_projection' })
    const covered = new Set(paragraphs.flatMap(paragraph => paragraph.slots))
    if (chapterId === 'CR-02' && paragraphs.length >= 3) covered.add('strengthFamilies')
    if (chapterId === 'CR-01' && paragraphs.flatMap(paragraph => paragraph.semanticUnitIds).length < 5) {
      gaps.push({ type: 'SOURCE_GAP', slot: 'distinctPersonalityMeanings' })
    }
    for (const slot of required[chapterId]) if (!covered.has(slot)) gaps.push({
      type: !natal && chapterId !== 'CR-07' ? 'ENGINE_GAP' : 'SOURCE_GAP', slot,
    })
    const axes = new Set(paragraphs.flatMap(paragraph => paragraph.relationshipAxes ?? []))
    const relationshipQuestionCovered = axes.size >= 3 && (axes.has('communication') || axes.has('boundary') || axes.has('conflict'))
    if (chapterId === 'CR-05') {
      gaps.push({ type: 'SOURCE_GAP', slot: 'beginnings' }, { type: 'SOURCE_GAP', slot: 'relationshipRecurrence' })
      if (!relationshipQuestionCovered) gaps.push({ type: 'SOURCE_GAP', slot: 'relationshipAxes' })
    }
    const moneyAxes = new Set(paragraphs.flatMap(paragraph => paragraph.moneyAxes ?? []))
    const moneyQuestionCovered = [...moneyAxes].some(axis => axis === 'earning' || axis === 'earning_method')
      && [...moneyAxes].some(axis => axis !== 'earning' && axis !== 'earning_method')
    const semanticReadiness = chapterId === 'CR-07'
      ? moneyQuestionCovered ? 'ready' : moneyAxes.size ? 'partial' : 'deferred'
      : chapterId === 'CR-05'
      ? relationshipQuestionCovered ? 'ready' : axes.size ? 'partial' : 'deferred'
      : paragraphs.length ? gaps.length ? 'partial' : 'ready' : 'deferred'
    for (const paragraph of paragraphs) if (paragraph.reasonStatus === 'partial') gaps.push({
      type: 'SOURCE_GAP', slot: `reason:${paragraph.slots.join(',')}`,
    })
    const uniqueGaps = [...new Map(gaps.map(gap => [`${gap.type}:${gap.slot}`, gap])).values()]
      .sort((a, b) => compare(a.slot, b.slot) || compare(a.type, b.type))
    return {
      chapterId, titleKey: customerChapterTitleKeys[chapterId], semanticReadiness,
      paragraphPlans: paragraphs, behaviorPatterns, relationshipSequence,
      ...(chapterId === 'CR-05' && { relationshipRecurrence: [] }), gaps: uniqueGaps, provenance: provenanceFrom(paragraphs),
    }
  })
  const timing = assembly.productScope === 'premium' ? buildTimingChapters(assembly, [...(moneyOutcomes ?? assembly.temporalMoneyOutcomes ?? []), ...(relationshipOutcomes ?? assembly.temporalRelationshipOutcomes ?? [])], usedUnits, referenceTime) : []
  const usedExplanationIds = new Set([...usedUnits.values()].flatMap(unit => unit.structuralExplanationUnitIds ?? []))
  const structuralExplanationUnits = assembly.structuralExplanationUnits
    .filter(unit => usedExplanationIds.has(unit.id)).sort((a, b) => compare(a.id, b.id))
  const evidenceContext = buildCustomerEvidenceContext(assembly,
    [...(moneyOutcomes ?? []), ...(relationshipOutcomes ?? [])],
    new Set([...usedUnits.values()].filter(unit => unit.meaningRef.kind === 'outcome_fact')
      .map(unit => unit.meaningRef.recordId)))
  return { version: 'p4g-1' as const, referenceTime, temporalOverlapQuality: timingOverlapQuality(timing),
    chapters: [...chapters, ...timing].sort((a, b) => compare(a.chapterId, b.chapterId)),
    semanticUnits: [...usedUnits.values()].sort(compareUnits), structuralExplanationUnits, evidenceContext }
}

function compareUnitsByPeriod(a: ReadingSemanticUnit, b: ReadingSemanticUnit) {
  const scopes = ['natal', 'daewoon', 'sewoon', 'month']
  return scopes.indexOf(a.scope) - scopes.indexOf(b.scope)
    || compare(bounds(a.period)?.[0] ?? '', bounds(b.period)?.[0] ?? '')
}
