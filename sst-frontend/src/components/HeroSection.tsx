import { Card, CardContent } from "@/components/ui/card"
import { useDashboardSummary, useCategories } from "@/api/dashboard"
import { computeMonthlyDelta } from "@/lib/utils"
import { EsgBadge } from "./EsgBadge"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Format an ISO "YYYY-MM" as a short English month, avoiding Date() timezone
// pitfalls by indexing the month number directly.
function monthLabel(iso: string): string {
  return MONTH_LABELS[Number(iso.split("-")[1]) - 1] ?? iso
}

export function HeroSection() {
  const summary = useDashboardSummary()
  const categories = useCategories()

  if (summary.isLoading || categories.isLoading) {
    return (
      <div>
        <p className="text-xs text-muted-foreground text-center mb-3" role="status" aria-live="polite">
          Loading summary… the backend may be cold-starting (~50s on free tier).
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2"><CardContent className="h-40 animate-pulse bg-muted/30" /></Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card><CardContent className="h-[72px] animate-pulse bg-muted/30" /></Card>
            <Card><CardContent className="h-[72px] animate-pulse bg-muted/30" /></Card>
          </div>
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
  const delta = computeMonthlyDelta(summary.data.monthlyTrend)

  // Asymmetric layout (DESIGN.md sec.1/sec.6): lead with the primary footprint
  // number, demote the other two — NOT the banned identical-card / hero-metric grid.
  // Label = mono uppercase data label; figures = mono tabular-nums data token.
  const labelCls = "font-mono text-[0.66rem] uppercase tracking-[0.04em] text-muted-foreground"

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Lead: the month's footprint is the subject of the page */}
      <Card className="lg:col-span-2">
        <CardContent className="flex h-full flex-col justify-center p-6 md:p-8">
          <p className={labelCls}>Total CO₂ · last 6 months</p>
          <p className="mt-3 font-mono text-5xl font-bold tabular-nums text-primary md:text-6xl">
            {summary.data.totalCo2Kg.toFixed(1)}
            <span className="ml-2 align-baseline text-xl font-medium text-foreground md:text-2xl">kg</span>
          </p>
          <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">
            Most of it comes from <span className="font-medium text-foreground">{topCategory}</span>.
          </p>
          {delta && delta.direction !== "flat" && (
            <p
              className={`mt-3 font-mono text-sm font-semibold tabular-nums ${
                delta.direction === "down" ? "text-primary" : "text-destructive"
              }`}
            >
              {delta.direction === "down" ? "▼" : "▲"} {delta.pct}% vs {monthLabel(delta.previousMonth)}
            </p>
          )}
          {/* Ground Note: the one warm line, shown only on an improving month —
              motivates, never moralizes (DESIGN.md narrative). */}
          {delta?.direction === "down" && (
            <p className="mt-2 max-w-[60ch] text-sm text-primary">
              A lighter footprint than last month.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Demoted pair: secondary readings stacked beside the lead */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Card>
          <CardContent className="p-4 md:p-5">
            <p className={labelCls}>Average ESG score</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {summary.data.avgEsgScore.toFixed(0)}
              </p>
              <EsgBadge score={summary.data.avgEsgScore} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-5">
            <p className={labelCls}>Top polluting category</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{topCategory}</p>
            {categories.data?.[0] && (
              <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                {categories.data[0].totalCo2Kg.toFixed(1)} kg CO₂
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
