import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { Button } from "@/shared/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
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

    const { mutate: create, isPending: creating } = useCreateCategory()
    const { mutate: update, isPending: updating } = useUpdateCategory()

    const isPending = creating || updating

    useEffect(() => {
        if (category) {
            setName(category.name ?? "")
            setState(category.state ?? "active")
        } else {
            setName("")
            setState("active")
        }
    }, [category, open])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        if (isEditing && category) {
            update(
                { id: category.idCategory, dto: { name: name.trim(), state } },
                {
                    onSuccess: () => {
                        sileo.success({ title: "Categoría actualizada" })
                        onClose()
                    },
                    onError: () => {
                        sileo.error({ title: "Error al actualizar", description: "Intenta de nuevo." })
                    },
                }
            )
        } else {
            create(
                { name: name.trim(), state },
                {
                    onSuccess: () => {
                        sileo.success({ title: "Categoría agregada" })
                        onClose()
                    },
                    onError: () => {
                        sileo.error({ title: "Error al agregar", description: "Intenta de nuevo." })
                    },
                }
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="cat-name" className="text-sm font-medium">
                            Nombre
                        </label>
                        <Input
                            id="cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Pulseras"
                            autoFocus
                            required
                        />
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Estado</span>
                        <div className="flex gap-2">
                            {(["active", "inactive"] as CategoryState[]).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setState(s)}
                                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${state === s
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background hover:bg-muted"
                                        }`}
                                >
                                    {s === "active" ? "Disponible" : "No disponible"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending || !name.trim()}>
                            {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
