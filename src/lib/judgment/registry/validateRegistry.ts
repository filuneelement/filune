import type { RuleDefinition, RuleExecutionContext } from './types'

/** Lexically stable topological ordering is scheduling, never conflict precedence. */
export function validateRegistry(context: RuleExecutionContext): RuleDefinition[] {
  const { registry, manifest } = context
  if (manifest.engineVersion !== 'judgment-skeleton-1'
    || !['production', 'test'].includes(manifest.scope)) throw new RangeError('Manifest mismatch: engine or scope.')
  const unique = (ids: string[], label: string) => {
    if (ids.some((id) => !id) || new Set(ids).size !== ids.length) throw new TypeError(`Duplicate or empty ${label}.`)
  }
  unique(registry.rules.map(({ id }) => id), 'rule ID')
  unique(registry.outputSchemas.map(({ id }) => id), 'output schema ID')
  unique(manifest.rules.map(({ ruleId }) => ruleId), 'manifest rule ID')
  unique((context.reviewPolicies ?? []).map(({ id }) => id), 'review policy ID')
  if (manifest.scope === 'production' && (registry.rules.length || manifest.rules.length || context.reviewPolicies?.length)) {
    throw new RangeError('Production rules and review policies are not mapped in this skeleton.')
  }
  if (registry.rules.length !== manifest.rules.length) throw new RangeError('Manifest mismatch: rule set.')
  for (const rule of registry.rules) {
    const entry = manifest.rules.find(({ ruleId }) => ruleId === rule.id)
    if (!entry || entry.ruleVersion !== rule.version) throw new RangeError(`Manifest mismatch: ${rule.id}.`)
    if (!registry.outputSchemas.some(({ id }) => id === rule.outputSchemaId)) throw new TypeError(`Undefined output schema: ${rule.id}.`)
    if (!rule.sources.length || JSON.stringify(rule.sources) !== JSON.stringify(entry.sources)) throw new RangeError('Manifest mismatch: rule sources.')
    unique(rule.requiredInputs.map(({ key }) => key), 'input key')
    unique(rule.dependsOn, 'dependency')
    for (const ref of rule.sources) {
      if (ref.ruleId !== rule.id || ref.ruleVersion !== rule.version || !ref.sourceSection || !ref.sourceContentHash) throw new RangeError('Manifest mismatch: source reference.')
      if (ref.sourceDocument === 'TEST') {
        if (manifest.scope !== 'test') throw new RangeError('Test source outside test manifest.')
      } else {
        const doc = manifest.documents[ref.sourceDocument]
        if (!doc || doc.revision !== ref.sourceRevision || doc.contentHash !== ref.sourceContentHash) throw new RangeError('Manifest mismatch: document.')
      }
    }
    for (const dependency of rule.dependsOn) {
      if (!registry.rules.some(({ id }) => id === dependency)) throw new TypeError(`Missing dependency: ${dependency}.`)
    }
  }
  if (context.reviewPolicies?.some(({ scope }) => scope !== 'test')) throw new TypeError('Only test review policies are supported.')
  const state = new Map<string, 'visiting' | 'done'>()
  const ordered: RuleDefinition[] = []
  function visit(rule: RuleDefinition) {
    if (state.get(rule.id) === 'visiting') throw new TypeError('Dependency cycle.')
    if (state.get(rule.id) === 'done') return
    state.set(rule.id, 'visiting')
    for (const id of [...rule.dependsOn].sort()) visit(registry.rules.find((item) => item.id === id)!)
    state.set(rule.id, 'done')
    ordered.push(rule)
  }
  for (const rule of [...registry.rules].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) visit(rule)
  return ordered
}
