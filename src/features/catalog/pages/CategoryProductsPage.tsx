import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Search } from "lucide-react"
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
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit gap-2 -ml-2 text-muted-foreground"
                    onClick={() => navigate("/catalogo")}
                >
                    <ArrowLeft className="size-4" />
                    Volver al catálogo
                </Button>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isLoadingCategory ? <Skeleton className="h-9 w-48" /> : category?.name}
                        </h1>
                    </div>
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="size-4" />
                        Nuevo Producto
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar productos..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid de Productos */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="aspect-square rounded-xl" />
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
                <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30">
                    <p className="font-medium text-muted-foreground">No hay productos en esta categoría</p>
                    <Button variant="outline" size="sm" onClick={handleAdd}>
                        Añadir el primero
                    </Button>
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
