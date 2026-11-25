import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ts from 'typescript'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const personalityDir = path.join(root, 'src/lib/personality')
const pillarSource = 'src/docs/source/personality/일주풀이.md'
const tenGodSource = 'src/docs/source/personality/십성.md'
const stems = [...'甲乙丙丁戊己庚辛壬癸']
const gods = '比肩 劫財 食神 傷官 偏財 正財 偏官 正官 偏印 正印'.split(' ')
const locations = ['stem', 'branch', 'month_branch', 'day_branch', 'hour_branch', 'year_branch']
const references = new Map()

// Findings from editorial comparison. The verifier checks whether each audited value is still present.
const findings = [
  { kind: 'MISSING_EXTRACTION', layer: 'day_stem', id: '丁', field: 'stressResponse', ref: pillarSource + '#L436', note: '속상한 사건이 생겼을 때 말을 아끼는 반응이 반복 문단에 명시된다. 현재 필드에는 사건과 반응의 연결이 없다.' },
  { kind: 'MISSING_EXTRACTION', layer: 'ten_god', id: '偏印', field: 'socialExpression', ref: tenGodSource + '#L850-L853', note: '편인이 강할 때 집단에 섞이기 어렵다는 사회적 발현이 본문에 있다.' },
  { kind: 'MISSING_EXTRACTION', layer: 'ten_god', id: '正印', field: 'relationshipStyle', ref: tenGodSource + '#L322-L329', note: '과다 맥락에서 관계가 원만해 보이더라도 주위와 거리감을 느낄 수 있다고 명시한다.' },
  { kind: 'MISSING_EXTRACTION', layer: 'day_pillar', id: '戊辰', field: 'strengths', ref: pillarSource + '#L493-L499', note: '융통성을 갖춘 상태에서도 유지되는 꼼꼼함과 책임감을 별도 강점으로 설명한다.' },
  { kind: 'MISSING_EXTRACTION', layer: 'day_pillar', id: '庚子', field: 'decisionStyle', ref: pillarSource + '#L2698-L2700', note: '스스로 미룰 만하다고 판단한 일을 자기 마감 기준에 맞춰 처리하는 판단 패턴이 있다.' },
  { kind: 'MISSING_EXTRACTION', layer: 'day_pillar', id: '辛丑', field: 'decisionStyle', ref: pillarSource + '#L2764-L2768', note: '신중하게 움직이며 최소한의 행동으로 효율을 높이려 한다는 판단 기준이 있다.' },
  { kind: 'MISSING_EXTRACTION', layer: 'day_pillar', id: '癸卯', field: 'growthDirection', ref: pillarSource + '#L2895-L2905', note: '낯선 과제에서 집중력이 급히 떨어진다는 사실과, 과거 경험을 새 과제의 적응에 활용하라는 조언이 이어진다.' },
  { kind: 'UNSUPPORTED_TRAIT', layer: 'day_stem', id: '壬', field: 'coreDrive', trait: '새로운 환경과 경험 탐색', ref: pillarSource + '#L811-L812', note: '반복 문단은 한곳에서 느끼는 답답함과 이동 후 얻은 지식을 말한다. 새 경험을 얻으려고 이동한다는 동기는 제시하지 않는다.' },
  { kind: 'UNSUPPORTED_TRAIT', layer: 'day_pillar', id: '癸巳', field: 'expressionPattern', trait: '친절하고 부드러워 보이면서도 안으로는 목적과 실속을 빠르게 따짐', ref: pillarSource + '#L2153-L2160', note: '2158행은 부드러운 외관과 냉정한 실속 판단을 지지한다. 2153–2155행의 빠른 실행을 이 내면 판단의 속도로 옮길 결합 근거가 없다.' },
  { kind: 'UNSUPPORTED_TRAIT', layer: 'day_pillar', id: '丙辰', field: 'branchNature', trait: '온도와 반응이 달라지는 변동성', ref: pillarSource + '#L3752-L3754', note: '진토의 이중성과 변동성은 명시되지만, 지지 자체의 온도 변화는 명시되지 않는다.' },
  { kind: 'UNSUPPORTED_TRAIT', layer: 'day_pillar', id: '己酉', field: 'strengths', trait: '새로운 것을 배우고 분석해 앞으로의 계획에 활용하려 함', ref: pillarSource + '#L3297-L3299', note: '배움·분석·미래지향성은 명시된다. 배운 것을 계획에 적용하려는 과정은 인용 범위에 없다.' },
]

