import { useState, useEffect } from "react"
import { useUpdateSaleLine, useDeleteSaleLine } from "./useSaleLine"
import { useProductPrices } from "./useProductPrice"


export function useEditSaleLineForm(idSale: string, line: any, onClose: () => void) {
  const { mutateAsync: updateLine, isPending: updating } = useUpdateSaleLine(idSale)
  const { mutateAsync: deleteLine, isPending: deleting } = useDeleteSaleLine(idSale)

  const [qty, setQty] = useState(() => Number(line?.qty ?? 1))
  const [idCategory, setIdCategory] = useState<number | "">(() => Number(line?.idCategory ?? ""))
  const [unitPrice, setUnitPrice] = useState<number>(() => Number(line?.unitPrice ?? 0))

  const [subtotal, setSubtotal] = useState<number>(() => Number(line?.subtotal ?? 0))
  const [subtotalTouched, setSubtotalTouched] = useState(true)
  const [oweMoney, setOweMoney] = useState(() => !!line?.oweMoney)
  const [sinpe, setSinpe] = useState(() => !!line?.sinpe)

  const { data: prices = [], isLoading: loadingPrices } = useProductPrices(idCategory)

  // Cargar precios cuando cambia categoría
  useEffect(() => {
    if (prices.length > 0) {
      if (!prices.includes(Number(unitPrice))) {
        setUnitPrice(Number(prices[0]))
        setSubtotalTouched(false)
      }
    }
  }, [prices, unitPrice])

  // Recalcular subtotal
  useEffect(() => {
    if (!subtotalTouched) {
      setSubtotal(Number(qty) * Number(unitPrice))
    }
  }, [qty, unitPrice, subtotalTouched])

  const handleSave = async () => {
    if (!line?.idSaleLine || idCategory === "" || qty <= 0) return
    
    await updateLine({
      idSaleLine: line.idSaleLine,
      idCategory: idCategory as number,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      subtotal: Number(subtotal),
      oweMoney: !!oweMoney,
      sinpe: !!sinpe,
    })
    onClose()
  }

  const handleDelete = async () => {
    if (!line?.idSaleLine) return
    await deleteLine(line.idSaleLine)
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

    // Derived State
    loadingPrices,
    prices,
    updating,
    deleting,
    canSave: !!line?.idSaleLine && idCategory !== "" && qty > 0 && !updating && !deleting,

    // Actions
    handleSave,
    handleDelete
  }
}
