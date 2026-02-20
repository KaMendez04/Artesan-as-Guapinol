import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { MultiImageUpload } from "@/shared/components/ui/multi-image-upload"
import { useCreateProduct, useUpdateProduct } from "@/features/catalog/hooks/useProduct"
import { sileo } from "sileo"
import type { Product } from "@/features/catalog/types/product.types"

const productSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    images: z.array(z.string()).nullable().optional(),
    state: z.enum(["active", "inactive"]),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product?: Product | null
    idCategory: number
}

export function ProductFormDialog({
    open,
    onOpenChange,
    product,
    idCategory,
}: ProductFormDialogProps) {
    const isEditing = !!product
    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            price: 0,
            images: [],
            state: "active",
        },
    })

    const images = watch("images")

    useEffect(() => {
        if (product && open) {
            reset({
                name: product.name ?? "",
                price: product.price ?? 0,
                images: product.images || [],
                state: product.state ?? "active",
            })
        } else if (!open) {
            reset({
                name: "",
                price: 0,
                images: [],
                state: "active",
            })
        }
    }, [product, open, reset])

    const onSubmit = async (data: ProductFormData) => {
        try {
            if (isEditing && product) {
                await updateProduct.mutateAsync({
                    id: product.idProduct,
                    dto: { ...data, idCategory },
                })
                sileo.success({ title: "Producto actualizado" })
            } else {
                await createProduct.mutateAsync({
                    ...data,
                    idCategory,
                })
                sileo.success({ title: "Producto creado" })
            }
            onOpenChange(false)
        } catch (error) {
            sileo.error({ title: "Error" })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEditing ? "Modifica los detalles del producto" : "Completa los campos para añadir un nuevo producto"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Imágenes del producto</Label>
                            <MultiImageUpload
                                value={images}
                                onChange={(urls) => setValue("images", urls)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                placeholder="Ej. Jarra de Barro Grande"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Precio (₡)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="any"
                                placeholder="0.00"
                                {...register("price", { valueAsNumber: true })}
                            />
                            {errors.price && (
                                <p className="text-sm text-destructive">{errors.price.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={createProduct.isPending || updateProduct.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createProduct.isPending || updateProduct.isPending}
                        >
                            {createProduct.isPending || updateProduct.isPending
                                ? "Guardando..."
                                : isEditing
                                    ? "Guardar cambios"
                                    : "Crear producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
