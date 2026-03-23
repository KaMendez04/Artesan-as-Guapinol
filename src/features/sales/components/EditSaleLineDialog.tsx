import { useEffect, useState } from "react"
import { X, Trash2, Check, ChevronDown } from "lucide-react"
import { listUniquePricesByCategory } from "../services/productPrice.service"
import { useUpdateSaleLine, useDeleteSaleLine } from "../hooks/useSaleLine"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu" // ajusta ruta si es diferente
import { Checkbox } from "@/shared/components/ui/checkbox"

type Category = { idCategory: number; name: string }

type Props = {
  open: boolean
  onClose: () => void
  idSale: string
  categories: Category[]
  line: any | null
}

export function EditSaleLineDialog({ open, onClose, idSale, categories, line }: Props) {
  const { mutateAsync: updateLine, isPending: updating } = useUpdateSaleLine(idSale)
  const { mutateAsync: deleteLine, isPending: deleting } = useDeleteSaleLine(idSale)

  const [qty, setQty] = useState(() => Number(line?.qty ?? 1))
  const [idCategory, setIdCategory] = useState<number | "">(() => Number(line?.idCategory ?? ""))
  const [unitPrice, setUnitPrice] = useState<number>(() => Number(line?.unitPrice ?? 0))

  const [subtotal, setSubtotal] = useState<number>(() => Number(line?.subtotal ?? 0))
  const [subtotalTouched, setSubtotalTouched] = useState(true)
  const [oweMoney, setOweMoney] = useState(() => !!line?.oweMoney)
  const [sinpe, setSinpe] = useState(() => !!line?.sinpe)

  const [loadingPrices, setLoadingPrices] = useState(false)
  const [prices, setPrices] = useState<number[]>([])

  const [confirmOpen, setConfirmOpen] = useState(false)

  // cargar precios cuando cambia categoría
  useEffect(() => {
    if (!open) return
    if (idCategory === "") return

    ;(async () => {
      setLoadingPrices(true)
      try {
        const list = await listUniquePricesByCategory(idCategory as number)
        setPrices(list)
        // si el unitPrice actual ya no existe, cae al primero
        if (!list.includes(Number(unitPrice))) {
          setUnitPrice(Number(list?.[0] ?? 0))
          setSubtotalTouched(false)
        }
      } catch (e) {
        console.error("Error cargando precios:", e)
        setPrices([])
      } finally {
        setLoadingPrices(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idCategory])

  // recalcular subtotal si no lo tocaron manual
  useEffect(() => {
    if (subtotalTouched) return
    setSubtotal(Number(qty) * Number(unitPrice))
  }, [qty, unitPrice, subtotalTouched])

  const canSave = !!line?.idSaleLine && idCategory !== "" && qty > 0 && !updating && !deleting

  const handleSave = async () => {
    if (!canSave) return
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

  const handleAskDelete = () => setConfirmOpen(true)

  const handleConfirmDelete = async () => {
    if (!line?.idSaleLine) return
    await deleteLine(line.idSaleLine)
    setConfirmOpen(false)
    onClose()
  }

  if (!open || !line) return null

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white border border-gray-200 p-5 shadow-xl text-gray-900
                      dark:bg-neutral-950 dark:border-white/10 dark:text-white">
        <div className="flex items-center justify-between">
        
            <h2 className="text-lg font-semibold">Editar artículo</h2>
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleAskDelete}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium
                            text-red-600 hover:bg-red-50 transition
                            dark:text-red-400 dark:hover:bg-red-500/10"
                >
                    <Trash2 size={15} />
                </button>
           
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 hover:bg-gray-100 text-gray-700 dark:hover:bg-white/10 dark:text-white"
                >
                    <X size={18} />
                </button> 
            </div>
        </div>

        <div className="mt-4 space-y-4">
          {/* Cantidad */}
          <div className="space-y-2">
            <label htmlFor="qty-edit" className="text-sm font-medium text-gray-700 dark:text-white/80">Cantidad</label>
            <input
              id="qty-edit"
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

          {/* Categoría */}
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
                      : (categories.find((c) => c.idCategory === idCategory)?.name ?? "Categoría")}
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
                {categories.map((c) => {
                  const active = Number(idCategory) === c.idCategory
                  return (
                    <DropdownMenuItem
                      key={c.idCategory}
                      onClick={() => {
                        setIdCategory(c.idCategory)
                        setSubtotalTouched(false)
                      }}
                      className={`rounded-xl px-3 py-2 text-sm flex items-center justify-between gap-2
                                ${active
                          ? "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#9FE870]"
                          : "text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10"
                        }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {active && <Check size={16} />}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Precio individual */}
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
                                focus:outline-none focus:ring-2 focus:ring-[#f0f3eb]/30
                                dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                >
                  <span className="truncate">
                    {loadingPrices
                      ? "Cargando precios…"
                      : prices.length === 0
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
                {(() => {
                    const uniquePrices = Array.from(
                    new Set((prices ?? []).map((p) => Number(p)))
                    ).sort((a, b) => a - b)

                    if (uniquePrices.length === 0) {
                    return (
                        <DropdownMenuItem
                        disabled
                        className="rounded-xl px-3 py-2 text-sm text-gray-500 dark:text-white/50"
                        >
                        No hay precios
                        </DropdownMenuItem>
                    )
                    }

                    return uniquePrices.map((p) => {
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
                })()}
                </DropdownMenuContent>
            </DropdownMenu>
            </div>

          {/* Subtotal */}
          <div className="space-y-2">
            <label htmlFor="subtotal-edit" className="text-sm font-medium text-gray-700 dark:text-white/80">Subtotal (editable)</label>
            <input
              id="subtotal-edit"
              type="number"
              min={0}
              value={subtotal}
              onChange={(e) => {
                setSubtotal(Number(e.target.value || 0))
                setSubtotalTouched(true)
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none
                         focus:ring-1 focus:ring-[#708C3E]/30
                         dark:border-white/10 dark:bg-black/30 dark:text-white"
            />
          </div>

          {/* Fiado (Checkbox shadcn verde) */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="owe-edit"
                checked={oweMoney}
                onCheckedChange={(value) => setOweMoney(!!value)}
                className="
                  h-5 w-5 rounded-md
                  border-gray-300 dark:border-white/20
                  data-[state=checked]:bg-[#708C3E]
                  data-[state=checked]:border-[#708C3E]
                  data-[state=checked]:text-white
                  focus-visible:ring-[#708C3E]/30
                "
              />
              <label htmlFor="owe-edit" className="text-sm text-gray-700 dark:text-white/80">
                Fiado
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sinpe-edit"
                checked={sinpe}
                onCheckedChange={(value) => setSinpe(!!value)}
                className="
                  h-5 w-5 rounded-md
                  border-gray-300 dark:border-white/20
                  data-[state=checked]:bg-[#708C3E]
                  data-[state=checked]:border-[#708C3E]
                  data-[state=checked]:text-white
                  focus-visible:ring-[#708C3E]/30
                "
              />
              <label htmlFor="sinpe-edit" className="text-sm text-gray-700 dark:text-white/80">
                SINPE
              </label>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {/* Guardar (izquierda) */}
            <button
                type="button"
                disabled={!canSave}
                onClick={handleSave}
                className="rounded-2xl bg-[#708C3E] hover:bg-[#5f7634] disabled:opacity-60
                        text-white font-medium py-2.5 transition"
            >
                Guardar cambios
            </button>

            {/* Cancelar (derecha) */}
            <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-gray-200 bg-white text-gray-700
                        hover:bg-gray-50 transition
                        dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
            >
                Cancelar
            </button>
           </div>
        </div>

        {/* Confirmación eliminar */}
        {confirmOpen && (
          <div className="absolute inset-0 rounded-3xl bg-white/85 dark:bg-neutral-950/85 p-5 flex flex-col justify-center">
            <div className="text-center">
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                ¿De verdad deseas eliminar esta venta?
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-white/70">
                Esta acción no se puede deshacer.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {/* Izquierda: Sí, aceptar */}
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium py-2.5 transition"
              >
                Sí, aceptar
              </button>

              {/* Derecha: No, cancelar */}
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition
                           dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
              >
                No, cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}