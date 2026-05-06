import { Card, CardContent } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useDashboardSummary } from "@/api/dashboard"

export function TrendChart() {
  const summary = useDashboardSummary()

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Monthly CO₂ trend</h2>
        <p className="text-sm text-muted-foreground mb-6">Kilograms of CO₂ per month</p>
        <div className="h-72 w-full">
          {summary.isLoading ? (
            <div className="h-full w-full bg-muted/30 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.data?.monthlyTrend ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 8 }}
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, "CO₂"]}
                />
                <Bar dataKey="co2Kg" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
