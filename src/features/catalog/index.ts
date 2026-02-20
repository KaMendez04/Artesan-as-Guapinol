/**
 * Barrel export para la feature de catálogo.
 * Importa todo lo de categorías desde un solo punto:
 *
 * @example
 * import { useCategories, useCreateCategory } from "@/features/catalog"
 */

// Tipos
export type {
    Category,
    CategoryState,
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryFilters,
} from "./types/category.types"

// Servicio (acceso directo si se necesita fuera de React)
export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
} from "./services/category.service"

// Hooks
export {
    useCategories,
    useCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    useDeactivateCategory,
} from "./hooks/useCategory"

// Query keys (para invalidación manual si se necesita)
export { categoryKeys } from "./constants/category.keys"
