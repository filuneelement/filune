import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const fixtures = JSON.parse(await readFile(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))
const output = new URL('../artifacts/phase4/', import.meta.url)
const write = process.argv.includes('--write')
// Delivered Phase 4-C manuscripts, before applied interpretation.
const baselineKo = {
  'CS-005': [674, 743, 362, 525, 685, 244, 451],
  'CS-126': [168, 618, 220, 293, 676, 921, 827],
  'CS-127': [362, 724, 460, 711, 635, 0, 852],
}
const baselineSemantics = {
  'CS-005': [6, 5, 3, 6, 7, 1, 5],
  'CS-126': [4, 5, 3, 4, 6, 8, 7],
  'CS-127': [3, 5, 6, 8, 5, 0, 6],
}
const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })

try {
  const { prepareProductResult } = await server.ssrLoadModule('/src/lib/product/prepareProductResult.ts')
  const { readBirthCustomerPlan } = await server.ssrLoadModule('/src/lib/product/readBirthChart.ts')
  const { default: PremiumResultPreview } = await server.ssrLoadModule('/src/components/result/PremiumResultPreview.tsx')
  const { messages } = await server.ssrLoadModule('/src/i18n/index.ts')
  const locales = ['ko', 'ja', 'en']
  const metrics = {}
  const reviewDir = new URL('../artifacts/phase4/review-plans/', import.meta.url)
  const review = process.argv.includes('--review')
  if (write) await mkdir(output, { recursive: true })
  if (review) await mkdir(reviewDir, { recursive: true })
  for (const id of ['CS-005', 'CS-126', 'CS-127']) {
    const fixture = fixtures[id]
    const birth = { date: fixture.date, time: { known: true, value: fixture.time }, gender: '女性', timeCorrectionMode: 'none' }
    const referenceTime = id === 'CS-126' ? '2027-07-15T00:00:00Z' : '2027-01-15T00:00:00Z'
    const { customerReading } = await prepareProductResult(birth, { referenceTime, productScope: 'premium', customerReadingLocales: locales })
    if (review) {
      const plan = readBirthCustomerPlan(birth, { referenceTime, productScope: 'premium' })
      const raw = JSON.stringify(plan, (key, value) => [
        'birthInput', 'customerReadingContext', 'customerContext', 'name', 'email', 'phone', 'birthplace',
      ].includes(key) ? undefined : value, 2)
      // Preserve identifiers and date equality without disclosing calendar instants.
      const dates = /\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?|-?\b\d{11,13}\b/gu
      const key = text => /^-?\d+$/u.test(text) ? Number(text) : Date.parse(text)
      const timeline = new Map([...new Set([...raw.matchAll(dates)].map(([text]) => key(text)))]
        .sort((a, b) => a - b).map((instant, index) => [instant, `T${String(index + 1).padStart(3, '0')}`]))
      const safe = JSON.stringify(JSON.parse(raw), (_, value) => typeof value === 'string'
        ? value.replace(dates, text => timeline.get(key(text)))
        : typeof value === 'number' && timeline.has(value) ? timeline.get(value) : value, 2)
      assert.doesNotMatch(safe, dates)
      await writeFile(new URL(`${id}.json`, reviewDir), safe + '\n', 'utf8')
    }
    const ids = chapters => chapters.map(chapter =>
      chapter.sections.flatMap(section => section.paragraphs.map(paragraph => paragraph.id)))
    assert.equal(customerReading.ko.length, 7)
    assert.ok(customerReading.ko[1].quality.structuralCauseCount > 0, `${id} natal pattern interpretation`)
    assert.ok(customerReading.ko[2].quality.structuralCauseCount > 0, `${id} adjudicated damage interpretation`)
    assert.ok(customerReading.ko[6].quality.structuralCauseCount > 0, `${id} dated structural interpretation`)
    const nextYearCopy = customerReading.ko[6].sections.flatMap(section => section.paragraphs)
      .map(paragraph => paragraph.text).find(text => text.startsWith('다음 해 흐름에서는'))
    assert.ok(nextYearCopy, `${id} next solar year interpretation`)
    assert.match(nextYearCopy, id === 'CS-126' ? /2028년 2월/u : /2027년 2월/u)
    assert.ok(ids(customerReading.ko)[4].some(id => id.includes(':linked-response')), `${id} linked functional chain`)
    if (id === 'CS-126') {
      assert.ok(ids(customerReading.ko)[1].some(id => id.includes(':learning')), 'conditional detail learning')
      assert.ok(ids(customerReading.ko)[6].some(id => id.includes(':coordination')), 'evaluated repeated configuration')
      const plan = readBirthCustomerPlan(birth, { referenceTime, productScope: 'premium' })
      const currentDecade = plan.semanticUnits.find(unit => unit.scope === 'daewoon'
        && unit.structuralInterpretation?.kind === 'axis' && !unit.structuralInterpretation.comparison)
      const cutoff = Date.parse(currentDecade?.period?.to?.instant)
      assert.ok(Number.isFinite(cutoff) && cutoff > Date.parse(referenceTime))
      const nextYear = plan.semanticUnits.find(unit => unit.scope === 'sewoon'
        && unit.structuralInterpretation?.kind === 'axis' && unit.structuralInterpretation.evaluatedWindow)
      assert.ok(Date.parse(nextYear?.period?.from?.instant) > cutoff,
        'the next solar year starts beyond the intervening long-term boundary')
      const evaluated = plan.semanticUnits.filter(unit => unit.period && ['sewoon', 'month'].includes(unit.scope)
        && unit.meaningRef.kind === 'outcome_fact'
        && unit.period.from?.kind === 'exact' && Date.parse(unit.period.from.instant) < cutoff)
      assert.ok(evaluated.length, 'CS-126 has evaluated outcomes before the long-term boundary')
      assert.ok(evaluated.every(unit => unit.period.to?.kind === 'exact'
        && Date.parse(unit.period.to.instant) <= cutoff), 'publish only within the parent used for evaluation')
      assert.ok(plan.semanticUnits.some(unit => unit.structuralInterpretation?.contentId === 'manageable_scope'))
      const after = readBirthCustomerPlan(birth, { referenceTime: new Date(cutoff).toISOString(), productScope: 'premium' })
      assert.ok(after.semanticUnits.some(unit => ['sewoon', 'month'].includes(unit.scope)
        && unit.period?.from?.kind === 'exact' && Date.parse(unit.period.from.instant) === cutoff),
      'a fresh evaluation after the boundary starts its publication interval at that boundary')
    }
    if (id === 'CS-127') {
      const wealth = customerReading.ko[5].sections.flatMap(section => section.paragraphs)
      assert.ok(wealth.some(paragraph => paragraph.id.includes(':latent-goal')), 'a supported goal and production reading is present')
      assert.ok(wealth.every(paragraph => paragraph.id.includes('structural-interpretation:')), 'no new Money Outcome assertion')
    }
    for (const locale of locales) {
      const selected = ids(customerReading[locale])
      const expected = ids(customerReading.ko)
      assert.ok(JSON.stringify(selected) === JSON.stringify(expected),
        `${id} ${locale} semantic placement differs in chapters ${selected.flatMap((row, i) =>
          JSON.stringify(row) === JSON.stringify(expected[i]) ? [] : [i + 1,
            expected[i].filter(id => !row.includes(id)), row.filter(id => !expected[i].includes(id))]).join(', ')}`)
      const chapters = customerReading[locale]
      const published = chapters.flatMap(chapter => chapter.sections.flatMap(section =>
        section.paragraphs.map(paragraph => paragraph.text.normalize('NFC').replace(/\s+/gu, ' ').trim())))
      assert.equal(new Set(published).size, published.length, `${id} ${locale} repeated customer paragraph`)
      assert.ok(chapters.every(chapter => chapter.quality.unsupportedClaimCount
        === chapter.quality.excludedCandidateCount + chapter.quality.rejectedPlannedClaimCount))
      const markup = renderToStaticMarkup(createElement(PremiumResultPreview, {
        copy: messages[locale].resultPreview, authorizedReading: { locale, chapters },
      }))
      assert.equal((markup.match(/<h2 id="premium-chapter-/gu) ?? []).length, 7)
      assert.ok(markup.includes(`lang="${locale}"`))
      assert.deepEqual(chapters.map(chapter => chapter.quality.structuralCauseCount),
        customerReading.ko.map(chapter => chapter.quality.structuralCauseCount), `${id} ${locale} structural cause coverage`)
      const empty = {
        ko: '이 장에서 구체적으로 설명할 수 있는 판단이 아직 확인되지 않았습니다.',
        ja: 'この章で具体的にお伝えできる判断は、まだ確認できていません。',
        en: 'There is not yet enough evidence for a specific reading in this chapter.',
      }[locale]
      const body = chapters.map(chapter => {
        const content = chapter.sections.filter(section => section.paragraphs.length)
        return [`## ${chapter.number}. ${chapter.title}`, ...(content.length ? content.flatMap(section => [
          ...(content.length > 1 ? [`### ${section.title}`] : []),
          ...section.paragraphs.map(({ text }) => text),
        ]) : [empty])].join('\n\n')
      }).join('\n\n')
      assert.ok(!/\b(?:CL-[A-Z]\d+|CR-0\d|SOURCE_GAP|ENGINE_GAP|HO-0\d)\b/u.test(body))
      metrics[id] ??= {}
      metrics[id][locale] = {
        referenceTime, totalCharacters: chapters.reduce((sum, chapter) => sum + chapter.quality.characterCount, 0),
        chapters: chapters.map(({ number, quality, sections }) => ({ number, ...quality,
          ...(locale === 'ko' && { baselineCharacterCount: baselineKo[id][number - 1],
            baselineDistinctSemanticCount: baselineSemantics[id][number - 1],
            structuralParagraphIds: sections.flatMap(section => section.paragraphs
              .filter(paragraph => paragraph.id.includes('structural-interpretation:')).map(paragraph => paragraph.id)),
          }),
        })),
      }
      if (write) await writeFile(new URL(`${id}-${locale}.md`, output), `# ${id}\n\n${body}\n`, 'utf8')
    }
  }
  const fixture = fixtures['CS-127']
  const free = await prepareProductResult({ date: fixture.date, time: { known: true, value: fixture.time },
    gender: '女性', timeCorrectionMode: 'none' }, { referenceTime: '2027-01-15T00:00:00Z', productScope: 'free', customerReadingLocales: locales })
  assert.ok(locales.every(locale => free.customerReading[locale].length === 3))
  assert.ok(locales.every(locale => free.customerReading[locale].every(chapter => chapter.quality.structuralCauseCount === 0)))
  const lockedMarkup = renderToStaticMarkup(createElement(PremiumResultPreview, {
    copy: messages.ko.resultPreview, authorizedReading: { locale: 'ko', chapters: free.customerReading.ko },
  }))
  assert.ok(!lockedMarkup.includes('premium-chapter-'))
  const additionalPlan = readBirthCustomerPlan({
    date: { year: 1991, month: 10, day: 23 }, time: { known: true, value: { hour: 1, minute: 30 } },
    gender: '女性', timeCorrectionMode: 'none',
  }, { referenceTime: '2027-07-15T00:00:00Z', productScope: 'premium' })
  assert.equal(additionalPlan.chapterGroups.length, 7)
  assert.ok(additionalPlan.semanticUnits.some(unit => unit.structuralInterpretation?.contentId)
    || additionalPlan.chapters.some(chapter => chapter.paragraphPlans.some(paragraph => paragraph.expression.contentId)),
    'independent BirthInput selects common interpretation content')
  if (write) await writeFile(new URL('metrics.json', output), JSON.stringify(metrics, null, 2) + '\n', 'utf8')
  console.log(JSON.stringify(metrics))
} finally {
  await server.close()
}
