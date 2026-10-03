import type { Birthplace } from './timeCorrection'

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/[\s　・,，]/g, '')
}

export function searchLocations(
  directory: readonly Birthplace[],
  query: string,
  locale: string,
  limit = 10,
): Birthplace[] {
  const normalizedQuery = normalize(query.trim())
  if (!normalizedQuery || limit <= 0) return []

  return directory
    .map((place) => {
      const normalizedRegion = normalize(place.region)
      const normalizedCity = normalize(place.city)
      const normalizedDisplayName = normalize(place.displayName)
      const normalizedAliases = (place.aliases ?? []).map(normalize)
      const matches = [normalizedRegion, normalizedCity, normalizedDisplayName, ...normalizedAliases]
      if (!matches.some((value) => value.includes(normalizedQuery))) return null

      const regionPrefix = normalizedRegion.startsWith(normalizedQuery)
      const exactCity = normalizedCity === normalizedQuery
      const cityPrefix = normalizedCity.startsWith(normalizedQuery)
      const aliasPrefix = normalizedAliases.some((alias) => alias.startsWith(normalizedQuery))
      const score = regionPrefix ? 0 : exactCity ? 1 : cityPrefix ? 2 : aliasPrefix ? 3 : 4
      return { place, score }
    })
    .filter((entry): entry is { place: Birthplace; score: number } => entry !== null)
    .sort((left, right) => left.score - right.score || left.place.displayName.localeCompare(right.place.displayName, locale))
    .slice(0, limit)
    .map(({ place }) => place)
}
