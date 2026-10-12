import luneImage from '../../assets/images/lune.png'
import type { Messages } from '../../i18n'

type Props = { name: string; messages: Messages }

export default function ResultHero({ name, messages: t }: Props) {
  const trimmedName = name.trim()
  const copy = trimmedName
    ? t.reading.heroNamed.replaceAll('{name}', trimmedName)
    : t.reading.heroGeneral
  return <section className="result-hero">
    <div className="result-hero__content">
      <img src={luneImage} alt="" />
      <p className="result-hero__brand">{t.reading.heroBrand} <span aria-hidden="true">✦</span></p>
      <h1>{copy.split('\n').map((line, index) => <span key={index}>{line}</span>)}</h1>
      <div className="result-hero__thread" aria-hidden="true" />
    </div>
  </section>
}
