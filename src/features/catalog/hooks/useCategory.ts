import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
    createCatalogShare,
    getGeneralCatalogShare,
    getCatalogShareById,
} from "@/features/catalog/services/category.service"
import { categoryKeys } from "@/features/catalog/constants/category.keys"
import type {
    CategoryFilters,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "@/features/catalog/types/category.types"

// Hook para listar categorías
export function useCategories(filters?: CategoryFilters) {
    return useQuery({
        queryKey: categoryKeys.list(filters),
        queryFn: () => getCategories(filters),
    })
}

// Hook para obtener una categoría por ID
export function useCategory(id: number) {
    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => getCategoryById(id),
        enabled: !!id,
    })
}

// Hook para crear una categoría
export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateCategoryDto) => createCategory(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        },
    })
}

// Hook para actualizar una categoría
export function useUpdateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: UpdateCategoryDto }) =>
            updateCategory(id, dto),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
        },
    })
}

// Hook para eliminar (hard delete) una categoría
export function useDeleteCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        },
    })
}

// Hook para desactivar (soft delete) una categoría
export function useDeactivateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deactivateCategory(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
        },
    })
}

// Hook para crear un enlace compartido
export function useCreateCatalogShare() {
    return useMutation({
        mutationFn: ({ name, categoryId }: { name?: string; categoryId?: number } = {}) =>
            createCatalogShare(name, categoryId),
    })
}

// Hook para obtener el enlace general existente
export function useGeneralCatalogShare() {
    return useQuery({
        queryKey: ["catalog-share", "general"],
        queryFn: getGeneralCatalogShare,
    })
}

// Hook para obtener detalles de un enlace compartido por su UUID
export function useCatalogShareDetail(id: string) {
    return useQuery({
        queryKey: ["catalog-share", id],
        queryFn: () => getCatalogShareById(id),
        enabled: !!id,
    })
}
