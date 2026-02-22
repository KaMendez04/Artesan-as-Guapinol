import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createSale, getAllSales, getSaleById, updateSale } from "../services/sale.service"

export function useAllSales() {
  return useQuery({
    queryKey: ["Sale", "all"],
    queryFn: getAllSales,
  })
}

export function useSale(idSale: string) {
  return useQuery({
    queryKey: ["Sale", "detail", idSale],
    queryFn: () => getSaleById(idSale),
    enabled: !!idSale,
  })
}

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["Sale"] })
    },
  })
}

export function useUpdateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["Sale"] })
    },
  })
}