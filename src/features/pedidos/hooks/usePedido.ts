import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido,
} from "@/features/pedidos/services/pedido.service"
import { pedidoKeys } from "@/features/pedidos/constants/pedido.keys"
import type {
    PedidoFilters,
    CreatePedidoDto,
    UpdatePedidoDto,
} from "@/features/pedidos/types/pedido.types"

export function usePedidos(filters?: PedidoFilters) {
    return useQuery({
        queryKey: pedidoKeys.list(filters),
        queryFn: () => getPedidos(filters),
    })
}

export function usePedido(id: string) {
    return useQuery({
        queryKey: pedidoKeys.detail(id),
        queryFn: () => getPedidoById(id),
        enabled: !!id,
    })
}

export function useCreatePedido() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreatePedidoDto) => createPedido(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pedidoKeys.lists() })
        },
    })
}

export function useUpdatePedido() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdatePedidoDto }) =>
            updatePedido(id, dto),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: pedidoKeys.lists() })
            queryClient.invalidateQueries({ queryKey: pedidoKeys.detail(id) })
        },
    })
}

export function useDeletePedido() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deletePedido(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pedidoKeys.lists() })
        },
    })
}
