import japanMunicipalitiesJson from '../data/japanMunicipalities.json'
import type { Birthplace } from './timeCorrection'
import { searchLocations } from './locationSearch'

type JapanMunicipalitySource = {
  code: string
  prefecture: string
  county?: string
  city: string
  ward?: string
  displayName: string
  latitude: number
  longitude: number
  timezone: string
}

export const JAPAN_LOCATIONS: Birthplace[] = (japanMunicipalitiesJson as JapanMunicipalitySource[]).map((place) => ({
  code: place.code,
  countryCode: 'JP',
  region: place.prefecture,
  city: [place.city, place.ward].filter(Boolean).join(' '),
  displayName: place.displayName,
  latitude: place.latitude,
  longitude: place.longitude,
  timezone: place.timezone,
  standardMeridian: 135,
  aliases: [place.prefecture, place.county, place.city, place.ward].filter((value): value is string => Boolean(value)),
}))

export function searchJapanMunicipalities(query: string, limit = 10): Birthplace[] {
  return searchLocations(JAPAN_LOCATIONS, query, 'ja', limit)
}
