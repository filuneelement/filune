import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, hmr: false, ws: false } })
const births = [
  { name: 'Same', birth: { date: { year: 1970, month: 7, day: 29 }, time: { known: true, value: { hour: 20, minute: 0 } },
    gender: '女性', timeCorrectionMode: 'none' } },
  { name: 'Same', birth: { date: { year: 1962, month: 2, day: 7 }, time: { known: true, value: { hour: 4, minute: 0 } },
    gender: '男性', timeCorrectionMode: 'none' } },
]
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

try {
  const { prepareCompatibilityProductResult } = await server.ssrLoadModule('/src/lib/product/prepareCompatibilityProductResult.ts')
  const { prepareProductResult } = await server.ssrLoadModule('/src/lib/product/prepareProductResult.ts')
  const [{ default: CompatibilityInput }, { default: CompatibilityResult }, { messages }]
    = await Promise.all([
      server.ssrLoadModule('/src/components/compatibility/CompatibilityInput.tsx'),
      server.ssrLoadModule('/src/components/compatibility/CompatibilityResult.tsx'),
      server.ssrLoadModule('/src/i18n/index.ts'),
    ])
  const before = JSON.stringify(births)
  const outputs = []
  for (const locale of ['ko', 'ja', 'en']) {
    const input = freeze(structuredClone(births))
    const result = await prepareCompatibilityProductResult({ first: input[0], second: input[1], locale,
      relationshipStatus: 'dating', referenceTime: '2028-03-01T00:00:00.000Z' })
    assert.equal(result.kind, 'compatibility')
    assert.equal(result.locale, locale)
    assert.equal(result.referenceTime, '2028-03-01T00:00:00.000Z')
    assert.deepEqual(result.final.identity.inputOrder, ['compatibility:first', 'compatibility:second'])
    assert.equal(result.final.userContext?.relationshipStatus, 'dating')
    assert.ok(Array.isArray(result.customerResult.sections))
    assert.ok(Array.isArray(result.customerResult.timeline))
    assert.ok(result.customerResult.sections.length > 0)
    const resultMarkup = renderToStaticMarkup(createElement(CompatibilityResult, {
      locale, result: result.customerResult, messages: messages[locale], onBack: () => {}, onHome: () => {},
    }))
    assert.ok(resultMarkup.includes(result.customerResult.sections[0].heading))
    assert.ok(resultMarkup.includes(messages[locale].compatibility.personA))
    assert.ok(resultMarkup.includes(messages[locale].compatibility.personB))
    assert.ok(resultMarkup.includes(messages[locale].compatibility.backToInput))
    assert.ok(resultMarkup.includes(messages[locale].compatibility.home))
    for (const section of result.customerResult.sections) {
      assert.ok(resultMarkup.includes(section.heading))
      for (const statement of section.statements) assert.ok(resultMarkup.includes(statement.text))
    }
    if (result.customerResult.timeline.length) assert.ok(resultMarkup.includes(result.customerResult.timeline[0].heading))
    for (const window of result.customerResult.timeline) {
      assert.ok(resultMarkup.includes(window.heading))
      for (const statement of window.statements) assert.ok(resultMarkup.includes(statement.text))
    }
    const inputMarkup = renderToStaticMarkup(createElement(CompatibilityInput, {
      locale, messages: messages[locale], disabled: false,
      initialPeople: input, onSubmit: () => {}, onBack: () => {},
    }))
    assert.ok(inputMarkup.includes(messages[locale].compatibility.personA))
    assert.ok(inputMarkup.includes(messages[locale].compatibility.personB))
    assert.ok(inputMarkup.includes('id="compatibility-location-first"'))
    assert.ok(inputMarkup.includes('id="compatibility-location-second"'))
    assert.ok(inputMarkup.includes('for="compatibility-location-first"'))
    assert.ok(inputMarkup.includes('for="compatibility-location-second"'))
    assert.doesNotThrow(() => JSON.stringify({
      kind: result.kind, locale: result.locale, referenceTime: result.referenceTime,
      first: input[0], second: input[1], customerResult: result.customerResult,
    }))
    assert.equal(JSON.stringify(input), JSON.stringify(births))
    outputs.push({ locale, inputRendered: true, sections: result.customerResult.sections.length,
      windows: result.customerResult.timeline.length, resultRendered: true })
  }
  assert.equal(JSON.stringify(births), before)
  const singleResult = await prepareProductResult(births[0].birth)
  assert.ok(singleResult.pillars && typeof singleResult.pillars.year === 'string')
  assert.equal(singleResult.reading, undefined)
  const noStatus = await prepareCompatibilityProductResult({ first: births[0], second: births[1], locale: 'en',
    referenceTime: '2028-03-01T00:00:00.000Z' })
  assert.equal(noStatus.final.userContext, undefined)
  console.log(JSON.stringify({ result: 'PASS', locales: outputs, singlePersonPreparation: 'PASS', fixedExecutionIds: true,
    sharedReferenceTime: true, explicitContextOnly: true, identicalNameIdentityCollision: false, inputMutation: 0 }, null, 2))
} finally {
  await server.close()
}
