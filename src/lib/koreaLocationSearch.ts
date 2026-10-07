import koreaLocationsJson from '../data/koreaLocations.json'
import type { Birthplace } from './timeCorrection'
import { searchLocations } from './locationSearch'

export const KOREA_LOCATIONS = koreaLocationsJson as Birthplace[]

const KOREA_CITY_LOCATIONS = KOREA_LOCATIONS.filter((place) => {
  if (place.code.startsWith('KR:ADM1:')) return true
  const hasDistrictAlias = (place.aliases ?? []).some((alias) => /-(?:gu|gun)$/i.test(alias))
  return !place.city.endsWith('구') && !place.city.endsWith('군') && !hasDistrictAlias
})

export function searchKoreaLocations(query: string, limit = 10): Birthplace[] {
  return searchLocations(KOREA_CITY_LOCATIONS, query, 'ko', limit)
}
