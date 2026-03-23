import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  deleteSaleLine,
  insertSaleLine,
  listSaleLines,
  updateSaleLine,
} from "../services/saleLine.service"
import { recomputeSaleSubtotalFromLines } from "../services/saleTotals.service"
import { useNetwork } from "@/shared/hooks/useNetwork"
import { useOfflineStore } from "@/shared/store/useOfflineStore"
import { sileo } from "sileo"

export function useSaleLines(idSale: string) {
  const { pendingSaleLines } = useOfflineStore()

  const query = useQuery({
    queryKey: ["SaleLine", idSale],
    queryFn: () => listSaleLines(idSale),
    enabled: !!idSale && !idSale.includes('-'), // Assume UUIDs with hyphens are offline for now
  })

  // Merge pending lines for this sale
  const localLines = pendingSaleLines.filter(l => l.offlineId === idSale).map((l, i) => ({
    idSaleLine: -(i + 1), // Negative temp ID
    idSale: l.offlineId,
    idCategory: l.idCategory,
    qty: l.qty,
    unitPrice: l.unitPrice,
    subtotal: l.subtotal,
    oweMoney: l.oweMoney,
    sinpe: l.sinpe,
    created_at: new Date().toISOString(),
    isOffline: true
  }))

  const data = query.data ? [...localLines, ...query.data] : (localLines.length > 0 ? localLines : undefined)

  return {
    ...query,
    data
  }
}

export function useInsertSaleLine(idSale: string) {
  const qc = useQueryClient()
  const { isOnline } = useNetwork()
  const { addPendingSaleLine } = useOfflineStore()

  return useMutation({
    mutationFn: async (payload: {
      idSale: string
      idCategory: number
      qty: number
      unitPrice: number
      subtotal: number
      oweMoney: boolean
      sinpe: boolean
    }) => {
      if (!isOnline) {
        addPendingSaleLine({
          offlineId: idSale,
          ...payload
        })
        sileo.info({ title: 'Línea guardada localmente' })
        return
      }
      return insertSaleLine(payload)
    },
    onSuccess: async () => {
      if (isOnline) {
        await recomputeSaleSubtotalFromLines(idSale)
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale"] })
      } else {
        // Simple local refresh for offline data
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
      }
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