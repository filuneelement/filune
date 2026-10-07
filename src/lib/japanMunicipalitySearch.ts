import japanMunicipalitiesJson from '../data/japanMunicipalities.json'
import type { Birthplace } from './timeCorrection'
import { searchLocations } from './locationSearch'

type JapanMunicipalitySource = {
  code: string
  type: 'prefecture' | 'municipality'
  prefecture: string
  county?: string
  city: string
  ward?: string
  displayName: string
  latitude: number
  longitude: number
  timezone: string
}

const japanSources = japanMunicipalitiesJson as JapanMunicipalitySource[]
const municipalityByCity = new Map<string, JapanMunicipalitySource>()

for (const place of japanSources) {
  if (!place.city) continue
  const key = `${place.prefecture}:${place.city}`
  const existing = municipalityByCity.get(key)
  if (!existing || (place.ward === '中央区' && existing.ward !== '中央区')) {
    municipalityByCity.set(key, place)
  }
}

const prefectureLocations: Birthplace[] = japanSources
  .filter((place) => place.type === 'prefecture')
  .map((place) => ({
    code: place.code,
    countryCode: 'JP',
    region: place.prefecture,
    city: '',
    displayName: place.prefecture,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
    standardMeridian: 135,
    aliases: [place.prefecture],
  }))

const cityLocations: Birthplace[] = [...municipalityByCity.values()].map((place) => ({
  code: place.code,
  countryCode: 'JP',
  region: place.prefecture,
  city: place.city,
  displayName: `${place.prefecture} ${place.city}`,
  latitude: place.latitude,
  longitude: place.longitude,
  timezone: place.timezone,
  standardMeridian: 135,
  aliases: [place.prefecture, place.county, place.city].filter((value): value is string => Boolean(value)),
}))

export const JAPAN_LOCATIONS: Birthplace[] = [...prefectureLocations, ...cityLocations]

export function searchJapanMunicipalities(query: string, limit = 10): Birthplace[] {
  return searchLocations(JAPAN_LOCATIONS, query, 'ja', limit)
}
