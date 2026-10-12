import { useState } from 'react'
import type { createBasicChartViewModel } from '../lib/basicChartViewModel'
import type { GreatLuckResult } from '../lib/calculateGreatLuck'
import GreatLuckSection from './GreatLuckSection'
import MonthlyLuckSection from './MonthlyLuckSection'
import YearlyLuckSection from './YearlyLuckSection'
import { FIVE_ELEMENTS } from './fiveElementDisplay'
import type { Messages, Locale } from '../i18n'
import ResultHero from './result/ResultHero'
import BasicReading, { hasBasicReading, type BasicReading as BasicReadingData } from './result/BasicReading'
import DayMasterCard from './result/DayMasterCard'
import DayBranchCard from './result/DayBranchCard'
import FiveElementsBalance from './result/FiveElementsBalance'
import SelectedTopicReading from './result/SelectedTopicReading'

type BasicChart = ReturnType<typeof createBasicChartViewModel>

type BasicChartResultProps = {
  chart: BasicChart
  profileSummary: string
  birthDateTime: string
  timeCorrectionSummary?: string
  showSolarTermAmbiguity: boolean
  onBack: () => void
  greatLuck: GreatLuckResult | null
  greatLuckMessage?: string
  messages: Messages
  locale: Locale
  name: string
  interestTopic?: string
  reading?: BasicReadingData
}

