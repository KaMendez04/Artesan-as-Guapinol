import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  deleteSaleCategoryLine,
  listSaleCategories,
  recomputeSaleSubtotal,
  upsertSaleCategoryLine,
} from "../services/saleCategory.service"
import { updateSale } from "../services/sale.service"

export function useSaleCategories(idSale: string) {
  return useQuery({
    queryKey: ["SaleCategory", idSale],
    queryFn: () => listSaleCategories(idSale),
    enabled: !!idSale,
  })
}

export function useUpsertSaleCategoryLine(idSale: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: upsertSaleCategoryLine,
    onSuccess: async () => {
      const subtotal = await recomputeSaleSubtotal(idSale)
      await updateSale({ idSale, subtotal })
      qc.invalidateQueries({ queryKey: ["SaleCategory", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale"] })
    },
  })
}

export function useDeleteSaleCategoryLine(idSale: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteSaleCategoryLine,
    onSuccess: async () => {
      const subtotal = await recomputeSaleSubtotal(idSale)
      await updateSale({ idSale, subtotal })
      qc.invalidateQueries({ queryKey: ["SaleCategory", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale"] })
    },
  })
}