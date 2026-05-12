import { Card, CardContent } from "@/components/ui/card"
import { useDashboardSummary, useCategories } from "@/api/dashboard"
import { EsgBadge } from "./EsgBadge"

export function HeroSection() {
  const summary = useDashboardSummary()
  const categories = useCategories()

  if (summary.isLoading || categories.isLoading) {
    return (
      <div>
        <p className="text-xs text-muted-foreground text-center mb-3" role="status" aria-live="polite">
          Loading summary… the backend may be cold-starting (~50s on free tier).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}><CardContent className="h-32 animate-pulse bg-muted/30" /></Card>
          ))}
        </div>
      </div>
    )
  }
  if (summary.isError || !summary.data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 flex items-center justify-between gap-4">
        <p className="text-sm text-destructive">Failed to load summary.</p>
        <button
          onClick={() => { summary.refetch(); categories.refetch(); }}
          className="px-3 py-1.5 text-sm rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  const topCategory = categories.data?.[0]?.category ?? "—"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Total CO₂ (last 6 months)</p>
          <p className="text-4xl font-bold text-primary mt-2">
            {summary.data.totalCo2Kg.toFixed(1)} <span className="text-lg font-medium text-foreground">kg</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Average ESG score</p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-4xl font-bold text-foreground">
              {summary.data.avgEsgScore.toFixed(0)}
            </p>
            <EsgBadge score={summary.data.avgEsgScore} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Top polluting category</p>
          <p className="text-2xl font-semibold text-foreground mt-2">{topCategory}</p>
          {categories.data?.[0] && (
            <p className="text-xs text-muted-foreground mt-1">
              {categories.data[0].totalCo2Kg.toFixed(1)} kg CO₂
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
