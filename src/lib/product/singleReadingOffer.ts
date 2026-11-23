/// <reference types="vite/client" />

import type { Locale } from '../../i18n'

const configuredAmount = Number(import.meta.env.VITE_SINGLE_READING_PRICE_KRW)

export function singleReadingPrice(locale: Locale): string | undefined {
  if (!Number.isSafeInteger(configuredAmount) || configuredAmount <= 0) return undefined
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'KRW' }).format(configuredAmount)
}
