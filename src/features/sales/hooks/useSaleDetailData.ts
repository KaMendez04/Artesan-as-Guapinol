import { useMemo, useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { getCategories } from "@/features/catalog/services/category.service"
import { listUniquePricesByCategory } from "../services/productPrice.service"
import { useSale } from "./useSale"
import { useSaleLines } from "./useSaleLine"
import { usePlaces } from "./usePlace"
import type { Category } from "../types/sale.types"

const ITEMS_PER_PAGE = 6

export function useSaleDetailData() {
  const { idSale = "" } = useParams()
  const queryClient = useQueryClient()
  
  const { data: places = [] } = usePlaces()
  const { data: sale } = useSale(idSale)
  const { data: lines = [] } = useSaleLines(idSale)
  
  const [currentPage, setCurrentPage] = useState(1)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["Category", "list"],
    queryFn: getCategories as any,
  })

  // Prefetch de precios para todas las categorías (Offline Support)
  useEffect(() => {
    if (categories.length > 0) {
      categories.forEach((cat) => {
        queryClient.prefetchQuery({
          queryKey: ["ProductPrice", cat.idCategory],
          queryFn: () => listUniquePricesByCategory(cat.idCategory),
          staleTime: 1000 * 60 * 60,
        })
      })
    }
  }, [categories, queryClient])

  const validCategories = useMemo(() => {
    return categories.filter(
      (c): c is Category & { name: string } =>
        c.name !== null && c.name !== undefined
    )
  }, [categories])

  const placeName = useMemo(() => {
    if (!sale?.idPlace) return "Ventas"
    const place = places.find((p) => p.idPlace === sale.idPlace)
    return place?.name ?? "Ventas"
  }, [sale, places])

  const totals = useMemo(() => {
    const subtotal = lines.reduce((acc, ln) => acc + Number(ln.subtotal ?? 0), 0)
    const deben = lines.reduce((acc, ln) => acc + (ln.oweMoney ? Number(ln.subtotal ?? 0) : 0), 0)
    const total = subtotal - deben
    const sinpe = lines.reduce((acc, ln) => acc + (!ln.oweMoney && ln.sinpe ? Number(ln.subtotal ?? 0) : 0), 0)
    const efectivo = lines.reduce((acc, ln) => acc + (!ln.oweMoney && !ln.sinpe ? Number(ln.subtotal ?? 0) : 0), 0)
    return { subtotal, deben, total, efectivo, sinpe }
  }, [lines])

  const categoryNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of categories) {
      m.set(c.idCategory, c.name ?? `Categoría #${c.idCategory}`)
    }
    return m
  }, [categories])

  const orderedLines = useMemo(() => {
    return [...lines].sort((a, b) => {
      const ao = a.oweMoney ? 1 : 0
      const bo = b.oweMoney ? 1 : 0
      if (ao !== bo) return bo - ao
      return String(a.idSaleLine).localeCompare(String(b.idSaleLine))
    })
  }, [lines])

  const totalPages = Math.max(1, Math.ceil(orderedLines.length / ITEMS_PER_PAGE))

  // Clamp current page at render time instead of using useEffect to reset it
  const safePage = Math.min(currentPage, totalPages)

  const paginatedLines = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return orderedLines.slice(start, end)
  }, [orderedLines, safePage])

  return {
    idSale,
    sale,
    lines,
    validCategories,
    placeName,
    totals,
    categoryNameById,
    orderedLines,
    paginatedLines,
    currentPage,
    setCurrentPage,
    totalPages
  }
}
