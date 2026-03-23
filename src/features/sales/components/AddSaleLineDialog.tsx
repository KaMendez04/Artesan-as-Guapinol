import { useEffect, useMemo, useState } from "react"
import { X, Check, ChevronDown } from "lucide-react"
import { listUniquePricesByCategory } from "../services/productPrice.service"
import { useInsertSaleLine } from "../hooks/useSaleLine"
import { formatCRC } from "../utils/date"

import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

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
  const [idCategory, setIdCategory] = useState<number | "">(categories?.[0]?.idCategory ?? "")
  const [unitPrice, setUnitPrice] = useState<number>(0)

  const [subtotal, setSubtotal] = useState<number>(0)
  const [subtotalTouched, setSubtotalTouched] = useState(false)

  const [oweMoney, setOweMoney] = useState(false)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [prices, setPrices] = useState<number[]>([])

  // cargar precios cuando cambia categoría
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

  const canSave = !!idSale && idCategory !== "" && Number(qty) > 0 && !isPending

  const computed = useMemo(() => Number(qty) * Number(unitPrice), [qty, unitPrice])

  const selectedCategoryName = useMemo(() => {
    if (idCategory === "") return ""
    return categories.find((c) => c.idCategory === idCategory)?.name ?? ""
  }, [categories, idCategory])

  const uniquePrices = useMemo(() => {
    return Array.from(new Set((prices ?? []).map((p) => Number(p)))).sort((a, b) => a - b)
  }, [prices])

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

  // ✅ IMPORTANTE: el return condicional VA DESPUÉS de todos los hooks
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
            <label htmlFor="qty-add" className="text-sm font-medium text-gray-700 dark:text-white/80">Cantidad</label>
            <input
              id="qty-add"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => {
                setQty(Math.max(1, Number(e.target.value || 1)))
                setSubtotalTouched(false)
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none
                         focus:ring-2 focus:ring-[#708C3E]/30
                         dark:border-white/10 dark:bg-black/30 dark:text-white"
            />
          </div>

          {/* Categoría (DropdownMenu) */}
          <div className="space-y-2">
            <label htmlFor="category-trigger" className="text-sm font-medium text-gray-700 dark:text-white/80">
              Artículo (Categoría)
            </label>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  id="category-trigger"
                  type="button"
                  className="w-full group flex items-center justify-between gap-2 rounded-2xl
                             border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900
                             hover:bg-gray-50 transition
                             focus:outline-none focus:ring-2 focus:ring-[#708C3E]/30
                             dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                >
                  <span className="truncate">
                    {idCategory === ""
                      ? "Seleccioná una categoría"
                      : selectedCategoryName || "Categoría"}
                  </span>

                  <ChevronDown
                    size={16}
                    className="shrink-0 text-gray-400 group-hover:text-gray-600 dark:text-white/40 dark:group-hover:text-white/70"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="z-[10050] min-w-[260px] w-full rounded-2xl p-1
                           border border-gray-200 bg-white shadow-lg
                           dark:border-white/10 dark:bg-neutral-950"
              >
                {categories.length === 0 ? (
                  <DropdownMenuItem
                    disabled
                    className="rounded-xl px-3 py-2 text-sm text-gray-500 dark:text-white/50"
                  >
                    No hay categorías
                  </DropdownMenuItem>
                ) : (
                  categories.map((c) => {
                    const active = Number(idCategory) === c.idCategory
                    return (
                      <DropdownMenuItem
                        key={c.idCategory}
                        onClick={() => {
                          setIdCategory(c.idCategory)
                          setSubtotalTouched(false)
                        }}
                        className={`rounded-xl px-3 py-2 text-sm flex items-center justify-between gap-2
                          ${
                            active
                              ? "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#9FE870]"
                              : "text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10"
                          }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {active && <Check size={16} />}
                      </DropdownMenuItem>
                    )
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Precio individual (DropdownMenu) */}
          <div className="space-y-2">
            <label htmlFor="price-trigger" className="text-sm font-medium text-gray-700 dark:text-white/80">
              Precio individual
            </label>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild disabled={loadingPrices}>
                <button
                  id="price-trigger"
                  type="button"
                  className="w-full group flex items-center justify-between gap-2 rounded-2xl
                             border border-gray-200 bg-white px-3 py-2 text-sm
                             text-gray-900 hover:bg-gray-50 transition
                             disabled:opacity-60
                             focus:outline-none focus:ring-2 focus:ring-[#708C3E]/30
                             dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                >
                  <span className="truncate">
                    {loadingPrices
                      ? "Cargando precios…"
                      : uniquePrices.length === 0
                      ? "Sin precios registrados"
                      : `₡${Number(unitPrice).toLocaleString("es-CR")}`}
                  </span>

                  <ChevronDown
                    size={16}
                    className="shrink-0 text-gray-400 group-hover:text-gray-600 dark:text-white/40 dark:group-hover:text-white/70"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="z-[10050] w-[300px] max-h-60 overflow-y-auto
                           rounded-2xl p-1 border border-gray-200 bg-white shadow-lg
                           dark:border-white/10 dark:bg-neutral-950"
              >
                {uniquePrices.length === 0 ? (
                  <DropdownMenuItem
                    disabled
                    className="rounded-xl px-3 py-2 text-sm text-gray-500 dark:text-white/50"
                  >
                    No hay precios
                  </DropdownMenuItem>
                ) : (
                  uniquePrices.map((p) => {
                    const active = Number(unitPrice) === Number(p)
                    return (
                      <DropdownMenuItem
                        key={p}
                        onClick={() => {
                          setUnitPrice(Number(p))
                          setSubtotalTouched(false)
                        }}
                        className={`rounded-xl px-3 py-2 text-sm flex items-center justify-between gap-2
                          ${
                            active
                              ? "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#9FE870]"
                              : "text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10"
                          }`}
                      >
                        <span>₡{Number(p).toLocaleString("es-CR")}</span>
                        {active && <Check size={16} />}
                      </DropdownMenuItem>
                    )
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-xs text-gray-500 dark:text-white/60">
              Usar calculado:{" "}
              <span className="text-[#708C3E] dark:text-[#9FE870]">
                {formatCRC(computed)}
              </span>
            </div>
          </div>

          {/* Subtotal */}
          <div className="space-y-2">
            <label htmlFor="subtotal-add" className="text-sm font-medium text-gray-700 dark:text-white/80">
              Subtotal (editable)
            </label>
            <input
              id="subtotal-add"
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

          {/* Fiado (Checkbox shadcn verde) */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={oweMoney}
              onCheckedChange={(value) => setOweMoney(!!value)}
              className="
                h-5 w-5 rounded-md
                border-gray-300 dark:border-white/20
                data-[state=checked]:bg-[#708C3E]
                data-[state=checked]:border-[#708C3E]
                data-[state=checked]:text-white
                focus-visible:ring-[#708C3E]/30
                dark:data-[state=checked]:bg-[#708C3E]
              "
            />
            <label className="text-sm text-gray-700 dark:text-white/80">
              Fiado
            </label>
          </div>

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