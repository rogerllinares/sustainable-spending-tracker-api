import { useAuth } from "@/auth/AuthContext"
import { setAuthToken } from "@/api/client"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/HeroSection"
import { TrendChart } from "@/components/TrendChart"
import { TransactionsTable } from "@/components/TransactionsTable"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useNavigate } from "react-router-dom"

export function DashboardPage() {
  const { name, picture, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setAuthToken(null)
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <h1 className="text-xl font-semibold text-foreground">Sustainable Spending Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            {picture && <img src={picture} alt={name ?? ""} className="h-8 w-8 rounded-full" />}
            <span className="text-sm text-foreground">{name}</span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 space-y-6">
        <HeroSection />
        <TrendChart />
        <TransactionsTable />
      </main>
    </div>
  )
}
