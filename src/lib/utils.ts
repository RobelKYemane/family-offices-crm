import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAum(usd: number | null): string {
  if (usd === null) return '—'
  if (usd >= 1_000_000_000) {
    return `$${(usd / 1_000_000_000).toFixed(1)}B`
  }
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(0)}M`
  }
  return `$${usd.toLocaleString()}`
}

// Converts a country name to its Unicode regional indicator flag.
// Falls back to an empty string for unknown countries — no image deps.
const COUNTRY_TO_CODE: Record<string, string> = {
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE',
  UAE: 'AE',
  Egypt: 'EG',
  Qatar: 'QA',
  Bahrain: 'BH',
  Kuwait: 'KW',
  Oman: 'OM',
  Jordan: 'JO',
  Iraq: 'IQ',
  Lebanon: 'LB',
  Morocco: 'MA',
  Algeria: 'DZ',
  Tunisia: 'TN',
  Libya: 'LY',
}

export function countryFlag(country: string): string {
  const code = COUNTRY_TO_CODE[country]
  if (!code) return ''
  // Regional indicator symbols: A = 0x1F1E6, offset by char code
  return [...code]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

/** Extract the hostname from a URL for display */
export function urlHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
