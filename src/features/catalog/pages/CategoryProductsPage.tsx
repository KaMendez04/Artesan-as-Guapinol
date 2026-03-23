import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Plus, Search, Package, ChevronRight } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ProductCard } from "@/features/catalog/components/ProductCard"
import { ProductFormDialog } from "@/features/catalog/components/ProductFormDialog"
import { ProductDetailDialog } from "@/features/catalog/components/ProductDetailDialog"
import { useProducts, useDeleteProduct } from "@/features/catalog/hooks/useProduct"
import { useCategory } from "@/features/catalog/hooks/useCategory"
import { sileo } from "sileo"
import { ConfirmModal } from "@/shared/components/ui/confirm-modal"
import type { Product } from "@/features/catalog/types/product.types"

export default function CategoryProductsPage() {
    const { id } = useParams<{ id: string }>()
    const idCategory = Number(id)
    const navigate = useNavigate()

    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 15
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [viewProduct, setViewProduct] = useState<Product | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [formKey, setFormKey] = useState(0) // Used to force reset "Add" form

    const { data: category, isLoading: isLoadingCategory } = useCategory(idCategory)

    const { data: products = [], isLoading: isLoadingResources } = useProducts({
        idCategory,
        // search: search || undefined // We will paginate client-side for consistent feel in admin
    })

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const deleteProduct = useDeleteProduct()

    const handleAdd = () => {
        setSelectedProduct(null)
        setFormKey(prev => prev + 1)
        setIsDialogOpen(true)
    }

    const handleEdit = (product: Product) => {
        setSelectedProduct(product)
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product)
        setIsConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!productToDelete) return

        try {
            await deleteProduct.mutateAsync(productToDelete.idProduct)
            sileo.success({ title: "Producto eliminado" })
        } catch {
            sileo.error({ title: "Error al eliminar" })
        } finally {
            setIsConfirmOpen(false)
            setProductToDelete(null)
        }
    }

    const isLoading = isLoadingCategory || isLoadingResources

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full p-4 md:p-0">
            <div className="flex justify-between">
                <div className="flex justify-start gap-3">
                    <button
                        type="button"
                        className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 transition
                                   dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                        onClick={() => navigate("/catalogo")}
                        aria-label="Volver al catálogo"
                        title="Volver al catálogo"
                    >
                        <ChevronLeft />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isLoadingCategory ? <Skeleton className="h-8 w-48 bg-gray-200 dark:bg-zinc-800" /> : category?.name}
                    </h1>
                </div>
            </div>

            {/* ═══ SEARCH + ADD ═══ */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" size={16} />
                    <Input
                        placeholder="Buscar productos..."
                        className="h-10 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 pl-9 pr-3 text-sm text-gray-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] text-white p-2.5 transition shrink-0 shadow-sm"
                    aria-label="Nuevo producto"
                    title="Nuevo producto"
                >
                    <Plus className="size-5" />
                </button>
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
                    {paginatedProducts.map((product) => (
                        <ProductCard
                            key={product.idProduct}
                            product={product}
                            onClick={handleEdit}
                            onEdit={handleEdit}
                            onDelete={() => handleDeleteClick(product)}
                            onView={setViewProduct}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#708C3E]/10">
                        <Package className="size-7 text-[#708C3E]" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {search ? "Sin resultados para tu búsqueda" : "No hay productos en esta categoría"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {search ? "Intentá con otra palabra clave" : "Agregá tu primer producto para empezar"}
                    </p>
                    {!search && (
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="mt-2 flex items-center gap-2 rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] text-white px-4 py-2 transition shadow-sm font-medium"
                        >
                            <Plus className="size-4" />
                            Añadir el primero
                        </button>
                    )}
                </div>
            )}

            {/* ═══ PRODUCT COUNT ═══ */}
            {!isLoadingResources && products.length > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        {products.length} {products.length === 1 ? "producto" : "productos"} en total
                    </p>
                </div>
            )}

            {/* ═══ PAGINATION ═══ */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] disabled:opacity-30"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                                    page === currentPage
                                        ? "bg-[#708C3E] text-white shadow-sm shadow-[#708C3E]/20"
                                        : "text-gray-500 dark:text-white/50 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7]"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] disabled:opacity-30"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            )}

            <ConfirmModal
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={handleConfirmDelete}
                title="Eliminar producto"
                description={`¿Estás seguro de que deseas eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
                isLoading={deleteProduct.isPending}
            />

            <ProductFormDialog
                key={selectedProduct ? `edit-${selectedProduct.idProduct}` : `add-${formKey}`}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                product={selectedProduct}
                idCategory={idCategory}
            />

            <ProductDetailDialog
                key={viewProduct?.idProduct || 'none'}
                product={viewProduct}
                isOpen={!!viewProduct}
                onOpenChange={(open) => !open && setViewProduct(null)}
            />
        </div>
    )
}
