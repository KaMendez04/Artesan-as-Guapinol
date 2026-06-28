import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { purchaseKeys } from "../constants/purchase.keys"
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getDistinctTiendas,
} from "../services/purchase.service"
import type { CreatePurchaseDto, UpdatePurchaseDto } from "../types/purchase.types"

export function usePurchases() {
  return useQuery({
    queryKey: purchaseKeys.list(),
    queryFn: getPurchases,
  })
}

export function useTiendas() {
  return useQuery({
    queryKey: [...purchaseKeys.all, "tiendas"],
    queryFn: getDistinctTiendas,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreatePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePurchaseDto) => createPurchase(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: purchaseKeys.lists() })
    },
  })
}

export function useUpdatePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePurchaseDto }) =>
      updatePurchase(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: purchaseKeys.lists() })
    },
  })
}

export function useDeletePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePurchase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: purchaseKeys.lists() })
    },
  })
}
