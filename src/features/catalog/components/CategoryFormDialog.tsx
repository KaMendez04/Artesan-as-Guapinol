import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { Button } from "@/shared/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { ImageUpload } from "@/shared/components/ui/image-upload"
import { useCreateCategory, useUpdateCategory } from "@/features/catalog/hooks/useCategory"
import type { Category, CategoryState } from "@/features/catalog/types/category.types"

interface CategoryFormDialogProps {
    open: boolean
    onClose: () => void
    category?: Category | null
}

export function CategoryFormDialog({ open, onClose, category }: CategoryFormDialogProps) {
    const isEditing = !!category

    const [name, setName] = useState("")
    const [state, setState] = useState<CategoryState>("active")
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    const { mutate: create, isPending: creating } = useCreateCategory()
    const { mutate: update, isPending: updating } = useUpdateCategory()

    const isPending = creating || updating

    useEffect(() => {
        if (category) {
            setName(category.name ?? "")
            setState(category.state ?? "active")
            setImageUrl(category.image_url)
        } else {
            setName("")
            setState("active")
            setImageUrl(null)
        }
    }, [category, open])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        if (isEditing && category) {
            update(
                { id: category.idCategory, dto: { name: name.trim(), state, image_url: imageUrl?.trim() || null } },
                {
                    onSuccess: () => {
                        sileo.success({ title: "Categoría actualizada" })
                        onClose()
                    },
                    onError: (error) => {
                        console.error("Error al actualizar categoría:", error)
                        sileo.error({ title: "Error al actualizar", description: error instanceof Error ? error.message : "Intenta de nuevo." })
                    },
                }
            )
        } else {
            create(
                { name: name.trim(), state, image_url: imageUrl?.trim() || null },
                {
                    onSuccess: () => {
                        sileo.success({ title: "Categoría agregada" })
                        onClose()
                    },
                    onError: (error) => {
                        console.error("Error al crear categoría:", error)
                        sileo.error({ title: "Error al agregar", description: error instanceof Error ? error.message : "Intenta de nuevo." })
                    },
                }
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm border-0 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? "Editar categoría" : "Nueva categoría"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEditing ? "Modifica los detalles de la categoría" : "Crea una nueva categoría para tus productos"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="cat-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Nombre
                        </label>
                        <Input
                            id="cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Pulseras"
                            required
                            className="h-11 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all"
                        />
                    </div>

                    {/* Imagen */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="cat-image" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                            Imagen de la categoría
                        </label>
                        <ImageUpload
                            id="cat-image"
                            value={imageUrl}
                            onChange={setImageUrl}
                            onUploadStart={() => { }}
                            onUploadEnd={() => { }}
                        />
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</span>
                        <div className="flex gap-2">
                            {(["active", "inactive"] as CategoryState[]).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setState(s)}
                                    className={`flex-1 rounded-2xl border py-2.5 text-sm font-semibold transition-all duration-200 ${state === s
                                        ? s === "active"
                                            ? "border-[#708C3E] bg-[#708C3E]/10 text-[#708C3E] ring-1 ring-[#708C3E]/30 dark:bg-[#708C3E]/20 dark:text-[#A5D6A7]"
                                            : "border-gray-300 bg-gray-100 text-gray-600 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-gray-300"
                                        : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-black/30 dark:text-gray-500 dark:hover:bg-black/40"
                                        }`}
                                >
                                    {s === "active" ? "Disponible" : "No disponible"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !name.trim()}
                            className="rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-md shadow-[#708C3E]/20 disabled:opacity-40 h-11 px-8 font-semibold"
                        >
                            {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
