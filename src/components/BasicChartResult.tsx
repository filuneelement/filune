import { useEffect, useMemo, useState } from 'react'
import { getCurrentJstYear } from '../lib/calculateMonthlyLuck'
import { calculateCanonicalChart } from '../lib/canonical/calculateCanonicalChart'
import type { BirthInput } from '../lib/canonical/types'
import type { FourPillars, ThreePillars } from '../lib/calculateEightChar'
import { CURRENT_CALCULATION_VERSION } from '../lib/canonical/version'
import { buildNatalPersonality, type CurrentPersonalityResult } from '../lib/personality'
import { singleReadingPrice } from '../lib/product/singleReadingOffer'
import { personalTopics, type Messages, type Locale } from '../i18n'
import PremiumResultPreview from './result/PremiumResultPreview'
import ResultChapter from './result/ResultChapter'
import ResultChartDisclosure from './result/ResultChartDisclosure'
import ResultHero from './result/ResultHero'
import { synthesizeSingleResult } from './result/singleResultCopy'

type BasicChartResultProps = {
  birth: BirthInput
  pillars: FourPillars | ThreePillars
  interestTopic?: string
  selectedStatus?: string
  relationshipStatus?: string
  careerStatus?: string
  profileSummary: string
  birthDateTime: string
  timeCorrectionSummary?: string
  showSolarTermAmbiguity: boolean
  onBack: () => void
  messages: Messages
  locale: Locale
  name: string
}

export default function BasicChartResult({
  birth,
  pillars,
  interestTopic,
  selectedStatus,
  relationshipStatus,
  careerStatus,
  profileSummary,
  birthDateTime,
  timeCorrectionSummary,
  showSolarTermAmbiguity,
  onBack,
  messages: t,
  locale,
  name,
}: BasicChartResultProps) {
  const calculation = useMemo(() => {
    const now = new Date()
    return calculateCanonicalChart(birth, {
      referenceTime: now.toISOString(),
      calculationVersion: CURRENT_CALCULATION_VERSION,
      monthlyLuckYear: getCurrentJstYear(now),
    })
  }, [birth])
  const natal = useMemo(() => buildNatalPersonality(calculation.chart), [calculation])
  const [premium, setPremium] = useState<{ birth: BirthInput; current: CurrentPersonalityResult }>()
  useEffect(() => {
    let active = true
    void import('../lib/product/prepareSingleReadingPreview').then(({ prepareSingleReadingPreview }) => {
      if (!active) return
      const current = prepareSingleReadingPreview(birth, calculation.context.referenceTime)
      if (current) setPremium({ birth, current })
    }).catch(() => {
      if (active) setPremium(undefined)
    })
    return () => { active = false }
  }, [birth, calculation])
  const current = premium?.birth === birth ? premium.current : undefined
  const selectedTopic = t.flow.topics[personalTopics.findIndex(topic => topic === interestTopic)]
  const reading = useMemo(() => synthesizeSingleResult(natal, current, calculation.context.referenceTime, {
    topic: interestTopic, careerStatus, relationshipStatus,
  }, locale, t), [natal, current, calculation.context.referenceTime, interestTopic, careerStatus, relationshipStatus, locale, t])

  return (
    <section className="result-screen" aria-label={t.resultTitle}>
      <ResultHero name={name} messages={t} />
      <header className="result-screen__header result-screen__header--meta">
        <div className="birth-step-top">
          <button className="story-back" type="button" aria-label={t.flow.back} onClick={onBack}>‹</button>
        </div>
        <p className="result-screen__profile">{profileSummary}</p>
        <p className="result-screen__birth-data">{birthDateTime}</p>
        {timeCorrectionSummary && <p className="result-screen__time-correction">{timeCorrectionSummary}</p>}
      </header>

      <div className="result-content">
        <div className="result-chapters">
          {reading.free.map((chapter, index) => (
            <ResultChapter key={chapter.title} number={index + 1} title={chapter.title} paragraphs={chapter.paragraphs}
              emptyMessage={locale === 'ko' && !chapter.paragraphs.length ? '이 장에서 설명할 수 있는 근거가 아직 충분하지 않습니다.' : undefined} />
          ))}
        </div>
        <ResultChartDisclosure pillars={pillars} calculation={calculation} messages={t}
          locale={locale} showSolarTermAmbiguity={showSolarTermAmbiguity} />
        <PremiumResultPreview copy={t.resultPreview} selectedTopic={selectedTopic} selectedStatus={selectedStatus}
          selectedTopicPreview={reading.selectedTopicPreview} currentFlow={reading.paid.currentFlow}
          priceLabel={singleReadingPrice(locale)} />
      </div>
    </section>
  )
}
