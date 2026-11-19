import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { createServer } from 'vite'

const root = new URL('../', import.meta.url)
const daySource = 'src/docs/source/personality/일주풀이.md'
const tenSource = 'src/docs/source/personality/십성.md'
const sourceFiles = new Map()
const forbidden = /배우자|남편|아내|이혼|외도|궁합|결혼|이별|질병|수명|사고를? 당|음주|술을 피|부자[가로]|돈을 (?:많이|잘) 번다|성공한다|공무원|대기업|남자는|여자는|양팔통|음팔통|반드시|평생 고생|당신은/
const confidenceValues = ['source_explicit', 'source_synthesis', 'filune_interpretation']

function readLines(file) {
  if (!sourceFiles.has(file)) {
    sourceFiles.set(file, readFileSync(new URL(file, root), 'utf8').split(/\r?\n/))
  }
  return sourceFiles.get(file)
}

function resolveRef(ref) {
  const match = /^(src\/docs\/.+\.md)#L(\d+)(?:-L(\d+))?$/.exec(ref)
  assert.ok(match, `Invalid sourceRef: ${ref}`)
  const [, file, start, end = start] = match
  const lines = readLines(file)
  assert.ok(+start > 0 && +start <= +end && +end <= lines.length, ref)
  const excerpt = lines.slice(+start - 1, +end)
  assert.ok(excerpt.some(line => line.trim()), ref)
  return { file, start: +start, excerpt }
}

function verifyTraits(traits, label) {
  assert.ok(Array.isArray(traits), label)
  assert.equal(new Set(traits).size, traits.length, `Duplicate trait: ${label}`)
  for (const trait of traits) {
    assert.ok(typeof trait === 'string' && trait.trim(), label)
    assert.doesNotMatch(trait, forbidden, label)
  }
}

