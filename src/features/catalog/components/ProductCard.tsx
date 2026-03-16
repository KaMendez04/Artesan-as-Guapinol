import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import type { Product } from "@/features/catalog/types/product.types"
import { isCloudinaryUrl } from "@/shared/lib/cloudinary"

interface ProductCardProps {
    product: Product
    onEdit?: (product: Product) => void
    onDelete?: (product: Product) => void
    onClick?: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete, onClick }: ProductCardProps) {
    const isActive = product.state === "active"
    const isPublicView = !onEdit && !onDelete

    /* ═══ PUBLIC CATALOG VIEW ═══ */
    if (isPublicView) {
        return (
            <div
                onClick={() => onClick?.(product)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E8E5D8] transition-all duration-300 hover:shadow-xl hover:shadow-[#708C3E]/10 hover:ring-[#708C3E]/40 ${!isActive ? "opacity-50 grayscale" : ""
                    }`}
            >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-[#F5F3EB]">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={
                                isCloudinaryUrl(product.images[0])
                                    ? product.images[0].replace("/upload/", "/upload/f_auto,q_auto,w_400,h_400,c_fill/")
                                    : product.images[0]
                            }
                            alt={product.name ?? ""}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-5xl font-extrabold text-[#708C3E]/15">
                                {product.name?.[0]?.toUpperCase()}
                            </span>
                        </div>
                    )}

                    {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                            <Badge className="bg-[#5D4037]/80 text-white font-semibold uppercase tracking-wider text-xs">
                                No disponible
                            </Badge>
                        </div>
                    )}

                    {/* Quick view icon on hover */}
                    {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#2E7D32]/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 scale-75 group-hover:scale-100">
                                <Eye className="size-5 text-[#2E7D32]" />
                            </div>
                        </div>
                    )}

                    {/* Image count badge */}
                    {product.images && product.images.length > 1 && (
                        <div className="absolute right-2 top-2 rounded-full bg-[#5D4037]/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                            +{product.images.length - 1}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-3.5">
                    <h3 className="truncate text-sm font-bold text-[#5D4037] group-hover:text-[#2E7D32] transition-colors duration-300">
                        {product.name}
                    </h3>
                    <p className="mt-1 text-base font-extrabold text-[#2E7D32]">
                        ₡{product.price?.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        )
    }

    /* ═══ ADMIN VIEW ═══ */
    return (
        <div
            onClick={() => onClick?.(product)}
            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-[#E8E5D8] dark:ring-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-[#5D4037]/5 dark:hover:shadow-black/20 hover:ring-[#708C3E]/40 cursor-pointer ${
                !isActive ? "opacity-60" : ""
            }`}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F3EB] dark:bg-zinc-800">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={
                            isCloudinaryUrl(product.images[0])
                                ? product.images[0].replace("/upload/", "/upload/f_auto,q_auto,w_400,h_300,c_fill/")
                                : product.images[0]
                        }
                        alt={product.name ?? ""}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl font-extrabold text-[#708C3E]/15 dark:text-[#708C3E]/25">
                            {product.name?.[0]?.toUpperCase()}
                        </span>
                    </div>
                )}

                {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px]">
                        <Badge className="bg-[#5D4037]/70 text-white text-[10px] font-semibold uppercase tracking-wider border-0">
                            Inactivo
                        </Badge>
                    </div>
                )}

                {/* Image count badge */}
                {product.images && product.images.length > 1 && (
                    <div className="absolute left-2 top-2 rounded-full bg-[#5D4037]/60 dark:bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                        {product.images.length} fotos
                    </div>
                )}
            </div>

            {/* Info + Actions */}
            <div className="flex items-center justify-between p-3.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="truncate font-bold text-sm text-[#5D4037] dark:text-[#D7CCC8] group-hover:text-[#708C3E] dark:group-hover:text-[#A5D6A7] transition-colors duration-300">
                        {product.name}
                    </h3>
                    <p className="text-sm font-extrabold text-[#708C3E] dark:text-[#A5D6A7]">
                        ₡{product.price?.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="flex items-center gap-0.5">
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 rounded-full text-[#5D4037]/40 dark:text-[#D7CCC8]/40 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] transition-colors"
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit(product)
                            }}
                            aria-label={`Editar ${product.name}`}
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 rounded-full text-[#5D4037]/40 dark:text-[#D7CCC8]/40 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(product)
                            }}
                            aria-label={`Eliminar ${product.name}`}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
