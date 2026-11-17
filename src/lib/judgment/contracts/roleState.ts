import { applicationReferenceSchema, contractHeader } from './common'
import { boolean, enumeration, id, literal, nonEmptyIds, object, refine, union, uniqueIds } from './schema'
import type { Infer } from './schema'

/** Describes assignments; never selects a role and never imports case expectations. */
export const roleStateSchema = refine(object({
  ...contractHeader, roleStateId: id, subjectKind: enumeration(['entity', 'structure'] as const),
  entityId: union(id, literal(null)), structureRef: union(id, literal(null)),
  role: enumeration(['격', '용신', '상신', '병', '구응'] as const),
  status: enumeration(['asserted', 'evaluated', 'deferred', 'unknown'] as const),
  sourceRuleIds: uniqueIds, evidenceIds: nonEmptyIds, validScopeId: id,
  provisional: boolean, uncertaintyIds: uniqueIds,
  origin: enumeration(['document-assertion', 'rule-result'] as const),
  applicationRef: union(applicationReferenceSchema, literal(null)),
  usage: enumeration(['reference-only', 'runtime-result'] as const),
}), (value) => (value.subjectKind === 'entity' ? value.entityId !== null && value.structureRef === null
  : value.entityId === null && value.structureRef !== null)
  && (value.role !== '격' || value.subjectKind === 'structure')
  && (value.origin === 'document-assertion'
    ? value.usage === 'reference-only' && value.applicationRef === null && value.status !== 'evaluated'
    : value.usage === 'runtime-result' && value.status !== 'asserted'
      && (value.status !== 'evaluated' || value.applicationRef !== null
        && value.sourceRuleIds.includes(value.applicationRef.ruleId)
        && value.applicationRef.scopeId === value.validScopeId))
  && (!value.provisional || value.uncertaintyIds.length > 0)
  && (!['unknown', 'deferred'].includes(value.status) || value.uncertaintyIds.length > 0),
'invalid role subject, expectation/runtime boundary, application or uncertainty')
export type RoleStateContract = Infer<typeof roleStateSchema>
