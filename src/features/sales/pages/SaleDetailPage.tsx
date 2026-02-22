import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"

import { useSale } from "../hooks/useSale"
import { useSaleLines, useDeleteSaleLine } from "../hooks/useSaleLine"
import { AddSaleLineDialog } from "../components/AddSaleLineDialog"
import { formatCRC } from "../utils/date"

import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/features/catalog/services/category.service"

type Category = { idCategory: number; name: string }

export default function SaleDetailPage() {
  const { idSale = "" } = useParams()
  const navigate = useNavigate()

  const { data: sale } = useSale(idSale)
  const { data: lines = [] } = useSaleLines(idSale)
  const { mutateAsync: deleteLine } = useDeleteSaleLine(idSale)

  const [openAdd, setOpenAdd] = useState(false)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["Category", "list"],
    queryFn: getCategories as any,
  })

  const categoryNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of categories) m.set(c.idCategory, c.name)
    return m
  }, [categories])

  return (
    <div className="min-h-screen text-gray-900 dark:bg-[#0b0b0b] dark:text-white">
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div
          className="rounded-3xl bg-white border border-gray-200 p-4 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                     dark:bg-black/40 dark:border-white/10 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center justify-between gap-3">
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

          <div className="mt-4 font-semibold text-gray-900 dark:text-white">
            Total vendido: {sale ? formatCRC(Number(sale.subtotal ?? 0)) : "—"}
          </div>

          <div
            className="mt-5 rounded-3xl border border-gray-200 bg-white p-4
                       dark:border-white/10 dark:bg-black/30"
          >
            <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200
                            dark:text-white/60 dark:border-white/10">
              <div>Cant.</div>
              <div>Artículo</div>
              <div className="text-right">Subtotal</div>
              <div className="text-right">Acción</div>
            </div>

            {lines.length === 0 ? (
              <div className="py-4 text-sm text-gray-600 dark:text-white/70">Sin artículos aún.</div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {lines.map((ln) => (
                  <div key={ln.idSaleLine} className="grid grid-cols-4 items-center py-3 text-sm">
                    <div className="text-gray-700 dark:text-white/80">{ln.qty}</div>

                    <div className="text-gray-900 dark:text-white">
                      {categoryNameById.get(ln.idCategory) ?? `Categoría #${ln.idCategory}`}
                      <div className="text-xs text-gray-500 dark:text-white/60">
                        {formatCRC(Number(ln.unitPrice))} • {ln.oweMoney ? "Fiado" : "Pagado"}
                      </div>
                    </div>

                    <div className="text-right text-gray-900 font-medium dark:text-white">
                      {formatCRC(Number(ln.subtotal))}
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => deleteLine(ln.idSaleLine)}
                        className="inline-flex items-center gap-1 rounded-3xl border border-gray-200 bg-white px-1.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition
                                   dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                      >
                          <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AddSaleLineDialog
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            idSale={idSale}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )
}