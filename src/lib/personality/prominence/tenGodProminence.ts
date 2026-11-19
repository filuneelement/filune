import type { NatalTenGodOccurrence, PersonalityTenGod, ProminenceResolution, TenGodProminenceEvidence } from '../types'

export function collectProminenceEvidence(tenGod: PersonalityTenGod, occurrences: readonly NatalTenGodOccurrence[]) {
  const evidence: TenGodProminenceEvidence[] = []
  const add = (type: TenGodProminenceEvidence['type'], sources: readonly NatalTenGodOccurrence[]) => {
    if (sources.length) evidence.push({ tenGod, type, sourceIds: sources.map(source => source.id).sort() })
  }
  add('stem_manifested', occurrences.filter(item => !item.hiddenStemRole))
  add('month_branch', occurrences.filter(item => item.position === 'month_branch'))
  add('branch_basis', occurrences.filter(item => item.hiddenStemRole))
  if (new Set(occurrences.map(item => item.position)).size > 1) add('repeated', occurrences)
  return evidence
}

export function resolveProminence(evidence: TenGodProminenceEvidence[]): ProminenceResolution {
  // Master §7 and schema §§35–38 specify evidence but provide no grade boundaries.
  return { status: 'deferred', reason: 'no_grade_criteria', evidence }
}
