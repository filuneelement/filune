import { useEffect, useRef } from 'react'
import type { GreatLuckResult } from '../lib/calculateGreatLuck'
import { calculateTwelveStage, type EarthlyBranch, type HeavenlyStem } from '../lib/twelveStages'
import { FIVE_ELEMENTS } from './fiveElementDisplay'
import type { Messages, Locale } from '../i18n'
import { formatAgeLabel } from '../i18n'

type GreatLuckSectionProps = {
  result: GreatLuckResult | null
  message?: string
  dayStem: string
  messages: Messages
  locale: Locale
}

function GreatLuckSection({ result, message, dayStem, messages: t, locale }: GreatLuckSectionProps) {
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
        <h2 id="great-luck-title">{t.greatLuck}</h2>
        {result && <span className="great-luck__direction">{t.direction[result.directionLabel as keyof typeof t.direction] ?? result.directionLabel}</span>}
      </div>

      {message ? (
        <p className="great-luck__notice">{message}</p>
      ) : result ? (
        <>
          <p className="great-luck__start-age">
            {result.startAgeLabel ? `${t.startAge} ${formatAgeLabel(result.startAgeLabel, locale)}` : t.unknownStartAge}
          </p>
          <div className="great-luck__cards" aria-label={t.greatLuckList} ref={cardsRef}>
            {result.cards.map((card, index) => {
              const stemElement = FIVE_ELEMENTS[card.stem]
              const current = result.currentIndex === index
              return (
                <article
                  className={`great-luck__card${current ? ' great-luck__card--current' : ''}`}
                  key={`${card.pillar}-${index}`}
                  aria-current={current ? 'true' : undefined}
                >
                  {card.startDateLabel && <span className="great-luck__card-date">{card.startDateLabel}</span>}
                  <span className="great-luck__card-pillar" aria-label={card.pillar}>
                    <span className={stemElement ? `great-luck__symbol great-luck__symbol--${stemElement.className}` : 'great-luck__symbol'}>
                      {card.stem}
                    </span>
                    <span className={FIVE_ELEMENTS[card.branch] ? `great-luck__symbol great-luck__symbol--${FIVE_ELEMENTS[card.branch].className}` : 'great-luck__symbol'}>{card.branch}</span>
                  </span>
                  <span className="great-luck__card-meta">{t.tenGods[card.stemTenGod as keyof typeof t.tenGods] ?? card.stemTenGod}・{t.tenGods[card.branchTenGod as keyof typeof t.tenGods] ?? card.branchTenGod}</span>
                  <span className="luck-card__twelve-stage">{t.stages[calculateTwelveStage(dayStem as HeavenlyStem, card.branch as EarthlyBranch) as keyof typeof t.stages]}</span>
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
