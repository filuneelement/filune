import { useEffect, useMemo, useRef, useState } from 'react'
import { calculateMonthlyLuck, getCurrentJstYear } from '../lib/calculateMonthlyLuck'
import { FIVE_ELEMENTS } from './fiveElementDisplay'
import type { Messages, Locale } from '../i18n'

type MonthlyLuckSectionProps = { dayStem: string; messages: Messages; locale: Locale }

function MonthlyLuckSection({ dayStem, messages: t, locale }: MonthlyLuckSectionProps) {
  const [year, setYear] = useState(() => getCurrentJstYear())
  const cardsRef = useRef<HTMLDivElement>(null)
  const result = useMemo(() => calculateMonthlyLuck(year, dayStem), [year, dayStem])

  useEffect(() => {
    const currentIndex = result.currentIndex
    const container = cardsRef.current
    if (currentIndex == null || !container) return
    const currentCard = container.children.item(currentIndex) as HTMLElement | null
    if (!currentCard) return
    const containerBounds = container.getBoundingClientRect()
    const cardBounds = currentCard.getBoundingClientRect()
    container.scrollTo({
      left: container.scrollLeft + cardBounds.left - containerBounds.left - (container.clientWidth - currentCard.clientWidth) / 2,
      behavior: 'instant',
    })
  }, [result.currentIndex, result.cards.length])

  return (
    <section className="monthly-luck" aria-labelledby="monthly-luck-title">
      <div className="monthly-luck__heading">
        <h2 id="monthly-luck-title">{t.monthlyLuck}</h2>
        <div className="monthly-luck__year-switcher" aria-label={t.displayYear}>
          <button type="button" aria-label={t.previousYear} onClick={() => setYear((value) => value - 1)}>‹</button>
          <span>{year}</span>
          <button type="button" aria-label={t.nextYear} onClick={() => setYear((value) => value + 1)}>›</button>
        </div>
      </div>
      <div className="monthly-luck__cards" aria-label={`${year} ${t.monthlyLuck}`} ref={cardsRef}>
        {result.cards.map((card, index) => {
          const stemElement = FIVE_ELEMENTS[card.pillar[0]]
          const branchElement = FIVE_ELEMENTS[card.pillar[1]]
          const current = result.currentIndex === index
          return (
            <article
              className={`monthly-luck__card${current ? ' monthly-luck__card--current' : ''}`}
              key={`${card.jieName}-${card.pillar}`}
              aria-current={current ? 'true' : undefined}
            >
              <span className="monthly-luck__month">{card.month}{t.monthSuffix}</span>
              <span className="monthly-luck__date">{card.startLabel.replace('〜', locale === 'en' ? '–' : locale === 'ko' ? '부터' : '〜')}</span>
              <span className="monthly-luck__pillar" aria-label={card.pillar}>
                <span className={stemElement ? `monthly-luck__symbol monthly-luck__symbol--${stemElement.className}` : 'monthly-luck__symbol'}>{card.pillar[0]}</span>
                <span className={branchElement ? `monthly-luck__symbol monthly-luck__symbol--${branchElement.className}` : 'monthly-luck__symbol'}>{card.pillar[1]}</span>
              </span>
              <span className="monthly-luck__gods">{t.tenGods[card.stemTenGod as keyof typeof t.tenGods] ?? card.stemTenGod} · {t.tenGods[card.branchTenGod as keyof typeof t.tenGods] ?? card.branchTenGod}</span>
              <span className="luck-card__twelve-stage">{t.stages[card.twelveStage as keyof typeof t.stages] ?? card.twelveStage}</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default MonthlyLuckSection
