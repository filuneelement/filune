import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react'
import type { createBasicChartViewModel } from './lib/basicChartViewModel'
import type { GreatLuckGender, GreatLuckResult } from './lib/calculateGreatLuck'
import type { FourPillars, ThreePillars } from './lib/calculateEightChar'
import luneImage from './assets/images/lune.png'
import type { Birthplace } from './lib/timeCorrection'
import {
  getDefaultCountryForLocale,
  getSavedCountry,
  getSavedCountrySelectionSource,
  getSavedLocale,
  messages,
  resolveCountryForLocale,
  type CountryCode,
  type CountrySelectionSource,
  type Locale,
} from './i18n'

type PillarResult = FourPillars | ThreePillars
type ChartViewModel = ReturnType<typeof createBasicChartViewModel>

const BasicChartResult = lazy(() => import('./components/BasicChartResult'))

type ResultRouteData = {
  pillars: PillarResult
  name: string
  gender: string
  year: string
  month: string
  day: string
  hour: string
  minute: string
  timeUnknown: boolean
  birthplace?: Birthplace
  timeCorrectionEnabled: boolean
}

type ResultHistoryState = {
  filuneResult?: ResultRouteData
}

function readResultHistoryState(): ResultRouteData | null {
  const result = (window.history.state as ResultHistoryState | null)?.filuneResult
  return result && result.pillars && typeof result.year === 'string'
    ? { ...result, name: result.name ?? '', gender: result.gender ?? '' }
    : null
}

