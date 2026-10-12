import { FIVE_ELEMENTS } from '../fiveElementDisplay'
import type { Messages } from '../../i18n'

export default function DayBranchCard({ branch, messages: t }: { branch: string; messages: Messages }) {
  const element = FIVE_ELEMENTS[branch]
  return <article className="evidence-card evidence-card--symbol"><p>{t.reading.dayBranch}</p><strong>{branch}</strong><span>{element ? t.elements[element.label as keyof typeof t.elements] : '—'}</span></article>
}
