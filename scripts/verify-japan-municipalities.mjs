import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const sourceManifest = JSON.parse(await readFile(new URL('./fixtures/geolonia-japan-codes.json', import.meta.url), 'utf8'))
const sourceCodes = new Set(sourceManifest.codes)
assert.equal(sourceCodes.size, sourceManifest.codes.length, 'the Geolonia source code manifest must contain unique codes')
assert.equal(
  new Date(sourceManifest.sourceUpdated * 1000).toISOString(),
  sourceManifest.sourceUpdatedUtc,
  'the Geolonia source timestamp must match its recorded UTC value',
)

const rawRows = JSON.parse(await readFile(new URL('../src/data/japanMunicipalities.json', import.meta.url), 'utf8'))
const codes = rawRows.map(({ code }) => String(code ?? ''))
const codeCounts = new Map()
for (const code of codes) codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1)
const duplicateCodes = [...codeCounts].filter(([code, count]) => !code || count > 1)
assert.deepEqual(duplicateCodes, [], 'every source row must have a unique municipality/prefecture code')

const localCodes = new Set(codes)
const missingCodes = [...sourceCodes].filter((code) => !localCodes.has(code))
const unexpectedCodes = [...localCodes].filter((code) => !sourceCodes.has(code))
assert.deepEqual(missingCodes, [], `local data is missing Geolonia source codes: ${missingCodes.join(', ')}`)
assert.deepEqual(unexpectedCodes, [], `local data has codes outside the Geolonia source snapshot: ${unexpectedCodes.join(', ')}`)

const prefectureRows = rawRows.filter(({ type }) => type === 'prefecture')
const municipalityRows = rawRows.filter(({ type }) => type === 'municipality')
const requiredPrefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]
assert.equal(prefectureRows.length, requiredPrefectures.length, 'the source data must contain one row for each prefecture')
assert.deepEqual(
  [...prefectureRows.map(({ prefecture }) => prefecture)].sort(),
  [...requiredPrefectures].sort(),
  'the source data must include all 47 prefectures',
)
for (const place of rawRows) {
  assert.ok(place.code, `${place.displayName} must have a code`)
  assert.ok(Number.isFinite(place.latitude), `${place.displayName} must have a latitude`)
  assert.ok(Number.isFinite(place.longitude), `${place.displayName} must have a longitude`)
  assert.equal(place.timezone, 'Asia/Tokyo', `${place.displayName} must use Japan's timezone`)
}

// Build the expected UI set from raw Geolonia records. Designated-city wards
// collapse to their parent city; county remains part of town/village identity.
const municipalityByCity = new Map()
for (const place of municipalityRows) {
  const key = `${place.prefecture}:${place.county ?? ''}:${place.city}`
  const current = municipalityByCity.get(key)
  if (!current || (place.ward === '中央区' && current.ward !== '中央区')) municipalityByCity.set(key, place)
}
const expectedCityCodes = new Set([...municipalityByCity.values()].map(({ code }) => String(code)))

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { JAPAN_LOCATIONS, searchJapanMunicipalities } = await server.ssrLoadModule('/src/lib/japanMunicipalitySearch.ts')
  const expectedUiCodes = new Set([
    ...prefectureRows.map(({ code }) => String(code)),
    ...expectedCityCodes,
  ])
  const actualUiCodes = JAPAN_LOCATIONS.map(({ code }) => String(code))
  assert.equal(new Set(actualUiCodes).size, actualUiCodes.length, 'UI search locations must not contain duplicate codes')
  assert.deepEqual(
    [...actualUiCodes].sort(),
    [...expectedUiCodes].sort(),
    'UI search locations must collapse only designated-city wards and retain distinct county municipalities',
  )

  const cases = [
    { query: '東京', displayName: '東京都' },
    { query: '新宿', displayName: '東京都 新宿区' },
    { query: '横浜', displayName: '神奈川県 横浜市' },
    { query: '札幌', displayName: '北海道 札幌市' },
    { query: '福岡市', displayName: '福岡県 福岡市' },
    { query: '那覇', displayName: '沖縄県 那覇市' },
  ]

  for (const { query, displayName } of cases) {
    const matches = searchJapanMunicipalities(query)
    assert.ok(matches.length > 0 && matches.length <= 10, `${query} must return up to ten local candidates`)
    const selected = matches.find((place) => place.displayName === displayName)
    assert.ok(selected, `${query} must include ${displayName}`)
    assert.ok(selected.code, `${displayName} must have a code`)
    assert.ok(Number.isFinite(selected.latitude), `${displayName} must have a latitude`)
    assert.ok(Number.isFinite(selected.longitude), `${displayName} must have a longitude`)
    assert.equal(selected.timezone, 'Asia/Tokyo', `${displayName} must use Japan's timezone`)
  }

  const shinjuku = searchJapanMunicipalities('新宿').find(({ displayName }) => displayName === '東京都 新宿区')
  assert.deepEqual(
    shinjuku && { code: shinjuku.code, latitude: shinjuku.latitude, longitude: shinjuku.longitude, timezone: shinjuku.timezone },
    { code: '131041', latitude: 35.69389, longitude: 139.703463, timezone: 'Asia/Tokyo' },
    'selected Shinjuku location data must match the Geolonia source coordinates',
  )

  const tomariVillages = searchJapanMunicipalities('泊村', 10).filter(({ displayName }) => displayName.endsWith('泊村'))
  assert.deepEqual(
    tomariVillages.map(({ displayName }) => displayName).sort(),
    ['北海道 古宇郡 泊村', '北海道 国後郡 泊村'],
    'same-named municipalities in different counties must remain distinct search results',
  )
  assert.equal(searchJapanMunicipalities('横浜', 2).length, 2, 'candidate count must honor the requested limit')
  assert.deepEqual(searchJapanMunicipalities(''), [], 'empty query must not show unfiltered results')

  const wardCount = municipalityRows.filter(({ ward }) => Boolean(ward)).length
  const recordsByPrefecture = requiredPrefectures
    .map((prefecture) => `${prefecture} ${rawRows.filter((place) => place.prefecture === prefecture).length}`)
    .join(' / ')
  console.log(`Japanese municipality search passed: ${cases.map(({ query }) => query).join('、')}; all source codes and coordinates verified.`)
  console.log(`Geolonia source checked ${sourceManifest.checkedOn}; API data updated ${sourceManifest.sourceUpdatedUtc}: ${prefectureRows.length} prefectures, ${municipalityRows.length} municipality records, ${wardCount} designated-city ward records.`)
  console.log(`Source records by prefecture (prefecture row included): ${recordsByPrefecture}`)
  console.log(`UI search units: ${JAPAN_LOCATIONS.length} (prefectures and city-level municipalities; wards grouped, county names retained).`)
} finally {
  await server.close()
}
