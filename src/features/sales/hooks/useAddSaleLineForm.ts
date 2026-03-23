import { useState, useEffect, useMemo } from "react"
import { useInsertSaleLine } from "./useSaleLine"
import { useProductPrices } from "./useProductPrice"

type Category = { idCategory: number; name: string }

export function useAddSaleLineForm(idSale: string, categories: Category[], onClose: () => void) {
  const { mutateAsync: insertLine, isPending } = useInsertSaleLine(idSale)

  const [sinpe, setSinpe] = useState(false)
  const [qty, setQty] = useState(1)
  const [idCategory, setIdCategory] = useState<number | "">(categories?.[0]?.idCategory ?? "")
  const [unitPrice, setUnitPrice] = useState<number>(0)

  const [subtotal, setSubtotal] = useState<number>(0)
  const [subtotalTouched, setSubtotalTouched] = useState(false)
  const [oweMoney, setOweMoney] = useState(false)

  const { data: prices = [], isLoading: loadingPrices } = useProductPrices(idCategory)

  // Recalcular subtotal cuando cambia cantidad o precio unitario (si no fue editado manualmente)
  useEffect(() => {
    if (!subtotalTouched) {
      setSubtotal(Number(qty) * Number(unitPrice))
    }
  }, [qty, unitPrice, subtotalTouched])

  // Actualizar precio unitario sugerido cuando cambian los precios (cambio de categoría)
  useEffect(() => {
    if (prices.length > 0) {
      setUnitPrice(Number(prices[0]))
      setSubtotalTouched(false)
    }
  }, [prices])

  const selectedCategoryName = useMemo(() => {
    if (idCategory === "") return ""
    return categories.find((c) => c.idCategory === idCategory)?.name ?? ""
  }, [categories, idCategory])

  const uniquePrices = useMemo(() => {
    return Array.from(new Set((prices ?? []).map((p) => Number(p)))).sort((a, b) => a - b)
  }, [prices])

  const computedSubtotal = useMemo(() => Number(qty) * Number(unitPrice), [qty, unitPrice])

  const handleSave = async () => {
    if (idCategory === "" || Number(qty) <= 0) return

    await insertLine({
      idSale,
      idCategory: idCategory as number,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      subtotal: Number(subtotal),
      oweMoney: !!oweMoney,
      sinpe: !!sinpe,
    })
    onClose()
  }

  return {
    // State
    qty,
    setQty,
    idCategory,
    setIdCategory,
    unitPrice,
    setUnitPrice,
    subtotal,
    setSubtotal,
    setSubtotalTouched,
    oweMoney,
    setOweMoney,
    sinpe,
    setSinpe,
    
    // Derived/Async State
    loadingPrices,
    uniquePrices,
    selectedCategoryName,
    computedSubtotal,
    isPending,
    
    // Actions
    handleSave,
    canSave: !!idSale && idCategory !== "" && Number(qty) > 0 && !isPending
  }
}
