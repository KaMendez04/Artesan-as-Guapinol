import { supabase } from "@/lib/supabase"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import type { SalesReportSummary, ChartDataPoint } from "../types/reports.types"

export async function getSalesReport(date: Date, mode: "month" | "week"): Promise<SalesReportSummary> {
  const start = mode === "month" ? startOfMonth(date) : startOfWeek(date, { weekStartsOn: 1 })
  const end = mode === "month" ? endOfMonth(date) : endOfWeek(date, { weekStartsOn: 1 })

  const { data: sales, error } = await supabase
    .from("Sale")
    .select("subtotal, dateSale")
    .gte("dateSale", start.toISOString())
    .lte("dateSale", end.toISOString())
    .order("dateSale", { ascending: true })

  if (error) throw error

  const interval = eachDayOfInterval({ start, end })
  
  const chartData: ChartDataPoint[] = interval.map((day) => {
    const daySales = (sales ?? []).filter((sale) => 
      isSameDay(new Date(sale.dateSale), day)
    )
    
    const dayTotal = daySales.reduce((acc, sale) => acc + Number(sale.subtotal || 0), 0)
    
    return {
      label: mode === "month" ? format(day, "d") : format(day, "EEEE", { locale: es }),
      fullDate: format(day, "yyyy-MM-dd"),
      total: dayTotal
    }
  })

  const totalSales = (sales ?? []).reduce((acc, sale) => acc + Number(sale.subtotal || 0), 0)
  const maxSale = chartData.length > 0 ? Math.max(...chartData.map(d => d.total)) : 0
  const saleCount = sales?.length || 0
  const averageSale = saleCount > 0 ? totalSales / saleCount : 0

  return {
    totalSales,
    averageSale,
    maxSale,
    saleCount,
    data: chartData
  }
}
