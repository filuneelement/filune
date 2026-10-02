import { useEffect, useState, type FormEvent } from 'react'
import BasicChartResult from './components/BasicChartResult'
import { calculateGreatLuck } from './lib/calculateGreatLuck'
import type { GreatLuckGender } from './lib/calculateGreatLuck'
import { calculateFullAge } from './lib/calculateFullAge'
import { calculateEightChar, calculateEightCharWithoutBirthTime, type FourPillars, type ThreePillars } from './lib/calculateEightChar'
import { createBasicChartViewModel } from './lib/basicChartViewModel'

type PillarResult = FourPillars | ThreePillars

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
  const [isResultPage, setIsResultPage] = useState(() => initialResult !== null)
  const [name, setName] = useState(initialResult?.name ?? '')
  const [gender, setGender] = useState(initialResult?.gender ?? '')
  const [year, setYear] = useState(initialResult?.year ?? '')
  const [month, setMonth] = useState(initialResult?.month ?? '')
  const [day, setDay] = useState(initialResult?.day ?? '')
  const [hour, setHour] = useState(initialResult?.hour ?? '')
  const [minute, setMinute] = useState(initialResult?.minute ?? '')
  const [timeUnknown, setTimeUnknown] = useState(initialResult?.timeUnknown ?? false)
  const [pillars, setPillars] = useState<PillarResult | null>(initialResult?.pillars ?? null)
  const [error, setError] = useState('')
  const chart = pillars ? createBasicChartViewModel(pillars) : null
  const selectedGender: GreatLuckGender | null = gender === '女性' || gender === '男性' ? gender : null
  const greatLuckAmbiguous = pillars?.timeKnown === false && pillars.solarTermAmbiguous
  const greatLuckMessage = greatLuckAmbiguous
    ? '節入り日かつ出生時刻不明のため、年柱・月柱が確定せず大運を表示できません。'
    : selectedGender
      ? undefined
      : '性別を選択すると大運を表示します。'
  const greatLuck = isResultPage && pillars && chart && selectedGender && !greatLuckAmbiguous
    ? calculateGreatLuck({
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
      })
    : null

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
        setPillars(result.pillars)
      }
    }

    if (window.location.pathname === '/result' && !initialResult) {
      window.history.replaceState(null, '', '/')
    }

    window.addEventListener('popstate', restoreHistoryPage)
    return () => window.removeEventListener('popstate', restoreHistoryPage)
  }, [initialResult])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPillars(null)

    if (!/^\d{4}$/.test(year) || Number(year) < 1) {
      setError('年は西暦4桁の数字で入力してください。')
      return
    }
    if (!/^\d{1,2}$/.test(month) || Number(month) < 1 || Number(month) > 12) {
      setError('月は1から12までの数字で入力してください。')
      return
    }
    if (!/^\d{1,2}$/.test(day)) {
      setError('日を数字で入力してください。')
      return
    }

    const numericYear = Number(year)
    const numericMonth = Number(month)
    const numericDay = Number(day)
    const isLeapYear = numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0)
    const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][numericMonth - 1]
    if (numericDay < 1 || numericDay > daysInMonth) {
      setError('入力した年月に有効な日付を入力してください。')
      return
    }
    if (!timeUnknown) {
      if (!/^\d{1,2}$/.test(hour) || Number(hour) < 0 || Number(hour) > 23) {
        setError('時は0から23までの数字で入力してください。')
        return
      }
      if (!/^\d{1,2}$/.test(minute) || Number(minute) < 0 || Number(minute) > 59) {
        setError('分は0から59までの数字で入力してください。')
        return
      }
    }

    try {
      const calculatedPillars = timeUnknown
        ? calculateEightCharWithoutBirthTime({ year: numericYear, month: numericMonth, day: numericDay })
        : calculateEightChar({
            year: numericYear,
            month: numericMonth,
            day: numericDay,
            hour: Number(hour),
            minute: Number(minute),
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
      }
      window.history.pushState({ filuneResult: routeData } satisfies ResultHistoryState, '', '/result')
      setPillars(calculatedPillars)
      setIsResultPage(true)
      setError('')
    } catch {
      setError('入力した日時を計算できませんでした。')
    }
  }

  return (
    <main>
      {!isResultPage && <div className="entry-screen">
        <p className="entry-screen__brand">FILUNE</p>
        <h1>あなたの命式</h1>
        <form className="entry-form" noValidate onSubmit={handleSubmit}>
          <section className="entry-form__section" aria-labelledby="profile-title">
            <h2 id="profile-title">プロフィール</h2>
            <label className="entry-form__name-field">
              名前
              <input
                type="text"
                autoComplete="name"
                maxLength={40}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="entry-form__gender" role="group" aria-labelledby="gender-title">
              <span id="gender-title">性別</span>
              <label>
                <input type="radio" name="gender" value="女性" checked={gender === '女性'} onChange={() => setGender('女性')} />
                <span>女性</span>
              </label>
              <label>
                <input type="radio" name="gender" value="男性" checked={gender === '男性'} onChange={() => setGender('男性')} />
                <span>男性</span>
              </label>
            </div>
          </section>
          <section className="entry-form__section" aria-labelledby="birth-date-title">
            <h2 id="birth-date-title">生年月日</h2>
            <div className="entry-form__fields">
              <label>
                <input
                  className="entry-form__year"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="年"
                  placeholder="2000"
                  maxLength={4}
                  value={year}
                  onChange={(event) => setYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <span>年</span>
              </label>
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="月"
                  placeholder="01"
                  maxLength={2}
                  value={month}
                  onChange={(event) => setMonth(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>月</span>
              </label>
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="日"
                  placeholder="01"
                  maxLength={2}
                  value={day}
                  onChange={(event) => setDay(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>日</span>
              </label>
            </div>
          </section>
          <section className="entry-form__section" aria-labelledby="birth-time-title">
            <h2 id="birth-time-title">出生時刻</h2>
            <div className="entry-form__fields">
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="時"
                  placeholder="12"
                  maxLength={2}
                  value={hour}
                  disabled={timeUnknown}
                  onChange={(event) => setHour(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>時</span>
              </label>
              <label>
                <input
                  className="entry-form__short-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="分"
                  placeholder="00"
                  maxLength={2}
                  value={minute}
                  disabled={timeUnknown}
                  onChange={(event) => setMinute(event.target.value.replace(/\D/g, '').slice(0, 2))}
                />
                <span>分</span>
              </label>
            </div>
            <label className="entry-form__unknown-time">
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(event) => {
                  const checked = event.target.checked
                  setTimeUnknown(checked)
                  if (checked && (error.startsWith('時は') || error.startsWith('分は'))) setError('')
                }}
              />
              <span>出生時刻がわからない</span>
            </label>
          </section>
          <button className="entry-form__submit" type="submit">命式を見る</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>}

      {isResultPage && pillars && chart && (
        <BasicChartResult
          chart={chart}
          profileSummary={`${name.trim() ? `${name.trim()}（` : ''}${calculateFullAge(Number(year), Number(month), Number(day))}歳${gender ? ` / ${gender}` : ''}${name.trim() ? '）' : ''}`}
          birthDateTime={`${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}${pillars.timeKnown === false ? '　出生時刻不明' : ` ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}`}
          showSolarTermAmbiguity={pillars.timeKnown === false ? pillars.solarTermAmbiguous : false}
          onBack={() => window.history.back()}
          greatLuck={greatLuck}
          greatLuckMessage={greatLuckMessage}
        />
      )}
    </main>
  )
}

export default App