function BasicChartResult({
  chart,
  profileSummary,
  birthDateTime,
  timeCorrectionSummary,
  showSolarTermAmbiguity,
  onBack,
  greatLuck,
  greatLuckMessage,
  messages: t,
  locale,
  name,
  interestTopic,
  reading,
}: BasicChartResultProps) {
  const [showHiddenStems, setShowHiddenStems] = useState(false)

  return (
    <section className="result-screen" aria-label={t.resultTitle}>
      <ResultHero name={name} messages={t} />
      <header className="result-screen__header result-screen__header--meta">
        <div className="page-topbar page-topbar--result">
          <button className="result-screen__back" type="button" aria-label={t.back} onClick={onBack}>&lt;</button>
          <div className="page-topbar__brand">
            <div className="page-topbar__title">FILUNE</div>
          </div>
        </div>
        <p className="result-screen__profile">{profileSummary}</p>
        <p className="result-screen__birth-data">{birthDateTime}</p>
        {timeCorrectionSummary && <p className="result-screen__time-correction">{timeCorrectionSummary}</p>}
        {showSolarTermAmbiguity && (
          <p className="result-screen__notice">
            {t.solarNotice}
          </p>
        )}
      </header>

      <section className="result-content">
        {hasBasicReading(reading) && <section className="reading-section">
          <p className="section-eyebrow">{t.reading.brandLine}</p>
          <BasicReading reading={reading} messages={t} />
        </section>}
        <section className="evidence-section">
          <h2>{t.reading.evidence}</h2>
          <div className="evidence-grid">
            <DayMasterCard stem={chart.dayStem} messages={t} locale={locale} />
            <DayBranchCard branch={chart.dayBranch} messages={t} />
          </div>
          <FiveElementsBalance chart={chart} messages={t} />
          <div className="ten-god-panel"><h3>{t.reading.tenGods}</h3><div className="ten-god-chips">
            {[...new Set(chart.columns.flatMap((column) => [column.stemTenGod, column.branchTenGod]).filter((god) => god !== '—' && god !== '日干'))].map((god) => (
              <span className="ten-god-chip" key={god}>{t.tenGods[god as keyof typeof t.tenGods] ?? god}</span>
            ))}
          </div></div>
        </section>
        <section className="how-reads-section">
          <p className="section-eyebrow">FILUNE</p><h2>{t.reading.howTitle}</h2><div className="reading-path">{t.reading.readingPath.map((item, index) => <span key={item}>{item}{index < t.reading.readingPath.length - 1 && <i>✦</i>}</span>)}</div><p>{t.reading.howBody}</p>
        </section>
        {interestTopic && <SelectedTopicReading data={{ topic: t.flow.topics[['self','love','work','money','future'].indexOf(interestTopic)] }} messages={t} />}
        <section className="topic-section">
          <div className="topic-section__intro"><p>{t.reading.premiumTitle}</p></div>
          <div className="topic-grid">{(interestTopic === 'love' ? t.reading.premiumLoveItems : interestTopic ? [t.flow.topics[['self','love','work','money','future'].indexOf(interestTopic)]] : t.reading.topics.slice(0, 1)).map((topic) => <article className="premium-card" key={topic}>
            <span className="premium-card__accent">✦</span><h3>{topic}</h3><p>{t.reading.previewUnavailable}</p>
            <button type="button" aria-label={`${topic}: ${t.reading.previewOpen}`} disabled>{t.reading.previewOpen}</button>
            <small>🔒 {t.reading.locked}</small>
          </article>)}</div>
        </section>

        <details className="full-chart-disclosure">
          <summary>{t.reading.disclosure}</summary>

      <section className="basic-chart">
        <div
          id="basic-chart-columns"
          dir="ltr"
          className={`basic-chart__columns basic-chart__columns--${chart.columns.length}`}
        >
          {[...chart.columns].reverse().map((column) => {
            const stemElement = FIVE_ELEMENTS[column.stem]
            const branchElement = FIVE_ELEMENTS[column.branch]

            return (
              <article
                className="basic-chart__pillar"
                key={column.name}
                aria-label={t.pillars[column.name as keyof typeof t.pillars]}
              >
                <h3>{t.pillars[column.name as keyof typeof t.pillars]}</h3>
                <div className="basic-chart__pillar-data basic-chart__pillar-data--stem">
                  <span className="basic-chart__symbol-value">
                    <span className={`basic-chart__symbol basic-chart__symbol--${stemElement?.className ?? 'unknown'}`}>
                      {column.stem}
                    </span>
                    {stemElement && (
                      <span className={`basic-chart__element basic-chart__element--${stemElement.className}`}>
                        {stemElement.polarity}{t.elements[stemElement.label as keyof typeof t.elements]}
                      </span>
                    )}
                  </span>
                  <span className="basic-chart__ten-god">{column.name === '日柱' ? t.dayMaster : t.tenGods[column.stemTenGod as keyof typeof t.tenGods] ?? column.stemTenGod}</span>
                </div>

                <div className="basic-chart__pillar-data basic-chart__pillar-data--branch">
                  <span className="basic-chart__symbol-value">
                    <span className={`basic-chart__symbol basic-chart__symbol--${branchElement?.className ?? 'unknown'}`}>
                      {column.branch}
                    </span>
                    {branchElement && (
                      <span className={`basic-chart__element basic-chart__element--${branchElement.className}`}>
                        {branchElement.polarity}{t.elements[branchElement.label as keyof typeof t.elements]}
                      </span>
                    )}
                  </span>
                  <span className="basic-chart__ten-god">{t.tenGods[column.branchTenGod as keyof typeof t.tenGods] ?? column.branchTenGod}</span>
                </div>

                {showHiddenStems && (
                  <div className="basic-chart__hidden-stems">
                    <span className="basic-chart__hidden-label">{t.hiddenStems}</span>
                    <ul className="basic-chart__hidden-list">
                      {column.hiddenStems.map(({ stem, role, tenGod }) => (
                        <li key={stem}>
                          <span className={`basic-chart__hidden-symbol${FIVE_ELEMENTS[stem] ? ` basic-chart__hidden-symbol--${FIVE_ELEMENTS[stem].className}` : ''}`}>
                            {stem}
                          </span>
                          <span className="basic-chart__hidden-meta">
                            {t.roles[role]}・{t.tenGods[tenGod as keyof typeof t.tenGods] ?? tenGod}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="basic-chart__twelve-stage">
                      <span className="basic-chart__hidden-symbol">{t.stages[column.twelveStage as keyof typeof t.stages] ?? column.twelveStage}</span>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        <button
          className="basic-chart__expand-link"
          type="button"
          aria-controls="basic-chart-columns"
          aria-expanded={showHiddenStems}
          onClick={() => setShowHiddenStems((visible) => !visible)}
        >
          {showHiddenStems ? t.collapseHidden : t.expandHidden}
        </button>
      </section>

      <section className="fortune-flow">
        <GreatLuckSection result={greatLuck} message={greatLuckMessage} dayStem={chart.dayStem} messages={t} locale={locale} />
        <YearlyLuckSection dayStem={chart.dayStem} greatLuckPeriods={greatLuck?.cards ?? []} messages={t} locale={locale} />
        <MonthlyLuckSection dayStem={chart.dayStem} messages={t} locale={locale} />
      </section>
        </details>
      </section>
    </section>
  )
}

export default BasicChartResult
