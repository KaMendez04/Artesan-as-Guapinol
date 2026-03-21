import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import type { ChartDataPoint } from "../types/reports.types"

interface SalesChartProps {
  data: ChartDataPoint[]
  mode: "week" | "month"
  isLoading?: boolean
}

export function SalesChart({ data, mode, isLoading }: SalesChartProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(value)

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-4 h-[400px] animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px] bg-muted/20 rounded m-6" />
      </Card>
    )
  }

  return (
    <Card className="col-span-1 lg:col-span-4 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Tendencia de Ventas</CardTitle>
        <CardDescription>
          {mode === "month" ? "Ventas diarias del mes seleccionado" : "Ventas por día de la semana"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => `₡${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "none", 
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" 
                }}
                formatter={(value: any) => [formatCurrency(Number(value || 0)), "Vendido"]}
                labelFormatter={(label) => mode === "month" ? `Día ${label}` : label}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#16a34a"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#16a34a" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
