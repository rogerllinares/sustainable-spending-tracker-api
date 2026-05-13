import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type TrendChartDatum = { month: string; co2Kg: number }

export default function TrendChartContent({ data }: { data: TrendChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 8 }}
          formatter={(value) => [`${Number(value).toFixed(1)} kg`, "CO₂"]}
        />
        <Bar dataKey="co2Kg" fill="#16A34A" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
