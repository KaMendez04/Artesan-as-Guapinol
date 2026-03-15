import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
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
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E8E5D8] transition-all duration-300 hover:shadow-xl hover:shadow-[#8AB528]/10 hover:ring-[#8AB528]/40 ${!isActive ? "opacity-50 grayscale" : ""
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
                            <span className="text-5xl font-extrabold text-[#8AB528]/15">
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

    /* ═══ ADMIN VIEW (original) ═══ */
    return (
        <Card
            onClick={() => onClick?.(product)}
            className={`relative overflow-hidden transition-all hover:shadow-md p-0 gap-0 cursor-pointer ${!isActive ? "opacity-60" : ""
                }`}
        >
            <div className="relative aspect-square w-full">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={
                            isCloudinaryUrl(product.images[0])
                                ? product.images[0].replace("/upload/", "/upload/f_auto,q_auto,w_400,h_400,c_fill/")
                                : product.images[0]
                        }
                        alt={product.name ?? ""}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-4xl font-bold text-muted-foreground/20">
                            {product.name?.[0]?.toUpperCase()}
                        </span>
                    </div>
                )}
                {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                        <Badge variant="secondary" className="font-semibold uppercase tracking-wider">
                            Inactivo
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="flex items-center justify-between p-4 pt-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="truncate font-semibold text-foreground">
                        {product.name}
                    </h3>
                    <p className="text-sm font-medium text-primary">
                        ₡ {product.price?.toFixed(2)}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            onClick={() => onEdit(product)}
                            aria-label={`Editar ${product.name}`}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(product)}
                            aria-label={`Eliminar ${product.name}`}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
