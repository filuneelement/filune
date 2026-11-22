import { useEffect, useState, type FormEvent } from 'react'
import type { BirthInput } from '../../lib/canonical/types'
import type { GreatLuckGender } from '../../lib/calculateGreatLuck'
import type { Birthplace } from '../../lib/timeCorrection'
import { getDefaultCountryForLocale, type CountryCode, type Locale, type Messages } from '../../i18n'

export type CompatibilityPersonInputValue = { readonly name?: string; readonly birth: BirthInput }

type ParticipantDraft = {
  name: string
  date: { year: string; month: string; day: string }
  time: string
  timeUnknown: boolean
  gender: GreatLuckGender | ''
  countryCode: CountryCode
  birthplace?: Birthplace
  birthplaceQuery: string
  birthplaceOptionsOpen: boolean
  timeCorrectionEnabled: boolean
}

type CompatibilityInputProps = {
  locale: Locale
  messages: Messages
  disabled: boolean
  error?: string
  initialPeople?: readonly [CompatibilityPersonInputValue, CompatibilityPersonInputValue]
  initialRelationshipStatus?: 'single' | 'dating' | 'partnered' | 'married'
  onSubmit: (first: CompatibilityPersonInputValue, second: CompatibilityPersonInputValue,
    relationshipStatus?: 'single' | 'dating' | 'partnered' | 'married') => void
  onBack: () => void
}

function draftFrom(person: CompatibilityPersonInputValue | undefined, locale: Locale): ParticipantDraft {
  const birth = person?.birth
  return {
    name: person?.name ?? '',
    date: birth ? {
      year: String(birth.date.year).padStart(4, '0'),
      month: String(birth.date.month).padStart(2, '0'),
      day: String(birth.date.day).padStart(2, '0'),
    } : { year: '', month: '', day: '' },
    time: birth?.time.known ? `${String(birth.time.value.hour).padStart(2, '0')}:${String(birth.time.value.minute).padStart(2, '0')}` : '',
    timeUnknown: birth ? !birth.time.known : false,
    gender: birth?.gender ?? '',
    countryCode: birth?.birthplace?.countryCode === 'JP' || birth?.birthplace?.countryCode === 'KR'
      || birth?.birthplace?.countryCode === 'US' ? birth.birthplace.countryCode : getDefaultCountryForLocale(locale),
    birthplace: birth?.birthplace,
    birthplaceQuery: birth?.birthplace?.displayName ?? '',
    birthplaceOptionsOpen: false,
    timeCorrectionEnabled: birth?.timeCorrectionMode !== 'none',
  }
}

function validDate({ year: yearInput, month: monthInput, day: dayInput }: ParticipantDraft['date']): {
  year: number; month: number; day: number
} | undefined {
  if (!monthInput || !dayInput) return undefined
  const value = `${yearInput}-${monthInput.padStart(2, '0')}-${dayInput.padStart(2, '0')}`
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined
  const [, yearText, monthText, dayText] = match
  const year = Number(yearText), month = Number(monthText), day = Number(dayText)
  if (year < 1) return undefined
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? { year, month, day } : undefined
}

function makePerson(draft: ParticipantDraft, date: { year: number; month: number; day: number }): CompatibilityPersonInputValue {
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(draft.time)
  const birth: BirthInput = {
    date,
    time: draft.timeUnknown
      ? { known: false }
      : { known: true, value: { hour: Number(timeMatch?.[1]), minute: Number(timeMatch?.[2]) } },
    ...(draft.gender && { gender: draft.gender }),
    ...(draft.birthplace && { birthplace: draft.birthplace }),
    timeCorrectionMode: draft.timeCorrectionEnabled && draft.birthplace ? 'longitude' : 'none',
  }
  const name = draft.name.trim()
  return { ...(name && { name }), birth }
}

