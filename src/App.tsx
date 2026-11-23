import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { GreatLuckGender } from './lib/calculateGreatLuck'
import type { FourPillars, ThreePillars } from './lib/calculateEightChar'
import LuneVisual from './components/LuneVisual'
import type { ReadingAssembly } from './lib/reading'
import type { Birthplace } from './lib/timeCorrection'
import type { BirthInput } from './lib/canonical/types'
import type { CompatibilityRouteHistoryData, CompatibilityPersonInput, CompatibilityCustomerResult } from './lib/product/prepareCompatibilityProductResult'
import {
  getDefaultCountryForLocale,
  getSavedCountry,
  getSavedCountrySelectionSource,
  getSavedLocale,
  messages,
  personalTopics,
  resolveCountryForLocale,
  type CountryCode,
  type CountrySelectionSource,
  type Locale,
} from './i18n'

type PillarResult = FourPillars | ThreePillars

const BasicChartResult = lazy(() => import('./components/BasicChartResult'))
const CompatibilityInput = lazy(() => import('./components/compatibility/CompatibilityInput'))
const CompatibilityResult = lazy(() => import('./components/compatibility/CompatibilityResult'))

type ResultRouteData = {
  pillars: PillarResult
  reading?: ReadingAssembly
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
  interestTopic?: string
  relationshipStatus?: string
  careerStatus?: string
}

type ResultHistoryState = {
  filuneResult?: ResultRouteData
  filuneCompatibilityResult?: CompatibilityRouteHistoryData
  filuneCompatibilityInput?: { version: 1; kind: 'compatibility-input' }
  filuneCompatibilityIntro?: true
}

type WizardStep = number | 'permission' | 'compatibility-intro' | 'compatibility'

