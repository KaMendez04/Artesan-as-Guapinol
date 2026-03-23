import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "../services/dashboardService"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1
  })
}
