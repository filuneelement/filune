import { useState } from 'react'
import type { createBasicChartViewModel } from '../lib/basicChartViewModel'

type BasicChart = ReturnType<typeof createBasicChartViewModel>

type BasicChartResultProps = {
  chart: BasicChart
  birthDateTime: string
  showSolarTermAmbiguity: boolean
}

const FIVE_ELEMENTS: Record<string, { label: string; className: string; polarity?: '＋' | '−' }> = {
  甲: { label: '木', className: 'wood', polarity: '＋' },
  乙: { label: '木', className: 'wood', polarity: '−' },
  寅: { label: '木', className: 'wood' },
  卯: { label: '木', className: 'wood' },
  丙: { label: '火', className: 'fire', polarity: '＋' },
  丁: { label: '火', className: 'fire', polarity: '−' },
  巳: { label: '火', className: 'fire' },
  午: { label: '火', className: 'fire' },
  戊: { label: '土', className: 'earth', polarity: '＋' },
  己: { label: '土', className: 'earth', polarity: '−' },
  辰: { label: '土', className: 'earth' },
  戌: { label: '土', className: 'earth' },
  丑: { label: '土', className: 'earth' },
  未: { label: '土', className: 'earth' },
  庚: { label: '金', className: 'metal', polarity: '＋' },
  辛: { label: '金', className: 'metal', polarity: '−' },
  申: { label: '金', className: 'metal' },
  酉: { label: '金', className: 'metal' },
  壬: { label: '水', className: 'water', polarity: '＋' },
  癸: { label: '水', className: 'water', polarity: '−' },
  子: { label: '水', className: 'water' },
  亥: { label: '水', className: 'water' },
}

function BasicChartResult({ chart, birthDateTime, showSolarTermAmbiguity }: BasicChartResultProps) {
  const [showHiddenStems, setShowHiddenStems] = useState(false)

  return (
    <section className="result-screen" aria-labelledby="result-title">
      <header className="result-screen__header">
        <p className="result-screen__brand">FILUNE</p>
        <h1 id="result-title">あなたの命式</h1>
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
            const mainHiddenStem = column.hiddenStems.find(({ role }) => role === 'main')
            const stemElement = FIVE_ELEMENTS[column.stem]
            const branchElement = FIVE_ELEMENTS[column.branch]

            return (
              <article
                className={`basic-chart__pillar${index === 2 ? ' basic-chart__pillar--day' : ''}`}
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

                <div className="basic-chart__hidden-stems">
                  <span className="basic-chart__hidden-label">蔵干</span>
                  {showHiddenStems ? (
                    <ul className="basic-chart__hidden-list">
                      {column.hiddenStems.map(({ stem, role, tenGod }) => (
                        <li key={stem}>
                          <span className="basic-chart__hidden-symbol">{stem}</span>
                          <span className="basic-chart__hidden-meta">
                            {role === 'main' ? '本気' : role === 'middle' ? '中気' : '余気'}・{tenGod}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="basic-chart__hidden-symbol">{mainHiddenStem?.stem ?? '—'}</span>
                  )}
                </div>
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
    </section>
  )
}

export default BasicChartResult
