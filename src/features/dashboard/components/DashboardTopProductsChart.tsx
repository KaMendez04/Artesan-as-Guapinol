import { useState } from "react"
import { useTheme } from "@/shared/components/theme-provider"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { TopProduct } from "../types/dashboard.types"

interface DashboardTopProductsChartProps {
  data: TopProduct[]
  isLoading?: boolean
}

const LIGHT_COLORS = ["#708C3E", "#9FE870", "#D9F99D", "#365314", "#BEF264", "#166534", "#064e3b", "#ecfccb"]
const DARK_COLORS = ["#9FE870", "#BEF264", "#D9F99D", "#708C3E", "#A3E635", "#BBF7D0", "#166534", "#064e3b"]

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-[9px] font-bold pointer-events-none"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DashboardTopProductsChart({ data, isLoading }: DashboardTopProductsChartProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { theme } = useTheme()
  const resolvedTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme
  const COLORS = resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-3 rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm h-[420px] flex items-center justify-center">
        <div className="animate-pulse text-[#708C3E] dark:text-[#9FE870] font-medium">Cargando gráfico...</div>
      </Card>
    )
  }

  const hasData = data && data.length > 0
  const chartData = hasData ? [...data].sort((a, b) => b.value - a.value).slice(0, 8) : []

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <Card className="col-span-1 lg:col-span-3 rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm overflow-hidden min-h-[420px]">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Top Categorías</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 flex flex-col items-center">
        <div className="h-[250px] sm:h-[300px] w-full relative min-w-0">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-white/20">
              <p className="text-sm">No hay datos disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={300} height={300}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  innerRadius={0}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onClick={onPieEnter}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={2}
                >
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      style={{ 
                        filter: activeIndex === index ? 'brightness(1.1) saturate(1.2)' : 'none',
                        transition: 'filter 0.3s ease, transform 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
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
                  formatter={(value: number | undefined) => [`₡${(value || 0).toLocaleString("es-CR")}`, "Monto"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dynamic Display Section (Active Item Details) */}
        {hasData && chartData[activeIndex] && (
          <div className="w-full max-w-[280px] -mt-2 mb-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[activeIndex % COLORS.length] }}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/40 truncate max-w-[120px]">
                  {chartData[activeIndex].name}
                </span>
              </div>
              <div className="text-[10px] bg-[#708C3E]/20 text-[#708C3E] dark:bg-[#9FE870]/20 dark:text-[#9FE870] px-2 py-0.5 rounded-full font-bold">
                {((chartData[activeIndex].value / chartData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
              ₡{chartData[activeIndex].value.toLocaleString("es-CR")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
