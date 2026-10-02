export function calculateFullAge(birthYear: number, birthMonth: number, birthDay: number, now = new Date()): number {
  const japanToday = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now)
  const year = Number(japanToday.find(({ type }) => type === 'year')?.value)
  const month = Number(japanToday.find(({ type }) => type === 'month')?.value)
  const day = Number(japanToday.find(({ type }) => type === 'day')?.value)

  let age = year - birthYear
  if (month < birthMonth || (month === birthMonth && day < birthDay)) age -= 1
  return age
}
