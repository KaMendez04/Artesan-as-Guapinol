export type ProductState = "active" | "inactive"

export interface Product {
    idProduct: number
    created_at: string
    name: string | null
    images: string[] | null
    price: number | null
    idCategory: number | null
    state: ProductState | null
}

export interface CreateProductDto {
    name: string
    images?: string[] | null
    price: number
    idCategory: number
    state?: ProductState
}

export interface UpdateProductDto {
    name?: string
    images?: string[] | null
    price?: number
    idCategory?: number
    state?: ProductState
}

export interface ProductFilters {
    idCategory?: number
    state?: ProductState
    search?: string
}
