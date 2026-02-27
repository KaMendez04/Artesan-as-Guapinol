import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft, Plus, Pencil, ChevronDown } from "lucide-react"
import { useSale } from "../hooks/useSale"
import { useSaleLines } from "../hooks/useSaleLine"
import { AddSaleLineDialog } from "../components/AddSaleLineDialog"
import { EditSaleLineDialog } from "../components/EditSaleLineDialog"
import { formatCRC } from "../utils/date"
import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/features/catalog/services/category.service"
import { usePlaces } from "../hooks/usePlace"
import type { Category } from "@/features/catalog/types/category.types"


export default function SaleDetailPage() {
  const { idSale = "" } = useParams()
  const navigate = useNavigate()
  const { data: places = [] } = usePlaces()
  const { data: sale } = useSale(idSale)
  const { data: lines = [] } = useSaleLines(idSale)
  const [showSummaryDetails, setShowSummaryDetails] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedLine, setSelectedLine] = useState<any>(null)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["Category", "list"],
    queryFn: getCategories as any,
  })

  const validCategories = useMemo(() => {
    return categories.filter((c): c is Category & { name: string } => c.name !== null && c.name !== undefined)
  }, [categories])

  const placeName = useMemo(() => {
    if (!sale?.idPlace) return "Ventas"
    const place = places.find(p => p.idPlace === sale.idPlace)
    return place?.name ?? "Ventas"
  }, [sale, places])

  const totals = useMemo(() => {
  const subtotal = lines.reduce((acc, ln) => acc + Number(ln.subtotal ?? 0), 0)
  const deben = lines.reduce(
    (acc, ln) => acc + (ln.oweMoney ? Number(ln.subtotal ?? 0) : 0),
    0
  )
  const total = subtotal - deben

  return { subtotal, deben, total }
}, [lines])

  const categoryNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of categories) m.set(c.idCategory, c.name ?? `Categoría #${c.idCategory}`)
    return m
  }, [categories])

  const orderedLines = useMemo(() => {
  return [...lines].sort((a, b) => {
    const ao = a.oweMoney ? 1 : 0
    const bo = b.oweMoney ? 1 : 0
    // fiado primero
    if (ao !== bo) return bo - ao
    // opcional: si empatan, por categoría o por id (para estabilidad)
    return String(a.idSaleLine).localeCompare(String(b.idSaleLine))
  })
}, [lines])

  return (
    <div className="min-h-screen bg-[#ffffff] text-gray-900 dark:bg-[#0b0b0b] dark:text-white">
      <div className="mx-auto max-w-3xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/ventas")}
                className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 transition
                          dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                aria-label="Regresar"
                title="Regresar"
              >
                <ChevronLeft />
              </button>

              <h1 className="text-2xl font-bold tracking-tight">
                {placeName}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setOpenAdd(true)}
              className="rounded-2xl bg-[#708C3E] hover:bg-[#5f7634] text-white p-2.5 transition"
              aria-label="Agregar"
              title="Agregar"
            >
              <Plus size={18} />
            </button>
          </div>
        <div className="rounded-3xl  p-4 md:p-6 
                        ">
          {/* Totales */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white px-4 py-3
                          dark:border-white/10 dark:bg-black/30">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-[11px] text-gray-700 dark:text-white/60">
                  Vendido (subtotal)
                </div>
                <div className="text-md font-bold tabular-nums text-gray-900 dark:text-white">
                  {formatCRC(totals.subtotal)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSummaryDetails((v) => !v)}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium
                          text-gray-700 hover:bg-gray-50 transition
                          dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                aria-expanded={showSummaryDetails}
                aria-label={showSummaryDetails ? "Ocultar detalles" : "Mostrar detalles"}
                title={showSummaryDetails ? "Ocultar detalles" : "Mostrar detalles"}
              >
                <ChevronDown
                  size={15}
                  className={`transition-transform ${showSummaryDetails ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showSummaryDetails && (
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/10">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-red-400 text-[12px] dark:text-red-400">Deben </span>
                  <span className="text-right font-medium tabular-nums text-red-400 text-[13px] dark:text-red-400">
                    {formatCRC(totals.deben)}
                  </span>

                  <span className="text-green-800 dark:text-[#708C3E] text-[12px]">Ganancia total</span>
                  <span className="text-right font-semibold tabular-nums text-green-800 text-[13px] dark:text-[#708C3E]">
                    {formatCRC(totals.total)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* List container */}
          <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-4 md:p-5
                          dark:border-white/10 dark:bg-black/30">

            {/* Table header (mejor espaciado) */}
            <div className="grid grid-cols-[44px_1fr_88px_44px] md:grid-cols-[70px_1fr_120px_92px] items-center justify-center gap-1.5
                text-[11px] md:text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200
                dark:text-white/60 dark:border-white/10">
              <div>Cant.</div>
              <div>Artículo</div>
              <div className="text-right">Subtotal</div>
              <div className="text-right">Editar</div>
            </div>

            {lines.length === 0 ? (
              <div className="py-6 text-sm text-gray-600 dark:text-white/70">
                Sin artículos aún.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {orderedLines.map((ln) => (
                  <div
                    key={ln.idSaleLine}
                    className="grid grid-cols-[44px_1fr_88px_44px] md:grid-cols-[70px_1fr_120px_92px] items-start gap-2 md:gap-3 py-4"
                  >
                    {/* Cantidad */}
                    <div className="text-xs md:text-sm font-medium text-gray-700 dark:text-white/80 pt-0.5">
                      {ln.qty}
                    </div>

                    {/* Artículo */}
                    <div className="min-w-0">
                      <div className="text-[12px] md:text-sm font-semibold text-gray-900 dark:text-white md:truncate break-words">
                        {categoryNameById.get(ln.idCategory) ?? `Categoría #${ln.idCategory}`}
                      </div>

                      <div className={[
                        "grid grid-cols-[44px_1fr_88px_44px] text-[12px] md:grid-cols-[70px_1fr_120px_92px] items-start gap-2 md:gap-3 rounded-2xl",
                        ln.oweMoney
                          ? "text-red-600/80 dark:text-red-500/40"
                          : "",
                      ].join(" ")}>
                        {ln.oweMoney ? "Fiado" : "Pagado"}
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right text-[13px] md:text-sm font-semibold text-gray-900 dark:text-white pt-0.5">
                      {formatCRC(Number(ln.subtotal))}
                    </div>

                    {/* Edit */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLine(ln)
                          setOpenEdit(true)
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-1.5 md:p-2
                                  hover:bg-gray-50 transition
                                  dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Pencil size={14} className="md:size-4 text-gray-700 dark:text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add */}
          <AddSaleLineDialog
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            idSale={idSale}
            categories={validCategories}
          />

          {/* Edit */}
          <EditSaleLineDialog
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            idSale={idSale}
            categories={validCategories}
            line={selectedLine}
          />
        </div>
      </div>
    </div>
  )
}