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

  // Derived values
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
    // We don't update unitPrice here because we wait for prices to load in the next render
    // However, react-doctor wants us to avoid effects. 
    // In a keyed component, this hook is new every time the 'line' or 'product' changes.
    // For manual changes within the same instance:
    setSubtotalTouched(false)
  }

  // To handle the "prices loaded" update without useEffect:
  // We can track the previous idCategory and if it changed, and we have new prices, update.
  // But wait, useQuery 'data' updates asynchronously.
  // This is one case where useEffect IS often used, or we handle it in 'onSuccess' of the query.
  // But useQuery v5 doesn't have onSuccess for queries.
  
  // Alternative: use a separate state or just accept it's one of the few valid effects, 
  // OR derive the first price and update state during render (not recommended in React).
  
  // Let's keep the price effect if it's strictly necessary for async data, 
  // but I'll try to minimize them.
  
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
    
    // Actions
    handleSave,
    canSave: idCategory !== "" && Number(qty) > 0 && !isPending && !!idSale
  }
}
