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
