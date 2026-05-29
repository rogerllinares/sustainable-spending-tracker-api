import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { LoginPage } from './LoginPage'

function DashboardScreen() {
  return <div>dashboard reached</div>
}

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('LoginPage', () => {
  it('renders the form', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter demo/i })).toBeInTheDocument()
  })

  it('exposes accessible labels for both inputs (WCAG 1.3.1/4.1.2)', () => {
    renderLogin()
    // getByLabelText only resolves when an associated <label htmlFor> exists.
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('shows an accessible error instead of failing silently on empty submit', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: /enter demo/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/name and email/i)
  })

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText(/name/i), 'Roger')
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /enter demo/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i)
    expect(screen.queryByText('dashboard reached')).not.toBeInTheDocument()
  })

  it('navigates to /dashboard after submitting valid credentials', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText(/name/i), 'Roger')
    await user.type(screen.getByLabelText(/email/i), 'roger@example.com')
    await user.click(screen.getByRole('button', { name: /enter demo/i }))
    expect(await screen.findByText('dashboard reached')).toBeInTheDocument()
  })
})
