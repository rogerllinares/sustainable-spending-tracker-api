import { Card, CardContent } from "@/components/ui/card"
import { useDashboardSummary, useCategories } from "@/api/dashboard"
import { EsgBadge } from "./EsgBadge"

export function HeroSection() {
  const summary = useDashboardSummary()
  const categories = useCategories()

  if (summary.isLoading || categories.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}><CardContent className="h-32 animate-pulse bg-muted/30" /></Card>
        ))}
      </div>
    )
  }
  if (summary.isError || !summary.data) {
    return <div className="text-destructive">Failed to load summary.</div>
  }

  const topCategory = categories.data?.[0]?.category ?? "—"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Total CO₂ (last 6 months)</p>
          <p className="text-4xl font-bold text-primary mt-2">
            {summary.data.totalCo2Kg.toFixed(1)} <span className="text-lg font-medium">kg</span>
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
