import { useEffect, useMemo, useRef } from 'react'
import type { GreatLuckCard } from '../lib/calculateGreatLuck'
import { calculateYearlyLuck } from '../lib/calculateYearlyLuck'
import { FIVE_ELEMENTS } from './fiveElementDisplay'
import type { Messages, Locale } from '../i18n'

type YearlyLuckSectionProps = {
  dayStem: string
  greatLuckPeriods: GreatLuckCard[]
  messages: Messages
  locale: Locale
}

function YearlyLuckSection({ dayStem, greatLuckPeriods, messages: t }: YearlyLuckSectionProps) {
  const cardsRef = useRef<HTMLDivElement>(null)
  const result = useMemo(
    () => calculateYearlyLuck(dayStem, new Date(), greatLuckPeriods),
    [dayStem, greatLuckPeriods],
  )

  useEffect(() => {
    const container = cardsRef.current
    const currentCard = container?.children.item(result.currentIndex) as HTMLElement | null | undefined
    if (!container || !currentCard) return
    const containerBounds = container.getBoundingClientRect()
    const cardBounds = currentCard.getBoundingClientRect()
    container.scrollTo({
      left: container.scrollLeft + cardBounds.left - containerBounds.left - (container.clientWidth - currentCard.clientWidth) / 2,
      behavior: 'instant',
    })
  }, [result.currentIndex, result.cards.length])

  return (
    <section className="yearly-luck" aria-labelledby="yearly-luck-title">
      <div className="yearly-luck__heading">
        <h2 id="yearly-luck-title">{t.yearlyLuck}</h2>
      </div>
      <div className="yearly-luck__cards" aria-label={t.yearlyLuckList} ref={cardsRef}>
        {result.cards.map((card, index) => {
          const stemElement = FIVE_ELEMENTS[card.pillar[0]]
          const branchElement = FIVE_ELEMENTS[card.pillar[1]]
          const current = index === result.currentIndex
          return (
            <article
              className={`yearly-luck__card${current ? ' yearly-luck__card--current' : ''}`}
              key={card.year}
              aria-current={current ? 'true' : undefined}
              data-great-luck={card.greatLuckPillar}
            >
              <span className="yearly-luck__year">{card.year}</span>
              <span className="yearly-luck__pillar" aria-label={card.pillar}>
                <span className={stemElement ? `yearly-luck__symbol yearly-luck__symbol--${stemElement.className}` : 'yearly-luck__symbol'}>{card.pillar[0]}</span>
                <span className={branchElement ? `yearly-luck__symbol yearly-luck__symbol--${branchElement.className}` : 'yearly-luck__symbol'}>{card.pillar[1]}</span>
              </span>
              <span className="yearly-luck__god">{t.tenGods[card.stemTenGod as keyof typeof t.tenGods] ?? card.stemTenGod}</span>
              <span className="yearly-luck__god">{t.tenGods[card.branchTenGod as keyof typeof t.tenGods] ?? card.branchTenGod}</span>
              <span className="luck-card__twelve-stage">{t.stages[card.twelveStage as keyof typeof t.stages] ?? card.twelveStage}</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default YearlyLuckSection
