import { useState } from 'react'
import type { createBasicChartViewModel } from '../lib/basicChartViewModel'

type BasicChart = ReturnType<typeof createBasicChartViewModel>

type BasicChartResultProps = {
  chart: BasicChart
  birthDateTime: string
  showSolarTermAmbiguity: boolean
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
          <div>
            <p className="basic-chart__eyebrow">BASIC CHART</p>
            <h2 id="basic-chart-title">基本命式表</h2>
          </div>
          <button
            type="button"
            aria-controls="basic-chart-table"
            aria-expanded={showHiddenStems}
            onClick={() => setShowHiddenStems((visible) => !visible)}
          >
            {showHiddenStems ? '簡略表示' : '蔵干を詳しく見る'}
          </button>
        </div>

        <div className="basic-chart__table-wrap">
          <table id="basic-chart-table" className="basic-chart__table">
            <thead>
              <tr>
                <th scope="col" aria-label="項目" />
                {chart.columns.map((column, index) => (
                  <th scope="col" className={index === 2 ? 'basic-chart__day-column' : undefined} key={column.name}>
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">天干</th>
                {chart.columns.map((column, index) => (
                  <td className={index === 2 ? 'basic-chart__day-column' : undefined} key={column.name}>
                    <span className="basic-chart__symbol">{column.stem}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">天干の十神</th>
                {chart.columns.map((column, index) => (
                  <td className={index === 2 ? 'basic-chart__day-column' : undefined} key={column.name}>
                    <span className="basic-chart__ten-god">{column.stemTenGod}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">地支</th>
                {chart.columns.map((column, index) => (
                  <td className={index === 2 ? 'basic-chart__day-column' : undefined} key={column.name}>
                    <span className="basic-chart__symbol">{column.branch}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">地支の十神</th>
                {chart.columns.map((column, index) => (
                  <td className={index === 2 ? 'basic-chart__day-column' : undefined} key={column.name}>
                    <span className="basic-chart__ten-god">{column.branchTenGod}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">蔵干</th>
                {chart.columns.map((column, index) => {
                  const mainHiddenStem = column.hiddenStems.find(({ role }) => role === 'main')
                  return (
                    <td className={index === 2 ? 'basic-chart__day-column' : undefined} key={column.name}>
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
                        <span className="basic-chart__hidden-symbol">{mainHiddenStem?.stem}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

      </section>
    </section>
  )
}

export default BasicChartResult
