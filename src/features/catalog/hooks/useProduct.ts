import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "@/features/catalog/services/product.service"
import type {
    ProductFilters,
    CreateProductDto,
    UpdateProductDto,
} from "@/features/catalog/types/product.types"

const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (filters?: ProductFilters) => [...productKeys.lists(), { filters }] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: number) => [...productKeys.details(), id] as const,
}

export function useProducts(filters?: ProductFilters) {
    return useQuery({
        queryKey: productKeys.list(filters),
        queryFn: () => getProducts(filters),
    })
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => getProductById(id),
        enabled: !!id,
    })
}

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateProductDto) => createProduct(dto),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() })
            // También invalidar la lista específica si se conoce el idCategory
            if (variables.idCategory) {
                queryClient.invalidateQueries({
                    queryKey: productKeys.list({ idCategory: variables.idCategory })
                })
            }
        },
    })
}

export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: UpdateProductDto }) =>
            updateProduct(id, dto),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() })
            queryClient.invalidateQueries({ queryKey: productKeys.detail(data.idProduct) })
            if (data.idCategory) {
                queryClient.invalidateQueries({
                    queryKey: productKeys.list({ idCategory: data.idCategory })
                })
            }
        },
    })
}

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() })
        },
    })
}
