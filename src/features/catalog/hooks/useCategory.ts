import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
} from "@/features/catalog/services/category.service"
import { categoryKeys } from "@/features/catalog/constants/category.keys"
import type {
    CategoryFilters,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "@/features/catalog/types/category.types"

// ─── Queries (lectura) ────────────────────────────────────────────────────────

/**
 * Hook para listar categorías.
 * @example const { data, isLoading } = useCategories({ state: "active" })
 */
export function useCategories(filters?: CategoryFilters) {
    return useQuery({
        queryKey: categoryKeys.list(filters),
        queryFn: () => getCategories(filters),
    })
}

/**
 * Hook para obtener una categoría por ID.
 * @example const { data } = useCategory(1)
 */
export function useCategory(id: number) {
    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => getCategoryById(id),
        enabled: !!id,
    })
}

// ─── Mutations (escritura) ────────────────────────────────────────────────────

/**
 * Hook para crear una categoría.
 * Al completarse, invalida la lista para refrescarla automáticamente.
 */
export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateCategoryDto) => createCategory(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        },
    })
}

/**
 * Hook para actualizar una categoría.
 * Invalida tanto la lista como el detalle específico.
 */
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

/**
 * Hook para eliminar (hard delete) una categoría.
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        },
    })
}

/**
 * Hook para desactivar (soft delete) una categoría.
 */
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
