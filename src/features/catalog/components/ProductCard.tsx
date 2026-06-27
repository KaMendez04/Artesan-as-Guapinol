import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Pencil, Trash2, Eye, MoreVertical, ToggleLeft, ToggleRight } from "lucide-react"
import type { Product } from "@/features/catalog/types/product.types"
import { isCloudinaryUrl } from "@/shared/lib/cloudinary"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

interface ProductCardProps {
    product: Product
    onEdit?: (product: Product) => void
    onDelete?: (product: Product) => void
    onView?: (product: Product) => void
    onToggleState?: (product: Product) => void
    onClick?: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete, onView, onToggleState, onClick }: ProductCardProps) {
    const isActive = product.state === "active"
    const isPublicView = !onEdit && !onDelete

    /* ═══ PUBLIC CATALOG VIEW ═══ */
    if (isPublicView) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={() => onClick?.(product)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onClick?.(product)
                    }
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E8E5D8] transition-shadow transition-transform duration-300 hover:shadow-xl hover:shadow-[#708C3E]/10 hover:ring-[#708C3E]/40 ${!isActive ? "opacity-50 grayscale" : ""
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
                            <Badge className="bg-[#5D4037]/80 text-white font-semibold uppercase tracking-wider text-[0.625rem] border-0">
                                No disponible
                            </Badge>
                        </div>
                    )}

                    {/* Quick view icon on hover */}
                    {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#6FA36A]/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 scale-75 group-hover:scale-100">
                                <Eye className="size-5 text-[#6FA36A]" />
                            </div>
                        </div>
                    )}

                    {/* Image count badge */}
                    {product.images && product.images.length > 1 && (
                        <div className="absolute right-2 top-2 rounded-full bg-[#5D4037]/70 px-2 py-0.5 text-[0.625rem] font-semibold text-white backdrop-blur-sm">
                            +{product.images.length - 1}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-3.5 text-center">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-[#5D4037] group-hover:text-[#6FA36A] transition-colors duration-300">
                        {product.name}
                    </h3>
                    <p className="mt-1 text-base font-extrabold text-[#6FA36A]">
                        ₡{product.price?.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        )
    }

    /* ═══ ADMIN VIEW ═══ */
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick?.(product)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick?.(product)
                }
            }}
            className={`group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5 border border-border/50 backdrop-blur-sm transition duration-300 hover:shadow-lg hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer ${
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
                            <Badge className="bg-[#5D4037]/70 text-white text-[0.625rem] font-semibold uppercase tracking-wider border-0">
                                Inactivo
                            </Badge>
                        </div>
                    )}

                    {/* Image count badge */}
                    {product.images && product.images.length > 1 && (
                        <div className="absolute left-2 top-2 rounded-full bg-[#5D4037]/60 dark:bg-black/60 px-2 py-0.5 text-[0.625rem] font-semibold text-white backdrop-blur-sm">
                            {product.images.length} fotos
                        </div>
                    )}

                    {/* Three-dot menu — positioned over the image top-right */}
                    {(onEdit || onDelete) && (
                        <div className="absolute right-1 top-1 z-10" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-full bg-white/80 dark:bg-black/60 text-gray-700 dark:text-white backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-black/80 transition-colors"
                                    >
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onView && (
                                        <DropdownMenuItem onClick={() => onView(product)}>
                                            <Eye className="mr-2 size-4" />
                                            <span>Ver detalles</span>
                                        </DropdownMenuItem>
                                    )}
                                    {onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(product)}>
                                            <Pencil className="mr-2 size-4" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                    )}
                                    {onToggleState && (
                                        <DropdownMenuItem onClick={() => onToggleState(product)}>
                                            {isActive
                                                ? <><ToggleLeft className="mr-2 size-4" /><span>Desactivar</span></>
                                                : <><ToggleRight className="mr-2 size-4 text-[#708C3E]" /><span className="text-[#708C3E] font-medium">Activar</span></>
                                            }
                                        </DropdownMenuItem>
                                    )}
                                    {onDelete && (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => onDelete(product)}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            <span>Eliminar</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-2.5 pb-3">
                    <h3 className="line-clamp-2 font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 group-hover:text-[#708C3E] dark:group-hover:text-[#A7D878] transition-colors duration-300">
                        {product.name}
                    </h3>

                    <p className="mt-1 text-sm font-extrabold text-[#708C3E] dark:text-[#A7D878]">
                        ₡{product.price?.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                    </p>
                </div>
        </div>
    )
}
