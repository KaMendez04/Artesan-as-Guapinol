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
  const [filters, setFilters] = useState<IReportFilters>({ mode: "month", date: new Date() })
  const [activeTab, setActiveTab] = useState<"general" | "products">("general")

  const { data, isLoading, isError } = useSalesReport(filters)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-3 pb-20 pt-4 sm:px-4 md:px-0 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm transition"
          aria-label="Regresar"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Reportes
        </h1>
      </div>

      {/* Filtros de período */}
      <ReportFilters filters={filters} onFiltersChange={setFilters} />

      {/* Tabs */}
      <div className="flex items-center rounded-2xl bg-gray-100/60 p-1 dark:bg-white/5">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
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
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "products"
              ? "bg-background text-[#708C3E] shadow-sm dark:text-[#A7D878]"
              : "text-gray-500 hover:text-gray-800 dark:text-white/45 dark:hover:text-white/70"
          }`}
        >
          Productos
        </button>
      </div>

      {activeTab === "general" ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <SummaryCards
            totalIncome={data?.totalIncome ?? 0}
            totalExpenses={data?.totalExpenses ?? 0}
            balance={data?.balance ?? 0}
            isLoading={isLoading}
          />
          <SalesChart
            data={data?.chartData ?? []}
            mode={filters.mode}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <CategoryChart
            data={data?.categorySales ?? []}
            isLoading={isLoading}
          />
          <ProductSummary
            data={data?.productSales ?? []}
            isLoading={isLoading}
          />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
          No se pudieron cargar los reportes. Intentá de nuevo.
        </div>
      )}
    </div>
  )
}
