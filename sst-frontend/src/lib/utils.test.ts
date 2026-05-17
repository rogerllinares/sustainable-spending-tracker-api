import { describe, it, expect } from 'vitest'
import { cn } from './utils'

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
