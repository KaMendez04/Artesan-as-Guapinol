import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useTheme } from "@/shared/components/theme-provider"
import type { FlowChartPoint } from "../types/reports.types"

interface SalesChartProps {
  data: FlowChartPoint[]
  mode: "week" | "month"
  isLoading?: boolean
}

const fmt = (v: number) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(v)

export function SalesChart({ data, mode, isLoading }: SalesChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : theme === "dark"

  const incomeColor  = isDark ? "#A7D878" : "#6FA36A"
  const expenseColor = isDark ? "#F0A94A" : "#E9A03B"
  const gridColor    = isDark ? "rgba(245,243,236,0.08)" : "rgba(112,140,62,0.12)"
  const tickColor    = isDark ? "rgba(245,243,236,0.45)" : "rgba(46,38,31,0.45)"
  const tooltipBg    = isDark ? "rgba(31,27,23,0.96)" : "rgba(255,252,246,0.98)"
  const tooltipBorder = isDark ? "rgba(245,243,236,0.12)" : "rgba(112,140,62,0.16)"
  const tooltipText  = isDark ? "#F5F3EC" : "#2E261F"

  if (isLoading) {
    return (
      <Card className="h-[260px] animate-pulse rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md">
        <CardHeader className="py-3 px-4">
          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent className="m-4 h-[160px] rounded-xl bg-gray-100 dark:bg-white/5" />
      </Card>
    )
  }

  const hasData = data.some(d => d.income > 0 || d.expenses > 0)

  return (
    <Card className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
          {mode === "week" ? "Esta semana" : "Este mes"}
        </CardTitle>
        <div className="flex items-center gap-4 mt-1">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/45">
            <span className="inline-block size-2.5 rounded-full" style={{ background: incomeColor }} />
            Ingresos
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/45">
            <span className="inline-block size-2.5 rounded-full" style={{ background: expenseColor }} />
            Egresos
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-3">
        {!hasData ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-gray-400 dark:text-white/30">
            Sin datos en este periodo
          </div>
        ) : (
          <div className="h-[200px] sm:h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                barCategoryGap={mode === "week" ? "30%" : "20%"}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: tickColor }}
                  tickFormatter={v => v >= 1000 ? `₡${(v / 1000).toFixed(0)}k` : `₡${v}`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: `1px solid ${tooltipBorder}`,
                    backgroundColor: tooltipBg,
                    color: tooltipText,
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: tickColor, fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: unknown, name: string) => [
                    fmt(Number(value || 0)),
                    name === "income" ? "Ingresos" : "Egresos",
                  ]}
                  labelFormatter={label =>
                    mode === "month" ? label : label
                  }
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
                />
                <Bar
                  dataKey="income"
                  fill={incomeColor}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={mode === "week" ? 28 : 18}
                />
                <Bar
                  dataKey="expenses"
                  fill={expenseColor}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={mode === "week" ? 28 : 18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
