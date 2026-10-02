import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateEightChar } = await server.ssrLoadModule('/src/lib/calculateEightChar.ts')

  assert.deepEqual(
    calculateEightChar({ year: 2026, month: 2, day: 4, hour: 5, minute: 1 }),
    { year: '乙巳', month: '己丑', day: '己酉', time: '丁卯' },
    '2026-02-04 05:01 JST must be before Risshun',
  )
  assert.deepEqual(
    calculateEightChar({ year: 2026, month: 2, day: 4, hour: 5, minute: 3 }),
    { year: '丙午', month: '庚寅', day: '己酉', time: '丁卯' },
    '2026-02-04 05:03 JST must be after Risshun',
  )

  console.log('Solar-term boundary checks passed:')
  console.log('2026-02-04 05:01 JST → 年柱 乙巳 / 月柱 己丑')
  console.log('2026-02-04 05:03 JST → 年柱 丙午 / 月柱 庚寅')
} finally {
  await server.close()
}
