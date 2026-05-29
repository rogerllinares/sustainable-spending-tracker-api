import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useDashboardSummary } from "@/api/dashboard"

export function TrendChart() {
  const summary = useDashboardSummary()

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-1">Monthly CO₂ trend</h2>
        <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">Kilograms of CO₂ per month</p>
        <div className="h-56 md:h-72 w-full">
          {summary.isLoading ? (
            <div className="h-full w-full bg-muted/30 animate-pulse rounded flex items-center justify-center">
              <p className="text-xs text-muted-foreground px-4 text-center" role="status" aria-live="polite">
                Loading chart… the backend may be cold-starting (~50s on free tier).
              </p>
            </div>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.data?.monthlyTrend ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tick={{ fontFamily: "ui-monospace, monospace" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tick={{ fontFamily: "ui-monospace, monospace" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  formatter={(value) => [`${Number(value).toFixed(1)} kg`, "CO₂"]}
                />
                <Bar dataKey="co2Kg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
