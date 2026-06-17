import { describe, it, expect } from 'vitest'
import { cn, latestMonthIndex, computeMonthlyDelta } from './utils'

describe('computeMonthlyDelta', () => {
  it('returns null with fewer than two months', () => {
    expect(computeMonthlyDelta([])).toBeNull()
    expect(computeMonthlyDelta([{ month: '2026-04', co2Kg: 12 }])).toBeNull()
  })

  it('reports a decrease as an improvement (down)', () => {
    const d = computeMonthlyDelta([
      { month: '2026-03', co2Kg: 100 },
      { month: '2026-04', co2Kg: 88 },
    ])
    expect(d).toEqual({ pct: 12, direction: 'down', previousMonth: '2026-03' })
  })

  it('reports an increase as a regression (up)', () => {
    const d = computeMonthlyDelta([
      { month: '2026-03', co2Kg: 100 },
      { month: '2026-04', co2Kg: 125 },
    ])
    expect(d).toEqual({ pct: 25, direction: 'up', previousMonth: '2026-03' })
  })

  it('reports an unchanged month as flat (0%)', () => {
    const d = computeMonthlyDelta([
      { month: '2026-03', co2Kg: 50 },
      { month: '2026-04', co2Kg: 50 },
    ])
    expect(d).toEqual({ pct: 0, direction: 'flat', previousMonth: '2026-03' })
  })

  it('uses the two most recent months even when unsorted', () => {
    const d = computeMonthlyDelta([
      { month: '2026-04', co2Kg: 80 },
      { month: '2026-01', co2Kg: 10 },
      { month: '2026-03', co2Kg: 100 },
    ])
    expect(d).toEqual({ pct: 20, direction: 'down', previousMonth: '2026-03' })
  })

  it('returns null when the previous month is zero (no defined % change)', () => {
    expect(computeMonthlyDelta([
      { month: '2026-03', co2Kg: 0 },
      { month: '2026-04', co2Kg: 12 },
    ])).toBeNull()
  })
})

describe('latestMonthIndex', () => {
  it('returns -1 for an empty series', () => {
    expect(latestMonthIndex([])).toBe(-1)
  })

  it('returns 0 for a single point', () => {
    expect(latestMonthIndex([{ month: '2026-04', co2Kg: 12 }])).toBe(0)
  })

  it('returns the last index when months are in ascending order', () => {
    const trend = [
      { month: '2026-02', co2Kg: 10 },
      { month: '2026-03', co2Kg: 11 },
      { month: '2026-04', co2Kg: 9 },
    ]
    expect(latestMonthIndex(trend)).toBe(2)
  })

  it('finds the most recent month even when the series is unsorted', () => {
    const trend = [
      { month: '2026-04', co2Kg: 9 },
      { month: '2026-01', co2Kg: 8 },
      { month: '2026-03', co2Kg: 11 },
    ]
    expect(latestMonthIndex(trend)).toBe(0)
  })
})

describe('cn', () => {
  it('joins multiple class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', (false as boolean) && 'b', null, undefined, 'c')).toBe('a c')
  })

  it('merges conflicting tailwind classes keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
