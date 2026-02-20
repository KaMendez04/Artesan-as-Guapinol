// Entidad Category
export interface Category {
    idCategory: number
    created_at: string
    name: string | null
    state: CategoryState | null
    image_url: string | null
}

// Enum de CategoryState
export type CategoryState = "active" | "inactive"

//Datos requeridos para crear una categoría
export interface CreateCategoryDto {
    name: string
    state?: CategoryState
    image_url?: string | null
}

//Datos opcionales para actualizar una categoría
export interface UpdateCategoryDto {
    name?: string
    state?: CategoryState
    image_url?: string | null
}

//Filtros para listar
export interface CategoryFilters {
    state?: CategoryState
    search?: string
}

// Entity CatalogShare
export interface CatalogShare {
    id: string
    created_at: string
    name: string | null
    is_active: boolean
    category_id: number | null
}
