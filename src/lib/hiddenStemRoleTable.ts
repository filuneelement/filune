export type HiddenStemRole = 'main' | 'middle' | 'residual'

export type HiddenStemRoleEntry = {
  stem: string
  role: HiddenStemRole
}

// FILUNE's fixed hidden-stem standard and display order: 余気 → 中気 → 本気.
export const HIDDEN_STEM_ROLE_TABLE = {
  子: [
    { stem: '壬', role: 'residual' },
    { stem: '癸', role: 'main' },
  ],
  丑: [
    { stem: '癸', role: 'residual' },
    { stem: '辛', role: 'middle' },
    { stem: '己', role: 'main' },
  ],
  寅: [
    { stem: '戊', role: 'residual' },
    { stem: '丙', role: 'middle' },
    { stem: '甲', role: 'main' },
  ],
  卯: [
    { stem: '甲', role: 'residual' },
    { stem: '乙', role: 'main' },
  ],
  辰: [
    { stem: '乙', role: 'residual' },
    { stem: '癸', role: 'middle' },
    { stem: '戊', role: 'main' },
  ],
  巳: [
    { stem: '戊', role: 'residual' },
    { stem: '庚', role: 'middle' },
    { stem: '丙', role: 'main' },
  ],
  午: [
    { stem: '丙', role: 'residual' },
    { stem: '己', role: 'middle' },
    { stem: '丁', role: 'main' },
  ],
  未: [
    { stem: '丁', role: 'residual' },
    { stem: '乙', role: 'middle' },
    { stem: '己', role: 'main' },
  ],
  申: [
    { stem: '戊', role: 'residual' },
    { stem: '壬', role: 'middle' },
    { stem: '庚', role: 'main' },
  ],
  酉: [
    { stem: '庚', role: 'residual' },
    { stem: '辛', role: 'main' },
  ],
  戌: [
    { stem: '辛', role: 'residual' },
    { stem: '丁', role: 'middle' },
    { stem: '戊', role: 'main' },
  ],
  亥: [
    { stem: '戊', role: 'residual' },
    { stem: '甲', role: 'middle' },
    { stem: '壬', role: 'main' },
  ],
} as const satisfies Record<string, readonly HiddenStemRoleEntry[]>