function App() {
  const [initialResult] = useState(() => window.location.pathname === '/result' ? readResultHistoryState() : null)
  const [locale, setLocale] = useState<Locale>(getSavedLocale)
  const [countrySelectionSource, setCountrySelectionSource] = useState<CountrySelectionSource>(getSavedCountrySelectionSource)
  const [countryCode, setCountryCode] = useState<CountryCode>(() => {
    const savedCountry = getSavedCountry(getDefaultCountryForLocale(locale))
    const resultCountry = initialResult?.birthplace?.countryCode
    return resultCountry === 'JP' || resultCountry === 'KR' || resultCountry === 'US'
      ? resultCountry
      : countrySelectionSource === 'manual' ? savedCountry : getDefaultCountryForLocale(locale)
  })
  const t = messages[locale]
  const [isResultPage, setIsResultPage] = useState(() => initialResult !== null)
  const [name, setName] = useState(initialResult?.name ?? '')
  const [gender, setGender] = useState(initialResult?.gender ?? '')
  const [year, setYear] = useState(initialResult?.year ?? '')
  const [month, setMonth] = useState(initialResult?.month ?? '')
  const [day, setDay] = useState(initialResult?.day ?? '')
  const [hour, setHour] = useState(initialResult?.hour ?? '')
  const [minute, setMinute] = useState(initialResult?.minute ?? '')
  const [timeUnknown, setTimeUnknown] = useState(initialResult?.timeUnknown ?? false)
  const [birthplace, setBirthplace] = useState(initialResult?.birthplace)
  const [birthplaceQuery, setBirthplaceQuery] = useState(initialResult?.birthplace?.displayName ?? '')
  const [birthplaceOptionsOpen, setBirthplaceOptionsOpen] = useState(false)
  const [birthplaceMatches, setBirthplaceMatches] = useState<Birthplace[]>([])
  const [timeCorrectionEnabled, setTimeCorrectionEnabled] = useState(initialResult?.timeCorrectionEnabled ?? true)
  const [pillars, setPillars] = useState<PillarResult | null>(initialResult?.pillars ?? null)
  const [chart, setChart] = useState<ChartViewModel | null>(null)
  const [greatLuck, setGreatLuck] = useState<GreatLuckResult | null>(null)
  const [fullAge, setFullAge] = useState<number | null>(null)
  const [error, setError] = useState('')
  const selectedGender: GreatLuckGender | null = gender === '女性' || gender === '男性' ? gender : null
  const greatLuckAmbiguous = pillars?.timeKnown === false && pillars.solarTermAmbiguous
  const greatLuckMessage = greatLuckAmbiguous
    ? t.ambiguousLuck
    : selectedGender
      ? undefined
      : t.genderRequired

  useEffect(() => { localStorage.setItem('filune:locale', locale) }, [locale])
  useEffect(() => { localStorage.setItem('filune:birthCountry', countryCode) }, [countryCode])
  useEffect(() => {
    localStorage.setItem('filune:birthCountrySource', countrySelectionSource)
    if (countrySelectionSource === 'manual' || isResultPage) return

    const nextCountry = resolveCountryForLocale(locale, countryCode, countrySelectionSource)
    if (nextCountry === countryCode) return
    setCountryCode(nextCountry)
    setBirthplace(undefined)
    setBirthplaceQuery('')
    setBirthplaceMatches([])
    setBirthplaceOptionsOpen(false)
  }, [locale, countryCode, countrySelectionSource, isResultPage])
  useEffect(() => {
    let active = true
    if (!pillars) {
      setChart(null)
      return () => { active = false }
    }
    import('./lib/basicChartViewModel').then(({ createBasicChartViewModel }) => {
      if (active) setChart(createBasicChartViewModel(pillars))
    })
    return () => { active = false }
  }, [pillars])

  useEffect(() => {
    let active = true
    if (!isResultPage) {
      setFullAge(null)
      return () => { active = false }
    }
    import('./lib/calculateFullAge').then(({ calculateFullAge }) => {
      if (active) setFullAge(calculateFullAge(Number(year), Number(month), Number(day)))
    })
    return () => { active = false }
  }, [isResultPage, year, month, day])

  useEffect(() => {
    let active = true
    if (!isResultPage || !pillars || !chart || !selectedGender || greatLuckAmbiguous) {
      setGreatLuck(null)
      return () => { active = false }
    }
    import('./lib/calculateGreatLuck').then(({ calculateGreatLuck }) => {
      if (!active) return
      setGreatLuck(calculateGreatLuck({
        yearPillar: pillars.year,
        monthPillar: pillars.month,
        dayStem: pillars.dayRelationships.dayStem,
        gender: selectedGender,
        timeUnknown: pillars.timeKnown === false,
        birthDateTime: pillars.timeKnown === false ? undefined : {
          year: Number(year),
          month: Number(month),
          day: Number(day),
          hour: Number(hour),
          minute: Number(minute),
        },
      }))
    })
    return () => { active = false }
  }, [isResultPage, pillars, chart, selectedGender, greatLuckAmbiguous, year, month, day, hour, minute])

  useEffect(() => {
    function restoreHistoryPage() {
      const result = readResultHistoryState()
      const shouldShowResult = window.location.pathname === '/result' && result !== null
      setIsResultPage(shouldShowResult)

      if (result) {
        setName(result.name)
        setGender(result.gender)
        setYear(result.year)
        setMonth(result.month)
        setDay(result.day)
        setHour(result.hour)
        setMinute(result.minute)
        setTimeUnknown(result.timeUnknown)
        setBirthplace(result.birthplace)
        setBirthplaceQuery(result.birthplace?.displayName ?? '')
        setBirthplaceOptionsOpen(false)
        setTimeCorrectionEnabled(result.timeCorrectionEnabled ?? true)
        setPillars(result.pillars)
      }
    }

    if (window.location.pathname === '/result' && !initialResult) {
      window.history.replaceState(null, '', '/')
    }

    window.addEventListener('popstate', restoreHistoryPage)
    return () => window.removeEventListener('popstate', restoreHistoryPage)
  }, [initialResult])

  useEffect(() => {
    if (!birthplaceOptionsOpen || !birthplaceQuery.trim()) {
      setBirthplaceMatches([])
      return
    }

    let active = true
    const search = countryCode === 'JP'
      ? import('./lib/japanMunicipalitySearch').then(({ searchJapanMunicipalities }) => searchJapanMunicipalities(birthplaceQuery, 10))
      : countryCode === 'KR'
        ? import('./lib/koreaLocationSearch').then(({ searchKoreaLocations }) => searchKoreaLocations(birthplaceQuery, 10))
        : import('./lib/usCitySearch').then(({ searchUSCities }) => searchUSCities(birthplaceQuery, 10))
    search.then((matches) => { if (active) setBirthplaceMatches(matches) })

    return () => {
      active = false
    }
  }, [birthplaceOptionsOpen, birthplaceQuery, countryCode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPillars(null)

    if (!/^\d{4}$/.test(year) || Number(year) < 1) {
      setError(t.errors.year)
      return
    }
    if (!/^\d{1,2}$/.test(month) || Number(month) < 1 || Number(month) > 12) {
      setError(t.errors.month)
      return
    }
    if (!/^\d{1,2}$/.test(day)) {
      setError(t.errors.day)
      return
    }

    const numericYear = Number(year)
    const numericMonth = Number(month)
    const numericDay = Number(day)
    const isLeapYear = numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0)
    const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][numericMonth - 1]
    if (numericDay < 1 || numericDay > daysInMonth) {
      setError(t.errors.date)
      return
    }
    if (!timeUnknown) {
      if (!/^\d{1,2}$/.test(hour) || Number(hour) < 0 || Number(hour) > 23) {
        setError(t.errors.hour)
        return
      }
      if (!/^\d{1,2}$/.test(minute) || Number(minute) < 0 || Number(minute) > 59) {
        setError(t.errors.minute)
        return
      }
    }

    try {
      const { calculateEightChar, calculateEightCharWithoutBirthTime } = await import('./lib/calculateEightChar')
      const calculatedPillars = timeUnknown
        ? calculateEightCharWithoutBirthTime({ year: numericYear, month: numericMonth, day: numericDay })
        : calculateEightChar({
            year: numericYear,
            month: numericMonth,
            day: numericDay,
            hour: Number(hour),
            minute: Number(minute),
          }, {
            mode: timeCorrectionEnabled && birthplace ? 'longitude' : 'none',
            birthplace,
          })
      const routeData: ResultRouteData = {
        pillars: calculatedPillars,
        name,
        gender,
        year,
        month,
        day,
        hour,
        minute,
        timeUnknown,
        birthplace,
        timeCorrectionEnabled,
      }
      window.history.pushState({ filuneResult: routeData } satisfies ResultHistoryState, '', '/result')
      setPillars(calculatedPillars)
      setIsResultPage(true)
      setError('')
    } catch {
      setError(t.errors.calculate)
    }
  }

  return (
    <main>
      {!isResultPage && <div className="page-topbar">
        <div className="page-topbar__brand">
          <img className="entry-screen__guide page-topbar__guide" src={luneImage} alt="" />
          <div className="page-topbar__title">FILUNE {t.entryTitle}</div>
        </div>
        <div className="language-picker">
          <label htmlFor="ui-language">Language</label>
          <select id="ui-language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
            <option value="ja">日本語</option><option value="ko">한국어</option><option value="en">English</option>
          </select>
        </div>
      </div>}
      {!isResultPage && <div className="entry-screen">
        <form className="entry-form" noValidate onSubmit={handleSubmit}>
          <section className="entry-form__section entry-form__profile" aria-label={`${t.name} / ${t.gender}`}>
            <div className="entry-form__profile-fields">
              <label className="entry-form__name-field">
                {t.name}
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={40}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <div className="entry-form__gender" role="group" aria-labelledby="gender-title">
                <span id="gender-title">{t.gender}</span>
                <label>
                  <input type="radio" name="gender" value="女性" checked={gender === '女性'} onChange={() => setGender('女性')} />
                  <span>{t.female}</span>
                </label>
                <label>
                  <input type="radio" name="gender" value="男性" checked={gender === '男性'} onChange={() => setGender('男性')} />
                  <span>{t.male}</span>
                </label>
              </div>
            </div>
          </section>
          <section className="entry-form__section entry-form__birth-datetime" aria-labelledby="birth-datetime-title">
            <h2 id="birth-datetime-title">{t.birthDateTime}</h2>
            <div className="entry-form__fields">
              <label>
                <input
                  className="entry-form__year"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={t.year}
                  placeholder="2000"
                  maxLength={4}
                  value={year}
                  onChange={(event) => setYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <span>{t.year}</span>
              </label>
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={t.month}
                  placeholder="01"
                  maxLength={2}
                  value={month}
                  onChange={(event) => setMonth(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>{t.month}</span>
              </label>
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={t.day}
                  placeholder="01"
                  maxLength={2}
                  value={day}
                  onChange={(event) => setDay(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>{t.day}</span>
              </label>
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={t.hour}
                  placeholder="12"
                  maxLength={2}
                  value={hour}
                  disabled={timeUnknown}
                  onChange={(event) => setHour(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>{t.hour}</span>
              </label>
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={t.minute}
                  placeholder="00"
                  maxLength={2}
                  value={minute}
                  disabled={timeUnknown}
                  onChange={(event) => setMinute(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>{t.minute}</span>
              </label>
            </div>
            <label className="entry-form__unknown-time">
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(event) => {
                  const checked = event.target.checked
                  setTimeUnknown(checked)
                  if (checked && (error === t.errors.hour || error === t.errors.minute)) setError('')
                }}
              />
              <span>{t.unknownTime}</span>
            </label>
          </section>
          <section className="entry-form__section entry-form__birthplace" aria-label={t.country}>
            <label className="entry-form__name-field entry-form__birthplace-field" htmlFor="birth-country">{t.country}</label>
            <select id="birth-country" className="entry-form__birthplace-input" value={countryCode} onChange={(event) => {
              const value = event.target.value as CountryCode
              setCountrySelectionSource('manual')
              setCountryCode(value)
              setBirthplace(undefined)
              setBirthplaceQuery('')
              setBirthplaceMatches([])
              setBirthplaceOptionsOpen(false)
            }}>
              <option value="JP">{t.countryNames.JP}</option><option value="KR">{t.countryNames.KR}</option><option value="US">{t.countryNames.US}</option>
            </select>
            <div className="entry-form__birthplace-picker">
              <label className="entry-form__name-field entry-form__birthplace-field" htmlFor="birthplace-search">
                {t.searchLocation}
              </label>
              <input
                id="birthplace-search"
                className="entry-form__birthplace-input"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={birthplaceOptionsOpen && birthplaceQuery.trim().length > 0}
                aria-controls="birthplace-options"
                aria-label={t.locationAria}
                autoComplete="off"
                value={birthplaceQuery}
                onFocus={() => setBirthplaceOptionsOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setBirthplaceOptionsOpen(false)
                }}
                onChange={(event) => {
                  setBirthplaceQuery(event.target.value)
                  setBirthplace(undefined)
                  setBirthplaceOptionsOpen(true)
                }}
                placeholder={t.locationPlaceholder[countryCode]}
              />
              {birthplaceOptionsOpen && birthplaceQuery.trim() && (
                <div id="birthplace-options" className="entry-form__birthplace-options" role="listbox" aria-label={t.candidates}>
                  {birthplaceMatches.length > 0
                    ? birthplaceMatches.map((place) => (
                      <button
                        className="entry-form__birthplace-option"
                        key={place.code}
                        type="button"
                        role="option"
                        aria-selected={place.code === birthplace?.code}
                        onClick={() => {
                          setBirthplace(place)
                          setBirthplaceQuery(place.displayName)
                          setBirthplaceOptionsOpen(false)
                        }}
                      >
                        {place.displayName}
                      </button>
                    ))
                    : <p className="entry-form__birthplace-empty">{t.noCandidates}</p>}
                </div>
              )}
              {birthplace && <p className="entry-form__birthplace-selected">{t.selectedLocation}: {birthplace.displayName}</p>}
            </div>
            <label className="entry-form__unknown-time">
              <input
                type="checkbox"
                checked={timeCorrectionEnabled}
                onChange={(event) => setTimeCorrectionEnabled(event.target.checked)}
              />
              <span>{t.useCorrection}</span>
            </label>
          </section>
          <button className="entry-form__submit" type="submit">{t.submit}</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>}

      {isResultPage && pillars && chart && fullAge !== null && (
        <Suspense fallback={null}>
          <BasicChartResult
            chart={chart}
            messages={t}
            locale={locale}
            profileSummary={`${name.trim() ? `${name.trim()}${locale === 'en' ? ' (' : '（'}` : ''}${fullAge}${t.yearsSuffix}${gender ? `${t.ageSeparator}${gender === '女性' ? t.female : t.male}` : ''}${name.trim() ? (locale === 'en' ? ')' : '）') : ''}`}
            birthDateTime={`${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}${pillars.timeKnown === false ? `　${t.birthTimeUnknown}` : ` ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}`}
            timeCorrectionSummary={pillars.timeKnown !== false && pillars.timeCorrection && birthplace
              ? `${t.correctionOriginal} ${pillars.timeCorrection.originalTime}　${t.correction} ${pillars.timeCorrection.correctionMinutes > 0 ? '+' : ''}${pillars.timeCorrection.correctionMinutes}${t.minuteUnit}　${t.calculationTime} ${pillars.timeCorrection.calculationTime}`
              : undefined}
            showSolarTermAmbiguity={pillars.timeKnown === false ? pillars.solarTermAmbiguous : false}
            onBack={() => window.history.back()}
            greatLuck={greatLuck}
            greatLuckMessage={greatLuckMessage}
          />
        </Suspense>
      )}
    </main>
  )
}

export default App
