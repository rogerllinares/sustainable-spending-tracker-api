import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { useEffect } from 'react'

function LoginScreen() {
  return <div>login screen</div>
}

function DashboardScreen() {
  return <div>dashboard</div>
}

/**
 * Logs in and navigates to /dashboard after auth state is set.
 * This simulates what the real login flow does: set token then redirect.
 */
function AutoLoginAndRedirect() {
  const { login } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    login('tok', { email: 'a@b.com', name: 'R', picture: 'p' })
    navigate('/dashboard')
  }, [login, navigate])
  return null
}

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardScreen />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )
    expect(screen.getByText('login screen')).toBeInTheDocument()
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <>
                  <LoginScreen />
                  <AutoLoginAndRedirect />
                </>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardScreen />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )
    // After AutoLoginAndRedirect fires: login() sets token, navigate('/dashboard') triggers re-render
    await waitFor(() => expect(screen.getByText('dashboard')).toBeInTheDocument())
  })
})
