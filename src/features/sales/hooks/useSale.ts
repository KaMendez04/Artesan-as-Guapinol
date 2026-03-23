import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createSale, getAllSales, getSaleById, updateSale } from "../services/sale.service"
import { useNetwork } from "@/shared/hooks/useNetwork"
import { useOfflineStore } from "@/shared/store/useOfflineStore"
import { sileo } from "sileo"

export function useAllSales() {
  const { pendingSales } = useOfflineStore()
  
  const query = useQuery({
    queryKey: ["Sale", "all"],
    queryFn: getAllSales,
  })

  // Merge pending sales into the list
  const data = query.data ? [...pendingSales.map(s => ({
    idSale: s.offlineId,
    subtotal: s.subtotal,
    dateSale: s.dateSale,
    oweMoney: s.oweMoney,
    idPlace: s.idPlace,
    isOffline: true // Helpful flag for UI
  })), ...query.data] : (pendingSales.length > 0 ? pendingSales.map(s => ({
    idSale: s.offlineId,
    subtotal: s.subtotal,
    dateSale: s.dateSale,
    oweMoney: s.oweMoney,
    idPlace: s.idPlace,
    isOffline: true
  })) : undefined)

  return {
    ...query,
    data
  }
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