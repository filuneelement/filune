import type { CanonicalChart } from '../canonical/types'
import { addDayPillarConflicts, collectPositionConflicts } from './conflicts/personalityConflicts'
import { extractNatalTenGodOccurrences } from './facts/natalTenGodOccurrences'
import {
  canonicalIds, compareId, createFactStore, DAY_PILLAR_FIELDS, DAY_STEM_FIELDS, TEN_GOD_BASE_FIELDS,
  TEN_GOD_INNER_FIELDS, TEN_GOD_OUTWARD_FIELDS, TEN_GOD_SHARED_CONTEXT_FIELDS,
} from './facts/personalityFacts'
import { DAY_PILLAR_PROFILES } from './knowledge/dayPillarProfiles'
import { DAY_STEM_PROFILES } from './knowledge/dayStemProfiles'
import { POSITION_EXPRESSION_RULES } from './knowledge/positionRules'
import { TEN_GOD_PROFILES } from './knowledge/tenGodProfiles'
import { OCCURRENCE_POSITION_ORDER, POSITION_CONTEXTS } from './position/positionExpression'
import { collectProminenceEvidence, resolveProminence } from './prominence/tenGodProminence'
import {
  TEN_GOD_TO_PERSONALITY_ID,
  type NatalPersonalityResult, type PersonalityDimensionSummary, type PersonalityTraitType,
  type PositionExpression, type TenGodPersonalityState,
} from './types'

const TEN_GOD_ORDER = Object.values(TEN_GOD_TO_PERSONALITY_ID)
const FACT_POSITION_ORDER = ['day_stem', ...OCCURRENCE_POSITION_ORDER] as const
const DIMENSIONS = {
  outwardExpression: ['social', 'expression'],
  innerDecision: ['decision', 'inner'],
  workStyle: ['work'],
  interpersonal: ['interpersonal'],
  stressPattern: ['stress'],
  strengths: ['strength'],
  shadowPatterns: ['shadow'],
} as const satisfies Record<PersonalityDimensionSummary['dimension'], readonly PersonalityTraitType[]>