function isCompatibilityIntroPage() {
  return window.location.pathname === '/'
    && (window.history.state as ResultHistoryState | null)?.filuneCompatibilityIntro === true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBirthInput(value: unknown): value is BirthInput {
  if (!isRecord(value) || !isRecord(value.date) || !isRecord(value.time)) return false
  const { year, month, day } = value.date
  if (![year, month, day].every(item => typeof item === 'number' && Number.isInteger(item))) return false
  const calendar = new Date(0)
  calendar.setUTCHours(0, 0, 0, 0)
  calendar.setUTCFullYear(year as number, (month as number) - 1, day as number)
  if ((year as number) < 1 || calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== (month as number) - 1
    || calendar.getUTCDate() !== day) return false
  const timeValid = value.time.known === false || (value.time.known === true && isRecord(value.time.value)
    && Number.isInteger(value.time.value.hour) && Number(value.time.value.hour) >= 0 && Number(value.time.value.hour) <= 23
    && Number.isInteger(value.time.value.minute) && Number(value.time.value.minute) >= 0 && Number(value.time.value.minute) <= 59)
  if (!timeValid || !['none', 'longitude', 'trueSolarTime'].includes(String(value.timeCorrectionMode))) return false
  if (value.gender !== undefined && value.gender !== '女性' && value.gender !== '男性') return false
  if (value.birthplace === undefined) return true
  return isRecord(value.birthplace) && typeof value.birthplace.code === 'string'
    && typeof value.birthplace.countryCode === 'string' && typeof value.birthplace.region === 'string'
    && typeof value.birthplace.city === 'string' && typeof value.birthplace.displayName === 'string'
    && typeof value.birthplace.timezone === 'string' && typeof value.birthplace.latitude === 'number'
    && typeof value.birthplace.longitude === 'number'
}

function isCustomerResult(value: unknown): value is CompatibilityCustomerResult {
  if (!isRecord(value) || !Array.isArray(value.sections) || !Array.isArray(value.timeline)) return false
  const statementsValid = (items: unknown) => Array.isArray(items) && items.every(statement => isRecord(statement)
    && typeof statement.text === 'string' && Array.isArray(statement.provenanceRefs)
    && (statement.periods === undefined || Array.isArray(statement.periods) && statement.periods.every(period =>
      isRecord(period) && (period.intervalLabel === undefined || typeof period.intervalLabel === 'string'))))
  return (value.headline === undefined || typeof value.headline === 'string')
    && value.sections.every(section => isRecord(section) && typeof section.key === 'string'
      && typeof section.heading === 'string' && statementsValid(section.statements))
    && value.timeline.every(window => isRecord(window) && typeof window.temporal === 'string'
      && typeof window.heading === 'string' && Array.isArray(window.provenanceRefs) && statementsValid(window.statements))
}

function isCompatibilityRouteData(value: unknown): value is CompatibilityRouteHistoryData {
  if (!isRecord(value) || value.version !== 1 || value.kind !== 'compatibility'
    || !['ja', 'ko', 'en'].includes(String(value.locale)) || typeof value.referenceTime !== 'string'
    || !Number.isFinite(Date.parse(value.referenceTime)) || !isRecord(value.first) || !isRecord(value.second)
    || !isBirthInput(value.first.birth) || !isBirthInput(value.second.birth) || !isCustomerResult(value.customerResult)) return false
  const statuses = ['single', 'dating', 'partnered', 'married']
  return (value.first.name === undefined || typeof value.first.name === 'string')
    && (value.second.name === undefined || typeof value.second.name === 'string')
    && (value.relationshipStatus === undefined || statuses.includes(String(value.relationshipStatus)))
}

function readCompatibilityRouteData(): CompatibilityRouteHistoryData | null {
  const state = window.history.state as ResultHistoryState | null
  const value = state?.filuneCompatibilityResult
  return isCompatibilityRouteData(value) ? value : null
}

const relationshipStatuses = ['single', 'dating', 'married'] as const
const careerStatuses = ['job_seeking', 'employed', 'business'] as const

function restoreCareerStatus(value?: string) {
  if (value === 'job-seeking') return 'job_seeking'
  if (value === 'business-owner') return 'business'
  return value ?? ''
}

function needsTopicStatus(topic?: string) {
  return topic === 'love' || topic === 'work'
}

function readResultHistoryState(): ResultRouteData | null {
  const result = (window.history.state as ResultHistoryState | null)?.filuneResult
  return result && result.pillars && typeof result.year === 'string'
    ? { ...result, name: result.name ?? '', gender: result.gender ?? '' }
    : null
}

function App() {
  const [initialResult] = useState(() => window.location.pathname === '/result' ? readResultHistoryState() : null)
  const [initialCompatibilityResult] = useState(() => window.location.pathname === '/compatibility/result' ? readCompatibilityRouteData() : null)
  const [locale, setLocale] = useState<Locale>(() => initialCompatibilityResult?.locale ?? getSavedLocale())
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
  const [isCompatibilityResultPage, setIsCompatibilityResultPage] = useState(() => initialCompatibilityResult !== null)
  const [compatibilityRouteData, setCompatibilityRouteData] = useState<CompatibilityRouteHistoryData | null>(initialCompatibilityResult)
  const [compatibilityInputMounted, setCompatibilityInputMounted] = useState(() =>
    window.location.pathname === '/compatibility' || window.location.pathname === '/compatibility/result'
    || isCompatibilityIntroPage())
  const [compatibilityStatus, setCompatibilityStatus] = useState<'idle' | 'calculating' | 'success' | 'error'>(() =>
    initialCompatibilityResult ? 'success' : 'idle')
  const [compatibilityError, setCompatibilityError] = useState('')
  const compatibilitySubmitLock = useRef(false)
  const compatibilityOriginRef = useRef(window.location.pathname === '/compatibility'
    || window.location.pathname === '/compatibility/result' || isCompatibilityIntroPage())
  const compatibilityReturnStepRef = useRef<WizardStep>(1)
  const [wizardStep, setWizardStep] = useState<WizardStep>(() => {
    if (window.location.pathname === '/compatibility' || initialCompatibilityResult) return 'compatibility'
    return isCompatibilityIntroPage() ? 'compatibility-intro' : 1
  })
  const isCompatibilityIntro = wizardStep === 'compatibility-intro'
  const isOnboarding = wizardStep === 'permission' || isCompatibilityIntro
  const [interestTopic, setInterestTopic] = useState(initialResult?.interestTopic ?? '')
  const [relationshipStatus, setRelationshipStatus] = useState(initialResult?.relationshipStatus ?? '')
  const [careerStatus, setCareerStatus] = useState(restoreCareerStatus(initialResult?.careerStatus))
  const personalResultReturnStep = useRef<4 | 5 | null>(
    initialResult ? (needsTopicStatus(initialResult.interestTopic) ? 5 : 4) : null,
  )
  const isRelationshipTopic = interestTopic === 'love'
  const topicStatus = isRelationshipTopic ? relationshipStatus : careerStatus
  const topicStatusOptions = isRelationshipTopic ? relationshipStatuses : careerStatuses
  const hasTopicStatus = topicStatusOptions.some(value => value === topicStatus)
  const [isTransitioning, setIsTransitioning] = useState(false)
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
  const [fullAge, setFullAge] = useState<number | null>(null)
  const [error, setError] = useState('')
  const selectedGender: GreatLuckGender | null = gender === '女性' || gender === '男性' ? gender : null
  const birth = useMemo<BirthInput>(() => ({
    date: { year: Number(year), month: Number(month), day: Number(day) },
    time: timeUnknown ? { known: false } : { known: true, value: { hour: Number(hour), minute: Number(minute) } },
    gender: selectedGender ?? undefined,
    birthplace,
    timeCorrectionMode: timeCorrectionEnabled && birthplace ? 'longitude' : 'none',
  }), [year, month, day, timeUnknown, hour, minute, selectedGender, birthplace, timeCorrectionEnabled])

  useEffect(() => { localStorage.setItem('filune:locale', locale) }, [locale])
  useEffect(() => { localStorage.setItem('filune:birthCountry', countryCode) }, [countryCode])
  useEffect(() => {
    localStorage.setItem('filune:birthCountrySource', countrySelectionSource)
    if (countrySelectionSource === 'manual' || isResultPage || isCompatibilityResultPage) return

    const nextCountry = resolveCountryForLocale(locale, countryCode, countrySelectionSource)
    if (nextCountry === countryCode) return
    setCountryCode(nextCountry)
    setBirthplace(undefined)
    setBirthplaceQuery('')
    setBirthplaceMatches([])
    setBirthplaceOptionsOpen(false)
  }, [locale, countryCode, countrySelectionSource, isResultPage, isCompatibilityResultPage])

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
    function restoreHistoryPage() {
      let path = window.location.pathname
      const result = path === '/result' ? readResultHistoryState() : null
      let compatibilityResult = path === '/compatibility/result' ? readCompatibilityRouteData() : null
      if (path === '/result' && !result || path === '/compatibility/result' && !compatibilityResult) {
        window.history.replaceState(null, '', '/')
        path = '/'
        compatibilityResult = null
      }
      const shouldShowResult = path === '/result' && result !== null
      const shouldShowCompatibilityResult = path === '/compatibility/result' && compatibilityResult !== null
      setIsResultPage(shouldShowResult)
      setIsCompatibilityResultPage(shouldShowCompatibilityResult)
      setCompatibilityRouteData(compatibilityResult)
      setCompatibilityStatus(shouldShowCompatibilityResult ? 'success' : 'idle')
      setCompatibilityError('')
      if (path === '/compatibility' || shouldShowCompatibilityResult) {
        setCompatibilityInputMounted(true)
        setWizardStep('compatibility')
      } else if (isCompatibilityIntroPage()) {
        compatibilityOriginRef.current = true
        setCompatibilityInputMounted(true)
        setWizardStep('compatibility-intro')
      } else if (path === '/') {
        setWizardStep(compatibilityOriginRef.current ? compatibilityReturnStepRef.current : personalResultReturnStep.current ?? 1)
        compatibilityOriginRef.current = false
      }
      if (compatibilityResult) setLocale(compatibilityResult.locale)

      if (result) {
        setInterestTopic(result.interestTopic ?? '')
        setRelationshipStatus(result.relationshipStatus ?? '')
        setCareerStatus(restoreCareerStatus(result.careerStatus))
        personalResultReturnStep.current = needsTopicStatus(result.interestTopic) ? 5 : 4
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
    if (window.location.pathname === '/compatibility/result' && !initialCompatibilityResult) {
      window.history.replaceState(null, '', '/')
    }

    window.addEventListener('popstate', restoreHistoryPage)
    return () => window.removeEventListener('popstate', restoreHistoryPage)
  }, [initialResult, initialCompatibilityResult])

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

  function validateBirth(): boolean {
    if (!/^\d{4}$/.test(year) || Number(year) < 1) {
      setError(t.errors.year)
      return false
    }
    if (!/^\d{1,2}$/.test(month) || Number(month) < 1 || Number(month) > 12) {
      setError(t.errors.month)
      return false
    }
    if (!/^\d{1,2}$/.test(day)) {
      setError(t.errors.day)
      return false
    }

    const numericYear = Number(year)
    const numericMonth = Number(month)
    const numericDay = Number(day)
    const isLeapYear = numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0)
    const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][numericMonth - 1]
    if (numericDay < 1 || numericDay > daysInMonth) {
      setError(t.errors.date)
      return false
    }
    if (!timeUnknown) {
      if (!/^\d{1,2}$/.test(hour) || Number(hour) < 0 || Number(hour) > 23) {
        setError(t.errors.hour)
        return false
      }
      if (!/^\d{1,2}$/.test(minute) || Number(minute) < 0 || Number(minute) > 59) {
        setError(t.errors.minute)
        return false
      }
    }

    return true
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateBirth()) return
    setError('')
    setWizardStep(4)
  }

  async function calculateAndShowResult() {
    setPillars(null)
    if (!validateBirth()) {
      setWizardStep(3)
      setIsTransitioning(false)
      return
    }
    try {
      const { prepareProductResult } = await import('./lib/product/prepareProductResult')
      const result = await prepareProductResult(birth)
      const routeData: ResultRouteData = {
        ...result,
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
        interestTopic,
        ...(isRelationshipTopic && relationshipStatus && { relationshipStatus }),
        ...(interestTopic === 'work' && careerStatus && { careerStatus }),
      }
      personalResultReturnStep.current = needsTopicStatus(interestTopic) ? 5 : 4
      window.history.pushState({ filuneResult: routeData } satisfies ResultHistoryState, '', '/result')
      setPillars(result.pillars)
      setIsResultPage(true)
      setIsTransitioning(false)
      setError('')
    } catch {
      setError(t.errors.calculate)
      setWizardStep(3)
      setIsTransitioning(false)
    }
  }

  function showCompatibilityIntro() {
    compatibilityReturnStepRef.current = wizardStep
    compatibilityOriginRef.current = true
    window.history.pushState({ filuneCompatibilityIntro: true }, '')
    setCompatibilityInputMounted(true)
    setWizardStep('compatibility-intro')
  }

  function beginCompatibility() {
    window.history.pushState({ filuneCompatibilityInput: { version: 1, kind: 'compatibility-input' } }, '', '/compatibility')
    setCompatibilityInputMounted(true)
    setCompatibilityStatus('idle')
    setCompatibilityError('')
    setIsResultPage(false)
    setIsCompatibilityResultPage(false)
    setCompatibilityRouteData(null)
    setWizardStep('compatibility')
  }

  function returnToCompatibilityHome() {
    window.history.replaceState(null, '', '/')
    compatibilityOriginRef.current = false
    setIsCompatibilityResultPage(false)
    setCompatibilityRouteData(null)
    setCompatibilityInputMounted(false)
    setCompatibilityStatus('idle')
    setCompatibilityError('')
    setWizardStep(1)
  }

  async function calculateCompatibility(first: CompatibilityPersonInput, second: CompatibilityPersonInput,
    relationshipStatus?: 'single' | 'dating' | 'partnered' | 'married') {
    if (compatibilitySubmitLock.current || compatibilityStatus === 'calculating') return
    compatibilitySubmitLock.current = true
    const calculationLocale = locale
    setCompatibilityStatus('calculating')
    setCompatibilityError('')
    try {
      const { prepareCompatibilityProductResult } = await import('./lib/product/prepareCompatibilityProductResult')
      const productResult = await prepareCompatibilityProductResult({ first, second, locale: calculationLocale,
        ...(relationshipStatus && { relationshipStatus }) })
      const routeData: CompatibilityRouteHistoryData = {
        version: 1, kind: 'compatibility', first, second,
        ...(relationshipStatus && { relationshipStatus }),
        locale: productResult.locale, referenceTime: productResult.referenceTime,
        customerResult: productResult.customerResult,
      }
      window.history.pushState({ filuneCompatibilityResult: routeData }, '', '/compatibility/result')
      setCompatibilityRouteData(routeData)
      setLocale(productResult.locale)
      setIsResultPage(false)
      setIsCompatibilityResultPage(true)
      setCompatibilityStatus('success')
      setWizardStep('compatibility')
    } catch {
      setCompatibilityError(messages[calculationLocale].compatibility.error)
      setCompatibilityStatus('error')
    } finally {
      compatibilitySubmitLock.current = false
    }
  }

  async function beginReading() {
    if (needsTopicStatus(interestTopic) && !hasTopicStatus) return
    setWizardStep(7)
    setIsTransitioning(true)
    await calculateAndShowResult()
  }

  return (
    <main>
      {!isResultPage && !isCompatibilityResultPage && wizardStep === 1 && <section className="story-step story-step--hero">
        <div className="story-topbar"><div className="story-brand">FILUNE</div><div className="language-picker"><label htmlFor="ui-language">{t.language}</label><select id="ui-language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}><option value="ja">日本語</option><option value="ko">한국어</option><option value="en">English</option></select></div></div>
        <div className="story-hero__content"><LuneVisual className="story-hero__lune" name="LUNE"/>{t.flow.guideLine && <p className="story-character-description">{t.flow.guideLine}</p>}<p className="story-hero__main-copy">{t.flow.heroMain}</p><button type="button" className="story-cta" onClick={() => setWizardStep('permission')}>{t.flow.start}</button><button type="button" className="story-cta story-cta--secondary" onClick={showCompatibilityIntro}>{t.compatibility.entry}</button></div>
      </section>}
      {!isResultPage && !isCompatibilityResultPage && wizardStep !== 1 && <div className={`story-language${isOnboarding || wizardStep === 3 || wizardStep === 4 || wizardStep === 5 ? ' story-language--dark' : ''}`}><label htmlFor="wizard-language">{t.language}</label><select id="wizard-language" value={locale} disabled={compatibilityStatus === 'calculating'} onChange={(event) => setLocale(event.target.value as Locale)}><option value="ja">日本語</option><option value="ko">한국어</option><option value="en">English</option></select></div>}
      {!isResultPage && isOnboarding && <section className={`story-step story-step--navy onboarding-scene${isCompatibilityIntro && locale === 'ja' ? ' compatibility-intro--ja' : ''}`}>
        <button type="button" className="story-back story-back--light" onClick={() => isCompatibilityIntro ? window.history.back() : setWizardStep(1)} aria-label={t.flow.back}>‹</button>
        <LuneVisual className="onboarding-scene__lune" name={t.flow.luneName}/>
        <h1 className="onboarding-scene__title">{isCompatibilityIntro ? t.compatibility.introTitle : t.flow.permissionTitle}</h1>
        <p className={isCompatibilityIntro ? 'onboarding-scene__body' : 'onboarding-scene__body onboarding-scene__body--personal'}>{isCompatibilityIntro ? t.compatibility.introBody : t.flow.permissionBody}</p>
        <button className="story-cta onboarding-scene__cta" type="button" onClick={isCompatibilityIntro ? beginCompatibility : () => setWizardStep(3)}>{t.flow.permissionAccept}</button>
      </section>}
      {!isResultPage && wizardStep === 3 && <div className="entry-screen story-form-screen">
        <header className="story-form-screen__intro">
          <LuneVisual className="story-form-screen__lune"/>
          <h1>{t.flow.birthInputTitle}</h1>
        </header>
        <div className="birth-step-top"><button type="button" className="story-back" onClick={() => setWizardStep('permission')} aria-label={t.flow.back}>‹</button></div>
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
          <button className="entry-form__submit" type="submit">{t.flow.next}</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>}
      {!isResultPage && wizardStep === 4 && <section className="story-form-screen">
        <header className="story-form-screen__intro">
          <LuneVisual className="story-form-screen__lune"/>
          <h1>{t.flow.topicIntroTitle}</h1>
        </header>
        <div className="birth-step-top"><button type="button" className="story-back" onClick={() => setWizardStep(3)} aria-label={t.flow.back}>‹</button></div>
        <section className="story-form-screen__topics" aria-labelledby="interest-topic-label">
          <h2 id="interest-topic-label" className="story-eyebrow">{t.flow.topicEyebrow}</h2>
          <div className="story-options">
            {personalTopics.map((value, i) => {
              const selected = interestTopic === value
              return <button key={value} type="button" className={selected ? 'selected' : ''}
                aria-pressed={selected}
                onClick={() => {
                  if (selected) return
                  setInterestTopic(value)
                  setRelationshipStatus('')
                  setCareerStatus('')
                }}>{t.flow.topics[i]}</button>
            })}
          </div>
          <button type="button" className="story-cta story-cta--navy" disabled={!personalTopics.some(topic => topic === interestTopic)}
            onClick={() => needsTopicStatus(interestTopic) ? setWizardStep(5) : void beginReading()}>{t.flow.next}</button>
        </section>
      </section>}
      {!isResultPage && wizardStep === 5 && <section className="story-form-screen">
        <header className="story-form-screen__intro">
          <LuneVisual className="story-form-screen__lune"/>
          <h1>{t.flow.followUp}</h1>
        </header>
        <div className="birth-step-top"><button type="button" className="story-back" onClick={() => setWizardStep(4)} aria-label={t.flow.back}>‹</button></div>
        <div className="story-form-screen__topics">
          <h2 className="story-eyebrow">{isRelationshipTopic ? t.flow.relationshipQuestion : t.flow.careerQuestion}</h2>
          <div className="story-options">
            {topicStatusOptions.map((value, i) => {
              const selected = topicStatus === value
              return <button key={value} type="button" className={selected ? 'selected' : ''} aria-pressed={selected}
                onClick={() => isRelationshipTopic ? setRelationshipStatus(value) : setCareerStatus(value)}>
                {(isRelationshipTopic ? t.flow.relationshipStatuses : t.flow.careerStatuses)[i]}
              </button>
            })}
          </div>
          <button type="button" className="story-cta story-cta--navy" disabled={!hasTopicStatus}
            onClick={() => void beginReading()}>{t.flow.next}</button>
        </div>
      </section>}
      {!isResultPage && wizardStep === 7 && <section className="story-step story-step--navy"><LuneVisual className="story-lune"/><p className="story-copy">{t.flow.transition}</p>{isTransitioning && <span className="story-loader" aria-label={t.flow.loading}/>}</section>}

      {compatibilityInputMounted && <div hidden={wizardStep !== 'compatibility' || isCompatibilityResultPage}>
        <Suspense fallback={null}>
          <CompatibilityInput locale={locale} messages={t} disabled={compatibilityStatus === 'calculating'}
            error={compatibilityStatus === 'error' ? compatibilityError : undefined}
            initialPeople={compatibilityRouteData ? [compatibilityRouteData.first, compatibilityRouteData.second] : undefined}
            initialRelationshipStatus={compatibilityRouteData?.relationshipStatus}
            onSubmit={(first, second, status) => void calculateCompatibility(first, second, status)}
            onBack={() => window.history.back()} />
        </Suspense>
      </div>}

      {isCompatibilityResultPage && compatibilityRouteData && <Suspense fallback={<p className="compatibility-loading" role="status">{messages[compatibilityRouteData.locale].compatibility.calculating}</p>}>
        <CompatibilityResult locale={compatibilityRouteData.locale} result={compatibilityRouteData.customerResult}
          messages={messages[compatibilityRouteData.locale]} onBack={() => window.history.back()}
          onHome={returnToCompatibilityHome} />
      </Suspense>}

      {isResultPage && pillars && fullAge !== null && (
        <Suspense fallback={null}>
          <BasicChartResult
            birth={birth}
            pillars={pillars}
            interestTopic={interestTopic}
            careerStatus={interestTopic === 'work' ? careerStatus : undefined}
            relationshipStatus={isRelationshipTopic ? relationshipStatus : undefined}
            selectedStatus={isRelationshipTopic
              ? t.flow.relationshipStatuses[relationshipStatuses.findIndex(value => value === relationshipStatus)]
              : interestTopic === 'work'
                ? t.flow.careerStatuses[careerStatuses.findIndex(value => value === careerStatus)]
                : undefined}
            messages={t}
            locale={locale}
            name={name}
            profileSummary={[name.trim(), `${fullAge}${t.yearsSuffix}`, selectedGender ? (selectedGender === '女性' ? t.female : t.male) : ''].filter(Boolean).join(' · ')}
            birthDateTime={`${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}${pillars.timeKnown === false ? `　${t.birthTimeUnknown}` : ` ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}`}
            timeCorrectionSummary={pillars.timeKnown !== false && pillars.timeCorrection
              ? [
                `${t.correctionOriginal} ${pillars.timeCorrection.originalTime}`,
                pillars.timeCorrection.mode === 'longitude'
                  ? `${t.correction} ${pillars.timeCorrection.correctionMinutes > 0 ? '+' : ''}${pillars.timeCorrection.correctionMinutes}${t.minuteUnit}`
                  : '',
                `${t.calculationTime} ${pillars.timeCorrection.calculationTime}`,
              ].filter(Boolean).join(' · ')
              : undefined}
            showSolarTermAmbiguity={pillars.timeKnown === false ? pillars.solarTermAmbiguous : false}
            onBack={() => window.history.back()}
          />
        </Suspense>
      )}
    </main>
  )
}

export default App
