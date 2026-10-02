import { HIDDEN_STEM_ROLE_TABLE, type HiddenStemRole } from './hiddenStemRoleTable'

export type { HiddenStemRole } from './hiddenStemRoleTable'

export type HiddenStemDetail = {
  stem: string
  role: HiddenStemRole
  tenGod: TenGod
}

export type TenGod =
  | '比肩'
  | '劫財'
  | '食神'
  | '傷官'
  | '偏財'
  | '正財'
  | '偏官'
  | '正官'
  | '偏印'
  | '印綬'

export type DayRelationships = {
  dayStem: string
  dayBranch: string
  hiddenStems: HiddenStemDetail[]
  mainHiddenStem: string
  mainHiddenTenGod: TenGod
}

type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water'
type StemInfo = { element: Element; yang: boolean }

const STEM_INFO: Record<string, StemInfo> = {
  甲: { element: 'wood', yang: true },
  乙: { element: 'wood', yang: false },
  丙: { element: 'fire', yang: true },
  丁: { element: 'fire', yang: false },
  戊: { element: 'earth', yang: true },
  己: { element: 'earth', yang: false },
  庚: { element: 'metal', yang: true },
  辛: { element: 'metal', yang: false },
  壬: { element: 'water', yang: true },
  癸: { element: 'water', yang: false },
}

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water']

export function calculateTenGod(dayStem: string, hiddenStem: string): TenGod {
  const day = STEM_INFO[dayStem]
  const hidden = STEM_INFO[hiddenStem]
  if (!day || !hidden) {
    throw new Error(`Unknown heavenly stem: ${!day ? dayStem : hiddenStem}`)
  }

  const dayElementIndex = ELEMENTS.indexOf(day.element)
  const hiddenElementIndex = ELEMENTS.indexOf(hidden.element)
  const samePolarity = day.yang === hidden.yang

  if (dayElementIndex === hiddenElementIndex) return samePolarity ? '比肩' : '劫財'
  if (hiddenElementIndex === (dayElementIndex + 1) % 5) return samePolarity ? '食神' : '傷官'
  if (hiddenElementIndex === (dayElementIndex + 2) % 5) return samePolarity ? '偏財' : '正財'
  if (hiddenElementIndex === (dayElementIndex + 3) % 5) return samePolarity ? '偏官' : '正官'
  return samePolarity ? '偏印' : '印綬'
}

export function calculateDayRelationships(
  dayStem: string,
  dayBranch: string,
  hiddenStemsInLibraryOrder: string[],
): DayRelationships {
  const roleEntries = HIDDEN_STEM_ROLE_TABLE[dayBranch as keyof typeof HIDDEN_STEM_ROLE_TABLE]
  if (!roleEntries) throw new Error(`Unknown earthly branch: ${dayBranch}`)

  const hiddenStems = hiddenStemsInLibraryOrder.map((stem) => {
    const roleEntry = roleEntries.find((entry) => entry.stem === stem)
    if (!roleEntry) throw new Error(`No hidden-stem role for ${dayBranch}/${stem}`)
    return { stem, role: roleEntry.role, tenGod: calculateTenGod(dayStem, stem) }
  })
  const mainHiddenStem = hiddenStems.find(({ role }) => role === 'main')
  if (!mainHiddenStem) throw new Error(`No main hidden stem for ${dayBranch}`)

  return {
    dayStem,
    dayBranch,
    hiddenStems,
    mainHiddenStem: mainHiddenStem.stem,
    mainHiddenTenGod: mainHiddenStem.tenGod,
  }
}
