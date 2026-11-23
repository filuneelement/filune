import type { MoneyOutcomeFact, RelationshipOutcomeFact } from '../../outcome'
import type { NatalPersonalityResult, PersonalityFact } from '../../personality/types'
import { activeCertainty, bounds, compare, compareUnits, makeUnit, uniqueIds } from '../semanticUnit'
import type { ReadingAssembly, ReadingProvenance, ReadingSemanticUnit } from '../types'
import { mapMoney, mapRelationship, outcomeSlots } from './outcomeMapping'
import type {
  CustomerChapterGap, CustomerChapterId, CustomerChapterPlan, CustomerReadingParagraphPlan,
  OutcomeVoice, ParagraphExpression, ParagraphPurpose, PersonalityVoice,
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
  ['넓은 교류', 'broad_contact'], ['넓고 활발한 교류', 'broad_contact'],
  ['위기 돌파', 'overcome_obstacles'], ['위기 돌파 지향', 'overcome_obstacles'],
  ['결과에 집중하며 난관을 돌파함', 'overcome_obstacles'],
  ['협동', 'collaborate'], ['치열하게 경쟁하거나 동료와 강하게 연대함', 'collaborate'],
])

// One source statement contains both the condition and the resulting reaction.
const linkedReactions = new Map([
  ['기분이 상하면 표정에 바로 드러남', 'discomfort_visible'],
  ['속상한 일이 생기면 말을 아끼는 경향', 'upset_withdraws_from_speech'],
  ['힘들 때도 자신의 어려움을 말하지 않음', 'difficulty_kept_private'],
  ['사회적 마찰이 커지면 반항이 강해짐', 'friction_pushback'],
  ['검토가 길어지면 시도하기 전에 스스로 포기할 수 있음', 'extended_review_inhibits_action'],
  ['자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함', 'rigid_standard_reduces_listening'],
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
  ['갈등을 우회하기보다 자기 뜻을 지키며 부딪히는 편', 'conflictMechanism'],
  ['교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음', 'conflictMechanism'],
])

const moneyOrder: readonly OutcomeVoice[] = ['skill', 'expression', 'earning', 'retention', 'capacity',
  'division', 'divisionRetention', 'sustainability', 'protection', 'pressure']
