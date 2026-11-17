import { HIDDEN_STEM_ROLE_TABLE } from '../../hiddenStemRoleTable'
import type { HiddenStemRole } from '../../hiddenStemRoleTable'
import { EARTHLY_BRANCH_ORDER } from '../../twelveStages'
import type { EarthlyBranch } from '../../twelveStages'

export type Compatibility = 'compatible' | 'compatible-with-metadata' | 'incompatible'
type DocumentRole = { stem: string; role: HiddenStemRole }
/** Audit-only transcriptions from D H-3-1, NOT a replacement hidden-stem data source. */
const DOCUMENT_OBSERVATIONS: Partial<Record<EarthlyBranch, DocumentRole[]>> = {
  子: [{ stem: '癸', role: 'main' }],
  丑: [{ stem: '癸', role: 'residual' }, { stem: '辛', role: 'middle' }, { stem: '己', role: 'main' }],
  寅: [{ stem: '戊', role: 'residual' }, { stem: '丙', role: 'middle' }, { stem: '甲', role: 'main' }],
  辰: [{ stem: '乙', role: 'residual' }, { stem: '癸', role: 'middle' }, { stem: '戊', role: 'main' }],
  午: [{ stem: '丙', role: 'residual' }, { stem: '己', role: 'middle' }, { stem: '丁', role: 'main' }],
  戌: [{ stem: '辛', role: 'residual' }, { stem: '丁', role: 'middle' }, { stem: '戊', role: 'main' }],
}
export function auditHiddenStemCompatibility(requiredBranches: readonly EarthlyBranch[] = EARTHLY_BRANCH_ORDER) {
  if (requiredBranches.some((branch) => !EARTHLY_BRANCH_ORDER.includes(branch))) throw new TypeError('Unknown required branch.')
  const rows = EARTHLY_BRANCH_ORDER.map((branch) => {
    const code = HIDDEN_STEM_ROLE_TABLE[branch].map((entry) => ({ ...entry }))
    const documented = DOCUMENT_OBSERVATIONS[branch]
    const extra = documented ? code.filter((entry) => !documented.some((item) => item.stem === entry.stem)).map((entry) => entry.stem)
      : branch === '亥' ? code.filter((entry) => entry.stem === '戊').map((entry) => entry.stem) : []
    const missing = documented?.filter((entry) => !code.some((item) => item.stem === entry.stem)).map((entry) => entry.stem) ?? []
    const roleDifferences = documented?.filter((entry) => !code.some((item) => item.stem === entry.stem && item.role === entry.role)) ?? []
    const orderMatches = documented ? JSON.stringify(code) === JSON.stringify(documented) : null
    const comparison = extra.length || missing.length || roleDifferences.length ? 'mismatch'
      : documented ? 'match' : 'insufficient-document-data'
    return { branch, code, documented: documented?.map((entry) => ({ ...entry })) ?? null,
      extra, missing, roleDifferences, orderMatches, comparison,
      source: documented ? { document: 'D', revision: 152, section: 'H-3-1' }
        : branch === '亥' ? { document: 'C', revision: 215, section: 'C-10-1 item 4 (CS-109): 亥 default excludes 戊' } : null }
  })
  const selected = rows.filter((row) => requiredBranches.includes(row.branch))
  const classification: Compatibility = selected.some((row) => row.comparison === 'mismatch') ? 'incompatible'
    : selected.some((row) => row.comparison === 'insufficient-document-data') ? 'compatible-with-metadata' : 'compatible'
  return { classification, requiredBranches: [...new Set(requiredBranches)].sort(), rows,
    usableAsDocumentDefault: selected.length > 0 && selected.every((row) => row.comparison === 'match'),
    documentCoverageComplete: selected.every((row) => row.documented !== null),
    semanticOrder: ['main', 'middle', 'residual'], codeDisplayOrder: ['residual', 'middle', 'main'],
    tenGodMethod: 'existing calculateTenGod; no new formula',
    note: 'Incomplete document rows are not inferred. No legacy values or producer metadata are changed.' }
}
