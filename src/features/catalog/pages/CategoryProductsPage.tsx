import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Search, Package } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ProductCard } from "@/features/catalog/components/ProductCard"
import { ProductFormDialog } from "@/features/catalog/components/ProductFormDialog"
import { useProducts, useDeleteProduct } from "@/features/catalog/hooks/useProduct"
import { useCategory } from "@/features/catalog/hooks/useCategory"
import { sileo } from "sileo"
import type { Product } from "@/features/catalog/types/product.types"

export default function CategoryProductsPage() {
    const { id } = useParams<{ id: string }>()
    const idCategory = Number(id)
    const navigate = useNavigate()

    const [search, setSearch] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const { data: category, isLoading: isLoadingCategory } = useCategory(idCategory)

    const { data: products = [], isLoading: isLoadingProducts } = useProducts({
        idCategory,
        search: search || undefined
    })

    const deleteProduct = useDeleteProduct()

    const handleAdd = () => {
        setSelectedProduct(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (product: Product) => {
        setSelectedProduct(product)
        setIsDialogOpen(true)
    }

    const handleDelete = async (product: Product) => {
        if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
            try {
                await deleteProduct.mutateAsync(product.idProduct)
                sileo.success({ title: "Producto eliminado" })
            } catch (error) {
                sileo.error({ title: "Error al eliminar" })
            }
        }
    }

    const isLoading = isLoadingCategory || isLoadingProducts

    return (
        <div className="flex flex-col gap-6">
            {/* ═══ BACK + HEADER ═══ */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit gap-2 -ml-2 rounded-full text-[#5D4037]/60 dark:text-[#D7CCC8]/60 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] hover:bg-[#708C3E]/10 transition-colors"
                    onClick={() => navigate("/catalogo")}
                >
                    <ArrowLeft className="size-4" />
                    Volver al catálogo
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#5D4037] dark:text-[#D7CCC8]">
                            {isLoadingCategory ? <Skeleton className="h-8 w-48 bg-[#E8E5D8]/40 dark:bg-zinc-700/40" /> : category?.name}
                        </h1>
                        {!isLoadingCategory && (
                            <p className="mt-1 text-sm text-[#5D4037]/50 dark:text-[#D7CCC8]/50">
                                {products.length} {products.length === 1 ? "producto" : "productos"}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="gap-2 rounded-xl bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-sm shadow-[#708C3E]/20 transition-colors"
                    >
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">Nuevo Producto</span>
                        <span className="sm:hidden">Nuevo</span>
                    </Button>
                </div>
            </div>

            {/* ═══ SEARCH ═══ */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#5D4037]/30 dark:text-[#D7CCC8]/30" />
                <Input
                    placeholder="Buscar productos..."
                    className="h-10 rounded-xl border-[#E8E5D8] dark:border-zinc-700 bg-white dark:bg-zinc-800/50 pl-10 text-sm text-[#5D4037] dark:text-[#D7CCC8] shadow-none placeholder:text-[#5D4037]/30 dark:placeholder:text-[#D7CCC8]/30 focus-visible:ring-1 focus-visible:ring-[#708C3E]/50 focus-visible:border-[#708C3E]/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* ═══ PRODUCT GRID ═══ */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-[#E8E5D8] dark:ring-zinc-700">
                            <Skeleton className="aspect-[4/3] w-full bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                            <div className="space-y-2 p-4">
                                <Skeleton className="h-4 w-3/4 bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                                <Skeleton className="h-3 w-1/2 bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((product) => (
                        <ProductCard
                            key={product.idProduct}
                            product={product}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#708C3E]/10">
                        <Package className="size-7 text-[#708C3E]" />
                    </div>
                    <p className="text-base font-semibold text-[#5D4037] dark:text-[#D7CCC8]">
                        {search ? "Sin resultados para tu búsqueda" : "No hay productos en esta categoría"}
                    </p>
                    <p className="text-sm text-[#5D4037]/40 dark:text-[#D7CCC8]/40">
                        {search ? "Intentá con otra palabra clave" : "Agregá tu primer producto para empezar"}
                    </p>
                    {!search && (
                        <Button
                            onClick={handleAdd}
                            className="mt-2 gap-1.5 rounded-full bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-sm"
                        >
                            <Plus className="size-4" />
                            Añadir el primero
                        </Button>
                    )}
                </div>
            )}

            <ProductFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                product={selectedProduct}
                idCategory={idCategory}
            />
        </div>
    )
}
