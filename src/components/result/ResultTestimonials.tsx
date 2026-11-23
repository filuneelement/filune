export type ResultTestimonial = {
  id: string
  quote: string
  attribution?: string
  rating?: number
  readingType?: string
}

export default function ResultTestimonials({ title, testimonials }: {
  title: string
  testimonials: readonly ResultTestimonial[]
}) {
  if (testimonials.length === 0) return null

  return (
    <section className="result-preview__section" aria-labelledby="result-testimonials-title">
      <h2 id="result-testimonials-title">{title}</h2>
      {testimonials.map(({ id, quote, attribution, rating, readingType }) => (
        <figure className="result-preview__testimonial" key={id}>
          <blockquote>{quote}</blockquote>
          {(attribution || readingType || rating !== undefined) && <figcaption>
            {[attribution, readingType, rating !== undefined ? `${rating}/5` : undefined].filter(Boolean).join(' · ')}
          </figcaption>}
        </figure>
      ))}
    </section>
  )
}
