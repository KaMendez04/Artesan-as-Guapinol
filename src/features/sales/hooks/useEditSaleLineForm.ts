import { useState } from "react"
import { useUpdateSaleLine, useDeleteSaleLine } from "./useSaleLine"
import { useProductPrices } from "./useProductPrice"

export function useEditSaleLineForm(idSale: string, line: any, onClose: () => void) {
  const { mutate: updateLine, isPending: updating } = useUpdateSaleLine(idSale)
  const { mutate: deleteLine, isPending: deleting } = useDeleteSaleLine(idSale)

  const [qty, setQty] = useState(() => Number(line?.qty ?? 1))
  const [idCategory, setIdCategory] = useState<number | "">(() => Number(line?.idCategory ?? ""))
  const [unitPrice, setUnitPrice] = useState<number>(() => Number(line?.unitPrice ?? 0))
  const [subtotal, setSubtotal] = useState<number>(() => Number(line?.subtotal ?? 0))
  const [subtotalTouched, setSubtotalTouched] = useState(true)
  const [oweMoney, setOweMoney] = useState(() => !!line?.oweMoney)
  const [sinpe, setSinpe] = useState(() => !!line?.sinpe)

  const { data: prices = [], isLoading: loadingPrices } = useProductPrices(idCategory)

  // Derived Values
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
    if (!line?.idSaleLine || idCategory === "" || qty <= 0) return
    
    updateLine({
      idSaleLine: line.idSaleLine,
      idCategory: idCategory as number,
      qty: Number(qty),
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
    canSave: idCategory !== "" && Number(qty) > 0 && !updating && !deleting && !!idSale,

    // Actions
    handleSave,
    handleDelete
  }
}
