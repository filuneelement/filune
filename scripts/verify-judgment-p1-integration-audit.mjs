import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const branchTypes = {
  officer: '正官', killing: '偏官', wealth: '偏財', resource: '印綬', food_god: '食神',
  hurting: '傷官', peer: '比肩', rob: '劫財', blade: '羊刃',
}
const gods = {
  wealth: '偏財', resource: '偏印', peer: '比肩', officer: '正官', killing: '偏官', food: '食神',
  hurting: '傷官', output: '食神', peer_only: '比肩', rob: '劫財', officer_killing: '偏官',
  indirect_resource: '偏印', day_master: '比肩',
}
try {
  const load = (file) => server.ssrLoadModule('/src/lib/judgment/core/' + file + '.ts')
  const { patternEffectRegistry, resolvePatternEffectPolicy, validatePatternEffectRegistry } = await load('policies')
  const { relationTypes } = await load('patternPolicyRegistry')
  validatePatternEffectRegistry(patternEffectRegistry)
  const reverse = [...patternEffectRegistry].reverse()
  for (const entry of patternEffectRegistry) {
    const [action, from, to] = relationTypes[entry.relationType]
    const fact = { id: 'audit-fact', action,
      source: { id: 'source', tenGod: gods[from], dayMaster: from === 'day_master' },
      target: { id: 'target', tenGod: gods[to], dayMaster: to === 'day_master' },
      ...(['KillingControlsBlade', 'OfficerControlsBlade'].includes(entry.relationType) ? { basis: 'month_blade' } : {}),
    }
    const context = { branchPattern: branchTypes[entry.branchPattern],
      patternMode: entry.patternMode === 'any' ? 'proper' : entry.patternMode,
      effectiveManifestedYongShen: entry.activeYongShenTypes.map((tenGod) => ({ tenGod })),
    }
    const tokens = new Set(entry.requiredConditions)
    const resolved = resolvePatternEffectPolicy(context, fact, tokens)
    assert.equal(resolved.selectedPolicy, entry.policyId)
    assert.equal(resolved.direction, entry.defaultDirection)
    assert.equal(resolved.evidenceStatus, entry.evidenceStatus)
    assert.deepEqual(resolvePatternEffectPolicy(context, fact, tokens, [], reverse), resolved)
    assert.ok(!('direction' in fact) && !('score' in fact))
  }
  console.log(`P1 integration audit registry: ${patternEffectRegistry.length}/${patternEffectRegistry.length}`)
} finally {
  await server.close()
}
