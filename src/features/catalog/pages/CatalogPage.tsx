import { useState } from "react"
import { ChevronLeft, Link2, Plus, Search, Store, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { sileo } from "sileo"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CategoryCard } from "@/features/catalog/components/CategoryCard"
import { CategoryFormDialog } from "@/features/catalog/components/CategoryFormDialog"
import { useCategories, useCreateCatalogShare } from "@/features/catalog/hooks/useCategory"
import { getGeneralCatalogShare } from "@/features/catalog/services/category.service"
import { APP_CONFIG } from "@/shared/constants/config"
import type { Category } from "@/features/catalog/types/category.types"

export default function CatalogPage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [copied, setCopied] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 12
const EMPTY_ARRAY: any[] = []

    const { data: categories = EMPTY_ARRAY, isLoading } = useCategories()
    const { mutateAsync: createShare, isPending: isSharing } = useCreateCatalogShare()

    const filtered = categories.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    )

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginatedCategories = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    function handleEdit(category: Category) {
        setEditingCategory(category)
        setDialogOpen(true)
    }

    function handleAdd() {
        setEditingCategory(null)
        setDialogOpen(true)
    }

    function handleCloseDialog() {
        setDialogOpen(false)
        setEditingCategory(null)
    }

    async function handleShareLink() {
        try {
            let share = await getGeneralCatalogShare()
            if (!share) {
                share = await createShare({ name: "General" })
            }
            const url = `${APP_CONFIG.PROD_URL}/v/${share.id}`
            await navigator.clipboard.writeText(url)
            sileo.info({ title: "Enlace copiado" })
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            sileo.error({ title: "Error", description: "No se pudo obtener el enlace" })
        }
    }

    async function handleShareCategory(category: Category) {
        try {
            const share = await createShare({
                name: `Categoría: ${category.name}`,
                categoryId: category.idCategory
            })
            const url = `${APP_CONFIG.PROD_URL}/v/${share.id}`
            await navigator.clipboard.writeText(url)
            sileo.info({ title: "Enlace de categoría copiado" })
        } catch {
            sileo.error({ title: "Error", description: "No se pudo generar el enlace de la categoría" })
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full p-4 md:p-0">
            <div className="flex items-center justify-between">
                <div className="flex justify-start gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 transition
                                   dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                        aria-label="Regresar"
                        title="Regresar"
                    >
                        <ChevronLeft />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Catálogo</h1>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareLink}
                    className="gap-1.5 rounded-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] transition-colors"
                    disabled={isSharing}
                >
                    <Link2 className="size-4" />
                    {isSharing ? "Generando..." : (copied ? "¡Copiado!" : "Compartir")}
                </Button>
            </div>

            {/* ═══ SEARCH + ADD ═══ */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" size={16} />
                    <Input
                        id="catalog-search"
                        className="h-10 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 pl-9 pr-3 text-sm text-gray-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                        placeholder="Buscar categoría…"
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
                    aria-label="Agregar categoría"
                    title="Agregar categoría"
                >
                    <Plus className="size-5" />
                </button>
            </div>

            {/* ═══ GRID ═══ */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={`skeleton-cat-${i}`} className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 p-4 shadow-sm">
                            <Skeleton className="aspect-[4/3] w-full bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                            <div className="space-y-2 p-4">
                                <Skeleton className="h-4 w-3/4 bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                                <Skeleton className="h-3 w-1/2 bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#708C3E]/10">
                        <Store className="size-7 text-[#708C3E]" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {search ? "Sin resultados para tu búsqueda" : "Aún no hay categorías"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {search ? "Intentá con otra palabra clave" : "Creá tu primera categoría para empezar"}
                    </p>
                    {!search && (
                        <Button
                            onClick={handleAdd}
                            className="mt-2 gap-1.5 rounded-full bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-sm"
                        >
                            <Plus className="size-4" />
                            Agregar primera categoría
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {paginatedCategories.map((category) => (
                        <CategoryCard
                            key={category.idCategory}
                            category={category}
                            onEdit={handleEdit}
                            onShare={handleShareCategory}
                            onClick={(c) => navigate(`/catalogo/${c.idCategory}/productos`)}
                        />
                    ))}
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
                                            key={`page-${page}`}
                                            onClick={() => setCurrentPage(page)}
                                            className={cn(
                                                "size-9 rounded-full text-sm font-bold transition-all",
                                                currentPage === page
                                                    ? "bg-[#708C3E] text-white shadow-lg shadow-[#708C3E]/20"
                                                    : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-100 dark:border-white/10"
                                            )}
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

            {/* ═══ CATEGORY COUNT ═══ */}
            {!isLoading && categories.length > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        {categories.length} {categories.length === 1 ? "categoría" : "categorías"} en total
                    </p>
                </div>
            )}

            <CategoryFormDialog
                key={editingCategory ? `edit-${editingCategory.idCategory}` : `add-${dialogOpen}`}
                open={dialogOpen}
                onClose={handleCloseDialog}
                category={editingCategory}
            />
        </div>
    )
}
