import { useState } from 'react'
import type { createBasicChartViewModel } from '../lib/basicChartViewModel'
import type { GreatLuckResult } from '../lib/calculateGreatLuck'
import GreatLuckSection from './GreatLuckSection'
import MonthlyLuckSection from './MonthlyLuckSection'
import YearlyLuckSection from './YearlyLuckSection'
import { FIVE_ELEMENTS } from './fiveElementDisplay'

type BasicChart = ReturnType<typeof createBasicChartViewModel>

type BasicChartResultProps = {
  chart: BasicChart
  profileSummary: string
  birthDateTime: string
  showSolarTermAmbiguity: boolean
  onBack: () => void
  greatLuck: GreatLuckResult | null
  greatLuckMessage?: string
}

function BasicChartResult({
  chart,
  profileSummary,
  birthDateTime,
  showSolarTermAmbiguity,
  onBack,
  greatLuck,
  greatLuckMessage,
}: BasicChartResultProps) {
  const [showHiddenStems, setShowHiddenStems] = useState(false)

  return (
    <section className="result-screen" aria-labelledby="result-title">
      <header className="result-screen__header">
        <button className="result-screen__back" type="button" onClick={onBack}>‹ 入力画面へ戻る</button>
        <p className="result-screen__brand">FILUNE</p>
        <h1 id="result-title">あなたの命式</h1>
        <p className="result-screen__profile">{profileSummary}</p>
        <p className="result-screen__birth-data">{birthDateTime}</p>
        {showSolarTermAmbiguity && (
          <p className="result-screen__notice">
            この日は節入り日にあたるため、出生時刻によって年柱・月柱が異なる場合があります。
          </p>
        )}
      </header>

      <section className="basic-chart" aria-labelledby="basic-chart-title">
        <div className="basic-chart__heading">
          <h2 id="basic-chart-title">基本命式</h2>
        </div>

        <div
          id="basic-chart-columns"
          className={`basic-chart__columns basic-chart__columns--${chart.columns.length}`}
        >
          {chart.columns.map((column, index) => {
            const stemElement = FIVE_ELEMENTS[column.stem]
            const branchElement = FIVE_ELEMENTS[column.branch]

            return (
              <article
                className="basic-chart__pillar"
                key={column.name}
                aria-label={column.name}
              >
                <h3>{column.name}</h3>
                <div className="basic-chart__pillar-data basic-chart__pillar-data--stem">
                  <span className="basic-chart__symbol-value">
                    <span className={`basic-chart__symbol basic-chart__symbol--${stemElement?.className ?? 'unknown'}`}>
                      {column.stem}
                    </span>
                    {stemElement && (
                      <span className={`basic-chart__element basic-chart__element--${stemElement.className}`}>
                        {stemElement.polarity}{stemElement.label}
                      </span>
                    )}
                  </span>
                  <span className="basic-chart__ten-god">{index === 2 ? '日干' : column.stemTenGod}</span>
                </div>

                <div className="basic-chart__pillar-data basic-chart__pillar-data--branch">
                  <span className="basic-chart__symbol-value">
                    <span className={`basic-chart__symbol basic-chart__symbol--${branchElement?.className ?? 'unknown'}`}>
                      {column.branch}
                    </span>
                    {branchElement && (
                      <span className={`basic-chart__element basic-chart__element--${branchElement.className}`}>
                        {branchElement.label}
                      </span>
                    )}
                  </span>
                  <span className="basic-chart__ten-god">{column.branchTenGod}</span>
                </div>

                {showHiddenStems && (
                  <div className="basic-chart__hidden-stems">
                    <span className="basic-chart__hidden-label">蔵干</span>
                    <ul className="basic-chart__hidden-list">
                      {column.hiddenStems.map(({ stem, role, tenGod }) => (
                        <li key={stem}>
                          <span className={`basic-chart__hidden-symbol${FIVE_ELEMENTS[stem] ? ` basic-chart__hidden-symbol--${FIVE_ELEMENTS[stem].className}` : ''}`}>
                            {stem}
                          </span>
                          <span className="basic-chart__hidden-meta">
                            {role === 'main' ? '本気' : role === 'middle' ? '中気' : '余気'}・{tenGod}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="basic-chart__twelve-stage">
                      <span className="basic-chart__hidden-symbol">{column.twelveStage}</span>
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
          {showHiddenStems ? '簡略表示' : '蔵干を詳しく見る'}
        </button>
      </section>

      <GreatLuckSection result={greatLuck} message={greatLuckMessage} dayStem={chart.dayStem} />
      <YearlyLuckSection dayStem={chart.dayStem} greatLuckPeriods={greatLuck?.cards ?? []} />
      <MonthlyLuckSection dayStem={chart.dayStem} />
    </section>
  )
}

export default BasicChartResult
