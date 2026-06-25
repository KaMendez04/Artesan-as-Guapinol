import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSalesReport } from "../hooks/useSalesReport"
import { ReportFilters } from "../components/ReportFilters"
import { SummaryCards } from "../components/SummaryCards"
import { SalesChart } from "../components/SalesChart"
import { CategoryChart } from "../components/CategoryChart"
import { ProductSummary } from "../components/ProductSummary"
import type { ReportFilters as IReportFilters } from "../types/reports.types"

export default function ReportsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<IReportFilters>({
    mode: "month",
    date: new Date()
  })
  const [activeTab, setActiveTab] = useState<"general" | "products">("general")

  const { data, isLoading, isError } = useSalesReport(filters)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-3 pb-20 pt-4 sm:px-4 md:px-0 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="rounded-2xl border border-gray-200 bg-background px-3 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          aria-label="Regresar"
          title="Regresar"
        >
          <ArrowLeft className="size-5" />
        </button>

        <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Reportes
        </h1>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        <ReportFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex w-full items-center rounded-2xl bg-gray-100/60 p-1 dark:bg-white/5 lg:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition lg:flex-none ${
              activeTab === "general"
                ? "bg-background text-[#708C3E] shadow-sm dark:text-[#A7D878]"
                : "text-gray-500 hover:text-gray-800 dark:text-white/45 dark:hover:text-white/70"
            }`}
          >
            Resumen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition lg:flex-none ${
              activeTab === "products"
                ? "bg-background text-[#708C3E] shadow-sm dark:text-[#A7D878]"
                : "text-gray-500 hover:text-gray-800 dark:text-white/45 dark:hover:text-white/70"
            }`}
          >
            Productos
          </button>
        </div>
      </div>

      {activeTab === "general" ? (
        <div className="space-y-5">
          <SummaryCards
            totalSales={data?.totalSales || 0}
            averageSale={data?.averageSale || 0}
            maxSale={data?.maxSale || 0}
            isLoading={isLoading}
          />

          <div key={activeTab} className="grid gap-5 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <ProductSummary
            data={data?.productSales || []}
            isLoading={isLoading}
          />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
          No se pudieron cargar los reportes. Intenta de nuevo.
        </div>
      )}
    </div>
  )
}

