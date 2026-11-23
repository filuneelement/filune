import type { CustomerParagraph } from './singleResultCopy'

type ResultChapterProps = {
  number: number
  title: string
  paragraphs: CustomerParagraph[]
  emphasis?: string
  callout?: string
  emptyMessage?: string
}

export default function ResultChapter({ number, title, paragraphs, emphasis, callout, emptyMessage }: ResultChapterProps) {
  const [lead, ...body] = paragraphs
  if (!lead && !emptyMessage) return null

  return (
    <article className="result-chapter">
      <span className="result-chapter__number" aria-hidden="true">{String(number).padStart(2, '0')}</span>
      <h2>{title}</h2>
      <p className="result-chapter__lead">{lead?.text ?? emptyMessage}</p>
      {body.map(paragraph => <p key={paragraph.text}>{paragraph.text}</p>)}
      {emphasis && <p><strong>{emphasis}</strong></p>}
      {callout && <aside className="result-chapter__callout">{callout}</aside>}
    </article>
  )
}
