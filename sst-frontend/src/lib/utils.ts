import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MonthlyTrendPoint } from "@/api/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Index of the most recent month in a trend series, or -1 when empty.
 * Compares the ISO "YYYY-MM" strings directly — they sort lexicographically —
 * so the result is correct even if the backend returns the series unsorted.
 */
export function latestMonthIndex(trend: readonly MonthlyTrendPoint[]): number {
  let maxIdx = -1
  for (let i = 0; i < trend.length; i++) {
    if (maxIdx === -1 || trend[i].month > trend[maxIdx].month) maxIdx = i
  }
  return maxIdx
}

export interface MonthlyDelta {
  /** Absolute, rounded percentage change vs the previous month. */
  pct: number
  /** "down" = less CO₂ than last month (the good direction). */
  direction: "down" | "up" | "flat"
  /** ISO "YYYY-MM" of the comparison period. */
  previousMonth: string
}

/**
 * Month-over-month change of the latest vs the previous month.
 * Returns null when there is no defined comparison: fewer than two months, or a
 * zero previous value (the percentage would be infinite). Sorts by ISO month so
 * the "latest two" are correct even if the series arrives unsorted.
 */
export function computeMonthlyDelta(trend: readonly MonthlyTrendPoint[]): MonthlyDelta | null {
  if (trend.length < 2) return null
  const sorted = [...trend].sort((a, b) => a.month.localeCompare(b.month))
  const current = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]
  if (previous.co2Kg === 0) return null
  const change = ((current.co2Kg - previous.co2Kg) / previous.co2Kg) * 100
  const pct = Math.round(Math.abs(change))
  const direction = pct === 0 ? "flat" : change < 0 ? "down" : "up"
  return { pct, direction, previousMonth: previous.month }
}
