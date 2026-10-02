import assert from 'node:assert/strict'
import { LunarUtil } from 'lunar-typescript'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateEightChar } = await server.ssrLoadModule('/src/lib/calculateEightChar.ts')
  const { calculateDayRelationships } = await server.ssrLoadModule('/src/lib/dayRelationships.ts')
  const { HIDDEN_STEM_ROLE_TABLE } = await server.ssrLoadModule('/src/lib/hiddenStemRoleTable.ts')
  const corePillars = ({ year, month, day, time }) => ({ year, month, day, time })

  assert.deepEqual(
    corePillars(calculateEightChar({ year: 2026, month: 2, day: 4, hour: 5, minute: 1 })),
    { year: '乙巳', month: '己丑', day: '己酉', time: '丁卯' },
    '2026-02-04 05:01 JST must be before Risshun',
  )
  assert.deepEqual(
    corePillars(calculateEightChar({ year: 2026, month: 2, day: 4, hour: 5, minute: 3 })),
    { year: '丙午', month: '庚寅', day: '己酉', time: '丁卯' },
    '2026-02-04 05:03 JST must be after Risshun',
  )
  const beforeWhiteDew = calculateEightChar({ year: 2026, month: 9, day: 7, hour: 23, minute: 40 })
  assert.deepEqual(
    { year: beforeWhiteDew.year, month: beforeWhiteDew.month },
    { year: '丙午', month: '丙申' },
    '2026-09-07 23:40 JST must be before White Dew',
  )
  const afterWhiteDew = calculateEightChar({ year: 2026, month: 9, day: 7, hour: 23, minute: 42 })
  assert.deepEqual(
    { year: afterWhiteDew.year, month: afterWhiteDew.month },
    { year: '丙午', month: '丁酉' },
    '2026-09-07 23:42 JST must be after White Dew',
  )

  const singleHiddenStem = calculateEightChar({ year: 2026, month: 2, day: 4, hour: 5, minute: 1 }).dayRelationships
  assert.deepEqual(singleHiddenStem, {
    dayStem: '己',
    dayBranch: '酉',
    hiddenStems: [{ stem: '辛', role: 'main', tenGod: '食神' }],
    mainHiddenStem: '辛',
    mainHiddenTenGod: '食神',
  })

  const twoHiddenStems = calculateEightChar({ year: 2026, month: 2, day: 1, hour: 12, minute: 0 }).dayRelationships
  assert.deepEqual(twoHiddenStems, {
    dayStem: '丙',
    dayBranch: '午',
    hiddenStems: [
      { stem: '丁', role: 'main', tenGod: '劫財' },
      { stem: '己', role: 'residual', tenGod: '傷官' },
    ],
    mainHiddenStem: '丁',
    mainHiddenTenGod: '劫財',
  })

  const threeHiddenStems = calculateEightChar({ year: 2005, month: 12, day: 23, hour: 8, minute: 37 }).dayRelationships
  assert.deepEqual(threeHiddenStems, {
    dayStem: '辛',
    dayBranch: '巳',
    hiddenStems: [
      { stem: '丙', role: 'main', tenGod: '正官' },
      { stem: '庚', role: 'middle', tenGod: '劫財' },
      { stem: '戊', role: 'residual', tenGod: '印綬' },
    ],
    mainHiddenStem: '丙',
    mainHiddenTenGod: '正官',
  })

  const expectedRoleTable = {
    子: [{ stem: '癸', role: 'main' }],
    丑: [
      { stem: '己', role: 'main' },
      { stem: '辛', role: 'middle' },
      { stem: '癸', role: 'residual' },
    ],
    寅: [
      { stem: '甲', role: 'main' },
      { stem: '丙', role: 'middle' },
      { stem: '戊', role: 'residual' },
    ],
    卯: [{ stem: '乙', role: 'main' }],
    辰: [
      { stem: '戊', role: 'main' },
      { stem: '乙', role: 'middle' },
      { stem: '癸', role: 'residual' },
    ],
    巳: [
      { stem: '丙', role: 'main' },
      { stem: '庚', role: 'middle' },
      { stem: '戊', role: 'residual' },
    ],
    午: [
      { stem: '丁', role: 'main' },
      { stem: '己', role: 'residual' },
    ],
    未: [
      { stem: '己', role: 'main' },
      { stem: '乙', role: 'middle' },
      { stem: '丁', role: 'residual' },
    ],
    申: [
      { stem: '庚', role: 'main' },
      { stem: '壬', role: 'middle' },
      { stem: '戊', role: 'residual' },
    ],
    酉: [{ stem: '辛', role: 'main' }],
    戌: [
      { stem: '戊', role: 'main' },
      { stem: '辛', role: 'middle' },
      { stem: '丁', role: 'residual' },
    ],
    亥: [
      { stem: '壬', role: 'main' },
      { stem: '甲', role: 'residual' },
    ],
  }
  assert.deepEqual(HIDDEN_STEM_ROLE_TABLE, expectedRoleTable, 'FILUNE role table must match all twelve branches')

  for (const [branch, roleEntries] of Object.entries(expectedRoleTable)) {
    const libraryStems = LunarUtil.ZHI_HIDE_GAN[branch]
    assert.ok(libraryStems, `lunar-typescript must provide hidden stems for ${branch}`)
    assert.deepEqual(
      [...libraryStems].sort(),
      roleEntries.map(({ stem }) => stem).sort(),
      `FILUNE stem set must match lunar-typescript for ${branch}`,
    )

    const relationships = calculateDayRelationships('甲', branch, libraryStems)
    assert.deepEqual(
      relationships.hiddenStems.map(({ stem, role }) => ({ stem, role })),
      libraryStems.map((stem) => ({ stem, role: roleEntries.find((entry) => entry.stem === stem)?.role })),
      `roles for ${branch} must be looked up by stem, independently of array index`,
    )
    assert.equal(
      relationships.mainHiddenStem,
      roleEntries.find(({ role }) => role === 'main')?.stem,
      `${branch} must expose its fixed-table main stem`,
    )
  }

  console.log('Solar-term boundary checks passed:')
  console.log('2026-02-04 05:01 JST → 年柱 乙巳 / 月柱 己丑')
  console.log('2026-02-04 05:03 JST → 年柱 丙午 / 月柱 庚寅')
  console.log('2026-09-07 23:40 JST → 年柱 丙午 / 月柱 丙申')
  console.log('2026-09-07 23:42 JST → 年柱 丙午 / 月柱 丁酉')
  console.log('Hidden-stem checks passed: 酉 (1) 辛/食神; 午 (2) 丁己/劫財・傷官; 巳 (3) 丙庚戊/正官・劫財・印綬')
  console.log('All twelve earthly-branch role-table checks passed (巳 丙/main・庚/middle・戊/residual; 午 丁/main・己/residual; 酉 辛/main).')
} finally {
  await server.close()
}
