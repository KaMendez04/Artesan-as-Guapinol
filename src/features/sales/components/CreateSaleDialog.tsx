import { useEffect, useMemo, useState } from "react"
import { X, Check, ChevronDown, Calendar as CalendarIcon } from "lucide-react"
import { usePlaces } from "../hooks/usePlace"
import { useCreateSale } from "../hooks/useSale"
import { buildCRZonedISOFromDateValueWithNowTime, toInputDateValue } from "../utils/date"
import { getOrCreatePlaceByName } from "../services/place.service"

import { Calendar } from "@/shared/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (idSale: string) => void
}

export function CreateSaleDialog({ open, onClose, onCreated }: Props) {
  const { data: places = [], refetch } = usePlaces()
  const { mutateAsync: createSale, isPending } = useCreateSale()
  const [placeSearch, setPlaceSearch] = useState("")
  const [placeId, setPlaceId] = useState<number | "">("")
  const [dateValue, setDateValue] = useState(toInputDateValue(new Date()))
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [creatingPlace, setCreatingPlace] = useState(false)
  console.log("Device local:", new Date().toString())
console.log("CR time:", new Date().toLocaleString("es-CR", { timeZone: "America/Costa_Rica" }))
console.log("Payload:", buildCRZonedISOFromDateValueWithNowTime(dateValue))

  useEffect(() => {
    if (!open) return
    setPlaceSearch("")
    setPlaceId("")
    const now = new Date()
    setDateValue(toInputDateValue(now))
    setDate(now)
    setCreatingPlace(false)
  }, [open])

  const filtered = useMemo(() => {
    const q = placeSearch.trim().toLowerCase()
    if (!q) return places
    return places.filter((p) => p.name.toLowerCase().includes(q))
  }, [places, placeSearch])

  const exactExists = useMemo(() => {
    const q = placeSearch.trim().toLowerCase()
    if (!q) return true
    return places.some((p) => p.name.trim().toLowerCase() === q)
  }, [places, placeSearch])

  if (!open) return null

  const canSave = placeId !== "" && !!dateValue && !isPending

  const handleCreatePlace = async () => {
    const name = placeSearch.trim()
    if (!name) return
    setCreatingPlace(true)
    try {
      const created = await getOrCreatePlaceByName(name)
      await refetch()
      setPlaceId(created.idPlace)
    } finally {
      setCreatingPlace(false)
    }
  }

  const handleSave = async () => {
  if (!canSave) return

  try {
    const sale = await createSale({
      idPlace: placeId as number,
      dateSale: new Date(buildCRZonedISOFromDateValueWithNowTime(dateValue)),
    })

    onCreated(sale.idSale)
    onClose()
  } catch (e: any) {
    console.error("Error creando venta:", e)
    alert(e?.message ?? "No se pudo crear la venta")
  }
}

  const selectedPlaceName =
    placeId === ""
      ? ""
      : (places.find((p) => p.idPlace === placeId)?.name ?? "")

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Nueva venta
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Lugar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Lugar
            </label>

            <input
              value={placeSearch}
              onChange={(e) => setPlaceSearch(e.target.value)}
              placeholder="Escribí para buscar o crear..."
              className="w-full rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#708C3E]/30"
            />

            {!exactExists && placeSearch.trim().length > 0 && (
              <button
                type="button"
                onClick={handleCreatePlace}
                disabled={creatingPlace}
                className="w-full rounded-2xl border border-[#708C3E]/40 text-[#708C3E] hover:bg-[#708C3E]/10 px-3 py-2 text-sm font-medium transition disabled:opacity-60"
              >
                {creatingPlace ? "Creando..." : `Crear "${placeSearch.trim()}"`}
              </button>
            )}

            {/* Dropdown lugares */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full group flex items-center justify-between gap-2 rounded-2xl
                             border border-gray-200 dark:border-neutral-700
                             bg-white dark:bg-neutral-950
                             px-3 py-2 text-sm text-gray-900 dark:text-gray-100
                             hover:bg-gray-50 dark:hover:bg-neutral-900 transition
                             focus:outline-none focus:ring-2 focus:ring-[#708C3E]/30"
                >
                  <span className="truncate">
                    {placeId === ""
                      ? "Seleccioná un lugar"
                      : selectedPlaceName || "Lugar"}
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
                           dark:border-neutral-700 dark:bg-neutral-950"
              >
                {filtered.length === 0 ? (
                  <DropdownMenuItem
                    disabled
                    className="rounded-xl px-3 py-2 text-sm text-gray-500 dark:text-white/50"
                  >
                    No hay lugares
                  </DropdownMenuItem>
                ) : (
                  filtered.map((p) => {
                    const active = Number(placeId) === p.idPlace
                    return (
                      <DropdownMenuItem
                        key={p.idPlace}
                        onClick={() => setPlaceId(p.idPlace)}
                        className={`rounded-xl px-3 py-2 text-sm flex items-center justify-between gap-2
                          ${
                            active
                              ? "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#9FE870]"
                              : "text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10"
                          }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {active && <Check size={16} />}
                      </DropdownMenuItem>
                    )
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Fecha (shadcn DatePicker) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Fecha
            </label>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full group flex items-center justify-between gap-2 rounded-2xl
                             border border-gray-200 dark:border-neutral-700
                             bg-white dark:bg-neutral-950
                             px-3 py-2 text-sm text-gray-900 dark:text-gray-100
                             hover:bg-gray-50 dark:hover:bg-neutral-900 transition
                             focus:outline-none focus:ring-2 focus:ring-[#708C3E]/30"
                >
                  <span className="truncate">
                    {dateValue || "Seleccioná una fecha"}
                  </span>

                  <CalendarIcon
                    size={16}
                    className="shrink-0 text-gray-400 group-hover:text-gray-600 dark:text-white/40 dark:group-hover:text-white/70"
                  />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="z-[10050] w-auto p-2 rounded-2xl
                           border border-gray-200 bg-white shadow-lg
                           dark:border-neutral-700 dark:bg-neutral-950"
              >
                {/* Wrapper para hacerlo más pequeño sin romper clicks */}
                <div className="text-[12px]">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (!d) return
                      setDate(d)
                      setDateValue(toInputDateValue(d))
                    }}
                    className="p-0"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <button
            disabled={!canSave}
            onClick={handleSave}
            type="button"
            className="w-full rounded-2xl bg-[#708C3E] hover:bg-[#5f7634] disabled:opacity-60 text-white font-medium py-2.5 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}