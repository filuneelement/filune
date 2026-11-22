import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import type { createBasicChartViewModel } from './lib/basicChartViewModel'
import type { GreatLuckGender, GreatLuckResult } from './lib/calculateGreatLuck'
import type { FourPillars, ThreePillars } from './lib/calculateEightChar'
import LuneVisual from './components/LuneVisual'
import type { EventDomain } from './lib/eventTiming'
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
  resolveCountryForLocale,
  type CountryCode,
  type CountrySelectionSource,
  type Locale,
} from './i18n'

type PillarResult = FourPillars | ThreePillars
type ChartViewModel = ReturnType<typeof createBasicChartViewModel>

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
  relationshipDuration?: string
  optionalQuestion?: string
}

type ResultHistoryState = {
  filuneResult?: ResultRouteData
  filuneCompatibilityResult?: CompatibilityRouteHistoryData
  filuneCompatibilityInput?: { version: 1; kind: 'compatibility-input' }
}

type WizardStep = number | 'permission' | 'lune-intro' | 'compatibility'

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

const eventContextOptions = [
  { value: 'contract', ja: '契約手続き中', ko: '계약 절차 진행 중', en: 'A contract process in progress' },
  { value: 'business_start', ja: '事業の立ち上げ', ko: '사업 시작 준비', en: 'Preparing to start a business' },
  { value: 'business_expansion', ja: '既存事業の拡大', ko: '운영 중인 사업 확장', en: 'Expanding an existing business' },
] as const satisfies readonly ({ value: EventDomain } & Record<Locale, string>)[]

const eventContextLabels = {
  ja: { label: '相談する予定（任意）', none: '指定しない' },
  ko: { label: '살펴볼 계획 (선택)', none: '선택 안 함' },
  en: { label: 'Plans to consider (optional)', none: 'None selected' },
}

