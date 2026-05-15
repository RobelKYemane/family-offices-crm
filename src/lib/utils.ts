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

/** Format a USD number with B/M/K suffix. Alias of formatAum for semantic clarity. */
export function formatUsd(usd: number | null): string {
  return formatAum(usd)
}

/**
 * Format a partial ISO date string.
 * '2024'       → '2024'
 * '2024-05'    → 'May 2024'
 * '2024-05-15' → 'May 15, 2024'
 */
export function formatDate(s: string | null): string {
  if (!s) return '—'
  const parts = s.split('-')
  if (parts.length === 1) return parts[0] // YYYY only
  try {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const monthIdx = parseInt(parts[1], 10) - 1
    const month = monthNames[monthIdx] ?? '?'
    if (parts.length === 2) return `${month} ${parts[0]}`
    return `${month} ${parseInt(parts[2], 10)}, ${parts[0]}`
  } catch {
    return s
  }
}

/**
 * Parse a partial date string to a JS Date for comparison.
 * Treats 'YYYY' as Jan 1 of that year, 'YYYY-MM' as the 1st of that month.
 * Returns null if unparseable.
 */
export function parseDateLoose(s: string | null): Date | null {
  if (!s) return null
  const parts = s.split('-')
  try {
    const year = parseInt(parts[0], 10)
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0
    const day = parts[2] ? parseInt(parts[2], 10) : 1
    const d = new Date(year, month, day)
    if (isNaN(d.getTime())) return null
    return d
  } catch {
    return null
  }
}
