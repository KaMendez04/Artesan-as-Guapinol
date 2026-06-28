import { supabase } from "@/lib/supabase"
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isAfter
} from "date-fns"
import { es } from "date-fns/locale"
import type { FlowReportSummary, FlowChartPoint, CategorySale, ProductSale } from "../types/reports.types"

export async function getFlowReport(date: Date, mode: "month" | "week"): Promise<FlowReportSummary> {
  const now = new Date()
  const start = mode === "month" ? startOfMonth(date) : startOfWeek(date, { weekStartsOn: 1 })
  let end = mode === "month" ? endOfMonth(date) : endOfWeek(date, { weekStartsOn: 1 })
  if (isAfter(end, now)) end = now

  const startStr = format(start, "yyyy-MM-dd")
  const endStr = format(end, "yyyy-MM-dd")

  // Ventas e ingresos
  const { data: sales, error: salesError } = await supabase
    .from("Sale")
    .select("idSale, subtotal, dateSale")
    .gte("dateSale", start.toISOString())
    .lte("dateSale", end.toISOString())
    .order("dateSale", { ascending: true })
  if (salesError) throw salesError

  // Compras / egresos
  const { data: purchases } = await supabase
    .from("Compras")
    .select("monto, fecha")
    .gte("fecha", startStr)
    .lte("fecha", endStr)

  // Líneas de venta para categorías y productos
  const saleIds = (sales ?? []).map(s => s.idSale)
  let categorySales: CategorySale[] = []
  let productSales: ProductSale[] = []

  if (saleIds.length > 0) {
    const { data: saleLines, error: linesError } = await supabase
      .from("SaleLine")
      .select("idCategory, qty, unitPrice, subtotal")
      .in("idSale", saleIds)
    if (linesError) throw linesError

    const { data: categories, error: catError } = await supabase
      .from("Category")
      .select("idCategory, name")
    if (catError) throw catError

    const catMap = new Map(categories?.map(c => [c.idCategory, c.name || "Sin nombre"]))
    const catTotals = new Map<number, number>()
    const prodTotals = new Map<number, { idCategory: number; qty: number; total: number }>()

    saleLines?.forEach(line => {
      catTotals.set(line.idCategory, (catTotals.get(line.idCategory) || 0) + Number(line.subtotal))
      const cur = prodTotals.get(line.idCategory) ?? { idCategory: line.idCategory, qty: 0, total: 0 }
      prodTotals.set(line.idCategory, { ...cur, qty: cur.qty + Number(line.qty), total: cur.total + Number(line.subtotal) })
    })

    categorySales = Array.from(catTotals.entries())
      .map(([id, total]) => ({ idCategory: id, name: catMap.get(id) || "Desconocida", total }))
      .sort((a, b) => b.total - a.total)

    productSales = Array.from(prodTotals.values())
      .map(p => ({ idCategory: p.idCategory, categoryName: catMap.get(p.idCategory) || "Desconocida", unitPrice: 0, quantity: p.qty, total: p.total }))
      .sort((a, b) => b.total - a.total)
  }

  // Datos del gráfico
  const chartIntervalEnd = mode === "month" ? endOfMonth(date) : endOfWeek(date, { weekStartsOn: 1 })
  const interval = eachDayOfInterval({ start, end: chartIntervalEnd })

  const dailyData: FlowChartPoint[] = interval.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    const label = mode === "month" ? format(day, "d") : format(day, "EEE", { locale: es })

    const dayIncome = (sales ?? [])
      .filter(s => isSameDay(new Date(s.dateSale), day))
      .reduce((acc, s) => acc + Number(s.subtotal || 0), 0)

    const dayExpenses = (purchases ?? [])
      .filter(p => p.fecha === dateStr)
      .reduce((acc, p) => acc + Number(p.monto || 0), 0)

    return { label, fullDate: dateStr, income: dayIncome, expenses: dayExpenses }
  })

  // Para modo mes: agrupar por semana para legibilidad
  let chartData: FlowChartPoint[]
  if (mode === "month") {
    const weeks: FlowChartPoint[] = []
    for (let i = 0; i < dailyData.length; i += 7) {
      const chunk = dailyData.slice(i, i + 7)
      weeks.push({
        label: `Sem ${Math.floor(i / 7) + 1}`,
        fullDate: chunk[0]?.fullDate ?? "",
        income: chunk.reduce((s, d) => s + d.income, 0),
        expenses: chunk.reduce((s, d) => s + d.expenses, 0),
      })
    }
    chartData = weeks
  } else {
    chartData = dailyData
  }

  const totalIncome = (sales ?? []).reduce((acc, s) => acc + Number(s.subtotal || 0), 0)
  const totalExpenses = (purchases ?? []).reduce((acc, p) => acc + Number(p.monto || 0), 0)
  const saleCount = sales?.length || 0

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    averageSale: saleCount > 0 ? totalIncome / saleCount : 0,
    saleCount,
    chartData,
    categorySales,
    productSales,
  }
}
