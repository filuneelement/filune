export type HiddenStemRole = 'main' | 'middle' | 'residual'

export type HiddenStemRoleEntry = {
  stem: string
  role: HiddenStemRole
}

// FILUNE's role table is explicit and independent of lunar-typescript array indexes.
// The role assignments follow the traditional fixed table based on 淵海子平「地支藏遁歌」:
// https://gothbox.com/shichu-suimei/kihon/zokan/
// lunar-typescript remains the source of stem membership and display order.
export const HIDDEN_STEM_ROLE_TABLE = {
  子: [{ stem: '癸', role: 'main' }],
  丑: [
    { stem: '己', role: 'main' },
    { stem: '辛', role: 'middle' },
    { stem: '癸', role: 'residual' },
  ],
  寅: [
    { stem: '甲', role: 'main' },
    { stem: '丙', role: 'middle' },
    { stem: '戊', role: 'residual' },
  ],
  卯: [{ stem: '乙', role: 'main' }],
  辰: [
    { stem: '戊', role: 'main' },
    { stem: '乙', role: 'middle' },
    { stem: '癸', role: 'residual' },
  ],
  巳: [
    { stem: '丙', role: 'main' },
    { stem: '庚', role: 'middle' },
    { stem: '戊', role: 'residual' },
  ],
  午: [
    { stem: '丁', role: 'main' },
    { stem: '己', role: 'residual' },
  ],
  未: [
    { stem: '己', role: 'main' },
    { stem: '乙', role: 'middle' },
    { stem: '丁', role: 'residual' },
  ],
  申: [
    { stem: '庚', role: 'main' },
    { stem: '壬', role: 'middle' },
    { stem: '戊', role: 'residual' },
  ],
  酉: [{ stem: '辛', role: 'main' }],
  戌: [
    { stem: '戊', role: 'main' },
    { stem: '辛', role: 'middle' },
    { stem: '丁', role: 'residual' },
  ],
  亥: [
    { stem: '壬', role: 'main' },
    { stem: '甲', role: 'residual' },
  ],
} as const satisfies Record<string, readonly HiddenStemRoleEntry[]>
