import { useMemo, useState } from 'react'
import { calculateEightCharWithoutBirthTime } from '../../lib/calculateEightChar'
import { calculateDayRelationships, calculateTenGod } from '../../lib/dayRelationships'
import { calculateTwelveStage, type EarthlyBranch, type HeavenlyStem } from '../../lib/twelveStages'
import type { Locale, Messages } from '../../i18n'

type CalendarDate = { year: number; month: number; day: number }

function referenceDate(referenceTime: string): CalendarDate {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(new Date(referenceTime))
  const value = (name: string) => Number(parts.find(({ type }) => type === name)?.value)
  return { year: value('year'), month: value('month'), day: value('day') }
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function moveMonth({ year, month, day }: CalendarDate, offset: number): CalendarDate {
  const target = new Date(Date.UTC(year, month - 1 + offset, 1))
  const nextYear = target.getUTCFullYear()
  const nextMonth = target.getUTCMonth() + 1
  return { year: nextYear, month: nextMonth, day: Math.min(day, daysInMonth(nextYear, nextMonth)) }
}

export default function DailyPillarCalendar({ referenceTime, dayStem, locale, messages: t }: {
  referenceTime: string
  dayStem: string
  locale: Locale
  messages: Messages
}) {
  const today = useMemo(() => referenceDate(referenceTime), [referenceTime])
  const [{ year, month, day }, setSelection] = useState(today)
  const monthStart = new Date(Date.UTC(year, month - 1, 1))
  const monthLabel = new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC', year: 'numeric', month: 'long',
  }).format(monthStart)
  const fullDate = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', dateStyle: 'full' })
  const weekdayLabel = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short' })
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayLabel.format(new Date(Date.UTC(2024, 0, 7 + index))))
  const days = useMemo(() => Array.from({ length: daysInMonth(year, month) }, (_, index) => {
    const day = index + 1
    const { day: pillar, dayRelationships } = calculateEightCharWithoutBirthTime({ year, month, day })
    const relationships = calculateDayRelationships(dayStem, dayRelationships.dayBranch)
    return { day, pillar, relationships, stemTenGod: calculateTenGod(dayStem, dayRelationships.dayStem) }
  }), [year, month, dayStem])
  const selected = days[day - 1]
  const selectedDate = new Date(Date.UTC(year, month - 1, day))
  const stage = calculateTwelveStage(dayStem as HeavenlyStem, selected.relationships.dayBranch as EarthlyBranch)

  return (
    <section className="daily-calendar" aria-label={t.resultDailyPillar}>
      <div className="daily-calendar__navigation">
        <button type="button" onClick={() => setSelection(date => moveMonth(date, -1))}
          aria-label={t.dailyCalendar.previousMonth}>‹</button>
        <h2 aria-live="polite">{monthLabel}</h2>
        <button type="button" onClick={() => setSelection(date => moveMonth(date, 1))}
          aria-label={t.dailyCalendar.nextMonth}>›</button>
      </div>
      <div className="daily-calendar__grid">
        {weekdays.map((label, index) => <span className="daily-calendar__weekday" key={index}>{label}</span>)}
        {Array.from({ length: monthStart.getUTCDay() }, (_, index) => <span aria-hidden="true" key={`blank-${index}`} />)}
        {days.map(entry => {
          const gods = `${t.tenGods[entry.stemTenGod]} · ${t.tenGods[entry.relationships.mainHiddenTenGod]}`
          const isToday = today.year === year && today.month === month && today.day === entry.day
          const date = fullDate.format(new Date(Date.UTC(year, month - 1, entry.day)))
          return (
            <button key={entry.day} type="button" className="daily-calendar__day"
              aria-label={`${date} · ${entry.pillar} · ${gods}`} aria-current={isToday ? 'date' : undefined}
              aria-pressed={entry.day === day} onClick={() => setSelection({ year, month, day: entry.day })}>
              <span className="daily-calendar__date">{entry.day}</span>
              <strong>{entry.pillar}</strong>
              <span className="daily-calendar__gods">{gods}</span>
            </button>
          )
        })}
      </div>
      <section className="daily-calendar__detail" aria-label={fullDate.format(selectedDate)}>
        <h3>{fullDate.format(selectedDate)} · {selected.pillar}</h3>
        <dl>
          <dt>{t.dailyCalendar.stem}</dt><dd>{t.tenGods[selected.stemTenGod]}</dd>
          <dt>{t.dailyCalendar.branch}</dt><dd>{t.tenGods[selected.relationships.mainHiddenTenGod]}</dd>
          <dt>{t.hiddenStems}</dt>
          <dd>{selected.relationships.hiddenStems.map(({ stem, role, tenGod }) =>
            `${stem} (${t.roles[role]} · ${t.tenGods[tenGod]})`).join(' / ')}</dd>
          <dt>{t.twelveStagesTitle}</dt><dd>{t.stages[stage]}</dd>
        </dl>
      </section>
    </section>
  )
}
