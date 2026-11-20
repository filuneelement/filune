import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
try {
  const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { moneyOutcomeFromReading } = await load('reading/index')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const inputs = freeze(JSON.parse(readFileSync(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8')))
  const sources = Object.fromEntries(['A_rev179', 'C_rev215', 'D_rev152', '25-7_rev16'].map(name => [
    name.startsWith('25-7') ? 'approval' : name[0], readFileSync(new URL(`../src/docs/source/authority/${name}.md`, import.meta.url), 'utf8'),
  ]))
  const build = () => {
    const birth = inputs['CS-126']
    return runInternalReading({
      birth: { date: birth.date, time: { known: true, value: birth.time }, gender: birth.gender ?? '女性', timeCorrectionMode: 'none' },
      calculation: { referenceTime: '2027-07-15T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
      executionId: 'p4j1-cs126-reproduction',
      natalInspectionPeriod: { periodId: 'p4j1-natal-inspection', from: { kind: 'exact', instant: '2027-07-15T00:00:00.000Z' }, to: { kind: 'exact', instant: '2027-07-16T00:00:00.000Z' } },
      sources, monthlyWindowStart: { year: 2026, month: 11 },
    })
  }
  const first = freeze(build())
  const second = freeze(build())
  const months = first.luck.monthlyWindow ?? []
  assert.equal(months.length, 12, 'CS-126 must complete all twelve 12-term months')
  assert.equal(JSON.stringify(first.luck.monthlyWindow), JSON.stringify(second.luck.monthlyWindow), 'monthly Judgment must be deterministic')
  for (const [index, month] of months.entries()) {
    assert.ok(Date.parse(month.startInstant) < Date.parse(month.endInstant), `invalid month ${index + 1} bounds`)
    assert.equal(month.effectivePeriod.from.instant, month.startInstant)
    assert.equal(month.effectivePeriod.to.instant, month.endInstant)
    assert.ok(month.judgmentCore, `month ${index + 1} missing Judgment snapshot`)
    assert.equal(month.parentJudgmentCore?.id, month.judgmentCore.parentScopeId, `month ${index + 1} wrong parent`)
    assert.equal(month.parentJudgmentCore?.scope, 'yearlyLuck', `month ${index + 1} parent is not Sewoon`)
    if (index) assert.equal(months[index - 1].endInstant, month.startInstant, `boundary gap at month ${index + 1}`)
  }
  const facts = moneyOutcomeFromReading({ judgment: first })
  assert.ok(Array.isArray(facts), 'Money Outcome was not reached')
  console.log(JSON.stringify({ fixture: 'CS-126', months: months.length,
    boundaries: months.map(({ startInstant, endInstant }) => [startInstant, endInstant]),
    judgmentIds: months.map(({ judgmentCore }) => judgmentCore.id),
    parentChain: months.map(({ judgmentCore, parentJudgmentCore }) => [judgmentCore.parentScopeId, parentJudgmentCore.id]),
    moneyOutcomeFacts: facts.length, invalidInheritance: 0, exception: 0 }))
  console.log('READY_TO_RERUN_P4J')
} finally {
  await server.close()
}
