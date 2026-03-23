import { useTheme } from "@/shared/components/theme-provider"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { MonthlySale } from "../types/dashboard.types"

interface DashboardSalesChartProps {
  data: MonthlySale[]
  isLoading?: boolean
}

export function DashboardSalesChart({ data, isLoading }: DashboardSalesChartProps) {
  const { theme } = useTheme()
  const resolvedTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme

  const primaryColor = resolvedTheme === "dark" ? "#9FE870" : "#708C3E"

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-4 rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm h-[400px] animate-pulse">
        <CardHeader><div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded" /></CardHeader>
        <CardContent className="h-[300px] bg-gray-100 dark:bg-white/5 rounded-2xl m-4" />
      </Card>
    )
  }

  return (
    <Card className="col-span-1 lg:col-span-4 rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm overflow-hidden min-h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Ventas Mensuales</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 pb-4">
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={320} debounce={100}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={resolvedTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
              />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "currentColor" }} 
                className="text-gray-400 dark:text-white/40"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "currentColor" }} 
                className="text-gray-400 dark:text-white/40"
                tickFormatter={(value) => `₡${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  borderRadius: "16px", 
                  border: "none", 
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  backgroundColor: "rgba(0,0,0,0.85)",
                  color: "#fff",
                  fontSize: "12px",
                  backdropFilter: "blur(4px)"
                }}
                itemStyle={{ color: "#9FE870" }}
                formatter={(value: number | undefined) => [`₡${(value || 0).toLocaleString("es-CR")}`, "Total"]}
              />
              <Bar 
                dataKey="sales" 
                fill={primaryColor} 
                radius={[6, 6, 0, 0]} 
                barSize={20} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
