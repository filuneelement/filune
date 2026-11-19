import type { CanonicalChart, PillarPosition } from '../../canonical/types'
import { TEN_GOD_TO_PERSONALITY_ID, type NatalTenGodOccurrence } from '../types'

const PILLAR_POSITIONS = [
  ['year', 'year_stem', 'year_branch'],
  ['month', 'month_stem', 'month_branch'],
  ['day', null, 'day_branch'],
  ['time', 'hour_stem', 'hour_branch'],
] as const satisfies ReadonlyArray<readonly [PillarPosition, NatalTenGodOccurrence['position'] | null, NatalTenGodOccurrence['position']]>

export function extractNatalTenGodOccurrences(chart: CanonicalChart) {
  const occurrences: NatalTenGodOccurrence[] = []
  const unavailablePositions: NatalTenGodOccurrence['position'][] = []
  for (const [pillarKey, stemPosition, branchPosition] of PILLAR_POSITIONS) {
    const pillar = chart.pillars[pillarKey]
    const relations = chart.basicRelations[pillarKey]
    if (pillar.status !== 'confirmed' || relations.status !== 'confirmed') {
      if (stemPosition) unavailablePositions.push(stemPosition)
      unavailablePositions.push(branchPosition)
      continue
    }

    const { stemTenGod, relationships } = relations.value
    const relationPath = `/chart/basicRelations/${pillarKey}/value`
    if (stemPosition) {
      occurrences.push({
        id: `occurrence:${stemPosition}:${pillar.value.stem}`,
        tenGod: TEN_GOD_TO_PERSONALITY_ID[stemTenGod],
        canonicalTenGod: stemTenGod,
        position: stemPosition,
        stem: pillar.value.stem,
        sourcePath: `${relationPath}/stemTenGod`,
      })
    }
    for (const [index, hidden] of relationships.hiddenStems.entries()) {
      occurrences.push({
        id: `occurrence:${branchPosition}:${hidden.role}:${hidden.stem}`,
        tenGod: TEN_GOD_TO_PERSONALITY_ID[hidden.tenGod],
        canonicalTenGod: hidden.tenGod,
        position: branchPosition,
        stem: hidden.stem,
        hiddenStemRole: hidden.role,
        sourcePath: `${relationPath}/relationships/hiddenStems/${index}/tenGod`,
      })
    }
  }
  return { occurrences, unavailablePositions }
}
