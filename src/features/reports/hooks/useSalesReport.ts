import { useQuery } from "@tanstack/react-query"
import { getFlowReport } from "../services/reports.service"
import type { ReportFilters } from "../types/reports.types"

export function useSalesReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["flow-report", filters.mode, filters.date.toISOString()],
    queryFn: () => getFlowReport(filters.date, filters.mode),
    staleTime: 1000 * 60 * 5,
  })
}
