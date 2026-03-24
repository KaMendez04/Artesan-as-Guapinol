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

  const primaryColor = resolvedTheme === "dark" ? "#9FE870" : "#708C3E"

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(value)

  const filteredData = data.filter(d => d.total > 0)
  const chartData = filteredData.length > 0 ? filteredData : data.slice(-7) // Fallback to last 7 if empty

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-4 h-[250px] sm:h-[300px] animate-pulse rounded-2xl border-gray-100 bg-white/50 dark:border-white/5 dark:bg-black/20">
        <CardHeader className="py-3 px-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded" />
        </CardHeader>
        <CardContent className="h-[150px] sm:h-[200px] bg-gray-100 dark:bg-white/5 rounded-xl m-4" />
      </Card>
    )
  }

  return (
    <Card className="col-span-1 lg:col-span-4 transition-all duration-300 hover:shadow-lg rounded-2xl border-gray-100 bg-white dark:border-white/10 dark:bg-black/30 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Tendencia de Ventas</CardTitle>
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
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-white/5" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "currentColor" }}
                className="text-gray-400 dark:text-white/40"
                dy={5}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "currentColor" }}
                className="text-gray-400 dark:text-white/40"
                tickFormatter={(value) => `₡${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  backgroundColor: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 8px 16px -4px rgb(0 0 0 / 0.4)",
                  color: "#fff",
                  fontSize: "11px",
                  padding: "8px"
                }}
                itemStyle={{ color: primaryColor, padding: 0 }}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                cursor={{ stroke: primaryColor, strokeWidth: 1.5, strokeDasharray: "4 4" }}
                formatter={(value: any) => [formatCurrency(Number(value || 0)), "Venta"]}
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
