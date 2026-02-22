import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { listUniquePricesByCategory } from "../services/productPrice.service"
import { useInsertSaleLine } from "../hooks/useSaleLine"
import { formatCRC } from "../utils/date"

type Category = { idCategory: number; name: string }

type Props = {
  open: boolean
  onClose: () => void
  idSale: string
  categories: Category[]
}

export function AddSaleLineDialog({ open, onClose, idSale, categories }: Props) {
  const { mutateAsync: insertLine, isPending } = useInsertSaleLine(idSale)

  const [qty, setQty] = useState(1)
  const [idCategory, setIdCategory] = useState<number | "">("")
  const [unitPrice, setUnitPrice] = useState<number>(0)

  const [subtotal, setSubtotal] = useState<number>(0)
  const [subtotalTouched, setSubtotalTouched] = useState(false)

  const [oweMoney, setOweMoney] = useState(false)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [prices, setPrices] = useState<number[]>([])

  useEffect(() => {
    if (!open) return
    setQty(1)
    setIdCategory(categories?.[0]?.idCategory ?? "")
    setPrices([])
    setUnitPrice(0)
    setSubtotal(0)
    setSubtotalTouched(false)
    setOweMoney(false)
  }, [open, categories])

  useEffect(() => {
    if (!open) return
    if (idCategory === "") return

    ;(async () => {
      setLoadingPrices(true)
      try {
        const list = await listUniquePricesByCategory(idCategory as number)
        setPrices(list)
        setUnitPrice(Number(list?.[0] ?? 0))
        setSubtotalTouched(false)
      } catch (e) {
        console.error("Error cargando precios:", e)
        setPrices([])
        setUnitPrice(0)
      } finally {
        setLoadingPrices(false)
      }
    })()
  }, [open, idCategory])

  useEffect(() => {
    if (subtotalTouched) return
    setSubtotal(Number(qty) * Number(unitPrice))
  }, [qty, unitPrice, subtotalTouched])

  const canSave = idSale && idCategory !== "" && qty > 0 && !isPending
  const computed = useMemo(() => Number(qty) * Number(unitPrice), [qty, unitPrice])

  const handleSave = async () => {
    if (!canSave) return
    await insertLine({
      idSale,
      idCategory: idCategory as number,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      subtotal: Number(subtotal),
      oweMoney: !!oweMoney,
    })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/50" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-3xl bg-white border border-gray-200 p-5 shadow-xl text-gray-900
                   dark:bg-neutral-950 dark:border-white/10 dark:text-white"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Agregar artículo</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-gray-100 text-gray-700 dark:hover:bg-white/10 dark:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Cantidad */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">Cantidad</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none
                         focus:ring-2 focus:ring-[#708C3E]/30
                         dark:border-white/10 dark:bg-black/30 dark:text-white"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">Artículo (Categoría)</label>
            <select
              value={idCategory}
              onChange={(e) => {
                setIdCategory(e.target.value ? Number(e.target.value) : "")
                setSubtotalTouched(false)
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none
                         focus:ring-2 focus:ring-[#708C3E]/30
                         dark:border-white/10 dark:bg-black/30 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.idCategory} value={c.idCategory}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">Precio individual</label>

            <select
              value={unitPrice}
              onChange={(e) => {
                setUnitPrice(Number(e.target.value))
                setSubtotalTouched(false)
              }}
              disabled={loadingPrices}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none disabled:opacity-60
                         focus:ring-2 focus:ring-[#708C3E]/30
                         dark:border-white/10 dark:bg-black/30 dark:text-white"
            >
              {prices.length === 0 ? (
                <option value={0}>Sin precios registrados</option>
              ) : (
                prices.map((p) => (
                  <option key={p} value={p}>
                    ₡{Number(p).toLocaleString("es-CR")}
                  </option>
                ))
              )}
            </select>

            <div className="text-xs text-gray-500 dark:text-white/60">
              Usar calculado: <span className="text-[#708C3E] dark:text-[#9FE870]">{formatCRC(computed)}</span>
            </div>
          </div>

          {/* Subtotal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-white/80">Subtotal (editable)</label>
            <input
              type="number"
              min={0}
              value={subtotal}
              onChange={(e) => {
                setSubtotal(Number(e.target.value || 0))
                setSubtotalTouched(true)
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none
                         focus:ring-2 focus:ring-[#708C3E]/30
                         dark:border-white/10 dark:bg-black/30 dark:text-white"
            />
          </div>

          {/* Fiado */}
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white/80">
            <input
              type="checkbox"
              checked={oweMoney}
              onChange={(e) => setOweMoney(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-white/20"
            />
            Fiado/debe
          </label>

          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="w-full rounded-2xl bg-[#708C3E] hover:bg-[#5f7634] disabled:opacity-60 text-white font-medium py-2.5 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}