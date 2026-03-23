import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createSale, getAllSales, getSaleById, updateSale } from "../services/sale.service"
import { useNetwork } from "@/shared/hooks/useNetwork"
import { useOfflineStore } from "@/shared/store/useOfflineStore"
import { sileo } from "sileo"
import { useMemo } from "react"

export function useAllSales() {
  const { pendingSales } = useOfflineStore()
  
  const query = useQuery({
    queryKey: ["Sale", "all"],
    queryFn: getAllSales,
  })

  // Merge pending sales into the list
  const mergedSales = useMemo(() => {
    const remote = query.data ?? []
    const local = pendingSales.map(s => ({
      idSale: s.offlineId,
      subtotal: s.subtotal,
      dateSale: s.dateSale,
      oweMoney: s.oweMoney,
      idPlace: s.idPlace,
      isOffline: true
    }))
    return [...local, ...remote]
  }, [query.data, pendingSales])

  return {
    ...query,
    data: mergedSales
  }
}

export function useSale(idSale: string) {
  const { pendingSales } = useOfflineStore()
  
  const query = useQuery({
    queryKey: ["Sale", "detail", idSale],
    queryFn: () => getSaleById(idSale),
    enabled: !!idSale && !pendingSales.some(s => s.offlineId === idSale),
  })

  const data = useMemo(() => {
    if (query.data) return query.data
    const offline = pendingSales.find(s => s.offlineId === idSale)
    if (offline) {
      return {
        idSale: offline.offlineId,
        idPlace: offline.idPlace,
        dateSale: offline.dateSale,
        subtotal: offline.subtotal,
        oweMoney: offline.oweMoney,
        isOffline: true
      }
    }
    return undefined
  }, [query.data, pendingSales, idSale])

  return {
    ...query,
    data
  }
}

export function useCreateSale() {
  const qc = useQueryClient()
  const { isOnline } = useNetwork()
  const { addPendingSale } = useOfflineStore()

  return useMutation({
    mutationFn: async (payload: { idPlace: number; dateSale: Date }) => {
      if (!isOnline) {
        const offlineId = crypto.randomUUID()
        const offlineSale = {
          offlineId,
          idPlace: payload.idPlace,
          dateSale: payload.dateSale.toISOString(),
          subtotal: 0,
          oweMoney: false
        }
        addPendingSale(offlineSale)
        sileo.info({ title: 'Venta guardada localmente', description: 'Se sincronizará cuando tengas internet.' })
        
        // Return a mock object so UI can continue
        return {
          idSale: offlineId,
          ...offlineSale
        }
      }
      return createSale(payload)
    },
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