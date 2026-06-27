import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { PieLabelRenderProps } from "recharts"
import { useTheme } from "@/shared/components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { CategorySale } from "../types/reports.types"

interface CategoryChartProps {
  data: CategorySale[]
  isLoading?: boolean
}

const LIGHT_COLORS = ["#8FC46A", "#E9A03B", "#6FA36A", "#CF7534", "#D9C897", "#9C543F", "#F0E4C6", "#304E33"]
const DARK_COLORS = ["#A7D878", "#F0A94A", "#8FBF8C", "#D47A3A", "#E6D8B5", "#B06A4C", "#F1E8CD", "#5F8E61"]

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {
  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.58;
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);
  const labelPercent = Number(percent ?? 0);

  if (labelPercent < 0.08) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-[9px] font-semibold pointer-events-none"
    >
      {`${(labelPercent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryChart({ data, isLoading }: CategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { theme } = useTheme()
  const resolvedTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme
  const isDark = resolvedTheme === "dark"
  const COLORS = resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS
  const textColor = isDark ? "#F5F3EC" : "#2E261F"
  const mutedTextColor = isDark ? "rgba(245,243,236,0.58)" : "rgba(46,38,31,0.56)"
  const tooltipBackground = isDark ? "rgba(31, 27, 23, 0.96)" : "rgba(255, 252, 246, 0.98)"
  const tooltipBorder = isDark ? "rgba(245,243,236,0.12)" : "rgba(112,140,62,0.16)"

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-3 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md h-[350px] flex items-center justify-center">
        <div className="animate-pulse text-[#708C3E] dark:text-[#B8D99A] font-medium">Cargando gráfico...</div>
      </Card>
    )
  }

  const hasData = data && data.length > 0
  const chartData = hasData ? data.map(item => ({
    name: item.name,
    value: item.total
  })).sort((a, b) => b.value - a.value).slice(0, 8) : []

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index)
  }

  return (
    <Card className="col-span-1 lg:col-span-3 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden min-h-[420px]">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold text-[#2E261F] dark:text-[#F5F3EC]">
          Categorías que más venden
        </CardTitle>
        <p className="text-xs text-gray-500 dark:text-white/45">
          Distribución del dinero vendido.
        </p>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 flex flex-col items-center">
        <div className="h-[250px] sm:h-[300px] w-full relative min-w-0">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center text-[#2E261F]/45 dark:text-[#F5F3EC]/30">
              <p className="text-sm">No hay ventas en este periodo</p>
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
                  outerRadius={94}
                  innerRadius={58}
                  paddingAngle={2}
                  cornerRadius={8}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onClick={onPieEnter}
                  stroke={isDark ? "var(--background)" : "var(--background)"}
                  strokeWidth={4}
                >
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      style={{ 
                        filter: activeIndex === index ? "brightness(1.04) saturate(1.04)" : "none",
                        opacity: activeIndex === index ? 1 : 0.86,
                        transition: "filter 0.3s ease, opacity 0.3s ease"
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: `1px solid ${tooltipBorder}`, 
                    boxShadow: "0 12px 30px -18px rgb(46 38 31 / 0.45)",
                    backgroundColor: tooltipBackground,
                    color: textColor,
                    fontSize: "12px",
                    padding: "10px 12px"
                  }}
                  labelStyle={{ color: mutedTextColor, fontWeight: 600 }}
                  itemStyle={{ color: COLORS[activeIndex % COLORS.length], fontWeight: 700 }}
                  formatter={(value: number | undefined) => [`₡${(value || 0).toLocaleString("es-CR")}`, "Total"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dynamic Display Section (Active Item Details) */}
        {hasData && chartData[activeIndex] && (
          <div className="w-full max-w-[280px] -mt-2 mb-4 p-4 rounded-xl bg-background border border-[#708C3E]/10 dark:border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div 
                  className="h-2.5 w-2.5 shrink-0 rounded-full" 
                  style={{ backgroundColor: COLORS[activeIndex % COLORS.length] }}
                />
                <span className="truncate text-xs font-semibold text-[#2E261F]/60 dark:text-[#F5F3EC]/55 max-w-[130px]">
                  {chartData[activeIndex].name}
                </span>
              </div>
              <div className="text-[10px] bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#B8D99A]/15 dark:text-[#B8D99A] px-2 py-0.5 rounded-full font-semibold">
                {((chartData[activeIndex].value / chartData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-[#2E261F] dark:text-[#F5F3EC]">
              ₡{chartData[activeIndex].value.toLocaleString("es-CR")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
