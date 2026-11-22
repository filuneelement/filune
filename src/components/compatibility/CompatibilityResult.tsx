import type { CompatibilityCustomerResult } from '../../lib/product/prepareCompatibilityProductResult'
import type { Locale, Messages } from '../../i18n'

export default function CompatibilityResult({ result, messages: t, onBack, onHome }: {
  result: CompatibilityCustomerResult
  locale: Locale
  messages: Messages
  onBack: () => void
  onHome: () => void
}) {
  return <section className="compatibility-result">
    <header className="compatibility-result__header">
      <nav className="compatibility-result__navigation" aria-label={t.compatibility.navigation}>
        <button type="button" className="compatibility-flow__back" onClick={onBack}>{t.compatibility.backToInput}</button>
        <button type="button" className="compatibility-flow__back" onClick={onHome}>{t.compatibility.home}</button>
      </nav>
      <div className="compatibility-result__pair" aria-label={t.compatibility.pairIdentity}>
        <span>{t.compatibility.personA}</span><span aria-hidden="true">×</span><span>{t.compatibility.personB}</span>
      </div>
      {result.headline && <h1>{result.headline}</h1>}
    </header>
    <div className="compatibility-result__sections">
      {result.sections.map(section => <section className="compatibility-result__section" key={section.key}>
        <h2>{section.heading}</h2>
        <div className="compatibility-result__statements">
          {section.statements.map((statement, index) => <article key={`${section.key}-${index}`}>
            {statement.periods?.map((period, periodIndex) => period.intervalLabel || period.within
              ? <p className="compatibility-result__period" key={`${section.key}-${index}-period-${periodIndex}`}>
                {[period.intervalLabel, period.within].filter(Boolean).join(' · ')}
              </p> : null)}
            <p>{statement.text}</p>
          </article>)}
        </div>
      </section>)}
    </div>
    {result.timeline.length > 0 && <section className="compatibility-result__timeline" aria-label={t.compatibility.timeline}>
      <h2>{t.compatibility.timeline}</h2>
      <div className="compatibility-result__timeline-list">
        {result.timeline.map((window, index) => <article className="compatibility-result__timeline-card"
          key={`${window.temporal}-${window.heading}-${index}`}>
          <h3>{window.heading}</h3>
          {window.within && <p className="compatibility-result__within">{window.within}</p>}
          {window.statements.map((statement, statementIndex) => <p key={`${index}-${statementIndex}`}>{statement.text}</p>)}
        </article>)}
      </div>
    </section>}
  </section>
}
