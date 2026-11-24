import { canonicalDocumentPath, DOCUMENT_PINS, verifyDocumentClaim } from '../../systems/documentReceipt'
import { BYEONG_RULE_SECTIONS } from './types'
import type { ByeongRuleId } from './types'

/** Verify only the operative rule clauses, excluding the case-example columns. */
export function issueByeongRuleReceipts(text: string, rawEvidenceId: string) {
  return (Object.keys(BYEONG_RULE_SECTIONS) as ByeongRuleId[]).map((ruleId) => {
    const section = BYEONG_RULE_SECTIONS[ruleId]
    const row = text.split(section)[1]?.split('\n').find((line) => line.startsWith(ruleId + '\t') || line.startsWith(ruleId + ' ('))
    const quote = row?.split('\t')[1]
    if (!quote) throw new TypeError(`Current byeong rule missing: ${ruleId}`)
    return verifyDocumentClaim({
      documentId: 'A', ...DOCUMENT_PINS.A, path: canonicalDocumentPath('A', DOCUMENT_PINS.A.revision), text, rawEvidenceId,
    }, { evidenceId: `byeong:direct-rule:${ruleId}`, section, ruleId, quote, claimRef: `byeong:rule:${ruleId}` })
  })
}