function validate(file, name, registry, expected, identity, sourceType, fields, variantIds) {
  const counts = {}
  const source = ts.createSourceFile(file, readFileSync(new URL(file, root), 'utf8'), ts.ScriptTarget.Latest, true)
  const declarations = source.statements.filter(ts.isVariableStatement).flatMap(node => [...node.declarationList.declarations])
  const registryDeclaration = declarations.find(node => node.name.getText(source) === name)
  assert.ok(ts.isSatisfiesExpression(registryDeclaration.initializer), name)
  const literal = registryDeclaration.initializer.expression
  assert.ok(ts.isObjectLiteralExpression(literal), name)
  const declaredKeys = literal.properties.map(property => property.name.getText(source))
  assert.equal(new Set(declaredKeys).size, declaredKeys.length, `Duplicate key: ${name}`)
  assert.deepEqual(Object.keys(registry).sort(), [...expected].sort(), name)

  for (const [id, profile] of Object.entries(registry)) {
    const variants = sourceType === 'ten_god' ? ['traitVariants'] : []
    assert.deepEqual(Object.keys(profile).sort(), [identity, 'evidenceNotes', ...fields, ...variants].sort(), id)
    assert.equal(profile[identity], id)
    const evidence = profile.evidenceNotes.filter(note => note.sourceRef)
    assert.ok(evidence.length > 0, `Missing provenance: ${id}`)
    const gapFields = profile.evidenceNotes.filter(note => note.note === 'source_gap').flatMap(note => note.fields)
    const covered = new Set()
    for (const note of profile.evidenceNotes) {
      assert.equal(note.sourceType, sourceType)
      assert.equal(note.sourceId, id)
      assert.ok(note.fields.length > 0 && note.fields.every(field => fields.includes(field)), id)
      if (!note.sourceRef) {
        assert.equal(note.note, 'source_gap', id)
        continue
      }
      assert.ok(confidenceValues.includes(note.confidence), id)
      const excerpts = [note.sourceRef, ...(note.corroboratingRefs ?? [])].map(resolveRef)
      if (sourceType === 'day_stem') {
        assert.ok(excerpts.every(entry => entry.file === daySource), id)
        if (note.confidence === 'source_synthesis') {
          const stemName = '갑을병정무기경신임계'[expected.indexOf(id)]
          assert.equal(new Set(excerpts.map(entry => entry.start)).size, 6, id)
          assert.ok(excerpts.every(({ excerpt }) =>
            excerpt.length === 2 && excerpt[0] === `어떤 사람인가요? 일간 ${stemName}의 기질` &&
            excerpt[1] === excerpts[0].excerpt[1]), id)
        }
      }
      if (sourceType === 'ten_god') assert.ok(excerpts.every(entry => entry.file === tenSource), id)
      for (const field of note.fields) covered.add(field)
    }
    for (const field of fields) {
      const traits = profile[field]
      verifyTraits(traits, `${id}.${field}`)
      assert.equal(covered.has(field), traits.length > 0, `Evidence coverage: ${id}.${field}`)
      assert.equal(gapFields.includes(field), traits.length === 0, `Source gap coverage: ${id}.${field}`)
    }
    for (const variant of profile.traitVariants ?? []) {
      assert.ok(variant.id && !variantIds.has(variant.id), `Duplicate variant: ${variant.id}`)
      variantIds.add(variant.id)
      verifyTraits([variant.trait], variant.id)
      for (const condition of variant.condition ?? []) verifyTraits([condition.context], variant.id)
      assert.equal(resolveRef(variant.sourceRef).file, tenSource)
      assert.ok(confidenceValues.includes(variant.confidence), variant.id)
      assert.ok(['core', 'positive', 'shadow', 'excess', 'deficiency', 'contextual', 'traditional', 'modern'].includes(variant.expressionType), variant.id)
    }
    counts[id] = { evidence: evidence.length, sourceGap: gapFields.length }
  }
  const traitSignatures = Object.values(registry).map(profile =>
    JSON.stringify(fields.flatMap(field => profile[field]).sort()))
  assert.equal(new Set(traitSignatures).size, expected.length, `Duplicate trait bundles: ${name}`)
  return counts
}

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const path = 'src/lib/personality/knowledge/'
  const { DAY_STEM_PROFILES } = await server.ssrLoadModule('/' + path + 'dayStemProfiles.ts')
  const { TEN_GOD_PROFILES } = await server.ssrLoadModule('/' + path + 'tenGodProfiles.ts')
  const { POSITION_EXPRESSION_RULES } = await server.ssrLoadModule('/' + path + 'positionRules.ts')
  const { TEN_GOD_TO_PERSONALITY_ID } = await server.ssrLoadModule('/src/lib/personality/types.ts')

  const day = validate(path + 'dayStemProfiles.ts', 'DAY_STEM_PROFILES', DAY_STEM_PROFILES, [...'甲乙丙丁戊己庚辛壬癸'], 'stem', 'day_stem',
    ['coreNature', 'coreDrive', 'strengths', 'shadowTraits', 'decisionStyle', 'socialExpression', 'innerExpression', 'stressResponse', 'growthDirection'])
  const tenGods = '比肩 劫財 食神 傷官 偏財 正財 偏官 正官 偏印 正印'.split(' ')
  const ten = validate(path + 'tenGodProfiles.ts', 'TEN_GOD_PROFILES', TEN_GOD_PROFILES, tenGods, 'tenGod', 'ten_god',
    ['coreDrive', 'coreStrengths', 'ordinaryExpression', 'productiveExpression', 'excessiveExpression', 'deficientExpression', 'socialExpression',
      'innerExpression', 'workStyle', 'relationshipStyle', 'decisionStyle', 'stressResponse', 'cautionPatterns'], new Set())
  const positions = validate(path + 'positionRules.ts', 'POSITION_EXPRESSION_RULES', POSITION_EXPRESSION_RULES,
    ['stem', 'branch', 'month_branch', 'day_branch', 'hour_branch', 'year_branch'], 'positionType', 'position', ['expressionDomain', 'interpretationRules'])
  assert.equal(TEN_GOD_TO_PERSONALITY_ID.印綬, '正印')
  assert.deepEqual(Object.values(TEN_GOD_TO_PERSONALITY_ID).sort(), [...tenGods].sort())
  const coreAxes = ['주체성|독립성', '모험성|경쟁성', '창조성|연구·탐구', '혁신성|응용성', '과감성|통제성',
    '치밀성|정확성', '권력성|극기성', '명예성|합리성', '신비성|영감성', '교육성|자비성']
  tenGods.forEach((id, index) => assert.deepEqual(TEN_GOD_PROFILES[id].coreDrive, coreAxes[index].split('|'), id))
  if (process.argv.includes('--coverage')) {
    console.log(JSON.stringify({ day, ten, positions, dayProfiles: DAY_STEM_PROFILES, tenProfiles: TEN_GOD_PROFILES }))
  } else {
    console.log('PASS: DayStem 10/10, TenGod 10/10, Position 6/6')
    console.log('Duplicate keys, missing identities, forbidden trait fields/text, missing provenance: 0')
  }
} finally {
  await server.close()
}
