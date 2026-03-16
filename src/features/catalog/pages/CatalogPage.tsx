import { useState } from "react"
import { Link2, Plus, Search, Store } from "lucide-react"
import { useNavigate } from "react-router"
import { sileo } from "sileo"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CategoryCard } from "@/features/catalog/components/CategoryCard"
import { CategoryFormDialog } from "@/features/catalog/components/CategoryFormDialog"
import { useCategories, useCreateCatalogShare } from "@/features/catalog/hooks/useCategory"
import { getGeneralCatalogShare } from "@/features/catalog/services/category.service"
import type { Category } from "@/features/catalog/types/category.types"

export default function CatalogPage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [copied, setCopied] = useState(false)

    const { data: categories = [], isLoading } = useCategories()
    const { mutateAsync: createShare, isPending: isSharing } = useCreateCatalogShare()

    const filtered = categories.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
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
            const url = `${window.location.origin}/v/${share.id}`
            await navigator.clipboard.writeText(url)
            sileo.info({ title: "Enlace copiado" })
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            sileo.error({ title: "Error", description: "No se pudo obtener el enlace" })
        }
    }

    async function handleShareCategory(category: Category) {
        try {
            const share = await createShare({
                name: `Categoría: ${category.name}`,
                categoryId: category.idCategory
            })
            const url = `${window.location.origin}/v/${share.id}`
            await navigator.clipboard.writeText(url)
            sileo.info({ title: "Enlace de categoría copiado" })
        } catch (error) {
            sileo.error({ title: "Error", description: "No se pudo generar el enlace de la categoría" })
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ═══ HEADER ═══ */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#5D4037] dark:text-[#D7CCC8]">Catálogo</h1>
                    <p className="mt-1 text-sm text-[#5D4037]/50 dark:text-[#D7CCC8]/50">
                        Gestiona tus categorías de productos
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareLink}
                    className="gap-1.5 rounded-full border-[#E8E5D8] dark:border-zinc-700 text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] hover:border-[#708C3E]/40 transition-colors"
                    disabled={isSharing}
                >
                    <Link2 className="size-4" />
                    {isSharing ? "Generando..." : (copied ? "¡Copiado!" : "Compartir")}
                </Button>
            </div>

            {/* ═══ SEARCH + ADD ═══ */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#5D4037]/30 dark:text-[#D7CCC8]/30" />
                    <Input
                        id="catalog-search"
                        className="h-10 rounded-xl border-[#E8E5D8] dark:border-zinc-700 bg-white dark:bg-zinc-800/50 pl-10 text-sm text-[#5D4037] dark:text-[#D7CCC8] shadow-none placeholder:text-[#5D4037]/30 dark:placeholder:text-[#D7CCC8]/30 focus-visible:ring-1 focus-visible:ring-[#708C3E]/50 focus-visible:border-[#708C3E]/50"
                        placeholder="Buscar categoría…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    size="icon"
                    onClick={handleAdd}
                    aria-label="Agregar categoría"
                    className="size-10 rounded-xl bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-sm shadow-[#708C3E]/20 transition-colors"
                >
                    <Plus className="size-5" />
                </Button>
            </div>

            {/* ═══ GRID ═══ */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#708C3E]/10">
                        <Store className="size-7 text-[#708C3E]" />
                    </div>
                    <p className="text-base font-semibold text-[#5D4037] dark:text-[#D7CCC8]">
                        {search ? "Sin resultados para tu búsqueda" : "Aún no hay categorías"}
                    </p>
                    <p className="text-sm text-[#5D4037]/40 dark:text-[#D7CCC8]/40">
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
                    {filtered.map((category) => (
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

            <CategoryFormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                category={editingCategory}
            />
        </div>
    )
}
