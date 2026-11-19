import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'
import { auditResult } from './verify-personality-renderer-en-p3e.mjs'

const { comparison, rendered } = auditResult
const server = await createServer({
  appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
  server: { hmr: false, middlewareMode: true, ws: false },
})
const load = name => server.ssrLoadModule(`/src/lib/personality/${name}.ts`)

try {
  const { isCustomerSafeEn } = await load('render/en/guardrails')
  const counters = {
    korean: /\p{Script=Hangul}/u,
    japaneseOrHan: /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,
    internalTerms: /\b(?:Day Master|Ten Gods|Heavenly Stems|Earthly Branches|Yong Shen|Xiang Shen|Bing|Jiu Ying|Seven Killings|Hurting Officer|Rob Wealth|sourceFactIds?|RoleModifier)\b/iu,
    fortune: /\b(?:the stars foretell|destiny decrees|fated|doomed|thou|thy)\b/iu,
    fear: /\b(?:danger|disaster|doom|curse|misfortune|beware)\b/iu,
    lifeAssumptions: /\byour (?:husband|wife|children|boss|company)\b/iu,
    events: /\b(?:you (?:changed jobs|broke up|failed|succeeded)|(?:you'll|you will) (?:succeed|fail|leave your job|meet someone))\b/iu,
    health: /\b(?:pain|stiffness|blocked|hospital|check[ -]?up)\b/iu,
    score: /[%％★]|\b(?:score|odds|rating|stars|rank)\b/iu,
    prominence: /\b(?:strongest trait|most dominant|number[ -]one|greatest strength)\b/iu,
    unsupportedAdvice: /\b(?:for entertainment only|everyone is different|your fate is in your hands|don't worry|that's okay|trust yourself|you should embrace this)\b/iu,
    translationCliches: /\b(?:the tendency of|the side of you which|in the case where|it can be seen that|this side of you)\b/iu,
  }
  for (const value of ['You failed.', 'You succeeded.', 'Trust yourself.']) assert.ok(!isCustomerSafeEn(value))
  for (const [id, output] of Object.entries(rendered)) {
    for (const block of Object.values(output).filter(item => item.heading)) {
      const content = block.heading + '\n' + block.text
      for (const [name, pattern] of Object.entries(counters)) assert.doesNotMatch(content, pattern, `${id}: ${name}`)
      assert.doesNotMatch(block.text, /\b(?:may|might|can) (?:also )?(?:can|may|might|sometimes|tend to)\b/u, id)
      if (block === output.currentExpression) {
        assert.doesNotMatch(block.text, /\b(?:naturally, you|you've always been|you are naturally|you were born)\b/iu, id)
      }
    }
  }

  // These Natal facts assert an existing tendency while retaining a possibility in its content.
  const examples = Object.values(rendered).flatMap(output => output.cautions?.paragraphs ?? [])
  const intrinsic = examples.find(p => p.text.includes('sometimes feel deeply unsettled when pressure to hold back your views continues'))
  assert.ok(intrinsic, 'missing the condition or possibility within the sourced trait')
  assert.equal(intrinsic.certainty, 'confirmed')
  assert.match(comparison.B, /Around other people,.*may.*Privately,.*may/u)
  assert.match(comparison.C, /want to be out in front.*hesitate while checking.*feel pulled/u)
  assert.match(comparison.K, /When support is needed.*can help keep/u)
  assert.match(comparison.L, /everyday situations.*When this response overlaps.*can get in the way/u)
  assert.match(comparison.M, /^Right now.*is getting in the way/u)
  assert.doesNotMatch(comparison.M, /\b(?:may|might|perhaps|possibly)\b/u)
  assert.match(comparison.reduced, /can help keep.*That effect is weaker/u)
  assert.equal(comparison.P, '')

  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(auditResult, null, 2) + '\n')
  console.log('PASS P3-F: English guardrails, intrinsic qualifications, actual role wording and expired exclusion')
} finally {
  await server.close()
}
