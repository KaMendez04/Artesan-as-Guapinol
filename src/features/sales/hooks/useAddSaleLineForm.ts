import { useState, useMemo } from "react"
import { useInsertSaleLine } from "./useSaleLine"
import { useProductPrices } from "./useProductPrice"

type Category = { idCategory: number; name: string }

export function useAddSaleLineForm(idSale: string, categories: Category[], onClose: () => void) {
  const { mutate: insertLine, isPending } = useInsertSaleLine(idSale)

  const [sinpe, setSinpe] = useState(false)
  const [qty, setQty] = useState(1)
  const [idCategory, setIdCategory] = useState<number | "">(categories?.[0]?.idCategory ?? "")
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [subtotal, setSubtotal] = useState<number>(0)
  const [subtotalTouched, setSubtotalTouched] = useState(false)
  const [oweMoney, setOweMoney] = useState(false)

  const { data: prices = [], isLoading: loadingPrices } = useProductPrices(idCategory)

  const uniquePrices = useMemo(() => {
    return Array.from(new Set((prices ?? []).map((p) => Number(p)))).sort((a, b) => a - b)
  }, [prices])

  const selectedCategoryName = useMemo(() => {
    if (idCategory === "") return ""
    return categories.find((c) => c.idCategory === idCategory)?.name ?? ""
  }, [categories, idCategory])

  const computedSubtotal = Number(qty) * Number(unitPrice)
  const displaySubtotal = subtotalTouched ? subtotal : computedSubtotal

  // Handlers
  const handleQtyChange = (val: number) => {
    const newQty = Math.max(1, val)
    setQty(newQty)
    if (!subtotalTouched) {
      setSubtotal(newQty * unitPrice)
    }
  }

  const handleUnitPriceChange = (val: number) => {
    setUnitPrice(val)
    if (!subtotalTouched) {
      setSubtotal(qty * val)
    }
  }

  const handleIdCategoryChange = (id: number | "") => {
    setIdCategory(id)
    setSubtotalTouched(false)
  }

  const handleSave = () => {
    if (idCategory === "" || Number(qty) <= 0) return

    insertLine({
      idSale,
      idCategory: idCategory as number,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      subtotal: displaySubtotal,
      oweMoney: !!oweMoney,
      sinpe: !!sinpe,
    })
    onClose()
  }

  return {
    // State
    qty,
    setQty: handleQtyChange,
    idCategory,
    setIdCategory: handleIdCategoryChange,
    unitPrice,
    setUnitPrice: handleUnitPriceChange,
    subtotal: displaySubtotal,
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
    handleSave,
    canSave: idCategory !== "" && Number(qty) > 0 && !isPending && !!idSale
  }
}
