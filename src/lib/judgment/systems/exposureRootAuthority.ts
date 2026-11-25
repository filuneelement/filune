import { evidenceRecordSchema, hiddenStemEntrySchema } from '../contracts'
import type { EvidenceRecord, HiddenStemEntry } from '../contracts'
import { a179SourceEvidence, FILUNE_A179 } from './hiddenStemFiluneA179'
import { canonicalDocumentPath, DOCUMENT_PINS, verifyDocumentClaim } from './documentReceipt'
import { detach } from '../producers/shared'

export type ExposureRootSources = { A: string; C: string; D: string; approval: string }
const revisions = { A: 179, C: 215, D: 152, approval: 16 } as const
const evidenceId = (document: string) => `exposure-root:source-${document}`
/** Supplementary document observations in C-10's system, never a legacy table lookup. */
export function exposureRootAuthority(sources: ExposureRootSources) {
  a179SourceEvidence(sources.A)
  for (const key of Object.keys(revisions) as (keyof ExposureRootSources)[]) {
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(sources[key])?.[1]
    if (!front || !new RegExp(`^revision: ${revisions[key]}$`, 'm').test(front) || !/^status: frozen$/m.test(front)) {
      throw new TypeError(`Frozen ${key} rev${revisions[key]} source required`)
    }
  }
  for (const clause of ['일간은 투출 판정 대상에서 뺀다', '고(庫)도 뿌리가 된다', '戌(화고)이 상신 丙의 뿌리',
    '합거된 천간의 현재 작용만 정지', '자동 개고·지장간 방출·새 천간 투출']) {
    if (!sources.A.includes(clause)) throw new TypeError(`Missing A clause: ${clause}`)
  }
  if (!sources.approval.includes('동일 오행이면 본기 투출') || !sources.approval.includes('분류 유지, 기능 정지')) {
    throw new TypeError('Current approval clauses missing')
  }
  const section = sources.D.split('H-3-1.')[1]?.split('H-3-2.')[0]
  if (!section?.includes('월지 지장간(여기·중기·본기)')) throw new TypeError('D H-3-1 role order missing')
  const entries: HiddenStemEntry[] = []
  const rowQuotes = new Map<string, string>()
  const observations = new Map<string, HiddenStemEntry['roles']>()
  for (const line of section.split('\n').filter((line) => /^NT-\d+\t/.test(line))) {
    const cell = line.split('\t')[1]
    const match = /^([子丑寅卯辰巳午未申酉戌亥]): (.*)$/.exec(cell)
    if (!match) continue
    const stems = [...match[2].matchAll(/(?:^| · )([甲乙丙丁戊己庚辛壬癸]) /g)].map((m) => m[1])
    if (stems.length !== 1 && stems.length !== 3) throw new TypeError('Unsupported documented role row')
    const roles = stems.length === 1 ? { main: stems[0] } : { residual: stems[0], middle: stems[1], main: stems[2] }
    if (observations.has(match[1]) && JSON.stringify(observations.get(match[1])) !== JSON.stringify(roles)) {
      throw new TypeError('Conflicting document role rows')
    }
    rowQuotes.set(match[1], cell)
    observations.set(match[1], roles as HiddenStemEntry['roles'])
  }
  if ([...observations.keys()].sort().join('') !== ['子', '丑', '寅', '辰', '午', '戌'].sort().join('')) {
    throw new TypeError('Unexpected D H-3-1 branch coverage')
  }
  const currentC = sources.C.split('C-10-1.')[1]?.split('C-10-2.')[0]
  if (!currentC?.includes('지지 未 지장간 乙로 존재')) {
    throw new TypeError('Current C partial 未 observation missing')
  }
  if (!currentC.includes('亥 / 壬') || !currentC.includes('亥 기본 체계에 戊가 없어')) {
    throw new TypeError('Current C partial 亥 observations missing')
  }
  for (const branch of ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']) {
    entries.push(hiddenStemEntrySchema.parse({ systemId: FILUNE_A179.id, branch,
      completeness: observations.has(branch) ? 'complete' : ['未', '亥'].includes(branch) ? 'partial' : 'unknown',
      roles: observations.get(branch) ?? (branch === '亥' ? { main: '壬' } : {}),
      evidenceIds: [evidenceId(observations.has(branch) ? 'D' : 'C')],
      uncertaintyIds: observations.has(branch) ? [] : [`document-role-coverage-incomplete:${branch}`] }))
  }
  const evidence: EvidenceRecord[] = (Object.keys(revisions) as (keyof ExposureRootSources)[]).map((key) => {
    const documentId = key === 'approval' ? '25-7' : key
    const section = key === 'A' ? 'A-8-1 / A-2-3 I-05 / A-8-5 OP-Z13' : key === 'D' ? 'H-3-1' : key === 'C' ? 'C-10-1 items 2,4,9' : '① G-1/G-8; ② items 14,15'
    return evidenceRecordSchema.parse({ evidenceId: evidenceId(key), sourceType: 'source-document',
      sourceRef: { kind: 'source-document', document: { documentId, documentRevision: revisions[key],
        path: canonicalDocumentPath(documentId, revisions[key]), section, location: section } },
      documentRevision: revisions[key], ruleId: key === 'D' || key === 'C' ? 'C-10' : 'I-02', status: 'provisional',
      verification: { claimRef: 'documented-hidden-membership-and-fact-boundaries', method: 'supplied-frozen-source-clause-and-row-extraction', basisEvidenceIds: [] },
      note: 'Document observations only; source supplied, not independently verified.',
      uncertaintyIds: ['supplied-source-not-independently-verified'], usage: 'runtime-evidence' })
  })
  // Raw-source evidence remains provisional. These are separate, local verification receipts.
  const receipt = (key: keyof ExposureRootSources, section: string, ruleId: string, quote: string, claimRef: string) => {
    const documentId = key === 'approval' ? '25-7' : key
    const record = verifyDocumentClaim({ documentId, revision: revisions[key], path: canonicalDocumentPath(documentId, revisions[key]),
      sha256: DOCUMENT_PINS[documentId].sha256, text: sources[key], rawEvidenceId: evidenceId(key) },
    { evidenceId: `exposure-root:verified:${claimRef}`, section, ruleId, quote, claimRef })
    evidence.push(record); return record.evidenceId
  }
  const roleOrderId = receipt('D', 'H-3-1.', 'C-10', '월지 지장간(여기·중기·본기)의 십신', 'hidden-role-order')
  const entryReceiptIds: Record<string, string[]> = {}
  for (const [branch, quote] of rowQuotes) entryReceiptIds[branch] = [roleOrderId, receipt('D', 'H-3-1.', 'C-10', quote, `hidden-entry:${branch}`)]
  // 25-7 5-1/5-2 identify the effective earth resource and metal peer
  // relative to 辛. These establish the branch main only, not a full row.
  const branchMainObservations = [
    { branch: '未', hiddenStem: '己', evidenceIds: [receipt('approval', '5-1. 원국 판단', 'I-04-2',
      '未 편인(일지)·戌 정인(년지)이 子와 인접', 'branch-main:未')] },
    { branch: '酉', hiddenStem: '辛', evidenceIds: [receipt('approval', '5-2. 대운 재판정', 'I-04-1',
      '己酉 (22~32)\t혼합\t유리: 己 인성이 남은 壬 상관을 제복\t유리: 酉 상신 강화(酉酉 자형·子酉 파 동반)\t—\t',
      'branch-main:酉')] },
  ]
  const ruleReceiptIds: Record<string, string> = {}
  const a81 = sources.A.split('A-8-1.')[1].split('A-8-2.')[0]
  for (const ruleId of ['C-10', 'I-01', 'I-02', 'I-02a']) {
    const quote = a81.split('\n').find((line) => line.startsWith(ruleId + ' ('))
    if (!quote) throw new TypeError(`Current rule section missing: ${ruleId}`)
    ruleReceiptIds[ruleId] = receipt('A', 'A-8-1.', ruleId, quote, `rule:${ruleId}`)
  }
  for (const [ruleId, section] of [['I-05', 'A-2-3.'], ['I-07', 'A-2-3.'], ['OP-Z13', 'A-8-5.']]) {
    const quote = sources.A.split(section)[1]?.split('\n').find((line) => line.startsWith(ruleId + '\t') || line.startsWith(ruleId + ' ('))
    if (!quote) throw new TypeError(`Current rule section missing: ${ruleId}`)
    ruleReceiptIds[ruleId] = receipt('A', section, ruleId, quote, `rule:${ruleId}`)
  }
  // Definition and handling direction only; omit case examples and role assignments in adjacent columns.
  for (const [ruleId, section] of [['I-03', 'A-2-2.'], ['I-04-1', 'A-8-2.']]) {
    const row = sources.A.split(section)[1]?.split('\n').find((line) => line.startsWith(ruleId + '\t') || line.startsWith(ruleId + ' ('))
    const quote = row?.split('\t')[1]
    if (!quote) throw new TypeError(`Current role-definition clause missing: ${ruleId}`)
    ruleReceiptIds[ruleId] = receipt('A', section, ruleId, quote, `rule:${ruleId}`)
  }
  // Verify document pillar statements only; birth dates/times and pattern outcomes are never adopted.
  const pillarReceipts = (currentC.split('\n').find((line) => line.startsWith('1 원국·출처\t'))?.split('\t').slice(1) ?? []).map((cell) => {
    const quote = /^(?:[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥] ){3}[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/.exec(cell)?.[0]
    if (!quote) throw new TypeError('Document pillar statement missing')
    return { pillars: quote.split(' '), evidenceId: receipt('C', 'C-10-1.', 'I-01', quote, `document-pillars:${quote}`) }
  })
  return detach({ entryReceiptIds, ruleReceiptIds, pillarReceipts, hiddenStemSystemId: FILUNE_A179.id, entries, evidence, branchMainObservations,
    unassigned: [{ branch: '未', hiddenStem: '乙', evidenceIds: [evidenceId('C')] }],
    excluded: [{ branch: '亥', hiddenStem: '戊', evidenceIds: [evidenceId('C')] }] })
}
