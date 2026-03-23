import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { CategorySale } from "../types/reports.types"

interface CategoryChartProps {
  data: CategorySale[]
  isLoading?: boolean
}

const COLORS = ["#708C3E", "#9FE870", "#D9F99D", "#365314", "#BEF264", "#166534"]

export function CategoryChart({ data, isLoading }: CategoryChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-3 rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm h-[350px] flex items-center justify-center">
        <div className="animate-pulse text-[#708C3E] dark:text-[#9FE870] font-medium">Cargando gráfico...</div>
      </Card>
    )
  }

  const hasData = data && data.length > 0
  const chartData = hasData ? data.map(item => ({
    name: item.name,
    total: item.total
  })).sort((a, b) => b.total - a.total).slice(0, 8) : []

  return (
    <Card className="col-span-1 lg:col-span-3 rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Ventas por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full mt-2">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-white/20">
              <p className="text-sm">No hay ventas en este periodo</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-gray-600 dark:text-white/60"
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    color: "#111"
                  }}
                  itemStyle={{ color: "#111" }}
                  formatter={(value: number | undefined) => [`₡${(value || 0).toLocaleString("es-CR")}`, "Total"]}
                />
                <Bar 
                  dataKey="total" 
                  radius={[0, 10, 10, 0]}
                  barSize={20}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

