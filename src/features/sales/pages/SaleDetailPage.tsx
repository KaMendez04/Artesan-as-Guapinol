import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Plus, Pencil, ChevronDown } from "lucide-react"
import { AddSaleLineDialog } from "../components/AddSaleLineDialog"
import { EditSaleLineDialog } from "../components/EditSaleLineDialog"
import { formatCRC } from "../utils/date"
import { useSaleDetailData } from "../hooks/useSaleDetailData"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination"

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "end"] as const
  }
  if (currentPage >= totalPages - 2) {
    return ["start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
  }
  return ["start", currentPage - 1, currentPage, currentPage + 1, "end"] as const
}

export default function SaleDetailPage() {
  const navigate = useNavigate()
  const {
    idSale,
    validCategories,
    placeName,
    totals,
    categoryNameById,
    orderedLines,
    paginatedLines,
    currentPage,
    setCurrentPage,
    totalPages
  } = useSaleDetailData()

  const [showSummaryDetails, setShowSummaryDetails] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedLine, setSelectedLine] = useState<any>(null)
  const [addKey, setAddKey] = useState(0)

  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="min-h-screen bg-[#ffffff] text-gray-900 dark:bg-[#0b0b0b] dark:text-white">
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/ventas")}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-700 transition hover:bg-gray-50
                         dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
              aria-label="Regresar"
              title="Regresar"
            >
              <ChevronLeft />
            </button>

            <h1 className="text-2xl font-bold tracking-tight">{placeName}</h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setAddKey((k) => k + 1)
              setOpenAdd(true)
            }}
            className="rounded-2xl bg-[#708C3E] p-2.5 text-white transition hover:bg-[#5f7634]"
            aria-label="Agregar"
            title="Agregar"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="rounded-3xl p-4 md:p-6">
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-black/30">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs text-gray-700 dark:text-white/60">
                  Vendido (subtotal)
                </div>
                <div className="text-md font-bold tabular-nums text-gray-900 dark:text-white whitespace-nowrap">
                  {formatCRC(totals.subtotal)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSummaryDetails((v) => !v)}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium
                           text-gray-700 transition hover:bg-gray-50
                           dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
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
                  <span className="text-xs text-red-400">Deben</span>
                  <span className="text-right text-xs font-medium tabular-nums text-red-400 whitespace-nowrap">
                    {formatCRC(totals.deben)}
                  </span>
                  <span className="text-xs text-green-800 dark:text-[#708C3E]">Ganancia total</span>
                  <span className="text-right text-xs font-semibold tabular-nums text-green-800 dark:text-[#708C3E] whitespace-nowrap">
                    {formatCRC(totals.total)}
                  </span>
                  <div className="col-span-2 mt-1 border-t border-gray-100 pt-3 dark:border-white/10" />
                  <span className="text-xs text-gray-700 dark:text-white/75">Efectivo</span>
                  <span className="text-right text-xs font-medium tabular-nums text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCRC(totals.efectivo)}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-white/75">SINPE</span>
                  <span className="text-right text-xs font-medium tabular-nums text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCRC(totals.sinpe)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-4 md:p-5 dark:border-white/10 dark:bg-black/30 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-2 gap-y-1 border-b border-gray-200 pb-2 text-xs font-semibold text-gray-500 md:grid-cols-[70px_1fr_120px_92px] md:gap-x-3 md:text-xs dark:border-white/10 dark:text-white/60">
              <div>Cant.</div>
              <div>Artículo</div>
              <div className="text-right">Subtotal</div>
              <div className="text-right">Editar</div>
            </div>

            {orderedLines.length === 0 ? (
              <div className="py-6 text-sm text-gray-600 dark:text-white/70">Sin artículos aún.</div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {paginatedLines.map((ln) => (
                    <div
                      key={ln.idSaleLine}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-start gap-x-2 gap-y-1 py-4 md:grid-cols-[70px_1fr_120px_92px] md:gap-3"
                    >
                      <div className="pt-0.5 text-xs font-medium text-gray-700 dark:text-white/80 md:text-sm">{ln.qty}</div>
                      <div className="min-w-0">
                        <div className="break-words text-xs font-semibold text-gray-900 dark:text-white md:truncate md:text-sm overflow-hidden">
                          {categoryNameById.get(ln.idCategory) ?? `Categoría #${ln.idCategory}`}
                        </div>
                        <div className={["text-xs", ln.oweMoney ? "text-red-600/80 dark:text-red-500/40" : ""].join(" ")}>
                          {ln.oweMoney ? "Fiado" : ln.sinpe ? "Pagado · SINPE" : "Pagado · Efectivo"}
                        </div>
                      </div>
                      <div className="pt-0.5 text-right text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap md:text-sm">
                        {formatCRC(Number(ln.subtotal))}
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLine(ln)
                            setOpenEdit(true)
                          }}
                          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-1.5 transition hover:bg-gray-50 dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40 md:p-2"
                        >
                          <Pencil size={14} className="text-gray-700 dark:text-white md:size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage > 1) setCurrentPage((p) => p - 1)
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {visiblePages.map((page, index) => {
                          if (page === "start" || page === "end") {
                            return <PaginationItem key={`${page}-${index}`}><PaginationEllipsis /></PaginationItem>
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(page)
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage < totalPages) setCurrentPage((p) => p + 1)
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>

          <AddSaleLineDialog
            key={`add-${addKey}`}
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            idSale={idSale}
            categories={validCategories}
          />

          <EditSaleLineDialog
            key={selectedLine?.idSaleLine ?? "edit-idle"}
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