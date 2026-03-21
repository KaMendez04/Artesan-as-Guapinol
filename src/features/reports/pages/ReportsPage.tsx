import { useState } from "react"
import { useSalesReport } from "../hooks/useSalesReport"
import { ReportFilters } from "../components/ReportFilters"
import { SummaryCards } from "../components/SummaryCards"
import { SalesChart } from "../components/SalesChart"
import type { ReportFilters as IReportFilters } from "../types/reports.types"

export default function ReportsPage() {
  const [filters, setFilters] = useState<IReportFilters>({
    mode: "month",
    date: new Date()
  })

  const { data, isLoading, isError } = useSalesReport(filters)

  return (
    <div className="flex-1 space-y-6 pt-6 pb-20 md:pb-6">
      <div className="flex px-4 md:px-0 items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes de Ventas</h2>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tus ventas por periodo.
          </p>
        </div>
      </div>

      <div className="px-4 md:px-0">
        <ReportFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <div className="px-4 md:px-0 space-y-6">
        <SummaryCards 
          totalSales={data?.totalSales || 0}
          averageSale={data?.averageSale || 0}
          maxSale={data?.maxSale || 0}
          saleCount={data?.saleCount || 0}
          isLoading={isLoading}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SalesChart 
            data={data?.data || []} 
            mode={filters.mode} 
            isLoading={isLoading} 
          />
        </div>

        {isError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
            Hubo un error al cargar los datos. Por favor, intenta de nuevo.
          </div>
        )}
      </div>
    </div>
  )
}