function ParticipantFields({ label, idSuffix, value, t, onChange }: {
  label: string; idSuffix: 'first' | 'second'; value: ParticipantDraft; t: Messages
  onChange: (value: ParticipantDraft) => void
}) {
  const [matches, setMatches] = useState<Birthplace[]>([])
  useEffect(() => {
    const query = value.birthplaceQuery.trim()
    if (!value.birthplaceOptionsOpen || !query) { setMatches([]); return }
    let active = true
    const search = value.countryCode === 'JP'
      ? import('../../lib/japanMunicipalitySearch').then(({ searchJapanMunicipalities }) => searchJapanMunicipalities(query, 10))
      : value.countryCode === 'KR'
        ? import('../../lib/koreaLocationSearch').then(({ searchKoreaLocations }) => searchKoreaLocations(query, 10))
        : import('../../lib/usCitySearch').then(({ searchUSCities }) => searchUSCities(query, 10))
    search.then(found => { if (active) setMatches(found) }).catch(() => { if (active) setMatches([]) })
    return () => { active = false }
  }, [value.birthplaceOptionsOpen, value.birthplaceQuery, value.countryCode])

  const patch = (partial: Partial<ParticipantDraft>) => onChange({ ...value, ...partial })
  const locationInputId = `compatibility-location-${idSuffix}`
  const locationOptionsId = `compatibility-options-${idSuffix}`
  return <fieldset className="compatibility-person">
    <legend>{label}</legend>
    <label className="compatibility-field">
      <span>{t.compatibility.optionalName}</span>
      <input type="text" autoComplete="name" maxLength={40} value={value.name}
        onChange={event => patch({ name: event.target.value })} />
    </label>
    <div className="compatibility-field" role="group" aria-labelledby={`compatibility-date-${idSuffix}`}>
      <span id={`compatibility-date-${idSuffix}`}>{t.birthDate}</span>
      <div className="compatibility-date">
        {(['year', 'month', 'day'] as const).map(part => (
          <label className="compatibility-field" key={part}>
            <span>{t[part]}</span>
            <input type="text" inputMode="numeric" autoComplete="off" required
              maxLength={part === 'year' ? 4 : 2} value={value.date[part]}
              onChange={event => patch({ date: { ...value.date, [part]: event.target.value.replace(/\D/g, '') } })} />
          </label>
        ))}
      </div>
    </div>
    <label className="compatibility-field">
      <span>{t.birthTime}</span>
      <input type="time" step={60} disabled={value.timeUnknown} value={value.time}
        onChange={event => patch({ time: event.target.value })} />
    </label>
    <label className="compatibility-check">
      <input type="checkbox" checked={value.timeUnknown}
        onChange={event => patch({ timeUnknown: event.target.checked })} />
      <span>{t.unknownTime}</span>
    </label>
    <label className="compatibility-field">
      <span>{t.gender}</span>
      <select value={value.gender} onChange={event => patch({ gender: event.target.value as GreatLuckGender | '' })}>
        <option value="">—</option>
        <option value="女性">{t.female}</option>
        <option value="男性">{t.male}</option>
      </select>
    </label>
    <label className="compatibility-field">
      <span>{t.compatibility.country}</span>
      <select value={value.countryCode} onChange={event => patch({ countryCode: event.target.value as CountryCode,
        birthplace: undefined, birthplaceQuery: '', birthplaceOptionsOpen: false })}>
        <option value="JP">{t.countryNames.JP}</option><option value="KR">{t.countryNames.KR}</option>
        <option value="US">{t.countryNames.US}</option>
      </select>
    </label>
    <div className="compatibility-field compatibility-location">
      <label htmlFor={locationInputId}><span>{t.searchLocation}</span></label>
      <input id={locationInputId} type="search" role="combobox" aria-autocomplete="list"
        aria-expanded={value.birthplaceOptionsOpen && Boolean(value.birthplaceQuery.trim())}
        aria-controls={value.birthplaceOptionsOpen && value.birthplaceQuery.trim() ? locationOptionsId : undefined}
        autoComplete="off"
        placeholder={t.locationPlaceholder[value.countryCode]} value={value.birthplaceQuery}
        onFocus={() => patch({ birthplaceOptionsOpen: true })}
        onChange={event => patch({ birthplaceQuery: event.target.value, birthplace: undefined, birthplaceOptionsOpen: true })}
        onKeyDown={event => { if (event.key === 'Escape') patch({ birthplaceOptionsOpen: false }) }} />
      {value.birthplaceOptionsOpen && value.birthplaceQuery.trim() && <div id={locationOptionsId}
        className="compatibility-location__options" role="listbox" aria-label={t.candidates}>
        {matches.length ? matches.map(place => <button key={place.code} type="button" role="option"
          aria-selected={place.code === value.birthplace?.code}
          onClick={() => patch({ birthplace: place, birthplaceQuery: place.displayName, birthplaceOptionsOpen: false })}>
          {place.displayName}
        </button>) : <p>{t.noCandidates}</p>}
      </div>}
      {value.birthplace && <p className="compatibility-location__selected">{t.selectedLocation}: {value.birthplace.displayName}</p>}
    </div>
    <label className="compatibility-check">
      <input type="checkbox" checked={value.timeCorrectionEnabled}
        onChange={event => patch({ timeCorrectionEnabled: event.target.checked })} />
      <span>{t.compatibility.timeCorrection}</span>
    </label>
  </fieldset>
}

