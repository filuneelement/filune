type LocalDateTime = { year: number; month: number; day: number; hour: number; minute: number }

function utcEpoch({ year, month, day, hour, minute }: LocalDateTime): number {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, 0, 0)
  return date.getTime()
}

function partsAt(epoch: number, timezone: string): LocalDateTime {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(epoch))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  }
}

function offsetAt(epoch: number, timezone: string): number {
  const local = partsAt(epoch, timezone)
  return Math.round((utcEpoch(local) - epoch) / 60_000)
}

function sameLocalDateTime(left: LocalDateTime, right: LocalDateTime): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day
    && left.hour === right.hour && left.minute === right.minute
}

function possibleOffsetsForLocalTime(local: LocalDateTime, timezone: string): number[] {
  const wallEpoch = utcEpoch(local)
  const offsets = new Set<number>()
  for (let hour = -36; hour <= 36; hour += 3) {
    const guessOffset = offsetAt(wallEpoch + hour * 3_600_000, timezone)
    const candidateEpoch = wallEpoch - guessOffset * 60_000
    const actualOffset = offsetAt(candidateEpoch, timezone)
    if (sameLocalDateTime(partsAt(candidateEpoch, timezone), local)) offsets.add(actualOffset)
  }
  return [...offsets]
}

function standardOffsetForYear(year: number, timezone: string, expectedMeridian: number): number {
  const expectedOffset = Math.round(expectedMeridian * 4)
  const monthlyOffsets = new Map<number, number>()
  for (let month = 1; month <= 12; month += 1) {
    const approximateLocalNoon = utcEpoch({ year, month, day: 15, hour: 12, minute: 0 })
    const observedOffset = offsetAt(approximateLocalNoon - expectedOffset * 60_000, timezone)
    monthlyOffsets.set(observedOffset, (monthlyOffsets.get(observedOffset) ?? 0) + 1)
  }

  if (monthlyOffsets.has(expectedOffset)) return expectedOffset
  return [...monthlyOffsets]
    .sort(([leftOffset, leftCount], [rightOffset, rightCount]) =>
      rightCount - leftCount || Math.abs(leftOffset - expectedOffset) - Math.abs(rightOffset - expectedOffset))
    [0][0]
}

/**
 * Converts a US local wall time's historical IANA timezone/DST offset into the
 * correction relative to the location's standard meridian. Ambiguous fall-back
 * times prefer the standard-time occurrence; nonexistent spring-forward times
 * are rejected because that local clock reading never occurred.
 */
export function calculateUsLongitudeCorrectionMinutes(
  local: LocalDateTime,
  timezone: string,
  longitude: number,
  standardMeridian: number,
): number {
  const standardOffset = standardOffsetForYear(local.year, timezone, standardMeridian)
  const offsets = possibleOffsetsForLocalTime(local, timezone)
  if (offsets.length === 0) {
    throw new RangeError(`The local time does not exist in ${timezone}.`)
  }
  const actualOffset = offsets.sort((left, right) =>
    Math.abs(left - standardOffset) - Math.abs(right - standardOffset))[0]
  const daylightAdjustment = actualOffset - standardOffset
  return Math.round((longitude - standardMeridian) * 4) - daylightAdjustment
}
