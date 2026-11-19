import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { createServer } from 'vite'

const root = new URL('../', import.meta.url)
const source = 'src/docs/source/personality/일주풀이.md'
const lines = readFileSync(new URL(source, root), 'utf8').split(/\r?\n/)
const knowledge = '/src/lib/personality/knowledge/'
const stemOrder = [...'甲乙丙丁戊己庚辛壬癸']
const branchOrder = [...'子丑寅卯辰巳午未申酉戌亥']
const expectedPillars = Array.from({ length: 60 }, (_, i) => stemOrder[i % 10] + branchOrder[i % 12])
const fields = [
  'branchNature', 'corePersonality', 'decisionStyle', 'interpersonalStyle', 'strengths',
  'shadowPatterns', 'internalConflict', 'expressionPattern', 'growthDirection',
]
const metadataFields = ['dayBranchTenGod', 'twelveLifeStage']
const reasons = [
  'relationship_prediction', 'gender_determinism', 'wealth_prediction', 'career_prediction',
  'health_prediction', 'compatibility_prediction', 'non_personality_claim',
]
const forbidden = /배우자|남편|아내|이혼|외도|궁합|결혼|이별|재물복|돈을 (?:잘|많이) 번|부자가 된|직업운|공무원|대기업|전문직|질병|수명|건강운|(?:병이나 )?사고를? 당|음주|중독|반드시 성공|평생 고생|(?:남자|여자)(?:는|라면)|(?:남성|여성)은|당신은/
const godNames = '비견 겁재 식신 상관 편재 정재 편관 정관 편인 정인'.split(' ')
const godIds = '比肩 劫財 食神 傷官 偏財 正財 偏官 正官 偏印 正印'.split(' ')
const stageNames = '장생 목욕 관대 건록 제왕 쇠 병 사 묘 절 태 양'.split(' ')

function sourceRange(ref, start, end) {
  const [file, anchor] = ref.split('#')
  assert.equal(file, source)
  const match = /^L(\d+)(?:-L(\d+))?$/.exec(anchor)
  assert.ok(match, ref)
  const from = Number(match[1])
  const to = Number(match[2] ?? match[1])
  assert.ok(start <= from && from <= to && to < end, ref)
  assert.ok(lines.slice(from - 1, to).some(line => line.trim()), ref)
  return [from, to]
}

function normalize(trait) {
  return trait.normalize('NFKC').replace(/(?:하는|보이는|하는데)?(?:편|경향)$/u, '').replace(/[^\p{L}\p{N}]/gu, '')
}

function nearDuplicate(left, right) {
  if (left === right) return true
  if (Math.min(left.length, right.length) >= 12 && (left.includes(right) || right.includes(left))) return true
  const bigrams = word => new Set([...word].slice(1).map((letter, i) => word[i] + letter))
  const a = bigrams(left)
  const b = bigrams(right)
  return a.size >= 5 && b.size >= 5 && 2 * [...a].filter(part => b.has(part)).length / (a.size + b.size) >= 0.8
}

function arrayEntries(profile) {
  return Object.values(profile).flatMap(value => Array.isArray(value) ? value.filter(item => typeof item === 'string') : [])
}

