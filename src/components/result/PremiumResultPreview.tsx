import type { Messages, Locale } from '../../i18n'
import type { LocalizedCustomerReading } from '../../lib/product/readBirthChart'
import ResultTestimonials, { type ResultTestimonial } from './ResultTestimonials'
import type { PaidPreview } from './singleResultCopy'

export default function PremiumResultPreview({ copy, selectedTopic, selectedStatus, selectedTopicPreview, currentFlow, testimonials = [], priceLabel, authorizedReading }: {
  copy: Messages['resultPreview']
  selectedTopic?: string
  selectedStatus?: string
  selectedTopicPreview?: PaidPreview
  currentFlow?: PaidPreview
  testimonials?: readonly ResultTestimonial[]
  priceLabel?: string
  authorizedReading?: { locale: Locale; chapters: LocalizedCustomerReading[string] }
}) {
  if (authorizedReading?.chapters.length === 7) {
    const { locale, chapters } = authorizedReading
    const empty = {
      ko: '이 장에서 구체적으로 설명할 수 있는 판단이 아직 확인되지 않았습니다.',
      ja: 'この章で具体的にお伝えできる判断は、まだ確認できていません。',
      en: 'There is not yet enough evidence for a specific reading in this chapter.',
    }[locale]
    return <div className="result-chapters" lang={locale}>
      {chapters.map(chapter => {
        const content = chapter.sections.filter(section => section.paragraphs.length > 0)
        return <section key={chapter.number} className="result-chapter" aria-labelledby={`premium-chapter-${chapter.number}`}>
          <h2 id={`premium-chapter-${chapter.number}`}>{chapter.number}. {chapter.title}</h2>
          {content.length ? content.map((section, index) => <div key={index}>
            {content.length > 1 && <h3>{section.title}</h3>}
            {section.paragraphs.map(paragraph => <p key={paragraph.id}>{paragraph.text}</p>)}
          </div>) : <p>{empty}</p>}
        </section>
      })}
    </div>
  }
  return (
    <div className="result-preview">
      <section className="result-preview__section" aria-labelledby="result-preview-title">
        <p className="result-preview__label">{copy.paidLabel}</p>
        <h2 id="result-preview-title">{copy.indexTitle}</h2>
        <ol className="result-preview__index">
          {copy.chapters.map(({ title, description }, index) => (
            <li key={title}>
              <span className="result-chapter__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>
          ))}
        </ol>
        {selectedTopic && <aside className="result-preview__topic">
          <h3>{copy.selectedLabel}</h3>
          <p><strong>{selectedTopic}</strong></p>
          {selectedStatus && <p>{selectedStatus}</p>}
          <p>{copy.selectedDescription}</p>
          {selectedTopicPreview?.paragraphs.map(({ text }) => <p key={text}>{text}</p>)}
        </aside>}
      </section>

      <section className="result-preview__section" aria-labelledby="result-difference-title">
        <h2 id="result-difference-title">{copy.differenceTitle}</h2>
        {copy.difference.map(({ before, emphasis, after }, index) => (
          <p key={index}>{before}{emphasis && <strong>{emphasis}</strong>}{after}</p>
        ))}
        <h3>{copy.focusTitle}</h3>
        <p>{copy.focusBody}</p>
        {selectedTopic && <p className="result-preview__topic"><strong>{selectedTopic}</strong></p>}
      </section>

      {currentFlow && <section className="result-preview__sample" aria-labelledby="result-sample-title">
        <p className="result-preview__label">{copy.sampleLabel}</p>
        <h2 id="result-sample-title">{currentFlow.title}</h2>
        {currentFlow.paragraphs.map(({ text }) => <p key={text}>{text}</p>)}
        {currentFlow.continuationHints.map(({ text }) => <p key={text}>{text}</p>)}
        <div className="result-preview__locked">
          <p>{copy.sampleContinuation}</p>
          <a href="#result-offer-title">{copy.cta}</a>
        </div>
      </section>}

      <ResultTestimonials title={copy.testimonialsTitle} testimonials={testimonials} />

      <section className="result-preview__offer" aria-labelledby="result-offer-title">
        <h2 id="result-offer-title">{copy.offerTitle}</h2>
        <p className="result-preview__price">{priceLabel ?? copy.pricePending}</p>
        <ul>
          {copy.chapters.map(({ title }) => <li key={title}>{title}</li>)}
          {selectedTopic && <li>{copy.offerTopic}</li>}
        </ul>
        <button className="story-cta" type="button" disabled aria-describedby="result-checkout-status">{copy.cta}</button>
        <p id="result-checkout-status">{copy.checkoutStatus}</p>
      </section>
    </div>
  )
}
