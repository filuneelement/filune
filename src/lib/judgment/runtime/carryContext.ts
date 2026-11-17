import { validateContractBundle } from '../contracts'
import type { ContractBundle, LuckCarryStateContract } from '../contracts'
import type { JudgmentProducerOutput } from '../producers'
import { detach } from '../producers/shared'
import { asContractScope, assertExecutionScopeContext } from './executionScopeContext'
import type { ExecutionScopeContext } from './executionScopeContext'

export type CarryContext = {
  scopeId: string; status: 'empty' | 'upstream-supplied'; carry: LuckCarryStateContract
  incoming: { changeId: string; sourceStateId: string; sourceStage: 'great' | 'year'; sourceScopeId: string
    validFrom: LuckCarryStateContract['entries'][number]['validity']['from']
    validTo: LuckCarryStateContract['entries'][number]['validity']['to']; causedByRuleIds: string[]
    provenance: { kind: 'inherited'; sourceSnapshotRef: string; originalApplicationIds: string[] } }[]
}
export type UpstreamCarryInput = { producerSnapshotIdentity: string; bundle: ContractBundle }
/** Empty carry or validated upstream references only. Never invents states or consumption. */
export function adaptCarryContext(output: JudgmentProducerOutput, context: ExecutionScopeContext, upstream?: UpstreamCarryInput): CarryContext {
  assertExecutionScopeContext(output, context)
  if (!upstream) return { scopeId: context.scopeId, status: 'empty', incoming: [], carry: {
    contractVersion: '1', carryStateId: `empty:${context.scopeId}`, entries: [], processedRelationRecords: [],
    snapshots: [], consumedAtStage: [], priorProcessingRefs: [] } }
  if (upstream.producerSnapshotIdentity !== context.producerSnapshotIdentity) throw new TypeError('Upstream carry belongs to another producer snapshot.')
  const bundle = validateContractBundle(upstream.bundle)
  if (bundle.purpose !== 'runtime-input') throw new TypeError('Reference-only carry cannot enter runtime.')
  const scope = bundle.scopes.find((item) => item.scopeId === context.scopeId)
  const expected = asContractScope(context)
  if (!scope || scope.stage !== expected.stage || scope.targetPeriodRef !== expected.targetPeriodRef
    || JSON.stringify([...scope.directEntityIds].sort()) !== JSON.stringify([...expected.directEntityIds].sort())) {
    throw new TypeError('Upstream destination does not match execution scope.')
  }
  if (!bundle.periods.some((period) => JSON.stringify(period) === JSON.stringify(context.effectivePeriod))) {
    throw new TypeError('Upstream effective period differs from context.')
  }
  const byId = new Map(output.entities.map((entity) => [entity.entityId, entity]))
  for (const entity of bundle.entities) {
    const produced = byId.get(entity.entityId)
    if (!produced || entity.canonicalFactRef !== produced.canonicalFactRef || entity.origin !== produced.origin
      || entity.part !== produced.part || entity.position !== produced.position || entity.periodRef !== produced.periodRef) {
      throw new TypeError('Upstream entity provenance differs from producer.')
    }
  }
  return detach({ scopeId: context.scopeId, status: 'upstream-supplied', carry: bundle.carry,
    incoming: bundle.carry.entries.filter((entry) => entry.inheritedIntoScopeId === context.scopeId).map((entry) => ({
      changeId: entry.changeId, sourceStateId: entry.sourceStateRef, sourceStage: entry.sourceStage,
      sourceScopeId: entry.sourceScopeId, validFrom: entry.validity.from, validTo: entry.validity.to,
      causedByRuleIds: entry.causedByRuleIds, provenance: { kind: 'inherited' as const,
        sourceSnapshotRef: entry.sourceSnapshotRef, originalApplicationIds: entry.causedByApplicationRefs.map((app) => app.applicationId) },
    })) })
}
