import { FIVE_ELEMENTS } from '../fiveElementDisplay'
import type { Messages, Locale } from '../../i18n'

export default function DayMasterCard({ stem, messages: t, locale }: { stem: string; messages: Messages; locale: Locale }) {
  const element = FIVE_ELEMENTS[stem]
  const polarity = element?.polarity === '＋' ? t.reading.yang : t.reading.yin
  const joiner = locale === 'ja' ? 'の' : locale === 'ko' ? '의 ' : ' '
  return <article className="evidence-card evidence-card--symbol"><p>{t.reading.dayMaster}</p><strong>{stem}</strong><span>{element ? `${polarity}${joiner}${t.elements[element.label as keyof typeof t.elements]}` : '—'}</span></article>
}
