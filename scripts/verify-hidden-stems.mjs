import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { HIDDEN_STEM_ROLE_TABLE } = await server.ssrLoadModule('/src/lib/hiddenStemRoleTable.ts')
  const { calculateDayRelationships, calculateTenGod } = await server.ssrLoadModule('/src/lib/dayRelationships.ts')
  const expected = {
    子: [['壬', 'residual'], ['癸', 'main']],
    丑: [['癸', 'residual'], ['辛', 'middle'], ['己', 'main']],
    寅: [['戊', 'residual'], ['丙', 'middle'], ['甲', 'main']],
    卯: [['甲', 'residual'], ['乙', 'main']],
    辰: [['乙', 'residual'], ['癸', 'middle'], ['戊', 'main']],
    巳: [['戊', 'residual'], ['庚', 'middle'], ['丙', 'main']],
    午: [['丙', 'residual'], ['己', 'middle'], ['丁', 'main']],
    未: [['丁', 'residual'], ['乙', 'middle'], ['己', 'main']],
    申: [['戊', 'residual'], ['壬', 'middle'], ['庚', 'main']],
    酉: [['庚', 'residual'], ['辛', 'main']],
    戌: [['辛', 'residual'], ['丁', 'middle'], ['戊', 'main']],
    亥: [['戊', 'residual'], ['甲', 'middle'], ['壬', 'main']],
  }
  const fixedTable = Object.fromEntries(Object.entries(expected).map(([branch, entries]) => [
    branch,
    entries.map(([stem, role]) => ({ stem, role })),
  ]))
  assert.deepEqual(HIDDEN_STEM_ROLE_TABLE, fixedTable, 'FILUNE table must match all 12 branches and display order')

  for (const [branch, entries] of Object.entries(expected)) {
    const relationships = calculateDayRelationships('甲', branch)
    assert.deepEqual(
      relationships.hiddenStems.map(({ stem, role }) => [stem, role]),
      entries,
      `${branch} must return FILUNE's fixed ordered hidden stems`,
    )
    assert.equal(
      relationships.mainHiddenStem,
      entries.find(([, role]) => role === 'main')[0],
      `${branch} must expose 本気 as mainHiddenStem`,
    )
    for (const [stem] of entries) {
      assert.equal(
        relationships.hiddenStems.find((entry) => entry.stem === stem)?.tenGod,
        calculateTenGod('甲', stem),
        `${branch}/${stem} must use the existing day-stem ten-god calculation`,
      )
    }
  }

  assert.deepEqual(expected.子.map(([stem]) => stem), ['壬', '癸'])
  assert.deepEqual(expected.卯.map(([stem]) => stem), ['甲', '乙'])
  assert.deepEqual(expected.辰.map(([stem]) => stem), ['乙', '癸', '戊'])
  console.log('FILUNE hidden-stem checks passed: all 12 branches, display order, ten gods, and 本気.')
  console.log('子 壬/癸; 卯 甲/乙; 辰 乙/癸/戊.')
} finally {
  await server.close()
}