export default function CompatibilityInput({ locale, messages: t, disabled, error, initialPeople, initialRelationshipStatus,
  onSubmit, onBack }: CompatibilityInputProps) {
  const [first, setFirst] = useState(() => draftFrom(initialPeople?.[0], locale))
  const [second, setSecond] = useState(() => draftFrom(initialPeople?.[1], locale))
  const [relationshipStatus, setRelationshipStatus] = useState<'' | 'single' | 'dating' | 'partnered' | 'married'>(initialRelationshipStatus ?? '')
  const [validationError, setValidationError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError('')
    const firstDate = validDate(first.date), secondDate = validDate(second.date)
    if (!firstDate || !secondDate) { setValidationError(t.compatibility.invalidDate); return }
    if ((!first.timeUnknown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(first.time))
      || (!second.timeUnknown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(second.time))) {
      setValidationError(t.compatibility.invalidTime); return
    }
    onSubmit(makePerson(first, firstDate), makePerson(second, secondDate), relationshipStatus || undefined)
  }

  return <section className="compatibility-flow">
    <header className="compatibility-flow__header">
      <button type="button" className="compatibility-flow__back" onClick={onBack}>{t.flow.back}</button>
      <h1>{t.compatibility.title}</h1><p>{t.compatibility.description}</p>
    </header>
    <form className="compatibility-form" noValidate onSubmit={submit}>
      <div className="compatibility-form__people">
        <ParticipantFields label={t.compatibility.personA} idSuffix="first" value={first} t={t} onChange={setFirst} />
        <ParticipantFields label={t.compatibility.personB} idSuffix="second" value={second} t={t} onChange={setSecond} />
      </div>
      <div className="compatibility-form__actions">
        <label className="compatibility-field">
          <span>{t.compatibility.relationshipStatus}</span>
          <select value={relationshipStatus} onChange={event => setRelationshipStatus(event.target.value as typeof relationshipStatus)}>
            <option value="">{t.compatibility.noRelationshipStatus}</option>
            <option value="single">{t.compatibility.single}</option>
            <option value="dating">{t.compatibility.dating}</option>
            <option value="partnered">{t.compatibility.partnered}</option>
            <option value="married">{t.compatibility.married}</option>
          </select>
        </label>
        {(validationError || error) && <p className="compatibility-form__error" role="alert">{validationError || error}</p>}
        <button type="submit" className="compatibility-form__submit" disabled={disabled}>
          {disabled ? t.compatibility.calculating : t.compatibility.calculate}
        </button>
      </div>
    </form>
  </section>
}
