import usCitiesJson from '../data/usCities.json'
import type { Birthplace } from './timeCorrection'
import { searchLocations } from './locationSearch'

type USCityRecord = [number, string, string, number, number, number, string?]
type USCityData = { timezones: string[]; cities: USCityRecord[] }

const STANDARD_MERIDIANS: Record<string, number> = {
  'America/Anchorage': -135,
  'America/Boise': -105,
  'America/Chicago': -90,
  'America/Denver': -105,
  'America/Detroit': -75,
  'America/Indiana/Indianapolis': -75,
  'America/Indiana/Vincennes': -75,
  'America/Juneau': -135,
  'America/Kentucky/Louisville': -75,
  'America/Los_Angeles': -120,
  'America/New_York': -75,
  'America/North_Dakota/New_Salem': -90,
  'America/Phoenix': -105,
  'Pacific/Honolulu': -150,
}

const usCityData = usCitiesJson as USCityData
export const US_CITIES: Birthplace[] = usCityData.cities.map(([id, region, city, latitude, longitude, timezoneIndex, asciiAlias]) => {
  const timezone = usCityData.timezones[timezoneIndex]
  return {
    code: `US:${id}`,
    countryCode: 'US',
    region,
    city,
    displayName: `${city}, ${region}`,
    latitude,
    longitude,
    timezone,
    standardMeridian: STANDARD_MERIDIANS[timezone],
    aliases: asciiAlias ? [asciiAlias] : undefined,
  }
})

export function searchUSCities(query: string, limit = 10): Birthplace[] {
  return searchLocations(US_CITIES, query, 'en', limit)
}
