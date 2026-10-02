import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateTenGod } = await server.ssrLoadModule('/src/lib/dayRelationships.ts')
  const cases = [
    ...[
      ['甲', '比肩'],
      ['乙', '劫財'],
      ['丙', '食神'],
      ['丁', '傷官'],
      ['戊', '偏財'],
      ['己', '正財'],
      ['庚', '偏官'],
      ['辛', '正官'],
      ['壬', '偏印'],
      ['癸', '印綬'],
    ].map(([stem, expected]) => ({ dayStem: '甲', stem, expected })),
    ...[
      ['乙', '比肩'],
      ['甲', '劫財'],
      ['丁', '食神'],
      ['丙', '傷官'],
      ['己', '偏財'],
      ['戊', '正財'],
      ['辛', '偏官'],
      ['庚', '正官'],
      ['癸', '偏印'],
      ['壬', '印綬'],
    ].map(([stem, expected]) => ({ dayStem: '乙', stem, expected })),
  ]

  for (const { dayStem, stem, expected } of cases) {
    assert.equal(calculateTenGod(dayStem, stem), expected, `${dayStem}日干 × ${stem} should be ${expected}`)
  }

  console.log(`Ten-god checks passed: ${cases.length}/20 (甲日干 10/10, 乙日干 10/10).`)
} finally {
  await server.close()
}
