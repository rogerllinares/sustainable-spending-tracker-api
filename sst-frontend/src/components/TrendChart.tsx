import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useDashboardSummary } from "@/api/dashboard"
import { latestMonthIndex } from "@/lib/utils"

export function TrendChart() {
  const summary = useDashboardSummary()
  const trend = summary.data?.monthlyTrend ?? []
  const currentIdx = latestMonthIndex(trend)

  // Mark the current month on its axis label with a ▸ glyph + bold weight, so
  // the emphasis does not rely on the bar colour alone (DESIGN.md AA rule).
  const currentMonth = trend[currentIdx]?.month
  const renderMonthTick = ({ x, y, payload }: {
    x?: number | string; y?: number | string; payload?: { value?: string }
  }) => {
    // Match on the month value, not the tick index: Recharts re-indexes ticks
    // when it skips labels on narrow widths, so an index compare would mark the
    // wrong month (codex review #23). The bar <Cell> uses the data index safely.
    const isCurrent = payload?.value != null && payload.value === currentMonth
    return (
      <text
        x={x}
        y={y}
        dy={12}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize={11}
        fontWeight={isCurrent ? 700 : 400}
        fill={isCurrent ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
      >
        {isCurrent ? `▸ ${payload?.value}` : payload?.value}
      </text>
    )
  }

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
              <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tick={renderMonthTick} />
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
                <Bar dataKey="co2Kg" radius={[6, 6, 0, 0]}>
                  {trend.map((point, i) => (
                    <Cell
                      key={point.month}
                      fill={i === currentIdx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
