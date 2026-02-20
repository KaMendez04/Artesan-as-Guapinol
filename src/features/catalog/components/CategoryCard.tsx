import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Pencil } from "lucide-react"
import type { Category } from "@/features/catalog/types/category.types"

interface CategoryCardProps {
    category: Category
    onEdit: (category: Category) => void
}

export function CategoryCard({ category, onEdit }: CategoryCardProps) {
    const isActive = category.state === "active"

    return (
        <Card
            className={`relative overflow-hidden transition-all hover:shadow-md ${!isActive ? "opacity-60" : ""
                }`}
        >
            <div
                className={`aspect-square w-full rounded-t-xl ${isActive
                        ? "bg-gradient-to-br from-primary/10 to-primary/5"
                        : "bg-muted"
                    }`}
            >
                {!isActive && (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">No Disponible</span>
                    </div>
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

                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(category)}
                        aria-label={`Editar ${category.name}`}
                    >
                        <Pencil className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
