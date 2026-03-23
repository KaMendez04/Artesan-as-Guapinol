import { supabase } from "@/lib/supabase"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import type { SalesReportSummary, ChartDataPoint, CategorySale, ProductSale } from "../types/reports.types"

export async function getSalesReport(date: Date, mode: "month" | "week"): Promise<SalesReportSummary> {
  const now = new Date()
  const start = mode === "month" ? startOfMonth(date) : startOfWeek(date, { weekStartsOn: 1 })
  let end = mode === "month" ? endOfMonth(date) : endOfWeek(date, { weekStartsOn: 1 })

  // Restricción: No ver fechas futuras
  if (isAfter(end, now)) {
    end = now
  }

  // 1. Obtener Ventas básicas para el gráfico y totales
  const { data: sales, error: salesError } = await supabase
    .from("Sale")
    .select("idSale, subtotal, dateSale")
    .gte("dateSale", start.toISOString())
    .lte("dateSale", end.toISOString())
    .order("dateSale", { ascending: true })

  if (salesError) throw salesError

  // 2. Obtener Líneas de Venta para categorías y "productos" (categoría + precio)
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

    // Agrupar por categoría
    const catTotals = new Map<number, number>()
    // Agrupar por "producto" (ahora solo por idCategory siguiendo feedback del usuario)
    const prodTotals = new Map<number, { idCategory: number, qty: number, total: number }>()

    saleLines?.forEach(line => {
      // Categoría
      const currentCatTotal = catTotals.get(line.idCategory) || 0
      catTotals.set(line.idCategory, currentCatTotal + Number(line.subtotal))

      // Producto (Agrupado por Categoría)
      const currentProd = prodTotals.get(line.idCategory) || { 
        idCategory: line.idCategory, 
        qty: 0, 
        total: 0 
      }
      prodTotals.set(line.idCategory, {
        ...currentProd,
        qty: currentProd.qty + Number(line.qty),
        total: currentProd.total + Number(line.subtotal)
      })
    })

    categorySales = Array.from(catTotals.entries()).map(([id, total]) => ({
      idCategory: id,
      name: catMap.get(id) || "Desconocida",
      total
    })).sort((a, b) => b.total - a.total)

    productSales = Array.from(prodTotals.values()).map(p => ({
      idCategory: p.idCategory,
      categoryName: catMap.get(p.idCategory) || "Desconocida",
      unitPrice: 0, // Ya no es un precio único, lo ponemos en 0 o lo manejamos en el UI
      quantity: p.qty,
      total: p.total
    })).sort((a, b) => b.total - a.total)
  }

  // 3. Preparar datos del gráfico (corregido para usar el 'end' real del intervalo si es mes completo o parcial)
  const chartIntervalEnd = mode === "month" ? endOfMonth(date) : endOfWeek(date, { weekStartsOn: 1 })
  const interval = eachDayOfInterval({ start, end: chartIntervalEnd })
  
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
    data: chartData,
    categorySales,
    productSales
  }
}

