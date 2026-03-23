import { useState, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { Search, ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/utils"
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
const CATEGORIES_PER_PAGE = 9
const EMPTY_ARRAY: any[] = []

export default function PublicCatalogPage() {
    const { token, id } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const { data: share, isLoading: isLoadingShare } = useCatalogShareDetail(token || "")

    const categoryId = id ? Number(id) : share?.category_id

    const { data: categories = EMPTY_ARRAY, isLoading: isLoadingCats } = useCategories({ state: "active" })

    const { data: products = EMPTY_ARRAY, isLoading: isLoadingProducts } = useProducts({
        idCategory: categoryId || undefined,
        state: "active"
    })

    const pid = searchParams.get("pid")
    const selectedProduct = useMemo(() => {
        if (!pid || products.length === 0) return null
        return products.find(p => p.idProduct === Number(pid)) || null
    }, [pid, products])

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

    // Products Pagination
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
    }, [filteredProducts, currentPage])

    // Categories Pagination
    const totalPagesCats = Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE)
    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * CATEGORIES_PER_PAGE
        return filteredCategories.slice(start, start + CATEGORIES_PER_PAGE)
    }, [filteredCategories, currentPage])


    const handleSelectProduct = (product: Product | null) => {
        if (product) {
            searchParams.set("pid", product.idProduct.toString())
        } else {
            searchParams.delete("pid")
        }
        setSearchParams(searchParams, { replace: true })
    }

    const showBackButton = categoryId && !share?.category_id

    return (
        <div className="light flex min-h-screen flex-col bg-[#FAFAF5] text-[#5D4037] transition-colors duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>

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
                                className="shrink-0 gap-1.5 rounded-full border-[#E8E5D8] text-[#5D4037]/70 hover:bg-white hover:text-[#2E7D32] hover:border-[#708C3E]/40"
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
                                className="h-10 rounded-full border border-[#E8E5D8] bg-white pl-10 text-sm text-[#5D4037] shadow-none placeholder:text-[#5D4037]/30 focus-visible:ring-1 focus-visible:ring-[#708C3E]/50 focus-visible:border-[#708C3E]/50"
                                placeholder={categoryId ? "Buscar productos..." : "Buscar categorías..."}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>

                        {/* Product count on right for balance */}
                        {categoryId && !isLoading && (
                            <span className="hidden sm:block shrink-0 text-xs font-medium text-[#5D4037]/60">
                                {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ CONTENT GRID ═══ */}
            <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={`skeleton-cat-${i}`} className="p-4 rounded-3xl bg-white shadow-sm ring-1 ring-[#E8E5D8]">
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
                            <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#708C3E]/10">
                                <ShoppingBag className="size-9 text-[#708C3E]" />
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
                                    className="mt-5 rounded-full border-[#708C3E]/30 text-[#2E7D32] hover:bg-[#708C3E]/5"
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
                                        className="size-9 rounded-full border-[#E8E5D8] text-[#5D4037]/60 hover:text-[#2E7D32] hover:border-[#708C3E]/40 disabled:opacity-30"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={`page-prod-${page}`}
                                            onClick={() => setCurrentPage(page)}
                                            className={cn(
                                                "size-9 rounded-full text-sm font-bold transition-all",
                                                currentPage === page
                                                    ? "bg-[#708C3E] text-white shadow-lg shadow-[#708C3E]/20"
                                                    : "bg-white text-[#5D4037] hover:bg-[#F5F3EB] ring-1 ring-[#E8E5D8]"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 rounded-full border-[#E8E5D8] text-[#5D4037]/60 hover:text-[#2E7D32] hover:border-[#708C3E]/40 disabled:opacity-30"
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
                            <div className="h-px flex-1 bg-gradient-to-r from-[#708C3E]/40 to-transparent" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-[#5D4037]/70">
                                Categorías
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-[#708C3E]/40 to-transparent" />
                        </div>

                        {filteredCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#708C3E]/10">
                                    <Search className="size-9 text-[#708C3E]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#5D4037]">No encontramos lo que buscás</h3>
                                <p className="mt-2 max-w-xs text-sm font-medium text-[#5D4037]/60">
                                    Intentá con otra palabra clave
                                </p>
                                {search && (
                                    <Button
                                        variant="outline"
                                        className="mt-5 rounded-full border-[#708C3E]/30 text-[#2E7D32] hover:bg-[#708C3E]/5"
                                        onClick={() => setSearch("")}
                                    >
                                        Limpiar búsqueda
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3">
                                    {paginatedCategories.map((category: Category) => (
                                        <CategoryCard
                                            key={category.idCategory}
                                            category={category}
                                            onClick={(c: Category) => navigate(`/v/${token}/${c.idCategory}`)}
                                        />
                                    ))}
                                </div>

                                {/* Categories Pagination */}
                                {totalPagesCats > 1 && (
                                    <div className="mt-10 flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full border-[#E8E5D8] text-[#5D4037]/60 hover:text-[#2E7D32] hover:border-[#708C3E]/40 disabled:opacity-30"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>

                                        {Array.from({ length: totalPagesCats }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={`page-cat-${page}`}
                                                onClick={() => setCurrentPage(page)}
                                                className={cn(
                                                    "size-9 rounded-full text-sm font-bold transition-all",
                                                    currentPage === page
                                                        ? "bg-[#708C3E] text-white shadow-lg shadow-[#708C3E]/20"
                                                        : "bg-white text-[#5D4037] hover:bg-[#F5F3EB] ring-1 ring-[#E8E5D8]"
                                                )}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full border-[#E8E5D8] text-[#5D4037]/60 hover:text-[#2E7D32] hover:border-[#708C3E]/40 disabled:opacity-30"
                                            onClick={() => setCurrentPage(p => Math.min(totalPagesCats, p + 1))}
                                            disabled={currentPage === totalPagesCats}
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-[#E8E5D8] bg-white">
                <div className="mx-auto max-w-5xl px-5 py-6">
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src="https://res.cloudinary.com/dkwvaxxdw/image/upload/v1771647969/WhatsApp_Image_2026-02-20_at_10.25.08_PM_tunvuh.jpg"
                            alt="Artesanías Guapinol"
                            className="h-10 w-auto object-contain"
                        />
                        <span className="text-[11px] font-medium text-[#5D4037]/50">
                            © {new Date().getFullYear()} Artesanías Guapinol · Costa Rica
                        </span>
                    </div>
                </div>
            </footer>

            <ProductDetailDialog
                key={selectedProduct?.idProduct || 'none'}
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onOpenChange={() => handleSelectProduct(null)}
                catalogToken={token}
                forceLight={true}
            />
        </div>
    )
}
