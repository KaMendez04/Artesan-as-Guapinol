import { useState } from "react"
import { useSalesReport } from "../hooks/useSalesReport"
import { ReportFilters } from "../components/ReportFilters"
import { SummaryCards } from "../components/SummaryCards"
import { SalesChart } from "../components/SalesChart"
import { CategoryChart } from "../components/CategoryChart"
import { ProductSummary } from "../components/ProductSummary"
import type { ReportFilters as IReportFilters } from "../types/reports.types"

export default function ReportsPage() {
  const [filters, setFilters] = useState<IReportFilters>({
    mode: "month",
    date: new Date()
  })
  const [activeTab, setActiveTab] = useState<"general" | "products">("general")

  const { data, isLoading, isError } = useSalesReport(filters)

  return (
    <div className="flex-1 space-y-6 pt-6 pb-20 md:pb-6">
      <div className="flex px-4 md:px-0 items-center justify-between mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reportes de Ventas
          </h2>
        </div>
      </div>

      <div className="px-4 md:px-0 space-y-4">
        <ReportFilters filters={filters} onFiltersChange={setFilters} />
        
        {/* Tabs / Navbar */}
        <div className="flex items-center p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("general")}
            className={`rounded-xl px-6 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === "general"
                ? "bg-white dark:bg-white/10 text-[#708C3E] dark:text-[#9FE870] shadow-sm"
                : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60"
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`rounded-xl px-6 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === "products"
                ? "bg-white dark:bg-white/10 text-[#708C3E] dark:text-[#9FE870] shadow-sm"
                : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60"
            }`}
          >
            Venta de Productos
          </button>
        </div>
      </div>

      <div className="px-4 md:px-0 space-y-6">
        {activeTab === "general" ? (
          <>
            <SummaryCards 
              totalSales={data?.totalSales || 0}
              averageSale={data?.averageSale || 0}
              maxSale={data?.maxSale || 0}
              isLoading={isLoading}
            />

            <div key={activeTab} className="grid gap-6 lg:grid-cols-7 animate-in fade-in duration-500">
              <SalesChart 
                data={data?.data || []} 
                mode={filters.mode} 
                isLoading={isLoading} 
              />
              <CategoryChart 
                data={data?.categorySales || []} 
                isLoading={isLoading} 
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <ProductSummary 
              data={data?.productSales || []} 
              isLoading={isLoading} 
            />
          </div>
        )}

        {isError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
            Hubo un error al cargar los datos. Por favor, intenta de nuevo.
          </div>
        )}
      </div>
    </div>
  )
}

