import type { FourPillars, ThreePillars } from './calculateEightChar'
import { calculateDayRelationships, calculateTenGod } from './dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from './hiddenStemRoleTable'

const PILLAR_NAMES = ['年柱', '月柱', '日柱', '時柱'] as const

export function createBasicChartViewModel(pillars: FourPillars | ThreePillars) {
  const timeKnown = pillars.timeKnown !== false
  const pillarValues = timeKnown
    ? [pillars.year, pillars.month, pillars.day, (pillars as FourPillars).time]
    : [pillars.year, pillars.month, pillars.day]
  const dayStem = pillars.dayRelationships.dayStem

  const columns = pillarValues.map((pillarValue, index) => {
    const solarTermUncertain = 'solarTermAmbiguous' in pillars
      && pillars.solarTermAmbiguous
      && index < 2
    const stem = solarTermUncertain ? undefined : pillarValue[0]
    const branch = solarTermUncertain ? undefined : pillarValue[1]
    const dayRelationships = !branch
      ? null
      : index === 2
        ? pillars.dayRelationships
        : calculateDayRelationships(
            dayStem,
            branch,
            HIDDEN_STEM_ROLE_TABLE[branch as keyof typeof HIDDEN_STEM_ROLE_TABLE].map(({ stem: hiddenStem }) => hiddenStem),
          )

    return {
      name: PILLAR_NAMES[index],
      stem: stem ?? '—',
      stemTenGod: stem ? calculateTenGod(dayStem, stem) : '—',
      branch: branch ?? '—',
      branchTenGod: dayRelationships?.mainHiddenTenGod ?? '—',
      hiddenStems: dayRelationships?.hiddenStems ?? [],
    }
  })

  return {
    columns,
    dayStem,
    dayBranch: pillars.dayRelationships.dayBranch,
    spousePalace: pillars.dayRelationships,
  }
}
