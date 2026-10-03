import ja from './ja'
import ko from './ko'
import en from './en'
export type Locale = 'ja' | 'ko' | 'en'
export type Messages = typeof ja
export const messages: Record<Locale, Messages> = { ja, ko, en }
export function getSavedLocale(): Locale {
  const value = localStorage.getItem('filune:locale')
  return value === 'ko' || value === 'en' ? value : 'ja'
}
export function getSavedCountry() {
  return localStorage.getItem('filune:birthCountry') === 'KR' ? 'KR' as const : 'JP' as const
}
export function formatAgeLabel(value: string, locale: Locale): string {
  if (locale === 'ja') return value
  const match = value.match(/^(\d+)歳(\d+)か月(?:(\d+)日)?$/)
  if (!match) return value
  const [, years, months, days = '0'] = match
  return locale === 'ko'
    ? `${years}년 ${months}개월${days === '0' ? '' : ` ${days}일`}`
    : `${years}y ${months}mo${days === '0' ? '' : ` ${days}d`}`
}
