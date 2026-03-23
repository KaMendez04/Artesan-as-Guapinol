export type SaleFilterMode = "day" | "week" | "month" | "year"

export type Place = {
  idPlace: number
  name: string
}

export type Category = {
  idCategory: number
  name: string
  state?: string
}

export type Sale = {
  idSale: string
  subtotal: number
  dateSale: string
  oweMoney: boolean
  idPlace: number
  place?: Place // opcional (si haces join)
  sinpe: boolean 
}

export type SaleCategoryRow = {
  idSaleCategory: number
  total: number
  idCategory: number
  idSale: string
  category?: Category // opcional (si haces join)
}

export type SaleListFilters = {
  mode: SaleFilterMode
  anchorDate: Date
  placeId?: number // requerido cuando mode === "day"
  search?: string
}