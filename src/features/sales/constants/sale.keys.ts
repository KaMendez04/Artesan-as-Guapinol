import type { SaleListFilters } from "../types/sale.types"

export const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (filters: SaleListFilters) => [...saleKeys.lists(), filters] as const,
  detail: (idSale: string) => [...saleKeys.all, "detail", idSale] as const,
  categories: (idSale: string) => [...saleKeys.all, "categories", idSale] as const,
}

export const placeKeys = {
  all: ["places"] as const,
  list: () => [...placeKeys.all, "list"] as const,
}

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
}