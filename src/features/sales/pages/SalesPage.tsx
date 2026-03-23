import { useMemo, useState } from "react"
import { Calendar, ChevronLeft, MapPin, Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAllSales } from "../hooks/useSale"
import { usePlaces } from "../hooks/usePlace"
import { CreateSaleDialog } from "../components/CreateSaleDialog"


export default function SalesPage() {
  const navigate = useNavigate()

  const [openCreate, setOpenCreate] = useState(false)
  const [createKey, setCreateKey] = useState(0)
  const [search, setSearch] = useState("")

  const { data: sales = [], isLoading, error } = useAllSales()
  const { data: places = [] } = usePlaces()

  const placeNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const p of places) m.set(p.idPlace, p.name)
    return m
  }, [places])

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sales

    return sales.filter((s) => {
      const placeName = (placeNameById.get(s.idPlace) ?? "").toLowerCase()
      const dateLabel = new Date(s.dateSale).toLocaleDateString("es-CR").toLowerCase()
      const id = String(s.idSale ?? "").toLowerCase()
      return placeName.includes(q) || dateLabel.includes(q) || id.includes(q)
    })
  }, [sales, search, placeNameById])

  return (
    <div className="min-h-screen text-gray-900 dark:bg-[#0b0b0b] dark:text-white">
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        {/* Top controls */}
        <div className="flex justify-start gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 transition
                       dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
            aria-label="Regresar"
            title="Regresar"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
         
        </div>

         {/* Search + Add */}
<div className="flex items-center gap-3 mb-4">
  {/* Buscador */}
  <div className="relative flex-1">
    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
      size={16}
    />
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar..."
      className="
        w-full rounded-2xl border border-gray-200 bg-white 
        pl-9 pr-3 py-2 text-sm text-gray-900 outline-none
        focus:ring-2 focus:ring-[#708C3E]/30
        dark:border-white/10 dark:bg-black/40 dark:text-white
      "
    />
  </div>

  {/* Botón Agregar */}
  <button
    type="button"
    onClick={() => {
      setCreateKey(prev => prev + 1)
      setOpenCreate(true)
    }}
    className="
      rounded-2xl bg-[#708C3E] hover:bg-[#5f7634] 
      text-white p-2.5 transition shrink-0
    "
    aria-label="Nueva venta"
    title="Nueva venta"
  >
    <Plus size={18} />
  </button>
</div>

        <div
          className="rounded-3xl bg-white border border-gray-200 p-4 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                     dark:bg-black/40 dark:border-white/10 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >


          {/* List */}
          <div className="mt-5 space-y-3">
            {isLoading ? (
              <div className="text-sm text-gray-600 dark:text-white/70">Cargando ventas…</div>
            ) : error ? (
              <div className="text-sm text-red-600 dark:text-red-400">Error cargando ventas.</div>
            ) : filteredSales.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-white/70">No hay ventas registradas.</div>
            ) : (
              filteredSales.map((s) => {
                const placeName = placeNameById.get(s.idPlace) ?? `Lugar #${s.idPlace}`
                const dateLabel = new Date(s.dateSale).toLocaleString("es-CR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <button
                    key={s.idSale}
                    type="button"
                    onClick={() => navigate(`/ventas/${s.idSale}`)}
                    className="
                      w-full text-left rounded-2xl border border-gray-200 bg-white p-4
                      shadow-sm hover:shadow-md hover:bg-gray-50 transition
                      dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40
                    "
                  >
                    <div className="space-y-2">
                      {/* Fecha */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
                        <Calendar className="size-4 opacity-70" />
                        <span>{dateLabel}</span>
                      </div>

                      {/* Lugar */}
                      <div className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                        <MapPin className="size-4 opacity-70" />
                        <span>{placeName}</span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <CreateSaleDialog
          key={createKey}
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={(idSale) => navigate(`/ventas/${idSale}`)}
        />
      </div>
    </div>
  )
}