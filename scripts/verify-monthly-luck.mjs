import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateMonthlyLuck } = await server.ssrLoadModule('/src/lib/calculateMonthlyLuck.ts')
  const expectedJies = ['小寒', '立春', '啓蟄', '清明', '立夏', '芒種', '小暑', '立秋', '白露', '寒露', '立冬', '大雪']
  const expectedBranches = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子']
  const year2026 = calculateMonthlyLuck(2026, '甲', new Date('2026-01-01T00:00:00Z'))
  assert.equal(year2026.cards.length, 12)
  assert.deepEqual(year2026.cards.map(({ jieName }) => jieName), expectedJies)
  assert.deepEqual(year2026.cards.map(({ pillar }) => pillar[1]), expectedBranches)

  const risshun = year2026.cards[1]
  assert.equal(risshun.pillar, '庚寅')
  const beforeRisshun = calculateMonthlyLuck(2026, '甲', new Date(risshun.startInstant.getTime() - 1))
  const afterRisshun = calculateMonthlyLuck(2026, '甲', new Date(risshun.startInstant.getTime() + 1))
  assert.equal(beforeRisshun.currentIndex, 0, 'before Risshun remains in 丑月')
  assert.equal(afterRisshun.currentIndex, 1, 'after Risshun changes to 寅月')

  const whiteDew = year2026.cards[7]
  const beforeWhiteDew = calculateMonthlyLuck(2026, '甲', new Date(whiteDew.startInstant.getTime() - 1))
  const afterWhiteDew = calculateMonthlyLuck(2026, '甲', new Date(whiteDew.startInstant.getTime() + 1))
  assert.equal(beforeWhiteDew.currentIndex, 6, 'before White Dew remains in 申月')
  assert.equal(afterWhiteDew.currentIndex, 7, 'after White Dew changes to 酉月')

  const year2027 = calculateMonthlyLuck(2027, '甲', new Date('2027-02-10T00:00:00Z'))
  assert.equal(year2027.cards[1].pillar, '壬寅', 'Five Tigers month stem must follow the solar-year stem')
  assert.equal(year2026.cards[1].stemTenGod, '偏官', 'Ten Gods use the supplied day stem')

  console.log('Monthly-luck checks passed: Risshun 2/2; White Dew 2/2; year-dependent Five Tigers month stem 2/2; ordered Jie months 12/12.')
} finally {
  await server.close()
}
