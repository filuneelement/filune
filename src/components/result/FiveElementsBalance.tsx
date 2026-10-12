import type { createBasicChartViewModel } from '../../lib/basicChartViewModel'
import { FIVE_ELEMENTS } from '../fiveElementDisplay'
import type { Messages } from '../../i18n'

type Chart = ReturnType<typeof createBasicChartViewModel>
const elementOrder = ['木', '火', '土', '金', '水'] as const

export default function FiveElementsBalance({ chart, messages: t }: { chart: Chart; messages: Messages }) {
  const counts = Object.fromEntries(elementOrder.map((element) => [element, 0])) as Record<typeof elementOrder[number], number>
  chart.columns.forEach(({ stem, branch }) => [stem, branch].forEach((symbol) => {
    const element = FIVE_ELEMENTS[symbol]?.label as typeof elementOrder[number] | undefined
    if (element) counts[element] += 1
  }))
  const max = Math.max(1, ...Object.values(counts))
  return <section className="evidence-panel"><h2>{t.reading.balance}</h2><div className="element-bars">
    {elementOrder.map((element) => <div className="element-bar" key={element}>
      <span>{t.elements[element]}</span><div className="element-bar__track" role="img" aria-label={`${t.elements[element]} ${counts[element]}`}>
        <span className={`element-bar__fill element-bar__fill--${FIVE_ELEMENTS[({ 木: '甲', 火: '丙', 土: '戊', 金: '庚', 水: '壬' } as const)[element]]?.className}`} style={{ width: `${counts[element] / max * 100}%` }} />
      </div><small>{counts[element]}</small>
    </div>)}
  </div><p className="evidence-note">{t.reading.elements}</p></section>
}
