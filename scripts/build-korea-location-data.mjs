import fs from 'node:fs'

const inputPath = process.argv[2]
if (!inputPath) throw new Error('Usage: node scripts/build-korea-location-data.mjs <GeoNames KR.txt>')

const REGION_NAMES = {
  '01': ['제주특별자치도', 'Jeju-do'],
  '03': ['전북특별자치도', 'Jeonbuk'],
  '05': ['충청북도', 'Chungcheongbuk-do'],
  '06': ['강원특별자치도', 'Gangwon'],
  10: ['부산광역시', 'Busan'],
  11: ['서울특별시', 'Seoul'],
  12: ['인천광역시', 'Incheon'],
  13: ['경기도', 'Gyeonggi-do'],
  14: ['경상북도', 'Gyeongsangbuk-do'],
  15: ['대구광역시', 'Daegu'],
  16: ['전라남도', 'Jeollanam-do'],
  17: ['충청남도', 'Chungcheongnam-do'],
  18: ['광주광역시', 'Gwangju'],
  19: ['대전광역시', 'Daejeon'],
  20: ['경상남도', 'Gyeongsangnam-do'],
  21: ['울산광역시', 'Ulsan'],
  22: ['세종특별자치시', 'Sejong-si'],
}

const ONSETS = [
  ['ch', 'ㅊ'], ['j', 'ㅈ'], ['g', 'ㄱ'], ['k', 'ㅋ'], ['n', 'ㄴ'], ['d', 'ㄷ'], ['t', 'ㅌ'],
  ['r', 'ㄹ'], ['l', 'ㄹ'], ['m', 'ㅁ'], ['b', 'ㅂ'], ['p', 'ㅍ'], ['s', 'ㅅ'], ['h', 'ㅎ'],
]
const VOWELS = [
  ['yae', 'ㅒ'], ['yeo', 'ㅕ'], ['ye', 'ㅖ'], ['ya', 'ㅑ'], ['wae', 'ㅙ'], ['wo', 'ㅝ'],
  ['we', 'ㅞ'], ['wi', 'ㅟ'], ['wa', 'ㅘ'], ['oe', 'ㅚ'], ['eu', 'ㅡ'], ['ui', 'ㅢ'],
  ['ae', 'ㅐ'], ['eo', 'ㅓ'], ['yo', 'ㅛ'], ['yu', 'ㅠ'], ['a', 'ㅏ'], ['e', 'ㅔ'],
  ['o', 'ㅗ'], ['u', 'ㅜ'], ['i', 'ㅣ'],
]
const CODAS = [
  ['ng', 'ㅇ'], ['k', 'ㄱ'], ['g', 'ㄱ'], ['n', 'ㄴ'], ['t', 'ㅅ'], ['d', 'ㅅ'],
  ['l', 'ㄹ'], ['r', 'ㄹ'], ['m', 'ㅁ'], ['p', 'ㅂ'], ['b', 'ㅂ'],
]
const LEADS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const VOWEL_INDEX = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const CODA_INDEX = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const SPECIAL = {
  'Anseong': '안성시',
  'Gyeongju': '경주시',
  'Dongducheon': '동두천시',
  'Pyeongtaek': '평택시',
  'Namwon': '남원시',
  'Siheung': '시흥시',
  'Michuhol': '미추홀구',
  'Guro District': '구로구',
  'Dongdaemun District': '동대문구',
  'Gangseo District': '강서구',
}

function matchesAt(value, index, choices) {
  return choices.find(([text]) => value.startsWith(text, index))
}

