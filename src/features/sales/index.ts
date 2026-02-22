//utility exports
export { toInputDateValue, formatCRC, fromInputDateValue } from "./utils/date"
export { getRange } from "./utils/dateRange"

//types exports
export type { SaleFilterMode, Place, Category, Sale, SaleCategoryRow, SaleListFilters } from "./types/sale.types"

//services exports
export { getPlaces, getOrCreatePlaceByName } from "./services/place.service"
export { listUniquePricesByCategory } from "./services/productPrice.service"
export { createSale, getAllSales, getSaleById, updateSale } from "./services/sale.service"
export { insertSaleLine, updateSaleLine, deleteSaleLine } from "./services/saleLine.service"
export { recomputeSaleSubtotalFromLines } from "./services/saleTotals.service"
export { getCategories } from "./services/category.service"
export { listSaleCategories, upsertSaleCategoryLine, deleteSaleCategoryLine } from "./services/saleCategory.service"


//hooks exports
export { useSale, useUpdateSale, useCreateSale, useAllSales } from "./hooks/useSale"
export { useSaleLines, useUpdateSaleLine, useDeleteSaleLine } from "./hooks/useSaleLine"
export { usePlaces } from "./hooks/usePlace"
export { useInsertSaleLine } from "./hooks/useSaleLine"

export { saleKeys, placeKeys, categoryKeys } from "./constants/sale.keys"
