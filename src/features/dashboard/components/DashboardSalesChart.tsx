import { useTheme } from "@/shared/components/theme-provider"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { MonthlySale } from "../types/dashboard.types"

interface DashboardSalesChartProps {
  data: MonthlySale[]
  isLoading?: boolean
}

export function DashboardSalesChart({
  data,
  isLoading,
}: DashboardSalesChartProps) {
  const { theme } = useTheme()
  const resolvedTheme =
    theme === "system" && typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme === "system"
        ? "light"
      : theme

  const isDark = resolvedTheme === "dark"
  const chartPalette = isDark
    ? ["#A7D878", "#8FBF8C", "#D5D0C4", "#6FA36A", "#E7A55A", "#78A96B"]
    : ["#8FC46A", "#6FA36A", "#C8C1B4", "#A7C878", "#D99045", "#789E5F"]
  const primaryColor = isDark ? "#A7D878" : "#6FA36A"
  const textColor = isDark ? "#F5F3EC" : "#2E261F"
  const mutedTextColor = isDark ? "rgba(245,243,236,0.58)" : "rgba(46,38,31,0.56)"
  const gridColor = isDark ? "rgba(245,243,236,0.08)" : "rgba(112,140,62,0.12)"
  const tooltipBackground = isDark ? "rgba(24, 24, 27, 0.96)" : "rgba(255, 252, 246, 0.98)"
  const tooltipBorder = isDark ? "rgba(245,243,236,0.12)" : "rgba(112,140,62,0.16)"

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-4 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm h-[400px] animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 rounded bg-[#E7E0D4] dark:bg-white/10" />
        </CardHeader>
        <CardContent className="m-4 h-[300px] rounded-xl bg-[#F1EBDD] dark:bg-white/5" />
      </Card>
    )
  }

  return (
    <Card className="col-span-1 lg:col-span-4 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm overflow-hidden min-h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#2E261F] dark:text-[#F5F3EC]">
          Ventas Mensuales
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 sm:px-4 pb-5">
        <div className="w-full min-w-0 h-[250px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {chartPalette.map((color, index) => (
                  <linearGradient
                    key={color}
                    id={`monthlySalesGradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.62} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="4 6"
                vertical={false}
                stroke={gridColor}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: mutedTextColor }}
                dy={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: mutedTextColor }}
                tickFormatter={(value) =>
                  `₡${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                }
              />

              <Tooltip
                cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(112,140,62,0.08)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: `1px solid ${tooltipBorder}`,
                  boxShadow: "0 12px 30px -18px rgb(46 38 31 / 0.45)",
                  backgroundColor: tooltipBackground,
                  color: textColor,
                  fontSize: "12px",
                  padding: "10px 12px",
                }}
                labelStyle={{ color: mutedTextColor, fontWeight: 600 }}
                itemStyle={{ color: primaryColor, fontWeight: 700 }}
                formatter={(value: number | undefined) => [
                  `₡${(value || 0).toLocaleString("es-CR")}`,
                  "Total",
                ]}
              />

              <Bar
                dataKey="sales"
                radius={[8, 8, 2, 2]}
                barSize={22}
                animationDuration={400}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`monthly-sale-${index}`}
                    fill={`url(#monthlySalesGradient-${index % chartPalette.length})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
