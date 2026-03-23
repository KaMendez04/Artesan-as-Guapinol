import { supabase } from "@/lib/supabase"
import { startOfYear, endOfYear, eachMonthOfInterval, format, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import type { DashboardStats, MonthlySale, TopProduct } from "../types/dashboard.types"

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const start = startOfYear(now)
  const end = endOfYear(now)

  // 1. Obtener Ventas Mensuales (Agrupadas por mes)
  const { data: sales, error: salesError } = await supabase
    .from("Sale")
    .select("subtotal, dateSale")
    .gte("dateSale", start.toISOString())
    .lte("dateSale", end.toISOString())

  if (salesError) throw salesError

  const months = eachMonthOfInterval({ start, end })
  const monthlySales: MonthlySale[] = months.map(month => {
    const monthSales = (sales ?? []).filter(s => isSameMonth(new Date(s.dateSale), month))
    const total = monthSales.reduce((acc, s) => acc + Number(s.subtotal || 0), 0)
    
    return {
      name: format(month, "MMM", { locale: es }),
      sales: total,
      target: 200000 // Valor de ejemplo o configurado
    }
  })

  // 2. Obtener Top Productos (Agrupados por Categoría para consistencia)
  const { data: topCats, error: topError } = await supabase
    .from("SaleLine")
    .select("idCategory, subtotal")
  
  if (topError) throw topError

  const { data: categories } = await supabase.from("Category").select("idCategory, name")
  const catMap = new Map(categories?.map(c => [c.idCategory, c.name]))

  const catTotals = new Map<number, number>()
  topCats?.forEach(line => {
    const current = catTotals.get(line.idCategory) || 0
    catTotals.set(line.idCategory, current + Number(line.subtotal))
  })

  const topProducts: TopProduct[] = Array.from(catTotals.entries())
    .map(([id, total]) => ({
      name: catMap.get(id) || "Otros",
      value: total
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return {
    monthlySales,
    topProducts
  }
}
