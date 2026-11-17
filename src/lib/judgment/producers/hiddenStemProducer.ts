import { HIDDEN_STEM_ROLE_TABLE } from '../../hiddenStemRoleTable'
import { calculateTenGod } from '../../dayRelationships'
import { hiddenStemEntrySchema, hiddenStemSystemSchema } from '../contracts'
import type { CanonicalProjection, HiddenStemFact, ProducerOptions } from './types'
import { FILUNE_A179, a179Entries, a179SourceEvidence } from '../systems/hiddenStemFiluneA179'
import { combineAssessment, detach, HIDDEN_EVIDENCE, HIDDEN_SYSTEM_ID, recordId, sortedUnique, TABLE_REF } from './shared'

/** Existing table and ten-god function only; does not choose exposure, structure or roles. */
export function hiddenStemProducer(projection: CanonicalProjection, selection?: ProducerOptions['hiddenStemSystem']) {
  if (selection) {
    if (selection.systemId !== FILUNE_A179.id) throw new TypeError('Unsupported judgment hidden-stem authority.')
    a179SourceEvidence(selection.sourceText)
    const hiddenStemEntries = a179Entries()
    const day = projection.entities.find((e) => e.origin === 'natal' && e.position === 'day' && e.part === 'stem')
    const hiddenStems: HiddenStemFact[] = []
    for (const entity of projection.entities.filter((e) => e.part === 'branch')) {
      const entry = hiddenStemEntries.find((e) => e.branch === entity.value)!
      for (const [role, stem] of Object.entries(entry.roles)) {
        hiddenStems.push({ id: recordId('hidden-stem', [entity.entityId, role]), branchEntityId: entity.entityId,
          hiddenStem: stem!, role: role as HiddenStemFact['role'], roleOrder: ['main', 'middle', 'residual'].indexOf(role),
          tenGod: day ? calculateTenGod(day.value, stem!) : null, sourceSystemId: FILUNE_A179.id,
          assessment: 'provisional', uncertaintyIds: sortedUnique([...entry.uncertaintyIds, ...entity.uncertaintyIds,
            ...(day?.uncertaintyIds ?? ['day-stem-unavailable'])]),
          inputFactIds: sortedUnique([entity.canonicalFactRef, ...(day ? [day.canonicalFactRef] : [])]),
          evidenceIds: [HIDDEN_EVIDENCE, FILUNE_A179.evidenceId], provenance: { producerRef: detach(projection.producerRef),
            tableRef: FILUNE_A179.path + '#A-8-1', method: 'A179-explicit-role-only-and-existing-calculateTenGod' } })
      }
    }
    return { hiddenStems, hiddenStemEntries, canonicalHiddenStemUsage: 'legacy-reference-only' as const,
      hiddenStemAvailability: projection.entities.filter((e) => e.part === 'branch').map((entity) => {
        const entry = hiddenStemEntries.find((e) => e.branch === entity.value)!
        return { branchEntityId: entity.entityId, completeness: entry.completeness, uncertaintyIds: [...entry.uncertaintyIds] }
      }), hiddenStemSystem: hiddenStemSystemSchema.parse({
      contractVersion: '1', systemId: FILUNE_A179.id, systemName: FILUNE_A179.systemName, systemVersion: '179',
      usage: 'default-judgment', semanticRoles: { main: '본기', middle: '중기', residual: '여기' },
      semanticOrder: ['main', 'middle', 'residual'], sourceDisplayOrder: ['main', 'middle', 'residual'],
      entriesRef: FILUNE_A179.path + '#A-8-1', sourceRefs: [FILUNE_A179.evidenceId],
      compatibility: { legacyTableRef: TABLE_REF, status: 'not-checked', comparisonEvidenceIds: [] },
      assessment: 'provisional', uncertaintyIds: ['A179-full-role-table-not-specified'] }) }
  }
  const day = projection.entities.find((entity) => entity.origin === 'natal' && entity.position === 'day' && entity.part === 'stem')
  const hiddenStems: HiddenStemFact[] = []
  const branches = new Set<keyof typeof HIDDEN_STEM_ROLE_TABLE>()
  for (const entity of projection.entities.filter((item) => item.part === 'branch')) {
    const branch = entity.value as keyof typeof HIDDEN_STEM_ROLE_TABLE
    const entries = HIDDEN_STEM_ROLE_TABLE[branch]
    if (!entries) throw new TypeError('Unknown canonical branch in hidden-stem projection.')
    branches.add(branch)
    entries.forEach((entry, roleOrder) => hiddenStems.push({
      id: recordId('hidden-stem', [entity.entityId, entry.role]), branchEntityId: entity.entityId,
      hiddenStem: entry.stem, role: entry.role, roleOrder,
      tenGod: day ? calculateTenGod(day.value, entry.stem) : null,
      sourceSystemId: HIDDEN_SYSTEM_ID, assessment: combineAssessment(entity.assessment, day?.assessment ?? 'unknown'),
      uncertaintyIds: sortedUnique([...entity.uncertaintyIds, ...(day?.uncertaintyIds ?? ['day-stem-unavailable'])]),
      inputFactIds: sortedUnique([entity.canonicalFactRef, ...(day ? [day.canonicalFactRef] : [])]),
      evidenceIds: [HIDDEN_EVIDENCE], provenance: { producerRef: detach(projection.producerRef), tableRef: TABLE_REF,
        method: 'existing-table-lookup-and-calculateTenGod' },
    }))
  }
  const hiddenStemSystem = hiddenStemSystemSchema.parse({ contractVersion: '1', systemId: HIDDEN_SYSTEM_ID,
    systemName: 'FILUNE legacy HIDDEN_STEM_ROLE_TABLE', systemVersion: '1', usage: 'separate-reference',
    semanticRoles: { main: '본기', middle: '중기', residual: '여기' }, semanticOrder: ['main', 'middle', 'residual'],
    sourceDisplayOrder: ['residual', 'middle', 'main'], entriesRef: TABLE_REF, sourceRefs: [HIDDEN_EVIDENCE],
    compatibility: { legacyTableRef: TABLE_REF, status: 'not-checked', comparisonEvidenceIds: [] },
    assessment: 'provisional', uncertaintyIds: ['document-hidden-system-compatibility-unverified'] })
  // Existing legacy contents stay intact; this is not certification as A's default system.
  const hiddenStemEntries = [...branches].sort().map((branch) => hiddenStemEntrySchema.parse({
    systemId: HIDDEN_SYSTEM_ID, branch, completeness: 'complete',
    roles: Object.fromEntries(HIDDEN_STEM_ROLE_TABLE[branch].map((entry) => [entry.role, entry.stem])),
    evidenceIds: [HIDDEN_EVIDENCE], uncertaintyIds: ['document-hidden-system-compatibility-unverified'],
  }))
  return { hiddenStems, hiddenStemSystem, hiddenStemEntries }
}