const topicQuestionConfig = {
  love: { statusQuestion: 'relationshipStatus', durationWhenStatus: 'dating' },
} as const

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
    window.location.pathname === '/compatibility' || window.location.pathname === '/compatibility/result')
  const [compatibilityStatus, setCompatibilityStatus] = useState<'idle' | 'calculating' | 'success' | 'error'>(() =>
    initialCompatibilityResult ? 'success' : 'idle')
  const [compatibilityError, setCompatibilityError] = useState('')
  const compatibilitySubmitLock = useRef(false)
  const compatibilityOriginRef = useRef(window.location.pathname === '/compatibility'
    || window.location.pathname === '/compatibility/result')
  const compatibilityReturnStepRef = useRef<WizardStep>(1)
  const [wizardStep, setWizardStep] = useState<WizardStep>(() =>
    window.location.pathname === '/compatibility' || initialCompatibilityResult ? 'compatibility' : 1)
  const [interestTopic, setInterestTopic] = useState(initialResult?.interestTopic ?? '')
  const [relationshipStatus, setRelationshipStatus] = useState(initialResult?.relationshipStatus ?? '')
  const [relationshipDuration, setRelationshipDuration] = useState(initialResult?.relationshipDuration ?? '')
  const [optionalQuestion, setOptionalQuestion] = useState(initialResult?.optionalQuestion ?? '')
  const [eventContext, setEventContext] = useState<EventDomain>()
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
  useEffect(() => {
    if (wizardStep !== 'lune-intro') return
    const timer = window.setTimeout(() => setWizardStep(3), 1200)
    return () => window.clearTimeout(timer)
  }, [wizardStep])
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
      } else if (path === '/') {
        setWizardStep(compatibilityOriginRef.current ? compatibilityReturnStepRef.current : 6)
        compatibilityOriginRef.current = false
      }
      if (compatibilityResult) setLocale(compatibilityResult.locale)

      if (result) {
        setInterestTopic(result.interestTopic ?? '')
        setRelationshipStatus(result.relationshipStatus ?? '')
        setRelationshipDuration(result.relationshipDuration ?? '')
        setOptionalQuestion(result.optionalQuestion ?? '')
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

  async function calculateAndShowResult(context?: EventDomain) {
    setPillars(null)
    if (!validateBirth()) {
      setWizardStep(3)
      setIsTransitioning(false)
      return
    }
    const numericYear = Number(year)
    const numericMonth = Number(month)
    const numericDay = Number(day)
    try {
      const { prepareProductResult } = await import('./lib/product/prepareProductResult')
      const result = await prepareProductResult({
        date: { year: numericYear, month: numericMonth, day: numericDay },
        time: timeUnknown ? { known: false } : { known: true, value: { hour: Number(hour), minute: Number(minute) } },
        gender: selectedGender ?? undefined,
        birthplace,
        timeCorrectionMode: timeCorrectionEnabled && birthplace ? 'longitude' : 'none',
      }, { eventContext: context })
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
        relationshipStatus,
        relationshipDuration,
        optionalQuestion,
      }
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

  function beginCompatibility() {
    compatibilityReturnStepRef.current = wizardStep === 'compatibility' ? 1 : wizardStep
    compatibilityOriginRef.current = true
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

  function nextAfterConditional() {
    setWizardStep(6)
  }

  async function beginReading(context?: EventDomain) {
    setWizardStep(7)
    setIsTransitioning(true)
    await calculateAndShowResult(context)
  }

  return (
    <main>
      {!isResultPage && !isCompatibilityResultPage && wizardStep === 1 && <section className="story-step story-step--hero">
        <div className="story-topbar"><div className="story-brand">FILUNE</div><div className="language-picker"><label htmlFor="ui-language">{t.language}</label><select id="ui-language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}><option value="ja">日本語</option><option value="ko">한국어</option><option value="en">English</option></select></div></div>
        <div className="story-hero__content"><LuneVisual className="story-hero__lune" name={t.flow.luneName}/>{t.flow.guideLine && <p className="story-character-description">{t.flow.guideLine}</p>}{t.flow.heroMain && <p className="story-hero__main-copy">{t.flow.heroMain}</p>}<p className={t.flow.heroMain ? 'story-hero__subline' : 'story-hero__headline'}>{t.flow.hero}</p><button type="button" className="story-cta" onClick={() => setWizardStep('permission')}>{t.flow.start}</button><button type="button" className="story-skip" onClick={beginCompatibility}>{t.compatibility.entry}</button></div>
      </section>}
      {!isResultPage && !isCompatibilityResultPage && wizardStep !== 1 && <div className={`story-language${wizardStep === 'permission' || wizardStep === 'lune-intro' ? ' story-language--dark' : ''}`}><label htmlFor="wizard-language">{t.language}</label><select id="wizard-language" value={locale} disabled={compatibilityStatus === 'calculating'} onChange={(event) => setLocale(event.target.value as Locale)}><option value="ja">日本語</option><option value="ko">한국어</option><option value="en">English</option></select></div>}
      {!isResultPage && wizardStep === 'permission' && <section className="story-step story-step--navy onboarding-scene">
        <button type="button" className="story-back story-back--light" onClick={() => setWizardStep(1)} aria-label={t.flow.back}>‹</button>
        <LuneVisual className="onboarding-scene__lune" name={t.flow.luneName}/>
        <h1 className="onboarding-scene__title">{t.flow.permissionTitle}</h1>
        <p className="onboarding-scene__body">{t.flow.permissionBody}</p>
        <button className="story-cta onboarding-scene__cta" type="button" onClick={() => setWizardStep('lune-intro')}>{t.flow.permissionAccept}</button>
      </section>}
      {!isResultPage && wizardStep === 'lune-intro' && <section className="story-step story-step--navy onboarding-scene onboarding-scene--intro" aria-live="polite">
        <LuneVisual className="onboarding-scene__lune" name={t.flow.luneName}/>
        <p className="onboarding-scene__intro-copy">{t.flow.introCopy}</p>
      </section>}
      {!isResultPage && wizardStep === 3 && <div className="entry-screen story-form-screen">
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
      {!isResultPage && wizardStep === 4 && <section className="story-step story-step--ivory"><div className="story-step-head"><button type="button" className="story-back" onClick={() => setWizardStep(3)} aria-label={t.flow.back}>‹</button><span>FILUNE</span></div><div className="story-panel"><p className="story-eyebrow">{t.flow.topicEyebrow}</p><h1>{t.flow.topicQuestion}</h1><div className="story-options">{t.flow.topics.map((topic, i) => <button key={i} type="button" className={interestTopic === ['self','love','work','money','future'][i] ? 'selected' : ''} onClick={() => { setInterestTopic(['self','love','work','money','future'][i]); setRelationshipStatus(''); setRelationshipDuration('') }}>{topic}</button>)}</div><button type="button" className="story-cta story-cta--navy" disabled={!interestTopic} onClick={() => setWizardStep(interestTopic in topicQuestionConfig ? 5 : 6)}>{t.flow.next}</button></div></section>}
      {!isResultPage && wizardStep === 5 && <section className="story-step story-step--ivory"><div className="story-step-head"><button type="button" className="story-back" onClick={() => setWizardStep(4)} aria-label={t.flow.back}>‹</button><span>FILUNE</span></div><div className="story-panel"><p className="story-eyebrow">{t.flow.followUp}</p><h1>{interestTopic in topicQuestionConfig ? t.flow.relationshipQuestion : t.flow.topicQuestion}</h1>{interestTopic in topicQuestionConfig ? <><div className="story-options">{t.flow.relationshipStatuses.map((v, i) => <button key={i} type="button" className={relationshipStatus === ['single','dating','married'][i] ? 'selected' : ''} onClick={() => { setRelationshipStatus(['single','dating','married'][i]); setRelationshipDuration('') }}>{v}</button>)}</div>{relationshipStatus === topicQuestionConfig.love.durationWhenStatus && <><h2>{t.flow.durationQuestion}</h2><div className="story-options">{t.flow.durations.map((v,i) => <button key={i} type="button" className={relationshipDuration === String(i) ? 'selected' : ''} onClick={() => setRelationshipDuration(String(i))}>{v}</button>)}</div></>}</> : <p className="story-note">{t.flow.noQuestions}</p>}<button type="button" className="story-cta story-cta--navy" disabled={interestTopic in topicQuestionConfig && (!relationshipStatus || (relationshipStatus === topicQuestionConfig.love.durationWhenStatus && !relationshipDuration))} onClick={nextAfterConditional}>{t.flow.next}</button></div></section>}
      {!isResultPage && wizardStep === 6 && <section className="story-step story-step--ivory"><div className="story-step-head"><button type="button" className="story-back" onClick={() => setWizardStep(interestTopic in topicQuestionConfig ? 5 : 4)} aria-label={t.flow.back}>‹</button><span>FILUNE</span></div><div className="story-panel"><p className="story-eyebrow">{t.flow.optional}</p><h1>{t.flow.optionalQuestion}</h1><textarea maxLength={200} value={optionalQuestion} placeholder={t.flow.optionalPlaceholder} onChange={(event) => setOptionalQuestion(event.target.value)}/><small className="story-counter">{optionalQuestion.length}/200</small>
        <label className="story-event-context">
          {eventContextLabels[locale].label}
          <select value={eventContext ?? ''} onChange={(event) => setEventContext(eventContextOptions.find(option => option.value === event.target.value)?.value)}>
            <option value="">{eventContextLabels[locale].none}</option>
            {eventContextOptions.map(option => <option key={option.value} value={option.value}>{option[locale]}</option>)}
          </select>
        </label>
        <button type="button" className="story-cta story-cta--navy" onClick={() => void beginReading(eventContext)}>{t.flow.next}</button><button type="button" className="story-skip" onClick={() => void beginReading()}>{t.flow.skip}</button></div></section>}
      {!isResultPage && wizardStep === 7 && <section className="story-step story-step--navy"><LuneVisual className="story-lune"/><p className="story-copy">{t.flow.transition}</p>{isTransitioning && <span className="story-loader" aria-label={t.flow.loading}/>}</section>}

      {compatibilityInputMounted && <div hidden={wizardStep !== 'compatibility' || isCompatibilityResultPage}>
        <Suspense fallback={<p className="compatibility-loading" role="status">{t.compatibility.calculating}</p>}>
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

      {isResultPage && pillars && chart && fullAge !== null && (
        <Suspense fallback={null}>
          <BasicChartResult
            chart={chart}
            messages={t}
            locale={locale}
            name={name}
            profileSummary={`${name.trim() ? `${name.trim()}${locale === 'en' ? ' (' : '（'}` : ''}${fullAge}${t.yearsSuffix}${gender ? `${t.ageSeparator}${gender === '女性' ? t.female : t.male}` : ''}${name.trim() ? (locale === 'en' ? ')' : '）') : ''}`}
            birthDateTime={`${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}${pillars.timeKnown === false ? `　${t.birthTimeUnknown}` : ` ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}`}
            timeCorrectionSummary={pillars.timeKnown !== false && pillars.timeCorrection && birthplace
              ? `${t.correctionOriginal} ${pillars.timeCorrection.originalTime}　${t.correction} ${pillars.timeCorrection.correctionMinutes > 0 ? '+' : ''}${pillars.timeCorrection.correctionMinutes}${t.minuteUnit}　${t.calculationTime} ${pillars.timeCorrection.calculationTime}`
              : undefined}
            showSolarTermAmbiguity={pillars.timeKnown === false ? pillars.solarTermAmbiguous : false}
            onBack={() => window.history.back()}
            greatLuck={greatLuck}
            greatLuckMessage={greatLuckMessage}
            interestTopic={interestTopic}
          />
        </Suspense>
      )}
    </main>
  )
}

export default App
