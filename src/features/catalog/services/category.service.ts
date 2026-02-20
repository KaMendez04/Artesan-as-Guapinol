import { supabase } from "@/lib/supabase"
import type {
    Category,
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryFilters,
} from "@/features/catalog/types/category.types"

const TABLE = "Category" as const

export async function getCategories(filters?: CategoryFilters): Promise<Category[]> {
    let query = supabase
        .from(TABLE)
        .select("idCategory, created_at, name, state")
        .order("name", { ascending: true })

    if (filters?.state) {
        query = query.eq("state", filters.state)
    }

    if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al obtener categorías: ${error.message}`)

    return data
}

export async function getCategoryById(id: number): Promise<Category> {
    const { data, error } = await supabase
        .from(TABLE)
        .select("idCategory, created_at, name, state")
        .eq("idCategory", id)
        .single()

    if (error) throw new Error(`Categoría ${id} no encontrada: ${error.message}`)

    return data
}

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
    const { data, error } = await supabase
        .from(TABLE)
        .insert([{ name: dto.name, state: dto.state ?? "active" }])
        .select("idCategory, created_at, name, state")
        .single()

    if (error) throw new Error(`Error al crear categoría: ${error.message}`)

    return data
}

export async function updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const { data, error } = await supabase
        .from(TABLE)
        .update(dto)
        .eq("idCategory", id)
        .select("idCategory, created_at, name, state")
        .single()

    if (error) throw new Error(`Error al actualizar categoría ${id}: ${error.message}`)

    return data
}

export async function deleteCategory(id: number): Promise<void> {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("idCategory", id)

    if (error) throw new Error(`Error al eliminar categoría ${id}: ${error.message}`)
}

export async function deactivateCategory(id: number): Promise<Category> {
    return updateCategory(id, { state: "inactive" })
}