const server = await createServer({
  appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { DAY_PILLAR_PROFILES: registry } = await server.ssrLoadModule(knowledge + 'dayPillarProfiles.ts')
  const { DAY_STEM_PROFILES } = await server.ssrLoadModule(knowledge + 'dayStemProfiles.ts')
  const { TEN_GOD_PROFILES } = await server.ssrLoadModule(knowledge + 'tenGodProfiles.ts')
  const { TEN_GOD_TO_PERSONALITY_ID } = await server.ssrLoadModule('/src/lib/personality/types.ts')
  const { calculateDayRelationships } = await server.ssrLoadModule('/src/lib/dayRelationships.ts')
  const { calculateTwelveStage, TWELVE_STAGE_ORDER } = await server.ssrLoadModule('/src/lib/twelveStages.ts')

  const registryPath = knowledge.slice(1) + 'dayPillarProfiles.ts'
  const syntax = ts.createSourceFile(registryPath, readFileSync(new URL(registryPath, root), 'utf8'), ts.ScriptTarget.Latest, true)
  const declaration = syntax.statements.filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(item => item.name.getText(syntax) === 'DAY_PILLAR_PROFILES')
  assert.ok(declaration && ts.isSatisfiesExpression(declaration.initializer))
  const literal = declaration.initializer.expression
  assert.ok(ts.isObjectLiteralExpression(literal))
  assert.deepEqual(literal.properties.map(property => property.name.getText(syntax)), expectedPillars)
  assert.deepEqual(Object.keys(registry), expectedPillars)

  const headings = lines.flatMap((line, i) => {
    const match = /^(\d+)\. .*\(([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/.exec(line)
    return match ? [{ index: Number(match[1]), pillar: match[2], line: i + 1 }] : []
  })
  assert.deepEqual(headings.map(item => item.pillar), expectedPillars)
  const sourceEnd = lines.findIndex(line => line.startsWith('일지는 내가 어떤 것을 결정할 때')) + 1
  assert.ok(sourceEnd > headings.at(-1).line)

  const coverage = []
  const confidence = { source_explicit: 0, source_synthesis: 0, filune_interpretation: 0 }
  const excluded = Object.fromEntries(reasons.map(reason => [reason, 0]))
  const sourceConflicts = []
  function compareSource(pillar, field, line, actual, expected) {
    assert.ok(actual, `Could not parse ${pillar} ${field} L${line}`)
    if (actual !== expected) sourceConflicts.push({ pillar, field, line, source: actual, canonical: expected })
  }

  const supplementaryStageRefs = [133, 163, 486, 654, 957, 971, 1055, 1351, 1663, 1867, 1906, 2772, 2843, 3086, 3154]
  // Supplementary passages where the prose explicitly labels the day branch.
  const godLabel = '(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)'
  const supplementaryGodRefs = new Map([
    [9, '일지에 '], [468, '일지 '], [582, '기토를 만나 '], [673, '오며 '],
    [830, '일지가 '], [957, '십신으로 치면 '], [994, '는 '], [1080, '일지 '],
    [1107, '인목은 '], [1170, '묘목, '], [1262, '진토.*가 '], [1415, '일지가 '],
    [1525, '일지 '], [1716, '해수.*가 '], [1846, '일지가 '], [1940, '일지의 '],
    [2175, '일지 '], [2253, '오화는 '], [2315, '일지.*에 '], [2549, '양토.*이기에 '],
    [2620, '일지 '], [2692, '자수.*가 '], [2761, '오는 '], [2887, '일지 '],
    [3024, '작용하는 '], [3083, '만나 '], [3686, '일지 '], [3746, '에서 '],
    [3831, '일지에 '], [3837, '일지로는 '], [3961, '일지 '], [4036, '일지에 '],
    [4100, '일지 '], [4138, '일지 '],
  ])
  const repeatCounts = new Map()
  for (const line of lines) {
    if (line.trim()) repeatCounts.set(line, (repeatCounts.get(line) ?? 0) + 1)
  }

  for (const [i, pillar] of expectedPillars.entries()) {
    const profile = registry[pillar]
    const { dayStem, dayBranch, dayBranchTenGod, twelveLifeStage } = profile
    assert.deepEqual(Object.keys(profile).sort(), ['pillar', 'dayStem', 'dayBranch', ...metadataFields, ...fields, 'evidenceNotes', 'excludedClaims'].sort(), pillar)
    assert.equal(profile.pillar, pillar)
    assert.equal(dayStem, pillar[0])
    assert.equal(dayBranch, pillar[1])
    assert.equal(dayBranchTenGod, TEN_GOD_TO_PERSONALITY_ID[calculateDayRelationships(dayStem, dayBranch).mainHiddenTenGod])
    assert.equal(twelveLifeStage, calculateTwelveStage(dayStem, dayBranch))

    const { index, line: start } = headings[i]
    const end = headings[i + 1]?.line ?? sourceEnd
    assert.equal(index, i + 1)
    const metadata = profile.evidenceNotes.filter(note => note.fields.includes('dayBranchTenGod'))
    assert.equal(metadata.length, 1, pillar)
    assert.deepEqual(metadata[0].fields, metadataFields)
    const [intro, introEnd] = sourceRange(metadata[0].sourceRef, start, end)
    assert.equal(intro, introEnd)
    const introText = lines[intro - 1]
    assert.match(introText, new RegExp(`60갑자의 ${index}번째 기둥.*\\(${dayStem}\\).*\\(${dayBranch}\\)`))
    assert.match(lines[intro], new RegExp(`^어떤 사람인가요\\? 일간 ${'갑을병정무기경신임계'[i % 10]}의 기질$`))
    assert.ok(repeatCounts.get(lines[intro + 1]) >= 6, pillar)
    assert.match(lines[intro + 2], /^그 .* 기질이 .* 위에 앉아 있어요\./)
    const tenGodHeading = /^배우자 자리\(일지\): ([가-힣]{2})$/.exec(lines[intro + 3])
    const introMeta = /([가-힣]{2}) 자리, 십이운성으로는 ([가-힣]{1,2})이에요/.exec(introText)
    const branchProof = /일간 . 기준 ([가-힣]{2})에 해당해요/.exec(lines[intro + 4])
    assert.ok(tenGodHeading && introMeta && branchProof, pillar)
    compareSource(pillar, 'dayBranchTenGod', intro, godIds[godNames.indexOf(introMeta[1])], dayBranchTenGod)
    compareSource(pillar, 'dayBranchTenGod', intro + 4, godIds[godNames.indexOf(tenGodHeading[1])], dayBranchTenGod)
    compareSource(pillar, 'dayBranchTenGod', intro + 5, godIds[godNames.indexOf(branchProof[1])], dayBranchTenGod)
    compareSource(pillar, 'twelveLifeStage', intro, TWELVE_STAGE_ORDER[stageNames.indexOf(introMeta[2])], twelveLifeStage)
    for (const [line, prefix] of supplementaryGodRefs) {
      if (line < start || line >= end) continue
      const mention = new RegExp(prefix + godLabel).exec(lines[line - 1])
      compareSource(pillar, 'dayBranchTenGod', line, godIds[godNames.indexOf(mention?.[1])], dayBranchTenGod)
    }
    for (const line of supplementaryStageRefs.filter(line => start <= line && line < end)) {
      const mention = /십이운성[^,。.?]{0,18}?(장생|목욕|관대|건록|제왕|쇠|병|사|묘|절|태|양)(?=\(|지|[에의으])/.exec(lines[line - 1])
      compareSource(pillar, 'twelveLifeStage', line, TWELVE_STAGE_ORDER[stageNames.indexOf(mention?.[1])], twelveLifeStage)
    }

    const evidenceCount = new Map(fields.map(field => [field, 0]))
    const gapFields = []
    let traitEvidence = 0
    for (const note of profile.evidenceNotes) {
      assert.equal(note.sourceType, 'day_pillar')
      assert.equal(note.sourceId, pillar)
      if (note === metadata[0]) continue
      assert.ok(note.fields.length && note.fields.every(field => fields.includes(field)), pillar)
      if (!note.sourceRef) {
        assert.equal(note.note, 'source_gap')
        gapFields.push(...note.fields)
        continue
      }
      const [from, to] = sourceRange(note.sourceRef, start, end)
      assert.ok(to - from <= 11, `Wide trait evidence: ${pillar} L${from}-L${to}`)
      assert.ok(to < intro || from > intro + 7, `Trait evidence overlaps a repeated source block: ${pillar}`)
      traitEvidence++
      assert.equal(note.fields.length, 1, pillar)
      assert.ok(Object.hasOwn(confidence, note.confidence), pillar)
      confidence[note.confidence]++
      const [field] = note.fields
      evidenceCount.set(field, evidenceCount.get(field) + 1)
    }

    assert.ok(traitEvidence > 0 || gapFields.length === fields.length, `Missing trait evidence or explicit gaps: ${pillar}`)
    const flat = []
    assert.equal(new Set(gapFields).size, gapFields.length, pillar)
    for (const field of fields) {
      assert.ok(Array.isArray(profile[field]), `${pillar}.${field}`)
      assert.equal(profile[field].length, evidenceCount.get(field), `${pillar}.${field}`)
      assert.equal(gapFields.includes(field), profile[field].length === 0, `${pillar}.${field}`)
      if (field === 'internalConflict') {
        for (const conflict of profile[field]) {
          assert.deepEqual(Object.keys(conflict).sort(), ['possibleExpression', 'sourceA', 'sourceB', 'tension'])
          assert.ok(Array.isArray(conflict.possibleExpression), pillar)
          flat.push(conflict.sourceA, conflict.sourceB, conflict.tension, ...conflict.possibleExpression)
        }
      } else {
        flat.push(...profile[field])
      }
    }
    const stemTraits = arrayEntries(DAY_STEM_PROFILES[dayStem]).map(normalize)
    const tenGodTraits = [...new Set(arrayEntries(TEN_GOD_PROFILES[dayBranchTenGod]).map(normalize))]
    for (const trait of flat) {
      assert.ok(typeof trait === 'string' && trait.trim(), pillar)
      assert.doesNotMatch(trait, forbidden, pillar)
      assert.ok(!stemTraits.some(stemTrait => nearDuplicate(normalize(trait), stemTrait)), `P2-A stem duplicate: ${pillar} ${trait}`)
    }
    const ownTraits = new Set(flat.map(normalize))
    assert.ok(!tenGodTraits.every(trait => ownTraits.has(trait)), `Generic TenGod bundle copied: ${pillar}`)

    const pillarReasons = profile.excludedClaims.map(claim => claim.exclusionReason)
    assert.equal(new Set(pillarReasons).size, pillarReasons.length, pillar)
    for (const claim of profile.excludedClaims) {
      assert.ok(Object.hasOwn(excluded, claim.exclusionReason), pillar)
      assert.ok(claim.sourceTextSummary, pillar)
      sourceRange(claim.sourceRef, start, end)
      excluded[claim.exclusionReason]++
    }
    coverage.push({
      pillar, dayStem,
      counts: Object.fromEntries(fields.map(field => [field, profile[field].length])),
      evidence: profile.evidenceNotes.filter(note => note.sourceRef).length,
      gap: gapFields.length,
    })
  }

  for (const stem of stemOrder) assert.equal(coverage.filter(row => row.dayStem === stem).length, 6)
  if (process.argv.includes('--coverage')) {
    console.log(JSON.stringify({ coverage, confidence, excluded, sourceConflicts }))
  } else {
    console.log('PASS: DayPillar 60/60, detected sections 60/60, each stem 6/6')
    console.log('Duplicate pillars, missing identities, forbidden traits, missing provenance/gaps, P2-A copy violations: 0')
    console.log(`SOURCE_CONFLICT: ${sourceConflicts.length}`)
    for (const conflict of sourceConflicts) console.log(JSON.stringify(conflict))
  }
} finally {
  await server.close()
}
