import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Pencil, Share2 } from "lucide-react"
import type { Category } from "@/features/catalog/types/category.types"
import { isCloudinaryUrl } from "@/shared/lib/cloudinary"

interface CategoryCardProps {
    category: Category
    onEdit?: (category: Category) => void
    onShare?: (category: Category) => void
    onClick?: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onShare, onClick }: CategoryCardProps) {
    const isActive = category.state === "active"

    return (
        <Card
            className={`relative overflow-hidden transition-all p-0 gap-0 ${!isActive ? "opacity-60" : ""
                } ${onClick ? "cursor-pointer hover:shadow-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" : "hover:shadow-md"}`}
            onClick={() => onClick?.(category)}
        >
            <div
                className={`aspect-square w-full rounded-t-xl overflow-hidden group ${isActive
                    ? "bg-gradient-to-br from-primary/10 to-primary/5"
                    : "bg-muted"
                    }`}
            >
                {category.image_url ? (
                    <img
                        src={
                            isCloudinaryUrl(category.image_url)
                                ? category.image_url.replace('/upload/', '/upload/c_fill,w_400,h_400,q_auto,f_auto/')
                                : category.image_url
                        }
                        alt={category.name ?? "Categoría"}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    !isActive && (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">No Disponible</span>
                        </div>
                    )
                )}
            </div>

            <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{category.name ?? "Sin nombre"}</p>
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="mt-1 text-xs"
                        >
                            {isActive ? "Disponible" : "No disponible"}
                        </Badge>
                    </div>

                    {onShare && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                            onClick={() => onShare(category)}
                            aria-label={`Compartir ${category.name}`}
                        >
                            <Share2 className="size-4" />
                        </Button>
                    )}

                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                            onClick={() => onEdit(category)}
                            aria-label={`Editar ${category.name}`}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
