// ─── Entidad base tal como vive en Supabase ───────────────────────────────────
export interface Category {
    idCategory: number
    created_at: string
    name: string | null
    state: CategoryState | null
}

// Enum que refleja el tipo personalizado `public.states` de Supabase
export type CategoryState = "active" | "inactive"

// ─── DTOs ─────────────────────────────────────────────────────────────────────
/** Datos requeridos para crear una categoría */
export interface CreateCategoryDto {
    name: string
    state?: CategoryState
}

/** Datos opcionales para actualizar una categoría */
export interface UpdateCategoryDto {
    name?: string
    state?: CategoryState
}

// ─── Filtros para listar ──────────────────────────────────────────────────────
export interface CategoryFilters {
    state?: CategoryState
    search?: string
}
