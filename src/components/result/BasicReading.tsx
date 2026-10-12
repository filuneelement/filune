import type { Messages } from '../../i18n'

export interface BasicReading {
  core?: string
  personality?: string
  strengths?: string[]
  cautions?: string[]
}

export function hasBasicReading(reading?: BasicReading): boolean {
  return Boolean(
    reading?.core?.trim()
    || reading?.personality?.trim()
    || reading?.strengths?.some((item) => item.trim())
    || reading?.cautions?.some((item) => item.trim()),
  )
}

export default function BasicReading({ reading, messages: t }: { reading?: BasicReading; messages: Messages }) {
  if (!hasBasicReading(reading)) return null

  const sections = [
    { title: t.reading.core, content: reading?.core },
    { title: t.reading.personality, content: reading?.personality },
    { title: t.reading.strengths, items: reading?.strengths },
    { title: t.reading.cautions, items: reading?.cautions },
  ]

  return <section className="basic-reading" aria-label={t.resultTitle}>
    {sections.map(({ title, content, items }) => {
      const visibleItems = items?.filter((item) => item.trim())
      if (!content?.trim() && !visibleItems?.length) return null

      return <article className="basic-reading__section" key={title}>
        <h2>{title}</h2>
        {content?.trim() && <p>{content}</p>}
        {visibleItems && <ul>{visibleItems.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>}
      </article>
    })}
  </section>
}
