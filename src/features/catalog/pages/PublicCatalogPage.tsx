import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { Search, ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
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

const PRODUCTS_PER_PAGE = 12

export default function PublicCatalogPage() {
    const { token, id } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const pid = searchParams.get("pid")

    const { data: share, isLoading: isLoadingShare } = useCatalogShareDetail(token || "")

    const categoryId = id ? Number(id) : share?.category_id

    const { data: categories = [], isLoading: isLoadingCats } = useCategories({ state: "active" })

    const { data: products = [], isLoading: isLoadingProducts } = useProducts({
        idCategory: categoryId || undefined,
        state: "active"
    })

    const isLoading = isLoadingShare || isLoadingCats || (!!categoryId && isLoadingProducts)

    const filteredCategories = categories.filter((c: Category) => {
        const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = share?.category_id ? c.idCategory === share.category_id : true
        return matchesSearch && matchesCategory
    })

    const currentCategory = categories.find((c: Category) => c.idCategory === categoryId)

    const filteredProducts = products.filter((p: Product) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
    }, [filteredProducts, currentPage])

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [search, categoryId])

    useEffect(() => {
        if (pid && products.length > 0 && !selectedProduct) {
            const product = products.find(p => p.idProduct === Number(pid))
            if (product) setSelectedProduct(product)
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

    const showBackButton = categoryId && !share?.category_id

    return (
        <div className="min-h-screen bg-[#FAFAF5]" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ═══ HEADER — Logo centered ═══ */}
            <header className="bg-white border-b border-[#E8E5D8]">
                <div className="mx-auto max-w-5xl px-5 py-6">
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src="https://res.cloudinary.com/dkwvaxxdw/image/upload/v1771647969/WhatsApp_Image_2026-02-20_at_10.25.08_PM_tunvuh.jpg"
                            alt="Artesanías Guapinol"
                            className="h-20 w-auto object-contain md:h-24"
                        />

                        {categoryId && (
                            <h1 className="text-2xl font-bold text-[#5D4037] md:text-3xl">
                                {currentCategory?.name || "Nuestros Productos"}
                            </h1>
                        )}
                    </div>
                </div>
            </header>

            {/* ═══ NAV BAR — Back + Search together ═══ */}
            <div className="sticky top-0 z-10 bg-[#FAFAF5]/90 backdrop-blur-sm border-b border-[#E8E5D8]/50">
                <div className="mx-auto max-w-5xl px-5 py-3">
                    <div className="flex items-center gap-3">
                        {/* Back button — always accessible */}
                        {showBackButton && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="shrink-0 gap-1.5 rounded-full border-[#E8E5D8] text-[#5D4037]/70 hover:bg-white hover:text-[#2E7D32] hover:border-[#8AB528]/40"
                                onClick={() => navigate(`/v/${token}`)}
                            >
                                <ArrowLeft className="size-4" />
                                <span className="hidden sm:inline">Volver</span>
                            </Button>
                        )}

                        {/* Search bar */}
                        <div className="relative flex-1 max-w-md mx-auto">
                            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#5D4037]/30" />
                            <Input
                                className="h-10 rounded-full border border-[#E8E5D8] bg-white pl-10 text-sm text-[#5D4037] shadow-none placeholder:text-[#5D4037]/30 focus-visible:ring-1 focus-visible:ring-[#8AB528]/50 focus-visible:border-[#8AB528]/50"
                                placeholder={categoryId ? "Buscar productos..." : "Buscar categorías..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Product count on right for balance */}
                        {categoryId && !isLoading && (
                            <span className="hidden sm:block shrink-0 text-xs text-[#5D4037]/40">
                                {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT GRID ═══ */}
            <main className="mx-auto max-w-5xl px-5 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                <Skeleton className="aspect-square w-full bg-[#E8E5D8]/50" />
                                <div className="space-y-2 p-4">
                                    <Skeleton className="h-4 w-3/4 bg-[#E8E5D8]/50" />
                                    <Skeleton className="h-3 w-1/2 bg-[#E8E5D8]/50" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : categoryId ? (
                    /* ── Products View ── */
                    filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#8AB528]/10">
                                <ShoppingBag className="size-9 text-[#8AB528]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#5D4037]">
                                {search ? "No encontramos productos" : "Aún no hay productos"}
                            </h3>
                            <p className="mt-2 max-w-xs text-sm text-[#5D4037]/50">
                                {search
                                    ? `No hay resultados para "${search}". Intentá con otro término.`
                                    : "Pronto agregaremos artesanías a esta categoría. ¡Volvé pronto!"}
                            </p>
                            {search && (
                                <Button
                                    variant="outline"
                                    className="mt-5 rounded-full border-[#8AB528]/30 text-[#2E7D32] hover:bg-[#8AB528]/5"
                                    onClick={() => setSearch("")}
                                >
                                    Limpiar búsqueda
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                                {paginatedProducts.map((product) => (
                                    <ProductCard
                                        key={product.idProduct}
                                        product={product}
                                        onClick={(p) => handleSelectProduct(p)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-10 flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 rounded-full border-[#E8E5D8] text-[#5D4037]/60 hover:text-[#2E7D32] hover:border-[#8AB528]/40 disabled:opacity-30"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                                page === currentPage
                                                    ? "bg-[#2E7D32] text-white"
                                                    : "text-[#5D4037]/60 hover:bg-[#8AB528]/10 hover:text-[#2E7D32]"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 rounded-full border-[#E8E5D8] text-[#5D4037]/60 hover:text-[#2E7D32] hover:border-[#8AB528]/40 disabled:opacity-30"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )
                ) : (
                    /* ── Categories View ── */
                    <>
                        <div className="mb-8 flex items-center gap-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-[#8AB528]/40 to-transparent" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#5D4037]/50">
                                Categorías
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-[#8AB528]/40 to-transparent" />
                        </div>

                        {filteredCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#8AB528]/10">
                                    <Search className="size-9 text-[#8AB528]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#5D4037]">No encontramos lo que buscás</h3>
                                <p className="mt-2 max-w-xs text-sm text-[#5D4037]/50">
                                    Intentá con otra palabra clave
                                </p>
                                {search && (
                                    <Button
                                        variant="outline"
                                        className="mt-5 rounded-full border-[#8AB528]/30 text-[#2E7D32] hover:bg-[#8AB528]/5"
                                        onClick={() => setSearch("")}
                                    >
                                        Limpiar búsqueda
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3">
                                {filteredCategories.map((category: Category) => (
                                    <CategoryCard
                                        key={category.idCategory}
                                        category={category}
                                        onClick={(c: Category) => navigate(`/v/${token}/${c.idCategory}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-[#E8E5D8] bg-white">
                <div className="mx-auto max-w-5xl px-5 py-10">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <img
                            src="https://res.cloudinary.com/dkwvaxxdw/image/upload/v1771647969/WhatsApp_Image_2026-02-20_at_10.25.08_PM_tunvuh.jpg"
                            alt="Artesanías Guapinol"
                            className="h-14 w-auto object-contain"
                        />

                        <p className="max-w-sm text-sm leading-relaxed text-[#5D4037]/50">
                            Artesanías con alma costarricense. Cada pieza es única, hecha a mano con materiales naturales.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-[#5D4037]/30">
                            <span>© {new Date().getFullYear()} Artesanías Guapinol</span>
                            <span>·</span>
                            <span>Costa Rica 🇨🇷</span>
                        </div>
                    </div>
                </div>
            </footer>

            <ProductDetailDialog
                product={selectedProduct}
                open={!!selectedProduct}
                onOpenChange={(open) => !open && handleSelectProduct(null)}
                catalogToken={token}
            />
        </div>
    )
}