function syllabifyRomanized(value) {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '')
  const syllables = []
  let index = 0
  while (index < normalized.length) {
    const onsetMatch = matchesAt(normalized, index, ONSETS)
    const onset = onsetMatch?.[1] ?? 'ㅇ'
    if (onsetMatch) index += onsetMatch[0].length
    const vowelMatch = matchesAt(normalized, index, VOWELS)
    if (!vowelMatch) break
    index += vowelMatch[0].length
    const nextSyllableStartsHere = (position) => {
      if (matchesAt(normalized, position, ONSETS)) {
        return Boolean(matchesAt(normalized, position + matchesAt(normalized, position, ONSETS)[0].length, VOWELS))
      }
      return Boolean(matchesAt(normalized, position, VOWELS))
    }
    let coda = ''
    const codaMatch = matchesAt(normalized, index, CODAS)
    if (codaMatch && !nextSyllableStartsHere(index)) {
      coda = codaMatch[1]
      index += codaMatch[0].length
    }
    const leadIndex = LEADS.indexOf(onset)
    const vowelIndex = VOWEL_INDEX.indexOf(vowelMatch[1])
    const codaIndex = CODA_INDEX.indexOf(coda)
    if (leadIndex < 0 || vowelIndex < 0 || codaIndex < 0) break
    syllables.push(String.fromCharCode(0xac00 + (leadIndex * 21 + vowelIndex) * 28 + codaIndex))
  }
  return syllables.join('')
}

function koreanName(geonamesName, adminCode, alternateNames) {
  const nativeName = alternateNames.split(',').find((name) => /[가-힣]/.test(name))
  if (nativeName) return nativeName
  if (SPECIAL[geonamesName]) return SPECIAL[geonamesName]
  const normalizedName = geonamesName.replace(/ District$/i, '-gu')
  const suffix = normalizedName.match(/-(si|gun|gu)$/i)?.[1]?.toLowerCase()
  const root = suffix ? normalizedName.replace(/-(si|gun|gu)$/i, '') : normalizedName
  const translatedRoot = syllabifyRomanized(root)
  const defaultSuffix = suffix === 'si' ? '시' : suffix === 'gun' ? '군' : suffix === 'gu' ? '구' : ''
  if (defaultSuffix) return translatedRoot + defaultSuffix
  if (adminCode === '22') return '세종시'
  return translatedRoot
}

const lines = fs.readFileSync(inputPath, 'utf8').trim().split('\n')
const parsed = lines.map((line) => line.split('\t'))
const regionRows = parsed.filter((row) => row[6] === 'A' && row[7] === 'ADM1')
const municipalityRows = parsed.filter((row) => row[6] === 'A' && row[7] === 'ADM2')
const places = []

for (const row of regionRows) {
  const adminCode = row[10]
  const [region, alias] = REGION_NAMES[adminCode] ?? [syllabifyRomanized(row[1]), row[1]]
  places.push({
    code: `KR:ADM1:${adminCode}`,
    countryCode: 'KR',
    region,
    city: '',
    displayName: region,
    latitude: Number(row[4]),
    longitude: Number(row[5]),
    timezone: 'Asia/Seoul',
    standardMeridian: 135,
    aliases: [row[1], alias].filter((value, index, all) => all.indexOf(value) === index),
  })
}

for (const row of municipalityRows) {
  const adminCode = row[10]
  if (adminCode === '22') continue
  const [region, regionAlias] = REGION_NAMES[adminCode] ?? [syllabifyRomanized(row[1]), row[1]]
  const city = koreanName(row[1], adminCode, row[3] ?? '')
  const municipalityCode = row[11]
  places.push({
    code: `KR:${adminCode}:${municipalityCode}`,
    countryCode: 'KR',
    region,
    city,
    displayName: `${region} ${city}`,
    latitude: Number(row[4]),
    longitude: Number(row[5]),
    timezone: 'Asia/Seoul',
    standardMeridian: 135,
    aliases: [row[1], regionAlias],
  })
}

const outputPath = new URL('../src/data/koreaLocations.json', import.meta.url)
fs.writeFileSync(outputPath, JSON.stringify(places))
console.log(`Wrote ${places.length} Korea location records to ${outputPath.pathname}`)
