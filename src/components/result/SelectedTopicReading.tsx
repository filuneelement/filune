import type { Messages } from '../../i18n'
import luneImage from '../../assets/images/lune.png'

export type SelectedTopicReadingData = {
  topic: string
  /** Personal reading text is optional until authored data is available. */
  reading?: string
}

type SelectedTopicReadingProps = {
  data: SelectedTopicReadingData
  messages: Messages
}

export default function SelectedTopicReading({ data, messages: t }: SelectedTopicReadingProps) {
  return (
    <section className="selected-topic-reading">
      <img src={luneImage} alt="" />
      <div>
        <h2>{t.reading.selectedTopicLead}</h2>
        <p className="topic-name">{data.topic}</p>
        {data.reading ? <p>{data.reading}</p> : <p>{t.reading.previewUnavailable}</p>}
      </div>
    </section>
  )
}
