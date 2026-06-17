import { useRef, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"
import { setAuthToken } from "@/api/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // noValidate is set on the form, so the handler owns all validation and
    // surfaces a single accessible message (audit #4) instead of failing silently.
    if (!name.trim() || !email.trim()) {
      setError("Enter both your name and email to continue.")
      return
    }
    // Defer the email-format gate to the input's native validity (type="email"),
    // so accepted addresses match the browser exactly rather than a hand-rolled regex.
    if (emailRef.current && !emailRef.current.checkValidity()) {
      setError("Enter a valid email address.")
      return
    }
    setError(null)
    const fakeToken = `demo-${Date.now()}`
    const initials = name.trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase()
    // background = green-700 #15803D (the WCAG-AA primary, DESIGN.md sec.1) so the
    // white initials clear 4.5:1, matching the accessible CTA — not the lighter brand-600.
    const picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=15803D&color=fff`
    login(fakeToken, { email: email.trim(), name: name.trim(), picture })
    setAuthToken(fakeToken)
    navigate("/dashboard", { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <span className="text-primary text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sustainable Spending Tracker</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Demo login — enter any name and email to explore the dashboard.
          </p>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="login-name" className="text-xs font-medium text-foreground">Name</label>
            <Input
              id="login-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-xs font-medium text-foreground">Email</label>
            <Input
              ref={emailRef}
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-xs text-destructive" role="alert">{error}</p>
          )}
          <Button type="submit" className="w-full">Enter demo</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          No password, no verification — this is a portfolio demo.
        </p>
      </form>
    </div>
  )
}
