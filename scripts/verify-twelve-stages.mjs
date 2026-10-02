import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateTwelveStage, EARTHLY_BRANCH_ORDER, TWELVE_STAGE_ORDER, TWELVE_STAGE_RULES } =
    await server.ssrLoadModule('/src/lib/twelveStages.ts')
  const { calculateEightChar } = await server.ssrLoadModule('/src/lib/calculateEightChar.ts')
  const { createBasicChartViewModel } = await server.ssrLoadModule('/src/lib/basicChartViewModel.ts')
  const { calculateGreatLuck } = await server.ssrLoadModule('/src/lib/calculateGreatLuck.ts')
  const { calculateMonthlyLuck } = await server.ssrLoadModule('/src/lib/calculateMonthlyLuck.ts')

  let checked = 0
  for (const [dayStem, rule] of Object.entries(TWELVE_STAGE_RULES)) {
    const startIndex = EARTHLY_BRANCH_ORDER.indexOf(rule.changShengBranch)
    const results = EARTHLY_BRANCH_ORDER.map((branch, branchIndex) => {
      const distance = ((branchIndex - startIndex) * rule.direction % 12 + 12) % 12
      const expected = TWELVE_STAGE_ORDER[distance]
      assert.equal(
        calculateTwelveStage(dayStem, branch),
        expected,
        `${dayStem}日干 × ${branch} must follow the fixed twelve-stage table`,
      )
      checked += 1
      return calculateTwelveStage(dayStem, branch)
    })
    assert.equal(new Set(results).size, 12, `${dayStem} must cover all twelve stages exactly once`)
  }

  assert.equal(checked, 120)

  const cases = [
    { birth: { year: 2026, month: 2, day: 1, hour: 12, minute: 0 }, gender: '男性' },
    { birth: { year: 2026, month: 2, day: 4, hour: 5, minute: 1 }, gender: '女性' },
  ]
  for (const { birth, gender } of cases) {
    const pillars = calculateEightChar(birth)
    const chart = createBasicChartViewModel(pillars)
    for (const column of chart.columns) {
      assert.equal(column.twelveStage, calculateTwelveStage(chart.dayStem, column.branch), `basic chart ${column.name}`)
    }

    const greatLuck = calculateGreatLuck({
      yearPillar: pillars.year,
      monthPillar: pillars.month,
      dayStem: chart.dayStem,
      gender,
      birthDateTime: birth,
      timeUnknown: false,
      now: new Date('2026-02-01T00:00:00Z'),
    })
    const monthlyLuck = calculateMonthlyLuck(2026, chart.dayStem, new Date('2026-02-01T00:00:00Z'))
    for (const card of greatLuck.cards) {
      assert.equal(
        calculateTwelveStage(chart.dayStem, card.branch),
        calculateTwelveStage(chart.dayStem, card.pillar[1]),
        `great-luck ${chart.dayStem} × ${card.branch}`,
      )
    }
    for (const card of monthlyLuck.cards) {
      assert.equal(
        card.twelveStage,
        calculateTwelveStage(chart.dayStem, card.pillar[1]),
        `monthly-luck ${chart.dayStem} × ${card.pillar[1]}`,
      )
    }
    const matchingMonth = monthlyLuck.cards.find(({ pillar }) => pillar[1] === greatLuck.cards[0].branch)
    assert.ok(matchingMonth, 'monthly luck contains each earthly branch')
    assert.equal(
      calculateTwelveStage(chart.dayStem, greatLuck.cards[0].branch),
      calculateTwelveStage(chart.dayStem, matchingMonth.pillar[1]),
      `same branch ${greatLuck.cards[0].branch} must have same stage in great luck and monthly luck`,
    )
  }

  console.log(`Twelve-stage checks passed: ${checked}/120 table cases plus basic chart, great-luck, and monthly-luck consistency for yang/yin day stems.`)
} finally {
  await server.close()
}
