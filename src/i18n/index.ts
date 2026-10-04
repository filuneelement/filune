import ja from './ja'
import ko from './ko'
import en from './en'
export type Locale = 'ja' | 'ko' | 'en'
export type CountryCode = 'JP' | 'KR' | 'US'
export type CountrySelectionSource = 'default' | 'manual'
export type Messages = typeof ja
export const messages: Record<Locale, Messages> = { ja, ko, en }
export function getSavedLocale(): Locale {
  const value = localStorage.getItem('filune:locale')
  return value === 'ko' || value === 'en' ? value : 'ja'
}
export function getDefaultCountryForLocale(locale: Locale): CountryCode {
  return locale === 'ja' ? 'JP' : locale === 'ko' ? 'KR' : 'US'
}
export function getSavedCountry(fallback: CountryCode = 'JP'): CountryCode {
  const value = localStorage.getItem('filune:birthCountry')
  return value === 'KR' || value === 'US' || value === 'JP' ? value : fallback
}
export function getSavedCountrySelectionSource(): CountrySelectionSource {
  return localStorage.getItem('filune:birthCountrySource') === 'manual' ? 'manual' : 'default'
}
export function resolveCountryForLocale(
  locale: Locale,
  currentCountry: CountryCode,
  source: CountrySelectionSource,
): CountryCode {
  return source === 'manual' ? currentCountry : getDefaultCountryForLocale(locale)
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
