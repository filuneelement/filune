import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { JAPAN_LOCATIONS, searchJapanMunicipalities } = await server.ssrLoadModule('/src/lib/japanMunicipalitySearch.ts')
  const cases = [
    { query: '東京', match: (place) => place.displayName === '東京都' },
    { query: '新宿', match: (place) => place.displayName === '東京都 新宿区' },
    { query: '横浜', match: (place) => place.displayName.startsWith('神奈川県 横浜市 ') },
    { query: '札幌', match: (place) => place.displayName.startsWith('北海道 札幌市 ') },
    { query: '福岡市', match: (place) => place.displayName.startsWith('福岡県 福岡市 ') },
    { query: '那覇', match: (place) => place.displayName === '沖縄県 那覇市' },
  ]

  assert.equal(JAPAN_LOCATIONS.length, 1945, '47 prefectures and all municipality records must be local')
  for (const { query, match } of cases) {
    const matches = searchJapanMunicipalities(query)
    assert.ok(matches.length > 0 && matches.length <= 10, `${query} must return up to ten local candidates`)
    const selected = matches.find(match)
    assert.ok(selected, `${query} must include the expected municipality candidate`)
    assert.ok(selected.code, `${query} selection must include a municipality code`)
    assert.ok(Number.isFinite(selected.latitude), `${query} selection must include latitude`)
    assert.ok(Number.isFinite(selected.longitude), `${query} selection must include longitude`)
    assert.equal(selected.timezone, 'Asia/Tokyo', `${query} selection must use Japan's timezone`)
  }

  const shinjuku = searchJapanMunicipalities('新宿').find(({ displayName }) => displayName === '東京都 新宿区')
  assert.deepEqual(
    shinjuku && { code: shinjuku.code, latitude: shinjuku.latitude, longitude: shinjuku.longitude, timezone: shinjuku.timezone },
    { code: '131041', latitude: 35.69389, longitude: 139.703463, timezone: 'Asia/Tokyo' },
    'selected Shinjuku location data must match Geolonia source coordinates',
  )
  assert.equal(searchJapanMunicipalities('横浜', 2).length, 2, 'candidate count must honor the requested limit')
  assert.deepEqual(searchJapanMunicipalities(''), [], 'empty query must not show unfiltered results')

  console.log('Japanese municipality search passed: 東京、新宿、横浜、札幌、福岡、那覇; code/coordinates/timezone verified.')
  console.log(`Local data records: ${JAPAN_LOCATIONS.length} (47 prefectures + ${JAPAN_LOCATIONS.length - 47} municipality/ward records).`)
} finally {
  await server.close()
}
