import { assertSupportedVersion } from '../../canonical/version'
import type { CalculatedChart, ValueStatus } from '../../canonical/types'
import { branchSchema, entityReferenceSchema, stemSchema } from '../contracts'
import { fromCanonical as projectExistingFacts } from '../facts/fromCanonical'
import type { DeepReadonly, JudgmentFact } from '../types'
import type { CanonicalProjection, FactEntity, ProducedFact, SourceScope } from './types'
import { combineAssessment, detach, jsonValue, PRODUCER_ID, PRODUCER_VERSION,
  PROJECTION_EVIDENCE, recordId, sortedUnique } from './shared'

/** Reuses existing canonical projection. No calendar, ten-god or period calculation. */
export function fromCanonical(input: DeepReadonly<CalculatedChart>): CanonicalProjection {
  const chart = detach(input) as CalculatedChart
  if (chart.schemaVersion !== '1') throw new RangeError('Unsupported canonical schema version.')
  assertSupportedVersion(chart.context.calculationVersion)
  const base: JudgmentFact[] = projectExistingFacts(chart)
  // Metadata deliberately omitted by the old evaluator projection is exposed here only.
  for (const key of ['birthInput', 'context', 'timePolicy', 'solarTerms', 'uncertainties'] as const) {
    const pointer = `/${key}`
    const affected = chart.uncertainties.filter((item) => item.affectedFields.some((path) =>
      path === pointer || path.startsWith(`${pointer}/`) || pointer.startsWith(`${path}/`)))
    base.push({ id: `canonical:${pointer}`, canonicalPointer: pointer, value: jsonValue(chart[key]),
      assessment: combineAssessment(...affected.map((item) => item.status)),
      uncertaintyIds: sortedUnique(affected.map((item) => item.id)) })
  }
  base.sort((a, b) => a.id.localeCompare(b.id, 'en'))
  const roots = new Set(['/birthInput', '/context', '/timePolicy', '/solarTerms', '/uncertainties',
    '/greatLuck', '/greatLuck/value', '/yearlyLuck', '/monthlyLuck',
    ...['year', 'month', 'day', 'time'].flatMap((position) => [`/chart/pillars/${position}`, `/chart/pillars/${position}/value`,
      `/chart/basicRelations/${position}`, `/chart/basicRelations/${position}/value`])])
  const producerRef = { producerId: PRODUCER_ID, version: PRODUCER_VERSION,
    sourceRef: JSON.stringify(chart.context.calculationVersion), inputFactIds: base.filter((fact) => roots.has(fact.canonicalPointer)).map((fact) => fact.id) }
  const scopeOf = (pointer: string): SourceScope | 'context' => pointer.startsWith('/chart/') ? 'natal'
    : pointer.startsWith('/greatLuck') ? 'greatLuck' : pointer.startsWith('/yearlyLuck') ? 'yearlyLuck'
      : pointer.startsWith('/monthlyLuck') ? 'monthlyLuck' : 'context'
  const facts: ProducedFact[] = base.map((fact) => ({ ...fact, sourceScope: scopeOf(fact.canonicalPointer),
    evidenceIds: [PROJECTION_EVIDENCE], provenance: { producerRef: detach(producerRef), method: 'canonical-value-projection' } }))
  const byPointer = new Map(facts.map((fact) => [fact.canonicalPointer, fact]))
  const entities: FactEntity[] = [], unavailableEntityFactRefs: string[] = []
  function add(pillar: unknown, fact: ProducedFact | undefined, origin: FactEntity['origin'],
    sourceScope: SourceScope, position?: FactEntity['position'], periodRef?: string): void {
    if (!fact) throw new TypeError('Canonical pillar fact is missing.')
    if (fact.assessment === 'unknown' || fact.assessment === 'unsupported') {
      unavailableEntityFactRefs.push(fact.id); return
    }
    if (typeof pillar !== 'string' || Array.from(pillar).length !== 2) throw new TypeError('Malformed canonical pillar.')
    const [stem, branch] = Array.from(pillar)
    stemSchema.parse(stem); branchSchema.parse(branch)
    for (const [part, value] of [['stem', stem], ['branch', branch]] as const) {
      const entity = { entityId: recordId('entity', [fact.canonicalPointer, part]), origin, part,
        canonicalFactRef: fact.id, ...(position ? { position } : {}), ...(periodRef ? { periodRef } : {}) }
      entityReferenceSchema.parse(entity)
      // Character splitting only; no pillar is calculated or filled in.
      entities.push({ ...entity, value, assessment: fact.assessment, uncertaintyIds: [...fact.uncertaintyIds],
        sourceScope, evidenceIds: [PROJECTION_EVIDENCE] })
    }
  }
  for (const position of ['year', 'month', 'day', 'time'] as const) {
    const assessed = chart.chart.pillars[position]
    if ('value' in assessed) add(assessed.value.ganZhi, byPointer.get(`/chart/pillars/${position}/value/ganZhi`), 'natal', 'natal', position)
    else unavailableEntityFactRefs.push(`canonical:/chart/pillars/${position}`)
  }
  if (chart.greatLuck.status === 'available') chart.greatLuck.value.cards.forEach((card, index) => {
    add(card.pillar, byPointer.get(`/greatLuck/value/cards/${index}/pillar`), 'great', 'greatLuck', undefined,
      `canonical-period:/greatLuck/value/cards/${index}`)
  })
  chart.yearlyLuck.cards.forEach((card, index) => add(card.pillar, byPointer.get(`/yearlyLuck/cards/${index}/pillar`),
    'year', 'yearlyLuck', undefined, `canonical-period:/yearlyLuck/cards/${index}`))
  chart.monthlyLuck.cards.forEach((card, index) => add(card.pillar, byPointer.get(`/monthlyLuck/cards/${index}/pillar`),
    'month', 'monthlyLuck', undefined, `canonical-period:/monthlyLuck/cards/${index}`))
  entities.sort((a, b) => a.entityId.localeCompare(b.entityId, 'en'))
  return { facts, entities, producerRef, unavailableEntityFactRefs: sortedUnique(unavailableEntityFactRefs),
    canonicalContext: detach(chart.context) }
}

/** Only used for derived fact availability, not for choosing a judgment. */
export function projectedAssessment(projection: CanonicalProjection, pointer: string): ValueStatus {
  return projection.facts.find((fact) => fact.canonicalPointer === pointer)?.assessment ?? 'unknown'
}
