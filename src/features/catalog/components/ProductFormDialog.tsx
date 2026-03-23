import { } from "react"
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
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product ? {
            name: product.name ?? "",
            price: product.price ?? 0,
            images: product.images || [],
            state: product.state ?? "active",
        } : {
            name: "",
            price: 0,
            images: [],
            state: "active",
        },
    })

    const images = watch("images")

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
            <DialogContent className="sm:max-w-md border-0 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? "Editar producto" : "Nuevo producto"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEditing ? "Modifica los detalles del producto" : "Completa los campos para añadir un nuevo producto"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
                    <div className="space-y-4">
                        {/* Images */}
                        <div className="space-y-1.5">
                            <Label htmlFor="images-upload" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Imágenes del producto</Label>
                            <MultiImageUpload
                                id="images-upload"
                                value={images}
                                onChange={(urls) => setValue("images", urls)}
                                maxImages={30}
                            />
                        </div>

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</Label>
                            <Input
                                id="name"
                                placeholder="Ej. Jarra de Barro Grande"
                                className="h-11 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-xs font-medium text-red-500 dark:text-red-400">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="space-y-1.5">
                            <Label htmlFor="price" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio (₡)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="any"
                                placeholder="0.00"
                                className="h-11 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all"
                                {...register("price", { valueAsNumber: true })}
                            />
                            {errors.price && (
                                <p className="text-xs font-medium text-red-500 dark:text-red-400">{errors.price.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={createProduct.isPending || updateProduct.isPending}
                            className="rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createProduct.isPending || updateProduct.isPending}
                            className="rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-md shadow-[#708C3E]/20 disabled:opacity-40 h-11 px-6"
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
