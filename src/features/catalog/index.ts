// Index de importaciones para evitar hacer muchos imports

// Tipos    
export type {
    Category,
    CategoryState,
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryFilters,
} from "./types/category.types"

// Servicios
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

// Query keys
export { categoryKeys } from "./constants/category.keys"
