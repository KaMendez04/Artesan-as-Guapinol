import { useState, useMemo } from "react"
import { useInsertSaleLine } from "./useSaleLine"
import { useProductPrices } from "./useProductPrice"

type Category = { idCategory: number; name: string }

export function useAddSaleLineForm(idSale: string, categories: Category[], onClose: () => void) {
  const { mutate: insertLine, isPending } = useInsertSaleLine(idSale)

  const [sinpe, setSinpe] = useState(false)
  const [qty, setQty] = useState<string>("")
  const [idCategory, setIdCategory] = useState<number | "">(categories?.[0]?.idCategory ?? "")
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [subtotal, setSubtotal] = useState<string>("")
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

  const numQty = Number(qty) || 0
  const computedSubtotal = numQty * Number(unitPrice)
  const displaySubtotal = subtotalTouched ? (Number(subtotal) || 0) : computedSubtotal

  // Handlers
  const handleQtyChange = (val: string) => {
    setQty(val)
    const numVal = Math.max(0, Number(val) || 0)
    if (!subtotalTouched) {
      setSubtotal(String(numVal * unitPrice))
    }
  }

  const handleUnitPriceChange = (val: number) => {
    setUnitPrice(val)
    const numQtyLocal = Number(qty) || 0
    if (!subtotalTouched) {
      setSubtotal(String(numQtyLocal * val))
    }
  }

  const handleIdCategoryChange = (id: number | "") => {
    setIdCategory(id)
    setSubtotalTouched(false)
  }

  const handleSave = () => {
    if (idCategory === "" || numQty <= 0) return

    insertLine({
      idSale,
      idCategory: idCategory as number,
      qty: numQty,
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
    canSave: idCategory !== "" && numQty > 0 && !isPending && !!idSale
  }
}
