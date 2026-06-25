import { useState } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { AppPagination } from "@/shared/components/ui/AppPagination"
import type { ProductSale } from "../types/reports.types"

interface ProductSummaryProps {
  data: ProductSale[]
  isLoading?: boolean
}

const ITEMS_PER_PAGE = 10

export function ProductSummary({ data, isLoading }: ProductSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-[86px] animate-pulse rounded-2xl border-gray-100 bg-background dark:border-white/10" />
        ))}
      </div>
    )
  }

  const hasData = data && data.length > 0
  const totalPages = Math.ceil((data?.length || 0) / ITEMS_PER_PAGE)
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentData = data.slice(startIndex, endIndex)
  const totalProducts = data.reduce((acc, product) => acc + product.quantity, 0)
  const totalAmount = data.reduce((acc, product) => acc + product.total, 0)

  return (
    <Card className="rounded-2xl border-gray-100 bg-background shadow-sm dark:border-white/10">
      <CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Productos vendidos</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
              Ordenados por monto vendido.
            </p>
          </div>
          {hasData && (
            <div className="grid grid-cols-2 gap-2 sm:min-w-[240px]">
              <div className="rounded-2xl bg-[#708C3E]/10 px-3 py-2 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#A7D878]">
                <p className="text-[11px] font-semibold">Unidades</p>
                <p className="text-lg font-bold">{totalProducts.toLocaleString("es-CR")}</p>
              </div>
              <div className="rounded-2xl bg-[#D99045]/10 px-3 py-2 text-[#9C543F] dark:bg-[#F0A94A]/15 dark:text-[#F0A94A]">
                <p className="text-[11px] font-semibold">Monto</p>
                <p className="truncate text-lg font-bold">₡{totalAmount.toLocaleString("es-CR")}</p>
              </div>
            </div>
          )}
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-12 text-center text-gray-500 dark:border-white/10 dark:text-white/45">
            <p className="text-sm font-medium">No hay productos vendidos en este periodo.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {currentData.map((prod, idx) => {
                const position = startIndex + idx + 1
                return (
                  <div
                    key={`${prod.idCategory}-${prod.unitPrice}-${position}`}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-background p-3 transition hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-500 dark:bg-white/5 dark:text-white/55">
                      {position}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {prod.categoryName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-white/45">
                        {prod.quantity} {prod.quantity === 1 ? "unidad" : "unidades"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#708C3E] dark:text-[#A7D878]">
                        ₡{prod.total.toLocaleString("es-CR")}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-white/35">
                        ₡{Number(prod.unitPrice || 0).toLocaleString("es-CR")} c/u
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <AppPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="pt-5"
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

