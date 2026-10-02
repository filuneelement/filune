import { useState, type FormEvent } from 'react'
import { calculateEightChar, type FourPillars } from './lib/calculateEightChar'

function App() {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [pillars, setPillars] = useState<FourPillars | null>(null)
  const [error, setError] = useState('')

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
    if (!/^\d{1,2}$/.test(hour) || Number(hour) < 0 || Number(hour) > 23) {
      setError('時は0から23までの数字で入力してください。')
      return
    }
    if (!/^\d{1,2}$/.test(minute) || Number(minute) < 0 || Number(minute) > 59) {
      setError('分は0から59までの数字で入力してください。')
      return
    }

    try {
      setPillars(calculateEightChar({
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
      <h1>四柱計算</h1>
      <form noValidate onSubmit={handleSubmit}>
        <fieldset>
          <legend>生年月日</legend>
          <label>
            年{' '}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="年"
              maxLength={4}
              value={year}
              onChange={(event) => setYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </label>{' '}
          <label>
            月{' '}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="月"
              maxLength={2}
              value={month}
              onChange={(event) => setMonth(event.target.value.replace(/\D/g, '').slice(0, 2))}
            />
          </label>{' '}
          <label>
            日{' '}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="日"
              maxLength={2}
              value={day}
              onChange={(event) => setDay(event.target.value.replace(/\D/g, '').slice(0, 2))}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>出生時刻</legend>
          <label>
            時{' '}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="時"
              maxLength={2}
              value={hour}
              onChange={(event) => setHour(event.target.value.replace(/\D/g, '').slice(0, 2))}
            />
          </label>{' '}
          <label>
            分{' '}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="分"
              maxLength={2}
              value={minute}
              onChange={(event) => setMinute(event.target.value.replace(/\D/g, '').slice(0, 2))}
            />
          </label>
        </fieldset>
        <button type="submit">計算</button>
      </form>

      {error && <p role="alert">{error}</p>}
      {pillars && (
        <>
          <table>
            <tbody>
              <tr>
                <th scope="row">年柱</th>
                <td>{pillars.year}</td>
              </tr>
              <tr>
                <th scope="row">月柱</th>
                <td>{pillars.month}</td>
              </tr>
              <tr>
                <th scope="row">日柱</th>
                <td>{pillars.day}</td>
              </tr>
              <tr>
                <th scope="row">時柱</th>
                <td>{pillars.time}</td>
              </tr>
            </tbody>
          </table>
          <section>
            <h2>日干</h2>
            <p>{pillars.dayRelationships.dayStem}</p>
            <h2>日支</h2>
            <p>{pillars.dayRelationships.dayBranch}</p>
            <h2>日支の蔵干</h2>
            <p>{pillars.dayRelationships.hiddenStems.map(({ stem }) => stem).join(' / ')}</p>
            <h2>本気</h2>
            <p>{pillars.dayRelationships.mainHiddenStem}</p>
            <h2>本気の十神</h2>
            <p>{pillars.dayRelationships.mainHiddenTenGod}</p>
          </section>
        </>
      )}
    </main>
  )
}

export default App
