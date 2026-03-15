import { supabase } from "@/lib/supabase"
import type {
    Category,
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryFilters,
    CatalogShare,
} from "@/features/catalog/types/category.types"

const TABLE = "Category" as const

export async function getCategories(filters?: CategoryFilters): Promise<Category[]> {
    let query = supabase
        .from(TABLE)
        .select("idCategory, created_at, name, state, image_url")
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
        .select("idCategory, created_at, name, state, image_url")
        .eq("idCategory", id)
        .single()

    if (error) throw new Error(`Categoría ${id} no encontrada: ${error.message}`)

    return data
}

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
    const { data, error } = await supabase
        .from(TABLE)
        .insert([{
            name: dto.name,
            state: dto.state ?? "active",
            image_url: dto.image_url
        }])
        .select("idCategory, created_at, name, state, image_url")
        .single()

    if (error) throw new Error(`Error al crear categoría: ${error.message}`)

    return data
}

export async function updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const { data, error } = await supabase
        .from(TABLE)
        .update(dto)
        .eq("idCategory", id)
        .select("idCategory, created_at, name, state, image_url")
        .maybeSingle()

    if (error) throw new Error(`Error al actualizar categoría ${id}: ${error.message}`)
    if (!data) throw new Error(`No se pudo actualizar la categoría ${id}. Verifica tus permisos.`)

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

export async function createCatalogShare(name?: string, categoryId?: number): Promise<CatalogShare> {
    const { data, error } = await supabase
        .from("CatalogShare")
        .insert([{
            name: name ?? "Enlace compartido",
            category_id: categoryId ?? null
        }])
        .select()
        .single()

    if (error) throw new Error(`Error al crear enlace compartido: ${error.message}`)

    return data
}

export async function getGeneralCatalogShare(): Promise<CatalogShare | null> {
    const { data, error } = await supabase
        .from("CatalogShare")
        .select()
        .is("category_id", null)
        .eq("name", "General")
        .eq("is_active", true)
        .maybeSingle()

    if (error) throw new Error(`Error al buscar enlace general: ${error.message}`)

    return data
}

export async function getCatalogShareById(id: string): Promise<CatalogShare> {
    const { data, error } = await supabase
        .from("CatalogShare")
        .select()
        .eq("id", id)
        .eq("is_active", true)
        .single()

    if (error) throw new Error(`Enlace no válido o expirado: ${error.message}`)

    return data
}
