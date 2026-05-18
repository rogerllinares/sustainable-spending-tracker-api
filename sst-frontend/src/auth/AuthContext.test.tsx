import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

describe('AuthProvider', () => {
  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
  })

  it('login sets token + profile and flips isAuthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('tok-123', { email: 'a@b.com', name: 'Roger', picture: 'p.png' })
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('tok-123')
    expect(result.current.email).toBe('a@b.com')
    expect(result.current.name).toBe('Roger')
  })

  it('logout clears state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('tok', { email: 'a@b.com', name: 'R', picture: 'p' })
    })
    act(() => {
      result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
    expect(result.current.email).toBeNull()
  })
})
