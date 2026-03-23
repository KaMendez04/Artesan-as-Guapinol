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
import { useMemo } from "react"

export function useSaleLines(idSale: string) {
  const { pendingSaleLines, pendingSales } = useOfflineStore()

  const query = useQuery({
    queryKey: ["SaleLine", idSale],
    queryFn: () => listSaleLines(idSale),
    enabled: !!idSale && !pendingSales.some((s: any) => s.offlineId === idSale),
  })

  const mergedLines = useMemo(() => {
    const remote = query.data ?? []
    // Merge pending lines for this sale
    const local = pendingSaleLines.filter(l => l.offlineId === idSale).map((l, i) => ({
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
    return [...local, ...remote]
  }, [query.data, pendingSaleLines, idSale])

  return {
    ...query,
    data: mergedLines
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
      const { pendingSales } = useOfflineStore.getState()
      const isOfflineSale = pendingSales.some(s => s.offlineId === idSale)

      if (!isOnline || isOfflineSale) {
        addPendingSaleLine({
          offlineId: idSale,
          ...payload
        })
        sileo.info({ 
          title: 'Artículo guardado localmente',
          description: isOfflineSale ? 'Sincronizará cuando la venta se envíe.' : 'Sincronizará cuando tengas internet.'
        })
        return
      }
      return insertSaleLine(payload)
    },
    onSuccess: () => {
      const { pendingSales } = useOfflineStore.getState()
      const isOfflineSale = pendingSales.some(s => s.offlineId === idSale)

      if (isOnline && !isOfflineSale) {
        // Run background tasks without awaiting them to avoid blocking UI close
        recomputeSaleSubtotalFromLines(idSale).catch(e => console.error("Error recomputing subtotal:", e))
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale"] })
      } else {
        // For offline, we only need to refresh the local view of lines
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
      }
    },
  })
}

export function useUpdateSaleLine(idSale: string) {
  const qc = useQueryClient()
  const { isOnline } = useNetwork()
  return useMutation({
    mutationFn: updateSaleLine,
    onSuccess: () => {
      const { pendingSales } = useOfflineStore.getState()
      const isOfflineSale = pendingSales.some(s => s.offlineId === idSale)

      if (isOnline && !isOfflineSale) {
        recomputeSaleSubtotalFromLines(idSale).catch(e => console.error("Error recomputing subtotal:", e))
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale"] })
      } else {
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
      }
    },
  })
}

export function useDeleteSaleLine(idSale: string) {
  const qc = useQueryClient()
  const { isOnline } = useNetwork()
  return useMutation({
    mutationFn: deleteSaleLine,
    onSuccess: () => {
      const { pendingSales } = useOfflineStore.getState()
      const isOfflineSale = pendingSales.some(s => s.offlineId === idSale)

      if (isOnline && !isOfflineSale) {
        recomputeSaleSubtotalFromLines(idSale).catch(e => console.error("Error recomputing subtotal:", e))
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale", "detail", idSale] })
        qc.invalidateQueries({ queryKey: ["Sale"] })
      } else {
        qc.invalidateQueries({ queryKey: ["SaleLine", idSale] })
      }
    },
  })
}