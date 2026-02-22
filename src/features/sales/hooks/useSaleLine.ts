import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  deleteSaleLine,
  insertSaleLine,
  listSaleLines,
  updateSaleLine,
} from "../services/saleLine.service"
import { recomputeSaleSubtotalFromLines } from "../services/saleTotals.service"

export function useSaleLines(idSale: string) {
  return useQuery({
    queryKey: ["SaleLine", idSale],
    queryFn: () => listSaleLines(idSale),
    enabled: !!idSale,
  })
}

export function useInsertSaleLine(idSale: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: insertSaleLine,
    onSuccess: async () => {
      await recomputeSaleSubtotalFromLines(idSale)
      qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale"] })
    },
  })
}

export function useUpdateSaleLine(idSale: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateSaleLine,
    onSuccess: async () => {
      await recomputeSaleSubtotalFromLines(idSale)
      qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale"] })
    },
  })
}

export function useDeleteSaleLine(idSale: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteSaleLine,
    onSuccess: async () => {
      await recomputeSaleSubtotalFromLines(idSale)
      qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
      qc.invalidateQueries({ queryKey: ["Sale"] })
    },
  })
}