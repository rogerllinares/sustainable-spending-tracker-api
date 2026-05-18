import { useState, type FormEvent } from "react"
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    const fakeToken = `demo-${Date.now()}`
    const initials = name.trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase()
    const picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16A34A&color=fff`
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
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">Enter demo</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          No password, no verification — this is a portfolio demo.
        </p>
      </form>
    </div>
  )
}
