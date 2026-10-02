import { useState, type FormEvent } from 'react'
import BasicChartResult from './components/BasicChartResult'
import { calculateEightChar, calculateEightCharWithoutBirthTime, type FourPillars, type ThreePillars } from './lib/calculateEightChar'
import { createBasicChartViewModel } from './lib/basicChartViewModel'

function App() {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [pillars, setPillars] = useState<FourPillars | ThreePillars | null>(null)
  const [error, setError] = useState('')
  const chart = pillars ? createBasicChartViewModel(pillars) : null

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
      setPillars(timeUnknown
        ? calculateEightCharWithoutBirthTime({ year: numericYear, month: numericMonth, day: numericDay })
        : calculateEightChar({
            year: numericYear,
            month: numericMonth,
            day: numericDay,
            hour: Number(hour),
            minute: Number(minute),
          }))
      setError('')
    } catch {
      setError('入力した日時を計算できませんでした。')
    }
  }

  return (
    <main>
      <div className="entry-screen">
        <p className="entry-screen__brand">FILUNE</p>
        <h1>あなたの命式</h1>
        <form className="entry-form" noValidate onSubmit={handleSubmit}>
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
      </div>

      {pillars && chart && (
        <BasicChartResult
          chart={chart}
          birthDateTime={`${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}${pillars.timeKnown === false ? ' / 出生時刻不明' : ` / ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}`}
          showSolarTermAmbiguity={pillars.timeKnown === false ? pillars.solarTermAmbiguous : false}
        />
      )}
    </main>
  )
}

export default App
