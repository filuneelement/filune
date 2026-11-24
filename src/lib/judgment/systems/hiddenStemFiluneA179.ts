import { hiddenStemEntrySchema, evidenceRecordSchema } from '../contracts'
import type { HiddenStemEntry } from '../contracts'

/** Authority is frozen; completeness is deliberately NOT asserted. No legacy fallback. */
export const FILUNE_A179 = Object.freeze({ id: 'filune-a179', sourceDocument: 'A', revision: 179,
  sourceSha256: 'cfeb43c482f973b5f06bf73f58ed57cd1faf46c8d8c00241eaf9753f73b4f7d2',
  status: 'frozen', path: 'src/docs/source/authority/A_rev179.md',
  evidenceId: 'producer-evidence:source-A179',
  systemName: '본기·중기·여기 체계', completeness: 'partial' } as const)
export const A179_BRANCHES = Object.freeze(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const)
export const A179_REQUIRED_QUOTES = Object.freeze([
  '지장간 목록은 본기·중기·여기 체계를 기본으로 하고 다른 체계는 별도 층위에 적는다.',
  '子월 본기 癸 식신',
  '子(지장간 癸)월의 천간 壬은 본기 투출',
])
/** Only an explicitly assigned role is encoded. Examples of exposure do not define a complete table. */
export function a179Entries(): HiddenStemEntry[] {
  return A179_BRANCHES.map((branch) => hiddenStemEntrySchema.parse({ systemId: FILUNE_A179.id, branch,
    completeness: branch === '子' ? 'partial' : 'unknown', roles: branch === '子' ? { main: '癸' } : {},
    evidenceIds: [FILUNE_A179.evidenceId], uncertaintyIds: ['A179-full-role-table-not-specified'] }))
}
export function a179SourceEvidence(content: string) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content)
  if (!front || !/^revision:\s*179\s*$/m.test(front[1]) || !A179_REQUIRED_QUOTES.every((quote) => content.includes(quote))) {
    throw new TypeError('A179 source metadata or cited clauses are missing; cannot select this authority.')
  }
  return evidenceRecordSchema.parse({ evidenceId: FILUNE_A179.evidenceId, sourceType: 'source-document',
    sourceRef: { kind: 'source-document', document: { documentId: 'A', documentRevision: 179,
      path: FILUNE_A179.path, section: 'A-8', location: 'A-8-1 C-10 / I-02; A-8-9 IR-02' } },
    documentRevision: 179, ruleId: 'C-10', status: 'provisional',
    verification: { claimRef: 'A179:hidden-stem-system', method: 'supplied-source-metadata-and-explicit-clause-check', basisEvidenceIds: [] },
    note: 'Source text exists; full twelve-branch role table and runtime claim confirmation are not supplied.',
    uncertaintyIds: ['A179-full-role-table-not-specified'], usage: 'runtime-evidence' })
}
