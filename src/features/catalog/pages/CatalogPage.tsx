import { useState } from "react"
import { Link2, Plus, Search } from "lucide-react"
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
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareLink}
                    className="gap-1.5"
                    disabled={isSharing}
                >
                    <Link2 className="size-4" />
                    {isSharing ? "Generando..." : (copied ? "¡Copiado!" : "Compartir")}
                </Button>
            </div>


            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="catalog-search"
                        className="pl-9"
                        placeholder="Buscar categoría…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button size="icon" onClick={handleAdd} aria-label="Agregar categoría">
                    <Plus className="size-5" />
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                    <p className="text-base font-medium">
                        {search ? "Sin resultados para tu búsqueda" : "Aún no hay categorías"}
                    </p>
                    {!search && (
                        <Button variant="outline" size="sm" onClick={handleAdd}>
                            <Plus className="mr-1 size-4" />
                            Agregar primera categoría
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
