export type ProductState = "active" | "inactive"

export interface Product {
    idProduct: number
    created_at: string
    name: string | null
    imgUrl: string | null
    price: number | null
    idCategory: number | null
    state: ProductState | null
}

export interface CreateProductDto {
    name: string
    imgUrl?: string | null
    price: number
    idCategory: number
    state?: ProductState
}

export interface UpdateProductDto {
    name?: string
    imgUrl?: string | null
    price?: number
    idCategory?: number
    state?: ProductState
}

export interface ProductFilters {
    idCategory?: number
    state?: ProductState
    search?: string
}
