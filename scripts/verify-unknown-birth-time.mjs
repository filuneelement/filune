import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateEightChar, calculateEightCharWithoutBirthTime } = await server.ssrLoadModule('/src/lib/calculateEightChar.ts')
  const { createBasicChartViewModel } = await server.ssrLoadModule('/src/lib/basicChartViewModel.ts')

  const knownTime = calculateEightChar({ year: 1985, month: 1, day: 22, hour: 14, minute: 22 })
  const knownTimeChart = createBasicChartViewModel(knownTime)
  assert.equal(knownTime.timeKnown, true)
  assert.equal(knownTimeChart.columns.length, 4, 'known birth time must display all four pillars')

  const unknownTime = calculateEightCharWithoutBirthTime({ year: 1985, month: 1, day: 22 })
  const unknownTimeChart = createBasicChartViewModel(unknownTime)
  assert.equal(unknownTime.timeKnown, false)
  assert.equal('time' in unknownTime, false, 'unknown birth time must not expose an internal time pillar')
  assert.equal(unknownTimeChart.columns.length, 3, 'unknown birth time must display only year, month, and day')
  assert.equal(unknownTimeChart.columns[2].name, '日柱')
  assert.equal(unknownTime.day, knownTime.day, 'internal noon reference must preserve the same local day pillar')
  assert.equal(unknownTime.solarTermAmbiguous, false, 'ordinary date must not be marked as a solar-term boundary')

  const boundaryDate = calculateEightCharWithoutBirthTime({ year: 2026, month: 2, day: 4 })
  const boundaryChart = createBasicChartViewModel(boundaryDate)
  assert.equal(boundaryDate.timeKnown, false)
  assert.equal(boundaryDate.solarTermAmbiguous, true, 'Risshun date must be identified as ambiguous without a birth time')
  assert.equal(boundaryChart.columns.length, 3)
  assert.equal(boundaryChart.columns[0].stem, '—', 'ambiguous year pillar must not be presented as certain')
  assert.equal(boundaryChart.columns[1].branch, '—', 'ambiguous month pillar must not be presented as certain')

  console.log('Unknown birth-time checks passed:')
  console.log('1985-01-22 14:22 JST → four pillars; unknown time → three pillars and no time value')
  console.log('2026-02-04 unknown time → solar-term ambiguity detected; year/month are left undecided')
} finally {
  await server.close()
}
