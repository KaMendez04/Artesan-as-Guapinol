import { supabase } from "@/lib/supabase"
import type {
    Product,
    CreateProductDto,
    UpdateProductDto,
    ProductFilters,
} from "@/features/catalog/types/product.types"

const TABLE = "Product" as const

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
        .from(TABLE)
        .select("*")
        .order("name", { ascending: true })

    if (filters?.idCategory) {
        query = query.eq("idCategory", filters.idCategory)
    }

    if (filters?.state) {
        query = query.eq("state", filters.state)
    }

    if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al obtener productos: ${error.message}`)

    return data as Product[]
}

export async function getProductById(id: number): Promise<Product> {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("idProduct", id)
        .single()

    if (error) throw new Error(`Producto ${id} no encontrado: ${error.message}`)

    return data as Product
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
    const { data, error } = await supabase
        .from(TABLE)
        .insert([{
            name: dto.name,
            images: dto.images,
            price: dto.price,
            idCategory: dto.idCategory,
            state: dto.state ?? "active"
        }])
        .select("*")
        .single()

    if (error) throw new Error(`Error al crear producto: ${error.message}`)

    return data as Product
}

export async function updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const { data, error } = await supabase
        .from(TABLE)
        .update(dto)
        .eq("idProduct", id)
        .select("*")
        .single()

    if (error) throw new Error(`Error al actualizar producto ${id}: ${error.message}`)

    return data as Product
}

export async function deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("idProduct", id)

    if (error) throw new Error(`Error al eliminar producto ${id}: ${error.message}`)
}
