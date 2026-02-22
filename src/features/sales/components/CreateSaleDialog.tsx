import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { usePlaces } from "../hooks/usePlace"
import { useCreateSale } from "../hooks/useSale"
import { fromInputDateValue, toInputDateValue } from "../utils/date"
import { getOrCreatePlaceByName } from "../services/place.service"

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
  const [creatingPlace, setCreatingPlace] = useState(false)

  useEffect(() => {
    if (!open) return
    setPlaceSearch("")
    setPlaceId("")
    setDateValue(toInputDateValue(new Date()))
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
      dateSale: fromInputDateValue(dateValue),
    })

    onCreated(sale.idSale)
    onClose()
  } catch (e: any) {
    console.error("Error creando venta:", e)

    const msg =
      e?.message ??
      e?.error_description ??
      (typeof e === "string" ? e : "No se pudo crear la venta")

    alert(msg)
  }
}

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

            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#708C3E]/30"
            >
              <option value="">Seleccioná un lugar</option>
              {filtered.map((p) => (
                <option key={p.idPlace} value={p.idPlace}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Fecha
            </label>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#708C3E]/30"
            />
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