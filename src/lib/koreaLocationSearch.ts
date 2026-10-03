import koreaLocationsJson from '../data/koreaLocations.json'
import type { Birthplace } from './timeCorrection'
import { searchLocations } from './locationSearch'

export const KOREA_LOCATIONS = koreaLocationsJson as Birthplace[]

export function searchKoreaLocations(query: string, limit = 10): Birthplace[] {
  return searchLocations(KOREA_LOCATIONS, query, 'ko', limit)
}
