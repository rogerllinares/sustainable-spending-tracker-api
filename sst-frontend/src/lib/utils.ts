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
