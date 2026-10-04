import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { getDefaultCountryForLocale, resolveCountryForLocale, messages } = await server.ssrLoadModule('/src/i18n/index.ts')
  const { searchJapanMunicipalities } = await server.ssrLoadModule('/src/lib/japanMunicipalitySearch.ts')
  const { searchKoreaLocations } = await server.ssrLoadModule('/src/lib/koreaLocationSearch.ts')
  const { searchUSCities } = await server.ssrLoadModule('/src/lib/usCitySearch.ts')
  const { calculateUsLongitudeCorrectionMinutes } = await server.ssrLoadModule('/src/lib/usTimeCorrection.ts')
  const { calculateEightChar } = await server.ssrLoadModule('/src/lib/calculateEightChar.ts')

  assert.equal(getDefaultCountryForLocale('ja'), 'JP')
  assert.equal(getDefaultCountryForLocale('ko'), 'KR')
  assert.equal(getDefaultCountryForLocale('en'), 'US')
  assert.equal(resolveCountryForLocale('ja', 'US', 'manual'), 'US')
  assert.equal(resolveCountryForLocale('ko', 'US', 'default'), 'KR')
  assert.deepEqual(
    [messages.ja.countryNames.US, messages.ko.countryNames.US, messages.en.countryNames.US],
    ['アメリカ', '미국', 'United States'],
  )

  const assertPlace = (place, code, timezone) => {
    assert.ok(place, `${code} city should be searchable`)
    assert.equal(place.countryCode, code)
    assert.ok(Number.isFinite(place.latitude))
    assert.ok(Number.isFinite(place.longitude))
    assert.equal(place.timezone, timezone)
  }

  const tokyo = searchJapanMunicipalities('東京', 10)[0]
  const seoul = searchKoreaLocations('서울', 10)[0]
  const newYork = searchUSCities('New York', 10)[0]
  const losAngeles = searchUSCities('Los Angeles', 10)[0]
  const chicago = searchUSCities('Chicago', 10)[0]
  assertPlace(tokyo, 'JP', 'Asia/Tokyo')
  assertPlace(seoul, 'KR', 'Asia/Seoul')
  assertPlace(newYork, 'US', 'America/New_York')
  assertPlace(losAngeles, 'US', 'America/Los_Angeles')
  assertPlace(chicago, 'US', 'America/Chicago')

  const winterCorrection = calculateUsLongitudeCorrectionMinutes(
    { year: 1985, month: 1, day: 15, hour: 12, minute: 0 },
    newYork.timezone,
    newYork.longitude,
    newYork.standardMeridian,
  )
  const summerCorrection = calculateUsLongitudeCorrectionMinutes(
    { year: 1985, month: 7, day: 15, hour: 12, minute: 0 },
    newYork.timezone,
    newYork.longitude,
    newYork.standardMeridian,
  )
  assert.equal(summerCorrection, winterCorrection - 60, 'IANA historical DST should adjust US local time')

  const summerChart = calculateEightChar(
    { year: 1985, month: 7, day: 15, hour: 12, minute: 0 },
    { mode: 'longitude', birthplace: newYork },
  )
  assert.equal(summerChart.timeCorrection?.birthplace?.timezone, 'America/New_York')
  assert.equal(summerChart.timeCorrection?.correctionMinutes, summerCorrection)

  console.log('Country defaults, manual selection, JP/KR/US city lookup, coordinates, IANA timezones, and historical US DST checks passed.')
} finally {
  await server.close()
}
