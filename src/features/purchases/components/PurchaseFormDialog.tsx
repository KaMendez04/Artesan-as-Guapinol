import { useEffect, useMemo, useState } from "react"
import { sileo } from "sileo"
import { Check, ChevronDown, CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { useCreatePurchase, useUpdatePurchase, useTiendas } from "../hooks/usePurchase"
import type { Purchase } from "../types/purchase.types"

interface PurchaseFormDialogProps {
  open: boolean
  onClose: () => void
  purchase?: Purchase | null
}

function toDateValue(d: Date) {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return x.toISOString().slice(0, 10)
}

function todayValue() {
  return toDateValue(new Date())
}

const inputClass =
  "h-10 w-full rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30"

export function PurchaseFormDialog({ open, onClose, purchase }: PurchaseFormDialogProps) {
  const isEditing = !!purchase

  const [monto, setMonto] = useState("")
  const [montoFocused, setMontoFocused] = useState(false)
  const [fechaValue, setFechaValue] = useState(todayValue)
  const [date, setDate] = useState<Date>(() => new Date())
  const [tiendaSelected, setTiendaSelected] = useState("")
  const [tiendaSearch, setTiendaSearch] = useState("")

  const { data: tiendas = [], refetch: refetchTiendas } = useTiendas()
  const { mutateAsync: createPurchase, isPending: isCreating } = useCreatePurchase()
  const { mutateAsync: updatePurchase, isPending: isUpdating } = useUpdatePurchase()
  const isPending = isCreating || isUpdating

  const today = useMemo(() => new Date(), [])

  useEffect(() => {
    if (open) {
      setMonto(purchase ? String(purchase.monto) : "")
      const initialDate = purchase ? new Date(purchase.fecha + "T12:00:00") : new Date()
      setDate(initialDate)
      setFechaValue(purchase?.fecha ?? todayValue())
      setTiendaSelected(purchase?.tienda ?? "")
      setTiendaSearch("")
    }
  }, [open, purchase])

  const filteredTiendas = useMemo(() => {
    const q = tiendaSearch.trim().toLowerCase()
    if (!q) return tiendas
    return tiendas.filter((t) => t.toLowerCase().includes(q))
  }, [tiendas, tiendaSearch])

  // Tienda que ya existe con ese nombre (ignorando mayúsculas)
  const exactMatch = useMemo(() => {
    const q = tiendaSearch.trim().toLowerCase()
    if (!q) return null
    return tiendas.find((t) => t.toLowerCase() === q) ?? null
  }, [tiendas, tiendaSearch])

  const handleSelectTienda = (name: string) => {
    setTiendaSelected(name)
    setTiendaSearch("")
  }

  const handleCreateTienda = () => {
    const name = tiendaSearch.trim()
    if (!name) return
    setTiendaSelected(name)
    setTiendaSearch("")
    refetchTiendas()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const montoNum = parseFloat(monto)
    if (!tiendaSelected) {
      sileo.error({ title: "Seleccioná una tienda" })
      return
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      sileo.error({ title: "Monto inválido" })
      return
    }
    if (!fechaValue) {
      sileo.error({ title: "Seleccioná una fecha" })
      return
    }
    if (fechaValue > todayValue()) {
      sileo.error({ title: "No se permiten fechas futuras" })
      return
    }

    try {
      if (isEditing) {
        await updatePurchase({ id: purchase.id, dto: { monto: montoNum, fecha: fechaValue, tienda: tiendaSelected } })
        sileo.success({ title: "Compra actualizada" })
      } else {
        await createPurchase({ monto: montoNum, fecha: fechaValue, tienda: tiendaSelected })
        sileo.success({ title: "Compra registrada" })
      }
      refetchTiendas()
      onClose()
    } catch {
      sileo.error({ title: "Error al guardar" })
    }
  }

  const canSave = !!tiendaSelected && !!fechaValue && !!monto && !isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "Editar compra" : "Nueva compra"}
          </DialogTitle>
        </DialogHeader>

        <form className="grid gap-4 pt-1" onSubmit={handleSubmit}>

          {/* Tienda */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">Tienda</label>

            <input
              value={tiendaSearch}
              onChange={(e) => setTiendaSearch(e.target.value)}
              placeholder="Buscar o escribir nueva..."
              className={inputClass}
            />

            {tiendaSearch.trim().length > 0 && exactMatch && exactMatch !== tiendaSelected && (
              <button
                type="button"
                onClick={() => handleSelectTienda(exactMatch)}
                className="w-full rounded-xl border border-[#708C3E]/40 bg-[#708C3E]/5 dark:bg-[#708C3E]/10 text-[#708C3E] dark:text-[#A7D878] hover:bg-[#708C3E]/15 px-3 py-2 text-sm font-medium transition text-left"
              >
                ¿Quisiste decir <span className="font-bold">"{exactMatch}"</span>?
              </button>
            )}

            {tiendaSearch.trim().length > 0 && !exactMatch && (
              <button
                type="button"
                onClick={handleCreateTienda}
                className="w-full rounded-xl border border-[#708C3E]/40 text-[#708C3E] dark:text-[#A7D878] hover:bg-[#708C3E]/10 px-3 py-2 text-sm font-medium transition"
              >
                Usar "{tiendaSearch.trim()}"
              </button>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-[#708C3E]/30"
                >
                  <span className="truncate text-left">
                    {tiendaSelected || <span className="text-gray-400 dark:text-white/30">Seleccioná una tienda</span>}
                  </span>
                  <ChevronDown size={15} className="shrink-0 text-gray-400 dark:text-white/40" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="z-10050 min-w-[260px] rounded-xl border border-border/50 bg-white dark:bg-zinc-900 p-1 shadow-lg"
              >
                {filteredTiendas.length === 0 ? (
                  <DropdownMenuItem disabled className="rounded-lg px-3 py-2 text-sm text-gray-400">
                    {tiendaSearch ? "Sin resultados" : "Sin tiendas registradas"}
                  </DropdownMenuItem>
                ) : (
                  filteredTiendas.map((t) => {
                    const active = tiendaSelected === t
                    return (
                      <DropdownMenuItem
                        key={t}
                        onClick={() => handleSelectTienda(t)}
                        className={[
                          "rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 cursor-pointer",
                          active
                            ? "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#A7D878]"
                            : "text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10",
                        ].join(" ")}
                      >
                        <span className="truncate">{t}</span>
                        {active && <Check size={14} />}
                      </DropdownMenuItem>
                    )
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          {/* Monto */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">Monto</label>
            <input
              value={
                montoFocused || !monto
                  ? monto
                  : new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(parseFloat(monto) || 0)
              }
              onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ""))}
              onFocus={() => setMontoFocused(true)}
              onBlur={() => setMontoFocused(false)}
              placeholder="₡0"
              inputMode="decimal"
              className={inputClass}
            />
          </div>

          {/* Fecha */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">Fecha</label>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-[#708C3E]/30"
                >
                  <span>{fechaValue || "Seleccioná una fecha"}</span>
                  <CalendarIcon size={15} className="shrink-0 text-gray-400 dark:text-white/40" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="z-10050 w-auto p-2 rounded-xl border border-border/50 bg-white dark:bg-zinc-900 shadow-lg"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (!d) return
                    setDate(d)
                    setFechaValue(toDateValue(d))
                  }}
                  disabled={{ after: today }}
                  className="p-0"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-4 text-sm font-medium text-gray-700 dark:text-white transition hover:bg-white/80 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="h-10 rounded-xl bg-[#708C3E] px-5 text-sm font-semibold text-white transition hover:bg-[#5E7634] disabled:opacity-60"
            >
              {isPending ? "Guardando..." : isEditing ? "Guardar" : "Registrar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
