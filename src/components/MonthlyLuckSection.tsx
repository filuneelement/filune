import { useEffect, useMemo, useRef, useState } from 'react'
import { calculateMonthlyLuck, getCurrentJstYear } from '../lib/calculateMonthlyLuck'
import { FIVE_ELEMENTS } from './fiveElementDisplay'

type MonthlyLuckSectionProps = { dayStem: string }

function MonthlyLuckSection({ dayStem }: MonthlyLuckSectionProps) {
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
        <h2 id="monthly-luck-title">月運</h2>
        <div className="monthly-luck__year-switcher" aria-label="表示年">
          <button type="button" aria-label="前年" onClick={() => setYear((value) => value - 1)}>‹</button>
          <span>{year}</span>
          <button type="button" aria-label="翌年" onClick={() => setYear((value) => value + 1)}>›</button>
        </div>
      </div>
      <div className="monthly-luck__cards" aria-label={`${year}年の月運`} ref={cardsRef}>
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
              <span className="monthly-luck__month">{card.month}月</span>
              <span className="monthly-luck__date">{card.startLabel}</span>
              <span className="monthly-luck__pillar" aria-label={card.pillar}>
                <span className={stemElement ? `monthly-luck__symbol monthly-luck__symbol--${stemElement.className}` : 'monthly-luck__symbol'}>{card.pillar[0]}</span>
                <span className={branchElement ? `monthly-luck__symbol monthly-luck__symbol--${branchElement.className}` : 'monthly-luck__symbol'}>{card.pillar[1]}</span>
              </span>
              <span className="monthly-luck__gods">{card.stemTenGod} / {card.branchTenGod}</span>
              <span className="luck-card__twelve-stage">{card.twelveStage}</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default MonthlyLuckSection
