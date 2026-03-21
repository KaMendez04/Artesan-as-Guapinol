import { useQuery } from "@tanstack/react-query"
import { getSalesReport } from "../services/reports.service"
import type { ReportFilters } from "../types/reports.types"

// We use the month/year string as a key to invalidate cache when filters change
export function useSalesReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["sales-report", filters.mode, filters.date.toISOString()],
    queryFn: () => getSalesReport(filters.date, filters.mode),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
