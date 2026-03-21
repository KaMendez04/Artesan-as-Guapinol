export type ReportFilterMode = "week" | "month"

export interface ReportFilters {
  mode: ReportFilterMode
  date: Date
}

export interface ChartDataPoint {
  label: string // Day name or day number
  fullDate: string
  total: number
}

export interface SalesReportSummary {
  totalSales: number
  averageSale: number
  maxSale: number
  saleCount: number
  data: ChartDataPoint[]
}
