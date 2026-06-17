import { describe, it, expect } from 'vitest'
import { cn, latestMonthIndex } from './utils'

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
