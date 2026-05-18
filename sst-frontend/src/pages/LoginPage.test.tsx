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

  it('navigates to /dashboard after submitting valid credentials', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByPlaceholderText('Your name'), 'Roger')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'roger@example.com')
    await user.click(screen.getByRole('button', { name: /enter demo/i }))
    expect(await screen.findByText('dashboard reached')).toBeInTheDocument()
  })
})
