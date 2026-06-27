import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useTheme } from "@/shared/components/theme-provider"
import type { ChartDataPoint } from "../types/reports.types"

interface SalesChartProps {
  data: ChartDataPoint[]
  mode: "week" | "month"
  isLoading?: boolean
}

export function SalesChart({ data, mode, isLoading }: SalesChartProps) {
  const { theme } = useTheme()
  const resolvedTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme

  const isDark = resolvedTheme === "dark"
  const primaryColor = isDark ? "#A7D878" : "#6FA36A"
  const textColor = isDark ? "#F5F3EC" : "#2E261F"
  const mutedTextColor = isDark ? "rgba(245,243,236,0.58)" : "rgba(46,38,31,0.56)"
  const gridColor = isDark ? "rgba(245,243,236,0.08)" : "rgba(112,140,62,0.12)"
  const tooltipBackground = isDark ? "rgba(31, 27, 23, 0.96)" : "rgba(255, 252, 246, 0.98)"
  const tooltipBorder = isDark ? "rgba(245,243,236,0.12)" : "rgba(112,140,62,0.16)"

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(value)

  const filteredData = data.filter(d => d.total > 0)
  const chartData = filteredData.length > 0 ? filteredData : data.slice(-7) // Fallback to last 7 if empty

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-4 h-[250px] sm:h-[300px] animate-pulse rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md">
        <CardHeader className="py-3 px-4">
          <div className="h-5 w-32 bg-[#E7E0D4] dark:bg-white/10 rounded" />
        </CardHeader>
        <CardContent className="h-[150px] sm:h-[200px] bg-[#F1EBDD] dark:bg-white/5 rounded-xl m-4" />
      </Card>
    )
  }

  return (
    <Card className="col-span-1 lg:col-span-4 transition-all duration-300 hover:shadow-md rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-semibold text-[#2E261F] dark:text-[#F5F3EC]">
          Ventas por día
        </CardTitle>
        <p className="text-xs text-gray-500 dark:text-white/45">
          Monto vendido en el periodo seleccionado.
        </p>
      </CardHeader>
      <CardContent className="px-0 sm:px-2 pb-2">
        <div className="h-[200px] sm:h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              width={500}
              height={280}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: mutedTextColor }}
                dy={5}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: mutedTextColor }}
                tickFormatter={(value) => `₡${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: `1px solid ${tooltipBorder}`,
                  backgroundColor: tooltipBackground,
                  boxShadow: "0 12px 30px -18px rgb(46 38 31 / 0.45)",
                  color: textColor,
                  fontSize: "11px",
                  padding: "8px"
                }}
                itemStyle={{ color: primaryColor, padding: 0, fontWeight: 700 }}
                labelStyle={{ color: mutedTextColor, fontWeight: 600, marginBottom: "4px" }}
                cursor={{ stroke: primaryColor, strokeWidth: 1.5, strokeDasharray: "4 4" }}
                formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Venta"]}
                labelFormatter={(label) => mode === "month" ? `Día ${label}` : label}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke={primaryColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotal)"
                activeDot={{ r: 5, strokeWidth: 0, fill: primaryColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
