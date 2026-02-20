// Entidad Category
export interface Category {
    idCategory: number
    created_at: string
    name: string | null
    state: CategoryState | null
}

// Enum de CategoryState
export type CategoryState = "active" | "inactive"

//Datos requeridos para crear una categoría
export interface CreateCategoryDto {
    name: string
    state?: CategoryState
}

//Datos opcionales para actualizar una categoría
export interface UpdateCategoryDto {
    name?: string
    state?: CategoryState
}

//Filtros para listar
export interface CategoryFilters {
    state?: CategoryState
    search?: string
}