/** Build a natal knowledge result from the already calculated canonical chart. */
export function buildNatalPersonality(chart: CanonicalChart): NatalPersonalityResult {
  const day = chart.pillars.day
  if (day.status !== 'confirmed') throw new TypeError('Natal personality requires a confirmed canonical day pillar.')
  const { stem: dayStem, branch, ganZhi } = day.value
  const dayPillar = `${dayStem}${branch}` as const
  if (dayPillar !== ganZhi || !Object.hasOwn(DAY_PILLAR_PROFILES, dayPillar)) {
    throw new TypeError('Invalid canonical day pillar for natal personality.')
  }
  const pillarProfile = DAY_PILLAR_PROFILES[dayPillar as keyof typeof DAY_PILLAR_PROFILES]
  const dayRelations = chart.basicRelations.day
  if (dayRelations.status === 'confirmed'
    && TEN_GOD_TO_PERSONALITY_ID[dayRelations.value.relationships.mainHiddenTenGod] !== pillarProfile.dayBranchTenGod) {
    throw new TypeError('Canonical day branch TenGod does not match the day pillar registry.')
  }

  const store = createFactStore()
  const { occurrences, unavailablePositions } = extractNatalTenGodOccurrences(chart)
  occurrences.sort((a, b) => OCCURRENCE_POSITION_ORDER.indexOf(a.position) - OCCURRENCE_POSITION_ORDER.indexOf(b.position)
    || compareId(a.id, b.id))

  store.addFields(DAY_STEM_PROFILES[dayStem], dayStem, DAY_STEM_FIELDS, {
    sourceType: 'day_stem', sourcePosition: 'day_stem', status: 'active', occurrenceIds: [],
  })

  const positionExpressions: PositionExpression[] = []
  for (const position of OCCURRENCE_POSITION_ORDER) {
    const local = occurrences.filter(item => item.position === position)
    if (!local.length) continue
    const { expressionMode, ruleIds } = POSITION_CONTEXTS[position]
    const rules = ruleIds.map(id => POSITION_EXPRESSION_RULES[id])
    const provenanceIds = rules.flatMap(rule =>
      (['expressionDomain', 'interpretationRules'] as const)
        .filter(field => rule[field].length)
        .map(field => store.registerEvidence('position', rule.positionType, field, rule.evidenceNotes)))
    for (const tenGod of TEN_GOD_ORDER) {
      const occurrenceIds = local.filter(item => item.tenGod === tenGod).map(item => item.id)
      if (!occurrenceIds.length) continue
      const profile = TEN_GOD_PROFILES[tenGod]
      const context = { sourceType: 'ten_god', sourcePosition: position, tenGod, occurrenceIds } as const
      const supporting = expressionMode === 'supporting_context'
      store.addFields(profile, tenGod, TEN_GOD_BASE_FIELDS, {
        ...context, status: supporting ? 'contextual' : 'active',
      }, provenanceIds)
      const contextual = { ...context, status: 'contextual' } as const
      store.addFields(profile, tenGod, TEN_GOD_SHARED_CONTEXT_FIELDS, contextual, provenanceIds)
      if (expressionMode === 'outward') {
        store.addFields(profile, tenGod, TEN_GOD_OUTWARD_FIELDS, contextual, provenanceIds)
      } else {
        store.addFields(profile, tenGod, TEN_GOD_INNER_FIELDS, contextual, provenanceIds)
      }
    }
    positionExpressions.push({
      position, expressionMode, ruleIds: [...ruleIds],
      expressionDomain: canonicalIds(rules.flatMap(rule => rule.expressionDomain)),
      interpretationRules: canonicalIds(rules.flatMap(rule => rule.interpretationRules)),
      provenanceIds: canonicalIds(provenanceIds),
      factIds: [],
    })
  }

  store.addFields(pillarProfile, dayPillar, DAY_PILLAR_FIELDS, {
    sourceType: 'day_pillar', dayPillar, status: 'active', occurrenceIds: [],
  })
  const pillarConflicts = addDayPillarConflicts(pillarProfile, store)

  // Sort by location, canonical TenGod order, trait category, and stable ID.
  const facts = [...store.facts.values()].sort((a, b) => {
    const positionIndex = (position: typeof a.sourcePosition) =>
      position ? FACT_POSITION_ORDER.indexOf(position) : FACT_POSITION_ORDER.length
    return positionIndex(a.sourcePosition) - positionIndex(b.sourcePosition)
      || (a.tenGod ? TEN_GOD_ORDER.indexOf(a.tenGod) : -1) - (b.tenGod ? TEN_GOD_ORDER.indexOf(b.tenGod) : -1)
      || compareId(a.traitType, b.traitType) || compareId(a.id, b.id)
  })
  for (const expression of positionExpressions) {
    expression.factIds = facts.filter(fact => fact.sourcePosition === expression.position).map(fact => fact.id)
  }

  const conflicts = [...pillarConflicts.sort((a, b) => compareId(a.id, b.id)), ...collectPositionConflicts(facts, positionExpressions)]
  const conflictingIds = new Set(conflicts.flatMap(item => item.factIds))
  const tenGodStates: TenGodPersonalityState[] = TEN_GOD_ORDER.map(tenGod => {
    const matching = occurrences.filter(item => item.tenGod === tenGod)
    const related = facts.filter(fact => fact.tenGod === tenGod)
    return {
      tenGod,
      occurrence: matching.length ? 'present' : unavailablePositions.length ? 'undetermined' : 'absent',
      occurrenceIds: matching.map(item => item.id),
      prominence: resolveProminence(collectProminenceEvidence(tenGod, matching)),
      activeTraitFactIds: related.filter(fact => fact.status === 'active').map(fact => fact.id),
      contextualTraitFactIds: related.filter(fact => fact.status === 'contextual').map(fact => fact.id),
    }
  })

  const summaryDimensions: PersonalityDimensionSummary[] = (Object.keys(DIMENSIONS) as PersonalityDimensionSummary['dimension'][])
    .map(dimension => {
      const types: readonly PersonalityTraitType[] = DIMENSIONS[dimension]
      const matching = facts.filter(fact => types.includes(fact.traitType)
        && (dimension !== 'outwardExpression' || !fact.sourcePosition || fact.sourcePosition === 'day_stem'
          || POSITION_CONTEXTS[fact.sourcePosition].expressionMode === 'outward'))
      return {
        dimension,
        confirmedFactIds: matching.filter(fact => fact.status === 'active').map(fact => fact.id),
        contextualFactIds: matching.filter(fact => fact.status === 'contextual').map(fact => fact.id),
        conflictingFactIds: matching.filter(fact => conflictingIds.has(fact.id)).map(fact => fact.id),
      }
    })

  const provenance = [...store.provenance.values()].sort((a, b) => compareId(a.id, b.id))
  return {
    dayStem, dayPillar, facts, occurrences, tenGodStates, positionExpressions, conflicts, summaryDimensions, unavailablePositions,
    dayPillarModifier: {
      pillar: dayPillar, dayBranchTenGod: pillarProfile.dayBranchTenGod,
      factIds: facts.filter(fact => fact.sourceType === 'day_pillar').map(fact => fact.id),
      conflictIds: pillarConflicts.map(item => item.id),
    },
    provenanceIds: provenance.map(item => item.id), provenance,
    structuralRoleModifiers: [], roleConflicts: [], structuralRoleDiagnostics: [],
  }
}
