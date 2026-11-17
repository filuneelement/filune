/** Structural existence lookup data only (A C-11 categories).
 * No priority, transformation, strength, role or auspiciousness is encoded.
 * This catalog is a versioned producer source, not an operator-confirmed judgment.
 */
export const RELATION_CATALOG_REF = 'src/lib/judgment/producers/relationCatalog.ts:structural-existence-v1'
export const STEM_COMBINATIONS = ['甲己', '乙庚', '丙辛', '丁壬', '戊癸'] as const
export const SIX_COMBINATIONS = ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'] as const
export const CLASHES = ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'] as const
export const HARMS = ['子未', '丑午', '寅巳', '卯辰', '申亥', '酉戌'] as const
export const BREAKS = ['子酉', '丑辰', '寅亥', '卯午', '巳申', '未戌'] as const
export const WONJIN = ['子未', '丑午', '寅酉', '卯申', '辰亥', '巳戌'] as const
export const THREE_COMBINATIONS = ['申子辰', '亥卯未', '寅午戌', '巳酉丑'] as const
export const SEASON_COMBINATIONS = ['寅卯辰', '巳午未', '申酉戌', '亥子丑'] as const
export const THREE_PUNISHMENTS = ['寅巳申', '丑戌未'] as const
export const PAIR_PUNISHMENTS = ['子卯', '辰辰', '午午', '酉酉', '亥亥'] as const

export function hasPair(catalog: readonly string[], a: string, b: string): boolean {
  return catalog.includes(a + b) || catalog.includes(b + a)
}
export function hasGroup(catalog: readonly string[], values: readonly string[]): boolean {
  return new Set(values).size === values.length
    && catalog.some((group) => Array.from(group).every((value) => values.includes(value)) && group.length === values.length)
}
export function isHalfCombination(a: string, b: string): boolean {
  // A OP-Z03 explicitly includes pairs without the central branch.
  return a !== b && THREE_COMBINATIONS.some((group) => group.includes(a) && group.includes(b))
}
export function isPunishmentPair(a: string, b: string): boolean {
  return hasPair(PAIR_PUNISHMENTS, a, b)
    || a !== b && THREE_PUNISHMENTS.some((group) => group.includes(a) && group.includes(b))
}
