import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { Search } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CategoryCard } from "@/features/catalog/components/CategoryCard"
import { ProductCard } from "@/features/catalog/components/ProductCard"
import { ProductDetailDialog } from "@/features/catalog/components/ProductDetailDialog"
import { useCategories, useCatalogShareDetail } from "@/features/catalog/hooks/useCategory"
import { useProducts } from "@/features/catalog/hooks/useProduct"
import type { Product } from "@/features/catalog/types/product.types"
import type { Category } from "@/features/catalog/types/category.types"

export default function PublicCatalogPage() {
    const { token, id } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const pid = searchParams.get("pid")

    // Obtener detalles del share
    const { data: share, isLoading: isLoadingShare } = useCatalogShareDetail(token || "")

    // Obtener productos si estamos dentro de una categoría
    const categoryId = id ? Number(id) : share?.category_id

    // Obtener categorías (activas)
    const { data: categories = [], isLoading: isLoadingCats } = useCategories({ state: "active" })

    // Si tenemos categoryId, obtener productos
    const { data: products = [], isLoading: isLoadingProducts } = useProducts({
        idCategory: categoryId || undefined,
        state: "active"
    })

    const isLoading = isLoadingShare || isLoadingCats || (!!categoryId && isLoadingProducts)

    // Filtrar categorías si no hay una seleccionada
    const filteredCategories = categories.filter((c: Category) => {
        const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = share?.category_id ? c.idCategory === share.category_id : true
        return matchesSearch && matchesCategory
    })

    // Obtener detalles de la categoría actual si hay categoryId
    const currentCategory = categories.find((c: Category) => c.idCategory === categoryId)

    // Filtrar productos si hay una categoría seleccionada
    const filteredProducts = products.filter((p: Product) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

    // Efecto para abrir el producto si viene en el URL

    useEffect(() => {
        if (pid && products.length > 0 && !selectedProduct) {
            const product = products.find(p => p.idProduct === Number(pid))
            if (product) {
                setSelectedProduct(product)
            }
        }
    }, [pid, products, selectedProduct])

    const handleSelectProduct = (product: Product | null) => {
        setSelectedProduct(product)
        if (product) {
            searchParams.set("pid", product.idProduct.toString())
        } else {
            searchParams.delete("pid")
        }
        setSearchParams(searchParams, { replace: true })
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-4xl flex flex-col gap-6">
                {/* Header Público */}
                <div className="flex flex-col gap-2 text-center md:text-left">
                    {categoryId && !share?.category_id && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-fit p-0 h-auto hover:bg-transparent text-muted-foreground mb-2"
                            onClick={() => navigate(`/v/${token}`)}
                        >
                            ← Volver al catálogo
                        </Button>
                    )}
                    <h1 className="text-3xl font-bold tracking-tight">
                        {categoryId
                            ? (currentCategory?.name || "Nuestros Productos")
                            : "Nuestro Catálogo"}
                    </h1>
                    <p className="text-muted-foreground italic">
                        {categoryId
                            ? `Explora nuestra selección de ${currentCategory?.name?.toLowerCase() || "productos"}`
                            : "Artesanías Guapinol - Arte hecho a mano"}
                    </p>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9 h-11 rounded-full bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                        placeholder="¿Qué estás buscando?..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Contenido Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-xl" />
                        ))}
                    </div>
                ) : categoryId ? (
                    // Vista de Productos
                    filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                            <Search className="size-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No hay productos en esta categoría</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.idProduct}
                                    product={product}
                                    onClick={(p) => handleSelectProduct(p)}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    // Vista de Categorías
                    filteredCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                            <Search className="size-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No encontramos lo que buscas</p>
                            <p className="text-sm">Intenta con otra palabra clave</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {filteredCategories.map((category: Category) => (
                                <CategoryCard
                                    key={category.idCategory}
                                    category={category}
                                    onClick={(c: Category) => navigate(`/v/${token}/${c.idCategory}`)}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* Footer simple */}
                <footer className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Artesanías Guapinol. Todos los derechos reservados.</p>
                </footer>
            </div>

            <ProductDetailDialog
                product={selectedProduct}
                open={!!selectedProduct}
                onOpenChange={(open) => !open && handleSelectProduct(null)}
                catalogToken={token}
            />
        </div>
    )
}
