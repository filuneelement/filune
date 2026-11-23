import { useState } from 'react'
import { FIVE_ELEMENTS } from '../fiveElementDisplay'
import { createBasicChartViewModel } from '../../lib/basicChartViewModel'
import type { FourPillars, ThreePillars } from '../../lib/calculateEightChar'
import type { CalculatedChart } from '../../lib/canonical/types'
import GreatLuckSection from '../GreatLuckSection'
import YearlyLuckSection from '../YearlyLuckSection'
import MonthlyLuckSection from '../MonthlyLuckSection'
import DailyPillarCalendar from './DailyPillarCalendar'
import type { Locale, Messages } from '../../i18n'

function NatalChart({ pillars, messages: t, showSolarTermAmbiguity }: {
  pillars: FourPillars | ThreePillars
  messages: Messages
  showSolarTermAmbiguity: boolean
}) {
  const [showHiddenStems, setShowHiddenStems] = useState(false)
  const chart = createBasicChartViewModel(pillars)

  return (
    <>
      {showSolarTermAmbiguity && <p className="result-screen__notice">{t.solarNotice}</p>}
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
    </>
  )
}

export default function ResultChartDisclosure({ pillars, calculation, messages: t, locale, showSolarTermAmbiguity }: {
  pillars: FourPillars | ThreePillars
  calculation: CalculatedChart
  messages: Messages
  locale: Locale
  showSolarTermAmbiguity: boolean
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('natal')
  const greatLuck = calculation.greatLuck.status === 'available' ? calculation.greatLuck.value : undefined
  const greatLuckMessage = showSolarTermAmbiguity
    ? t.ambiguousLuck
    : calculation.birthInput.gender ? undefined : t.genderRequired
  const panels = [
    { id: 'natal', label: t.resultNatalChart, content: <NatalChart pillars={pillars} messages={t}
      showSolarTermAmbiguity={showSolarTermAmbiguity} /> },
    { id: 'great', label: t.greatLuck, content: <GreatLuckSection result={greatLuck} message={greatLuckMessage}
      messages={t} locale={locale} /> },
    { id: 'yearly', label: t.yearlyLuck, content: <YearlyLuckSection result={calculation.yearlyLuck} messages={t} /> },
    { id: 'monthly', label: t.monthlyLuck, content: <MonthlyLuckSection dayStem={pillars.dayRelationships.dayStem}
      calculation={calculation} messages={t} locale={locale} /> },
    { id: 'daily', label: t.resultDailyPillar, content: <DailyPillarCalendar referenceTime={calculation.context.referenceTime}
      dayStem={pillars.dayRelationships.dayStem} locale={locale} messages={t} /> },
  ]
  const selected = panels.find(panel => panel.id === active) ?? panels[0]

  return (
    <details className="full-chart-disclosure" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>{t.reading.disclosure}</summary>
      {open && <>
        <div className="result-chart-sections" role="group" aria-label={t.reading.disclosure}>
          {panels.map(({ id, label }) => <button key={id} type="button" aria-pressed={id === active}
            aria-controls="result-chart-panel" onClick={() => setActive(id)}>{label}</button>)}
        </div>
        <div id="result-chart-panel" role="region" aria-label={selected.label}
          className={active === 'natal' || active === 'daily' ? undefined : 'fortune-flow'}>{selected.content}</div>
      </>}
    </details>
  )
}
