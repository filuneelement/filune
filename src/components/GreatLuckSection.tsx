import { useEffect, useRef } from 'react'
import type { GreatLuckResult } from '../lib/calculateGreatLuck'
import { calculateTwelveStage, type EarthlyBranch, type HeavenlyStem } from '../lib/twelveStages'
import { FIVE_ELEMENTS } from './fiveElementDisplay'

type GreatLuckSectionProps = {
  result: GreatLuckResult | null
  message?: string
  dayStem: string
}

function GreatLuckSection({ result, message, dayStem }: GreatLuckSectionProps) {
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentIndex = result?.currentIndex
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
  }, [result?.currentIndex, result?.cards.length])

  return (
    <section className="great-luck" aria-labelledby="great-luck-title">
      <div className="great-luck__heading">
        <h2 id="great-luck-title">大運</h2>
        {result && <span className="great-luck__direction">{result.directionLabel}</span>}
      </div>

      {message ? (
        <p className="great-luck__notice">{message}</p>
      ) : result ? (
        <>
          <p className="great-luck__start-age">
            {result.startAgeLabel ? `起運 ${result.startAgeLabel}` : '出生時刻が不明のため、起運時期は目安です'}
          </p>
          <div className="great-luck__cards" aria-label="大運の一覧" ref={cardsRef}>
            {result.cards.map((card, index) => {
              const stemElement = FIVE_ELEMENTS[card.stem]
              const branchElement = FIVE_ELEMENTS[card.branch]
              const current = result.currentIndex === index
              return (
                <article
                  className={`great-luck__card${current ? ' great-luck__card--current' : ''}`}
                  key={`${card.pillar}-${index}`}
                  aria-current={current ? 'true' : undefined}
                >
                  {card.startAgeLabel && <span className="great-luck__card-age">{card.startAgeLabel}</span>}
                  <span className="great-luck__card-pillar" aria-label={card.pillar}>
                    <span className={stemElement ? `great-luck__symbol great-luck__symbol--${stemElement.className}` : 'great-luck__symbol'}>
                      {card.stem}
                    </span>
                    <span className={branchElement ? `great-luck__symbol great-luck__symbol--${branchElement.className}` : 'great-luck__symbol'}>
                      {card.branch}
                    </span>
                  </span>
                  <span className="great-luck__card-meta">{card.stemTenGod}・{card.branchTenGod}</span>
                  <span className="luck-card__twelve-stage">{calculateTwelveStage(dayStem as HeavenlyStem, card.branch as EarthlyBranch)}</span>
                </article>
              )
            })}
          </div>
        </>
      ) : null}
    </section>
  )
}

export default GreatLuckSection
