export type ReportFilterMode = "week" | "month"

export interface ReportFilters {
  mode: ReportFilterMode
  date: Date
}

export interface FlowChartPoint {
  label: string
  fullDate: string
  income: number
  expenses: number
}

export interface CategorySale {
  idCategory: number
  name: string
  total: number
}

export interface ProductSale {
  idCategory: number
  categoryName: string
  unitPrice: number
  quantity: number
  total: number
}

export interface FlowReportSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  averageSale: number
  saleCount: number
  chartData: FlowChartPoint[]
  categorySales: CategorySale[]
  productSales: ProductSale[]
}
