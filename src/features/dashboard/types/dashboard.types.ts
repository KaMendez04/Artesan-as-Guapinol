export interface MonthlySale {
  name: string
  sales: number
  target: number
}

export interface TopProduct {
  name: string
  value: number
}

export interface DashboardStats {
  monthlySales: MonthlySale[]
  topProducts: TopProduct[]
}
