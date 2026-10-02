import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateYearlyLuck, getSexagenaryYearPillar } = await server.ssrLoadModule('/src/lib/calculateYearlyLuck.ts')
  const { findRisshunBoundary } = await server.ssrLoadModule('/src/lib/solarTermPillars.ts')
  const boundary2026 = findRisshunBoundary(2026).instant
  const before = calculateYearlyLuck('甲', new Date(boundary2026.getTime() - 1))
  const after = calculateYearlyLuck('甲', new Date(boundary2026.getTime() + 1))
  assert.equal(before.cards[before.currentIndex].year, 2025)
  assert.equal(before.cards[before.currentIndex].pillar, '乙巳', 'before 立春 2026 must remain 乙巳')
  assert.equal(after.cards[after.currentIndex].year, 2026)
  assert.equal(after.cards[after.currentIndex].pillar, '丙午', 'after 立春 2026 must change to 丙午')

  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const cycle = Array.from({ length: 60 }, (_, index) => stems[index % 10] + branches[index % 12])
  for (let year = 1984; year < 2044; year += 1) {
    assert.equal(getSexagenaryYearPillar(year), cycle[year - 1984], `${year} sexagenary year`)
  }

  const related = calculateYearlyLuck('甲', new Date('2026-06-01T00:00:00Z'), [
    { pillar: '甲子', startInstant: new Date('2020-01-01T00:00:00Z'), endInstant: new Date('2030-01-01T00:00:00Z') },
  ])
  assert.equal(related.cards[related.currentIndex].greatLuckPillar, '甲子', 'current annual luck can reference its Great Luck period')

  console.log('Yearly-luck checks passed: 2026 立春 boundary 2/2; sexagenary cycle 60/60; Great Luck period association passed.')
} finally {
  await server.close()
}
