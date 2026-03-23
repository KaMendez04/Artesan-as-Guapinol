import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination"
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
          <Card key={i} className="rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm h-[80px] animate-pulse" />
        ))}
      </div>
    )
  }

  const hasData = data && data.length > 0
  const totalPages = Math.ceil((data?.length || 0) / ITEMS_PER_PAGE)
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentData = data.slice(startIndex, endIndex)

  return (
    <Card className="rounded-3xl border-none bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm overflow-hidden flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Resumen de Productos</CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {!hasData ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-white/20">
            <p className="text-sm">No hay datos de productos para este periodo</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {/* Desktop View Table */}
              <table className="w-full text-left hidden sm:table">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 font-medium border-b border-gray-100 dark:border-white/5">
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-center">Cantidad Total</th>
                    <th className="px-4 py-3 text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {currentData.map((prod, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{prod.categoryName}</div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                        {prod.quantity}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-[#708C3E] dark:text-[#9FE870]">
                        ₡{prod.total.toLocaleString("es-CR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile View List */}
              <div className="sm:hidden space-y-1 divide-y divide-gray-50 dark:divide-white/5">
                {currentData.map((prod, idx) => (
                  <div key={idx} className="px-4 py-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900 dark:text-white">{prod.categoryName}</div>
                      <div className="text-xs text-gray-500 dark:text-white/40">
                        {prod.quantity} unidades vendidas
                      </div>
                    </div>
                    <div className="font-bold text-[#708C3E] dark:text-[#9FE870] text-sm">
                      ₡{prod.total.toLocaleString("es-CR")}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="py-6 px-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 disabled:opacity-30"
                      >
                        <PaginationPrevious />
                      </button>
                    </PaginationItem>
                    
                    <div className="flex items-center gap-1 mx-2">
                       <span className="text-sm font-medium text-gray-500 dark:text-white/40">
                         Página {currentPage} de {totalPages}
                       </span>
                    </div>

                    <PaginationItem>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 disabled:opacity-30"
                      >
                        <PaginationNext />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

