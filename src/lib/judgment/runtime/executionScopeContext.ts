import { instantSchema, validitySchema } from '../contracts'
import type { ScopeReference, Validity } from '../contracts'
import type { JudgmentProducerOutput, SourceScope } from '../producers'
import { detach, recordId } from '../producers/shared'

export type ExecutionStage = 'natal' | 'greatLuck' | 'yearlyLuck' | 'monthlyLuck'
const SCOPES: Record<ExecutionStage, readonly SourceScope[]> = {
  natal: ['natal'], greatLuck: ['natal', 'greatLuck'],
  yearlyLuck: ['natal', 'greatLuck', 'yearlyLuck'], monthlyLuck: ['natal', 'yearlyLuck', 'monthlyLuck'],
}
const STAGES = { natal: 'natal', greatLuck: 'great', yearlyLuck: 'year', monthlyLuck: 'month' } as const
export type ExecutionScopeRequest = {
  executionId: string; stage: ExecutionStage; referenceTime: string
  selectedPeriodRefs: Partial<Record<Exclude<SourceScope, 'natal'>, string>>
  /** Evaluate a year only over its overlap with the selected Great Luck period. */
  intersectYearWithGreatLuck?: boolean
  /** Natal has no computed luck period; caller must provide its explicit inspection window. */
  natalInspectionPeriod?: Validity
}
export type ExecutionScopeContext = {
  scopeId: string; executionId: string; stage: ExecutionStage; includedScopes: SourceScope[]; excludedScopes: SourceScope[]
  includedEntityIds: string[]; excludedEntityIds: string[]; selectedPeriodRefs: ExecutionScopeRequest['selectedPeriodRefs']
  referenceTime: string; effectivePeriod: Validity; periodSelectionStatus: 'confirmed' | 'unknown'
  intersectYearWithGreatLuck: boolean
  uncertaintyIds: string[]; ruleRef: { document: 'A'; revision: 179; section: 'A-8-6'; ruleId: 'OP-L01' }
  producerSnapshotIdentity: string
}
/** Exact canonical-root identity, not an astrological score or a claim of external verification. */
export function producerSnapshotIdentity(output: JudgmentProducerOutput): string {
  const roots = new Set(output.producerRef.inputFactIds)
  return JSON.stringify(detach({ producerRef: output.producerRef,
    roots: output.facts.filter((fact) => roots.has(fact.id)).map(({ id, value, assessment, uncertaintyIds }) =>
      ({ id, value, assessment, uncertaintyIds })) }))
}
export function producerPeriod(output: JudgmentProducerOutput, periodRef: string): Validity {
  const prefix = 'canonical-period:'
  if (!periodRef.startsWith(prefix) || !output.entities.some((entity) => entity.periodRef === periodRef)) {
    throw new TypeError('Selected period is not supplied by producer.')
  }
  const pointer = periodRef.slice(prefix.length)
  const boundary = (key: string): Validity['from'] => {
    const fact = output.facts.find((item) => item.canonicalPointer === `${pointer}/${key}`)
    return fact && typeof fact.value === 'string' && ['confirmed', 'provisional'].includes(fact.assessment)
      ? { kind: 'exact', instant: instantSchema.parse(fact.value) } : { kind: 'unknown', reason: `Unavailable ${pointer}/${key}` }
  }
  return validitySchema.parse({ periodId: periodRef, from: boundary('startInstant'), to: boundary('endInstant') })
}
function membership(period: Validity, instant: string): 'inside' | 'outside' | 'unknown' {
  if (period.from.kind === 'unknown' || period.to.kind === 'unknown') return 'unknown'
  const earliestStart = period.from.kind === 'exact' ? period.from.instant : period.from.earliest
  const latestStart = period.from.kind === 'exact' ? period.from.instant : period.from.latest
  const earliestEnd = period.to.kind === 'exact' ? period.to.instant : period.to.earliest
  const latestEnd = period.to.kind === 'exact' ? period.to.instant : period.to.latest
  if (instant < earliestStart || instant >= latestEnd) return 'outside'
  return instant >= latestStart && instant < earliestEnd ? 'inside' : 'unknown'
}
/** Implements only the documented direct comparison scope; performs no relation judgment. */
export function createExecutionScopeContext(output: JudgmentProducerOutput, request: ExecutionScopeRequest): ExecutionScopeContext {
  if (!request.executionId.trim() || !Object.hasOwn(SCOPES, request.stage)) throw new TypeError('Invalid execution context.')
  const referenceTime = instantSchema.parse(request.referenceTime)
  const includedScopes = [...SCOPES[request.stage]]
  const excludedScopes = (Object.keys(SCOPES) as SourceScope[]).filter((scope) => !includedScopes.includes(scope))
  const selectedPeriodRefs = detach(request.selectedPeriodRefs)
  let unknown = false
  for (const [scope, ref] of Object.entries(selectedPeriodRefs)) {
    if (!includedScopes.includes(scope as SourceScope) || !ref) throw new TypeError('Excluded source scope cannot supply a direct period.')
  }
  for (const scope of includedScopes.filter((scope) => scope !== 'natal')) {
    const ref = selectedPeriodRefs[scope as Exclude<SourceScope, 'natal'>]
    if (!ref || !output.entities.some((entity) => entity.sourceScope === scope && entity.periodRef === ref)) {
      throw new TypeError(`Explicit ${scope} period required.`)
    }
    const status = membership(producerPeriod(output, ref), referenceTime)
    if (status === 'outside') throw new TypeError('Selected luck period excludes referenceTime.')
    unknown ||= status === 'unknown'
  }
  const canonicalPeriod = request.stage === 'natal'
    ? validitySchema.parse(request.natalInspectionPeriod)
    : producerPeriod(output, selectedPeriodRefs[request.stage]!)
  if (request.stage !== 'natal' && request.natalInspectionPeriod) throw new TypeError('Natal inspection window belongs only to natal stage.')
  if (request.intersectYearWithGreatLuck && request.stage !== 'yearlyLuck') throw new TypeError('Only yearly evaluation can intersect Great Luck.')
  let effectivePeriod = canonicalPeriod
  if (request.intersectYearWithGreatLuck) {
    const great = producerPeriod(output, selectedPeriodRefs.greatLuck!)
    if (canonicalPeriod.from.kind !== 'exact' || canonicalPeriod.to.kind !== 'exact'
      || great.from.kind !== 'exact' || great.to.kind !== 'exact') throw new TypeError('Exact boundaries required for yearly inheritance.')
    const start = canonicalPeriod.from.instant > great.from.instant ? canonicalPeriod.from.instant : great.from.instant
    const end = canonicalPeriod.to.instant < great.to.instant ? canonicalPeriod.to.instant : great.to.instant
    if (!(start < end) || referenceTime < start || referenceTime >= end) throw new TypeError('Yearly evaluation does not overlap selected Great Luck period.')
    if (start !== canonicalPeriod.from.instant || end !== canonicalPeriod.to.instant) {
      const periodId = `period-intersection:${selectedPeriodRefs.yearlyLuck}:${selectedPeriodRefs.greatLuck}`
      effectivePeriod = validitySchema.parse({ periodId, from: { kind: 'exact', instant: start }, to: { kind: 'exact', instant: end } })
    }
  }
  const member = membership(effectivePeriod, referenceTime)
  if (member === 'outside') throw new TypeError('Effective period excludes referenceTime.')
  unknown ||= member === 'unknown'
  const includedEntityIds = output.entities.filter((entity) => entity.sourceScope === 'natal'
    || includedScopes.includes(entity.sourceScope) && entity.periodRef === selectedPeriodRefs[entity.sourceScope])
    .map((entity) => entity.entityId).sort()
  return { executionId: request.executionId,
    scopeId: recordId('execution-scope', [request.executionId, request.stage, effectivePeriod.periodId]),
    stage: request.stage, includedScopes, excludedScopes, includedEntityIds,
    excludedEntityIds: output.entities.filter((entity) => !includedEntityIds.includes(entity.entityId)).map((entity) => entity.entityId).sort(),
    selectedPeriodRefs, referenceTime, effectivePeriod, intersectYearWithGreatLuck: request.intersectYearWithGreatLuck ?? false,
    periodSelectionStatus: unknown ? 'unknown' : 'confirmed',
    uncertaintyIds: unknown ? ['execution-period-membership-unconfirmed'] : [],
    producerSnapshotIdentity: producerSnapshotIdentity(output),
    ruleRef: { document: 'A', revision: 179, section: 'A-8-6', ruleId: 'OP-L01' } }
}
export function assertExecutionScopeContext(output: JudgmentProducerOutput, context: ExecutionScopeContext): void {
  const expected = createExecutionScopeContext(output, { executionId: context.executionId, stage: context.stage,
    referenceTime: context.referenceTime, selectedPeriodRefs: context.selectedPeriodRefs,
    ...(context.stage === 'natal' ? { natalInspectionPeriod: context.effectivePeriod } : {}),
    intersectYearWithGreatLuck: context.intersectYearWithGreatLuck })
  if (JSON.stringify(detach(expected)) !== JSON.stringify(detach(context))) throw new TypeError('Execution scope/context was altered or belongs to another producer snapshot.')
}
export function selectExecutionCandidates(output: JudgmentProducerOutput, context: ExecutionScopeContext) {
  assertExecutionScopeContext(output, context)
  const included = new Set(context.includedEntityIds)
  return detach({ status: context.periodSelectionStatus === 'confirmed' ? 'selected' as const : 'deferred' as const,
    relations: context.periodSelectionStatus === 'confirmed'
      ? output.relations.filter((relation) => relation.participantEntityIds.every((id) => included.has(id))) : [],
    // Original observation IDs/provenance remain intact. This is a view, not a new producer.
    executionScopeId: context.scopeId })
}
export function asContractScope(context: ExecutionScopeContext, evidenceIds: string[] = []): ScopeReference {
  return { scopeId: context.scopeId, stage: STAGES[context.stage], targetPeriodRef: context.effectivePeriod.periodId,
    directEntityIds: [...context.includedEntityIds], inheritedChangeIds: [], priorProcessingRefs: [],
    evidenceIds: [...evidenceIds], scopeApprovalApplicationRef: null }
}
