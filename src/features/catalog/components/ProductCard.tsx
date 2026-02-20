import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Pencil, Trash2 } from "lucide-react"
import type { Product } from "@/features/catalog/types/product.types"
import { isCloudinaryUrl } from "@/shared/lib/cloudinary"

interface ProductCardProps {
    product: Product
    onEdit?: (product: Product) => void
    onDelete?: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const isActive = product.state === "active"

    return (
        <Card
            className={`relative overflow-hidden transition-all hover:shadow-md p-0 gap-0 ${!isActive ? "opacity-60" : ""
                }`}
        >
            <div className="relative aspect-square w-full">
                {product.imgUrl ? (
                    <img
                        src={
                            isCloudinaryUrl(product.imgUrl)
                                ? product.imgUrl.replace("/upload/", "/upload/f_auto,q_auto,w_400,h_400,c_fill/")
                                : product.imgUrl
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
                            < Pencil className="size-4" />
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
