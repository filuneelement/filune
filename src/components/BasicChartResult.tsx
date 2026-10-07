import { useState } from 'react'
import type { createBasicChartViewModel } from '../lib/basicChartViewModel'
import type { GreatLuckResult } from '../lib/calculateGreatLuck'
import GreatLuckSection from './GreatLuckSection'
import MonthlyLuckSection from './MonthlyLuckSection'
import YearlyLuckSection from './YearlyLuckSection'
import { FIVE_ELEMENTS } from './fiveElementDisplay'
import type { Messages, Locale } from '../i18n'
import luneImage from '../assets/images/lune.png'

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
}: BasicChartResultProps) {
  const [showHiddenStems, setShowHiddenStems] = useState(false)

  return (
    <section className="result-screen" aria-label={t.resultTitle}>
      <header className="result-screen__header">
        <div className="page-topbar page-topbar--result">
          <button className="result-screen__back" type="button" aria-label={t.back} onClick={onBack}>&lt;</button>
          <div className="page-topbar__brand">
            <img className="entry-screen__guide page-topbar__guide" src={luneImage} alt="" />
            <div className="page-topbar__title">FILUNE {t.entryTitle}</div>
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
    </section>
  )
}

export default BasicChartResult
