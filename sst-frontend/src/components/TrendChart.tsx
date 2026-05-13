import { lazy, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDashboardSummary } from "@/api/dashboard"

const TrendChartContent = lazy(() => import("./TrendChartContent"))

function ChartSkeleton({ message }: { message: string }) {
  return (
    <div className="h-full w-full bg-muted/30 animate-pulse rounded flex items-center justify-center">
      <p className="text-xs text-muted-foreground px-4 text-center" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  )
}

export function TrendChart() {
  const summary = useDashboardSummary()

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Monthly CO₂ trend</h2>
        <p className="text-sm text-muted-foreground mb-6">Kilograms of CO₂ per month</p>
        <div className="h-72 w-full">
          {summary.isLoading ? (
            <ChartSkeleton message="Loading chart… the backend may be cold-starting (~50s on free tier)." />
          ) : summary.isError ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-destructive">Couldn't load the trend.</p>
              <p className="text-xs text-muted-foreground">
                The backend may be cold-starting (free tier). It usually wakes up in ~50 seconds.
              </p>
              <Button variant="outline" size="sm" onClick={() => summary.refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <Suspense fallback={<ChartSkeleton message="Loading chart…" />}>
              <TrendChartContent data={summary.data?.monthlyTrend ?? []} />
            </Suspense>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
