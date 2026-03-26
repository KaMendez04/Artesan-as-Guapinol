import { useState } from "react"
import { useUpdateSaleLine, useDeleteSaleLine } from "./useSaleLine"
import { useProductPrices } from "./useProductPrice"

export function useEditSaleLineForm(idSale: string, line: any, onClose: () => void) {
  const { mutate: updateLine, isPending: updating } = useUpdateSaleLine(idSale)
  const { mutate: deleteLine, isPending: deleting } = useDeleteSaleLine(idSale)

  const [qty, setQty] = useState<string>(() => String(line?.qty ?? ""))
  const [idCategory, setIdCategory] = useState<number | "">(() => Number(line?.idCategory ?? ""))
  const [unitPrice, setUnitPrice] = useState<number>(() => Number(line?.unitPrice ?? 0))
  const [subtotal, setSubtotal] = useState<string>(() => String(line?.subtotal ?? ""))
  const [subtotalTouched, setSubtotalTouched] = useState(true)
  const [oweMoney, setOweMoney] = useState(() => !!line?.oweMoney)
  const [sinpe, setSinpe] = useState(() => !!line?.sinpe)

  const { data: prices = [], isLoading: loadingPrices } = useProductPrices(idCategory)

  // Derived Values
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
    if (!line?.idSaleLine || idCategory === "" || numQty <= 0) return
    
    updateLine({
      idSaleLine: line.idSaleLine,
      idCategory: idCategory as number,
      qty: numQty,
      unitPrice: Number(unitPrice),
      subtotal: Number(displaySubtotal),
      oweMoney: !!oweMoney,
      sinpe: !!sinpe,
    })
    onClose()
  }

  const handleDelete = () => {
    if (!line?.idSaleLine) return
    deleteLine(line.idSaleLine)
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
    prices,
    updating,
    deleting,
    canSave: idCategory !== "" && numQty > 0 && !updating && !deleting && !!idSale,

    // Actions
    handleSave,
    handleDelete
  }
}