function resolveRef(ref, allowRules = false) {
  const m = /^(src\/docs\/(?:source\/personality|rules\/master)\/[^#]+\.md)#L(\d+)(?:-L(\d+))?$/.exec(ref)
  assert.ok(m, ref)
  const [, file, start, end = start] = m
  assert.ok(file === pillarSource || file === tenGodSource || (allowRules && /^src\/docs\/rules\/master\/(?:11-personality-master|12-personality-knowledge-schema)\.md$/.test(file)), ref)
  if (!references.has(file)) references.set(file, readFileSync(path.join(root, file), 'utf8').split(/\r?\n/))
  const lines = references.get(file)
  assert.ok(+start > 0 && +start <= +end && +end <= lines.length, ref)
  assert.ok(lines.slice(+start - 1, +end).some(line => line.trim()), ref)
  return { file, start: +start, end: +end }
}

const customer = /당신(?:은|이|에게|의)|여러분(?:은|의|께)|(?:하|입|됩)니다[.!?]/
const gender = /(?:남성|여성|남자|여자)(?:은|는|라면|의 경우)/
const prediction = /배우자|남편|아내|결혼|이혼|외도|궁합|재물복|재물운|직업운|건강운|질병|수명|공무원|대기업|전문직|돈을 (?:잘|많이) 번|부자가 된|사업에 성공/
const deterministic = /반드시|무조건|평생|결국|할 수밖에 없/
const positionRule = /(?:천간|지지|월지|일지|시지|년지|연지)\s*(?:=|은|는|를)\s*(?:외부 표현|내재 판단|타고난 본성|내부 결정 기준|개인적 욕구|보조 맥락)/
const polarity = /길신|흉신|좋은 사람|나쁜 성격|good personality|bad personality/i

function traitStrings(field, item) {
  if (field === 'traitVariants') return [item.trait, ...(item.condition ?? []).map(rule => rule.context)]
  if (field === 'internalConflict') return [item.sourceA, item.sourceB, item.tension, ...item.possibleExpression]
  return [item]
}

function auditRegistry(layer, registry, identity, ids) {
  assert.deepEqual(Object.keys(registry).sort(), [...ids].sort(), layer)
  const metadata = new Set(['evidenceNotes', 'excludedClaims', 'dayStem', 'dayBranch', 'dayBranchTenGod', 'twelveLifeStage', identity])
  const coverage = {}
  for (const [id, profile] of Object.entries(registry)) {
    assert.equal(profile[identity], id)
    const arrays = Object.keys(profile).filter(field => !metadata.has(field))
    const evidence = profile.evidenceNotes.filter(note => note.sourceRef)
    const gap = profile.evidenceNotes.filter(note => note.note === 'source_gap').flatMap(note => note.fields)
    assert.equal(new Set(gap).size, gap.length, id)
    assert.ok(evidence.length > 0 || gap.length > 0, id)
    for (const note of profile.evidenceNotes) {
      assert.equal(note.sourceId, id)
      assert.equal(note.sourceType, layer)
      if (note.sourceRef) {
        for (const ref of [note.sourceRef, ...(note.corroboratingRefs ?? [])]) resolveRef(ref, layer === 'position')
        const nonCore = layer === 'position' || (layer === 'day_stem' && note.fields.every(field => field === 'growthDirection'))
        assert.ok(['source_explicit', 'source_synthesis', ...(nonCore ? ['filune_interpretation'] : [])].includes(note.confidence), id)
      } else {
        assert.equal(note.note, 'source_gap', id)
      }
    }

    let traits = 0
    for (const field of arrays) {
      assert.ok(Array.isArray(profile[field]), `${id}.${field}`)
      if (field !== 'traitVariants') {
        assert.equal(gap.includes(field), profile[field].length === 0, `${id}.${field}`)
        assert.equal(evidence.some(note => note.fields.includes(field)), profile[field].length > 0, `${id}.${field}`)
      }
      for (const item of profile[field]) {
        if (field === 'traitVariants') {
          assert.equal(resolveRef(item.sourceRef).file, tenGodSource)
          assert.ok(['source_explicit', 'source_synthesis'].includes(item.confidence))
        }
        for (const value of traitStrings(field, item)) {
          assert.ok(typeof value === 'string' && value.trim(), `${id}.${field}`)
          for (const rule of [customer, gender, prediction, deterministic]) assert.doesNotMatch(value, rule, id)
          if (layer === 'ten_god' || layer === 'day_pillar') assert.doesNotMatch(value, positionRule, id)
          if (layer === 'ten_god') assert.doesNotMatch(value, polarity, id)
        }
        traits++
      }
    }
    for (const claim of profile.excludedClaims ?? []) resolveRef(claim.sourceRef)
    coverage[id] = { traits, evidence: evidence.length, gap: gap.length, conflicts: profile.internalConflict?.length ?? 0 }
  }
  return coverage
}

function inspectImports() {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.app.json'), ts.sys.readFile)
  assert.ok(!config.error)
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options
  const graph = new Map()
  const cache = ts.createModuleResolutionCache(root, file => file, options)
  for (const listedFile of ts.sys.readDirectory(path.join(root, 'src'), ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'])) {
    const file = path.normalize(listedFile)
    const imports = ts.preProcessFile(readFileSync(file, 'utf8'), true, /\.[cm]?jsx?$/.test(file)).importedFiles
    graph.set(file, imports.flatMap(({ fileName }) => {
      const target = ts.resolveModuleName(fileName, file, options, ts.sys, cache).resolvedModule?.resolvedFileName
      const normalized = target && path.normalize(target)
      return normalized?.startsWith(path.join(root, 'src') + path.sep) ? [normalized] : []
    }))
  }

  const isPersonality = file => file.startsWith(personalityDir + path.sep)
  const reaches = (from, match, seen = new Set()) => {
    if (seen.has(from)) return false
    seen.add(from)
    return (graph.get(from) ?? []).some(to => match(to) || reaches(to, match, seen))
  }
  const structural = [...graph.keys()].filter(file => /^src\/lib\/(judgment|canonical)\//.test(path.relative(root, file).split(path.sep).join('/')))
  const personality = [...graph.keys()].filter(isPersonality)
  assert.ok(structural.length && personality.length)
  assert.deepEqual(structural.filter(file => reaches(file, isPersonality)), [], 'Structural import from Personality')
  assert.deepEqual(personality.filter(file => reaches(file, target => target === file)), [], 'Personality import cycle')
  return { structuralFiles: structural.length, personalityFiles: personality.length }
}

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
try {
  const knowledge = '/src/lib/personality/knowledge/'
  const { DAY_STEM_PROFILES: day_stem } = await server.ssrLoadModule(knowledge + 'dayStemProfiles.ts')
  const { TEN_GOD_PROFILES: ten_god } = await server.ssrLoadModule(knowledge + 'tenGodProfiles.ts')
  const { DAY_PILLAR_PROFILES: day_pillar } = await server.ssrLoadModule(knowledge + 'dayPillarProfiles.ts')
  const { POSITION_EXPRESSION_RULES: position } = await server.ssrLoadModule(knowledge + 'positionRules.ts')
  const { TEN_GOD_TO_PERSONALITY_ID: mapping } = await server.ssrLoadModule('/src/lib/personality/types.ts')
  const { calculateDayRelationships } = await server.ssrLoadModule('/src/lib/dayRelationships.ts')
  const { EARTHLY_BRANCH_ORDER: branches, calculateTwelveStage } = await server.ssrLoadModule('/src/lib/twelveStages.ts')
  const pillars = Array.from({ length: 60 }, (_, i) => stems[i % 10] + branches[i % 12])
  const registries = { day_stem, ten_god, day_pillar, position }
  const coverage = {
    day_stem: auditRegistry('day_stem', day_stem, 'stem', stems),
    ten_god: auditRegistry('ten_god', ten_god, 'tenGod', gods),
    day_pillar: auditRegistry('day_pillar', day_pillar, 'pillar', pillars),
    position: auditRegistry('position', position, 'positionType', locations),
  }
  assert.deepEqual({ ...mapping }, Object.fromEntries(gods.map(id => [id === '正印' ? '印綬' : id, id])))
  for (const stem of stems) assert.equal(Object.values(day_pillar).filter(profile => profile.dayStem === stem).length, 6)
  for (const pillar of pillars) {
    const profile = day_pillar[pillar]
    assert.equal(profile.dayStem, pillar[0])
    assert.equal(profile.dayBranch, pillar[1])
    const canonical = calculateDayRelationships(profile.dayStem, profile.dayBranch).mainHiddenTenGod
    assert.equal(profile.dayBranchTenGod, mapping[canonical], pillar)
    assert.equal(profile.twelveLifeStage, calculateTwelveStage(profile.dayStem, profile.dayBranch), pillar)
    assert.ok(day_stem[profile.dayStem] && ten_god[profile.dayBranchTenGod], pillar)
  }
  assert.equal(day_pillar.戊午.dayBranchTenGod, '正印')
  assert.equal(calculateDayRelationships('戊', '午').mainHiddenTenGod, '印綬')
  assert.match(references.get(pillarSource)[3836], /일지로는 편재/)
  assert.match(references.get(pillarSource)[3882], /정인 자리/)
  assert.match(references.get(pillarSource)[3887], /본기 천간.*정인/)
  for (const note of day_pillar.戊午.evidenceNotes.filter(note => note.sourceRef && !note.fields.includes('dayBranchTenGod'))) {
    const { start, end } = resolveRef(note.sourceRef)
    assert.ok(start >= 3860 && end <= 3866, note.sourceRef)
  }

  const imports = inspectImports()
  const active = findings.filter(finding => {
    resolveRef(finding.ref)
    const values = registries[finding.layer][finding.id][finding.field]
    return finding.kind === 'MISSING_EXTRACTION' ? values.length === 0 : values.includes(finding.trait)
  })
  const summary = {
    missingExtraction: active.filter(finding => finding.kind === 'MISSING_EXTRACTION').length,
    unsupportedTrait: active.filter(finding => finding.kind === 'UNSUPPORTED_TRAIT').length,
  }
  if (process.argv.includes('--coverage')) {
    console.log(JSON.stringify({ coverage, summary, findings: active, imports }))
  } else {
    console.log('PASS: 86 profiles/rules, canonical identity mismatch 0, provenance/wording checks and import isolation')
    for (const finding of active) console.log(`${finding.kind}: ${finding.id}.${finding.field} ${finding.ref}`)
    console.log(active.length ? 'P2-C FAIL: unresolved knowledge findings' : 'P2-C automated checks PASS')
  }
  if (active.length) process.exitCode = 1
} finally {
  await server.close()
}