const relationshipOrder: readonly OutcomeVoice[] = ['contact', 'change', 'formation', 'relationshipPressure']
const relationshipLayer = (chapterId: CustomerChapterId, layer: 'personality' | 'outcome') =>
  chapterId === 'CR-05' ? { layer } : {}

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

  const chapterIds: CustomerChapterId[] = ['CR-01', 'CR-02', 'CR-03']
  if (assembly.productScope === 'premium') chapterIds.push('CR-05', 'CR-07')

  const chapters = chapterIds.map((chapterId): CustomerChapterPlan => {
    const paragraphs: CustomerReadingParagraphPlan[] = []
    const gaps: CustomerChapterGap[] = []
    const contributions = new Set<string>()
    const selectedTraits = new Set<string>()
    const scene = assembly.customerReadingContext?.relationshipStatus
    const selectedProfiles = new Set<string>()
    let usedScene = false

    function add(purpose: ParagraphPurpose, slots: readonly string[], expression: ParagraphExpression,
      units: readonly ReadingSemanticUnit[], keys: readonly string[], mapping?: string, mechanism?: string,
      conflictIds: readonly string[] = [], hasOutcomePath = false) {
      if (!units.length || keys.some(key => contributions.has(key))) return
      keys.forEach(key => contributions.add(key))
      const references = [...units].sort(compareUnits)
      references.forEach(unit => usedUnits.set(unit.id, unit))
      const provenance = provenanceFrom(references)
      const first = units[0]
      const certainty = units.some(unit => unit.certainty === 'conditional') ? 'conditional'
        : units.some(unit => unit.certainty !== 'confirmed') ? 'contextual' : 'confirmed'
      const causeAvailable = expression.kind === 'personality'
        ? Boolean(mapping && mechanism) : hasOutcomePath
      const lifeMappingAvailable = Boolean(mapping && mechanism)
      paragraphs.push({
        ...provenance, sourceConflictIds: uniqueIds([...provenance.sourceConflictIds, ...conflictIds]),
        id: `${chapterId}:${JSON.stringify(keys)}`, chapterId, purpose, slots,
        ...relationshipLayer(chapterId, expression.kind),
        ...(!paragraphs.length && { emphasis: 'key_conclusion' as const }),
        semanticUnitIds: uniqueIds(references.map(unit => unit.id)),
        sourceOutcomeIds: uniqueIds(units.filter(unit => unit.meaningRef.kind === 'outcome_fact')
          .map(unit => unit.meaningRef.recordId)),
        sourceMappingIds: mapping ? [mapping] : [], lifeMechanismIds: mechanism ? [mechanism] : [],
        contributionKeys: keys, scope: first.scope, periodRef: first.period?.periodId, certainty,
        causeAvailable, lifeMappingAvailable, reasonStatus: causeAvailable && lifeMappingAvailable ? 'complete' : 'partial',
        expression,
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
      const fact = sorted.find(item => !selectedTraits.has(aliases.get(item.trait) ?? item.trait)
        && (!independent || profiles(item).every(profile => !selectedProfiles.has(profile))))
      if (!fact) return
      const key = aliases.get(fact.trait) ?? fact.trait
      selectedTraits.add(key)
      profiles(fact).forEach(profile => selectedProfiles.add(profile))
      const applicableScene = chapterId === 'CR-05' && ['communication', 'conflictMechanism'].includes(slot) && !usedScene ? scene : undefined
      if (applicableScene) usedScene = true
      add(purpose, [slot], { kind: 'personality', voice, traitFactIds: [fact.id],
        ...(applicableScene && { scene: applicableScene }) }, [unitFor(fact)], [`trait:${key}`],
      'CL-P01', `${mechanism}:${key}`)
    }

    if (chapterId === 'CR-01') {
      for (const [slot, voice, purpose] of cr01Slots) {
        const candidates = fromIds(projection?.['CR-01'][slot].sourcePersonalityFactIds)
        const qualified = voice === 'outward' ? candidates.filter(fact => fact.traitType === 'social'
          || fact.sourceType === 'day_pillar') : voice === 'stress'
          ? candidates.filter(fact => !linkedReactions.has(fact.trait)) : candidates
        personality(slot, voice, purpose, qualified, voice, voice === 'decision' || voice === 'relationship' ? 'day_pillar' : undefined)
      }
      const conflict = projection?.['CR-01'].internalContradiction.sourceConflictIds
        .map(id => conflicts.get(id)).find(item => item && (
          item.conflictType === 'outward_vs_inner' && fromIds(item.factIds).length === 2
          || item.conflictType === 'source_explicit' && fromIds(item.factIds)
            .some(fact => fact.sourceType === 'day_pillar' && fact.traitType === 'expression')))
      if (conflict) {
        const linked = fromIds(conflict.factIds)
        const selected = conflict.conflictType === 'source_explicit'
          ? linked.filter(fact => fact.sourceType === 'day_pillar' && fact.traitType === 'expression').slice(0, 1)
          : [...linked].sort((a, b) => Number(b.traitType === 'social') - Number(a.traitType === 'social'))
        const distinct = selected.some(fact => !selectedTraits.has(aliases.get(fact.trait) ?? fact.trait))
        if (distinct) add('contrast', ['internalContradiction'], { kind: 'personality', voice: 'duality',
          traitFactIds: selected.map(fact => fact.id) }, linked.map(unitFor), [`contrast:${conflict.id}`],
        'CL-P01', 'outward_inner_tension', [conflict.id])
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
      const behavior = new Set(slots?.behavior.sourcePersonalityFactIds)
      for (const fact of fromIds(slots?.trigger.sourcePersonalityFactIds)) {
        const mechanism = linkedReactions.get(fact.trait)
        if (!behavior.has(fact.id) || !mechanism) continue
        add('condition', ['trigger', 'internalResponse', 'behavior'], { kind: 'personality', voice: 'pattern',
          traitFactIds: [fact.id] }, [unitFor(fact)], [`reaction:${mechanism}`], 'CL-P01', mechanism)
      }
      gaps.push({ type: 'PARTIAL_LOOP', slot: 'repetitionMechanism' })
    } else if (chapterId === 'CR-05') {
      const social = fromIds(projection?.['CR-01'].relationshipSocialExpression.sourcePersonalityFactIds)
      const outward = new Set(projection?.['CR-01'].externalExpression.sourcePersonalityFactIds)
      personality('socialExpression', 'outward', 'conclusion',
        social.filter(fact => fact.traitType === 'social' && outward.has(fact.id)))
      const interpersonal = social.filter(fact => fact.traitType === 'interpersonal')
      personality('relationshipStyle', 'relationship', 'life_expression',
        interpersonal.filter(fact => !relationshipBehavior.has(fact.trait)), 'relationship_style', 'day_pillar')
      for (const slot of ['afterCloseness', 'communication', 'conflictMechanism']) {
        personality(slot, 'relationship', 'condition',
          interpersonal.filter(fact => relationshipBehavior.get(fact.trait) === slot), slot, 'day_pillar')
      }
    }

    if (chapterId === 'CR-05' || chapterId === 'CR-07') {
      const outcomes = chapterId === 'CR-05' ? relationshipOutcomes : moneyOutcomes
      if (!outcomes) gaps.push({ type: 'ENGINE_GAP', slot: 'outcome' })
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
          return []
        }
        return [{ fact, unit, mapping, voice, slots }]
      }).sort((a, b) => {
        const order = chapterId === 'CR-05' ? relationshipOrder : moneyOrder
        return compareUnitsByPeriod(a.unit, b.unit) || order.indexOf(a.voice) - order.indexOf(b.voice)
          || compareUnits(a.unit, b.unit)
      })
      const grouped = new Set<string>()
      const buckets = new Map<string, { item: typeof candidates[number]; entries: typeof candidates }>()
      for (const item of candidates) {
        const { fact, unit, mapping, voice } = item
        if (grouped.has(fact.id)) continue
        // Preserve independent Outcome IDs for a shared explanation and interval.
        const companionType = voice === 'skill' || voice === 'expression' ? 'money_acquisition'
          : voice === 'division' ? 'money_retention' : undefined
        const companion = mapping && companionType && 'conditionId' in fact
          ? candidates.find(other => other.fact.semanticType === companionType && 'conditionId' in other.fact
            && other.fact.conditionId === fact.conditionId && other.fact.scopeId === fact.scopeId
            && other.mapping?.id === mapping.id && other.unit.certainty === unit.certainty) : undefined
        if (companion) grouped.add(companion.fact.id)
        const signature = JSON.stringify([voice, mapping?.mechanism, unit.scope, unit.period?.periodId, bounds(unit.period), unit.certainty])
        const bucket = buckets.get(signature) ?? { item, entries: [] }
        bucket.entries.push(item, ...(companion ? [companion] : []))
        buckets.set(signature, bucket)
      }
      const explained = new Set<string>()
      for (const { item, entries } of buckets.values()) {
        const { unit, mapping, voice } = item
        const interval = bounds(unit.period)
        const explanationKey = mapping?.mechanism ?? voice
        const meaning = JSON.stringify([voice, explanationKey])
        const timingOnly = Boolean(interval && explained.has(meaning))
        explained.add(meaning)
        const scopedScene = chapterId === 'CR-05' && !usedScene && (voice === 'contact' || voice === 'relationshipPressure') ? scene : undefined
        if (scopedScene) usedScene = true
        const keys = uniqueIds(entries.map(entry => JSON.stringify([
          entry.fact.semanticType, entry.mapping?.mechanism ?? entry.voice, entry.unit.scope, bounds(entry.unit.period) ?? null,
          'conditionId' in entry.fact ? entry.fact.conditionId : entry.fact.sourceRelationIds,
        ])))
        add(interval ? 'timing' : mapping ? 'cause' : 'conclusion',
          uniqueIds(entries.flatMap(entry => [...entry.slots, ...(entry.mapping?.slots ?? [])])),
          { kind: 'outcome', voice, ...(scopedScene && { scene: scopedScene }),
            ...(interval && { startsAt: interval[0], endsBefore: interval[1] }), ...(timingOnly && { timingOnly: true }) },
          entries.map(entry => entry.unit), keys, mapping?.id, mapping?.mechanism, [],
          entries.every(entry => entry.fact.sourceRelationIds.length > 0))
      }
    }

    const required: Record<CustomerChapterId, readonly string[]> = {
      'CR-01': ['coreNature', 'externalExpression', 'internalDecisionStyle', 'relationshipSocialExpression'],
      'CR-02': ['problemSolving', 'socialCollaboration', 'independentAbility', 'workApplication', 'overuseRisk'],
      'CR-03': ['trigger', 'internalResponse', 'judgment', 'behavior', 'result'],
      'CR-05': ['relationshipStyle', 'socialExpression', 'beginnings', 'afterCloseness', 'communication',
        'conflictMechanism', 'repetitionMechanism'],
      'CR-07': ['earning', 'earning_method', 'retention', 'accumulation', 'loss', 'division', 'competition', 'cost', 'sustainability'],
    }
    if (chapterId !== 'CR-07' && natal && !projection) gaps.push({ type: 'ASSEMBLY_GAP', slot: 'personality_projection' })
    const covered = new Set(paragraphs.flatMap(paragraph => paragraph.slots))
    for (const slot of required[chapterId]) if (!covered.has(slot)) gaps.push({
      type: !natal && chapterId !== 'CR-07' ? 'ENGINE_GAP' : 'SOURCE_GAP', slot,
    })
    for (const paragraph of paragraphs) if (paragraph.reasonStatus === 'partial') gaps.push({
      type: 'SOURCE_GAP', slot: `reason:${paragraph.slots.join(',')}`,
    })
    const uniqueGaps = [...new Map(gaps.map(gap => [`${gap.type}:${gap.slot}`, gap])).values()]
      .sort((a, b) => compare(a.slot, b.slot) || compare(a.type, b.type))
    return {
      chapterId, titleKey: chapterId,
      readiness: paragraphs.length ? uniqueGaps.length ? 'partial' : 'ready' : 'deferred',
      paragraphPlans: paragraphs, gaps: uniqueGaps, provenance: provenanceFrom(paragraphs),
    }
  })
  return { version: 'p4c-1' as const, referenceTime, chapters, semanticUnits: [...usedUnits.values()].sort(compareUnits) }
}

function compareUnitsByPeriod(a: ReadingSemanticUnit, b: ReadingSemanticUnit) {
  const scopes = ['natal', 'daewoon', 'sewoon', 'month']
  return scopes.indexOf(a.scope) - scopes.indexOf(b.scope)
    || compare(bounds(a.period)?.[0] ?? '', bounds(b.period)?.[0] ?? '')
}
