import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { CardContent } from "@/shared/components/ui/card"
import { Pencil, Share2, ArrowRight, MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
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
    const isPublicView = !onEdit && !onShare

    /* ═══ PUBLIC CATALOG VIEW ═══ */
    if (isPublicView) {
        return (
            <div
                role="button"
                tabIndex={0}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E8E5D8] transition duration-300 hover:shadow-xl hover:shadow-[#708C3E]/10 hover:ring-[#708C3E]/40 ${!isActive ? "opacity-50 grayscale" : ""
                    }`}
                onClick={() => onClick?.(category)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onClick?.(category)
                    }
                }}
            >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F3EB]">
                    {category.image_url ? (
                        <img
                            src={
                                isCloudinaryUrl(category.image_url)
                                    ? category.image_url.replace('/upload/', '/upload/c_fill,w_500,h_375,q_auto,f_auto/')
                                    : category.image_url
                            }
                            alt={category.name ?? "Categoría"}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-5xl font-extrabold text-[#708C3E]/20">
                                {category.name?.[0]?.toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2E7D32]/70 via-[#2E7D32]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Hover CTA */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 opacity-0 transition duration-300 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="text-sm font-semibold text-white drop-shadow-sm">
                            Ver productos
                        </span>
                        <div className="flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition-transform group-hover:translate-x-0.5">
                            <ArrowRight className="size-4" />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 text-center">
                    <h3 className="font-bold text-[#5D4037] group-hover:text-[#2E7D32] transition-colors duration-300">
                        {category.name ?? "Sin nombre"}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-[#5D4037]/60">
                        Explorar categoría
                    </p>
                </div>
            </div>
        )
    }

    /* ═══ ADMIN VIEW ═══ */
    return (
        <div
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-[#E8E5D8] dark:ring-zinc-700 transition duration-300 hover:shadow-lg hover:shadow-[#5D4037]/5 dark:hover:shadow-black/20 hover:ring-[#708C3E]/40 ${
                !isActive ? "opacity-60" : ""
            } ${onClick ? "cursor-pointer" : ""}`}
            onClick={() => onClick?.(category)}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onClick(category)
                }
            }}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F3EB] dark:bg-zinc-800">
                {category.image_url ? (
                    <img
                        src={
                            isCloudinaryUrl(category.image_url)
                                ? category.image_url.replace('/upload/', '/upload/c_fill,w_400,h_300,q_auto,f_auto/')
                                : category.image_url
                        }
                        alt={category.name ?? "Categoría"}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-extrabold text-[#708C3E]/15 dark:text-[#708C3E]/25">
                            {category.name?.[0]?.toUpperCase()}
                        </span>
                    </div>
                )}

                {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px]">
                        <Badge className="bg-[#5D4037]/70 text-white text-[0.625rem] font-semibold uppercase tracking-wider border-0">
                            No disponible
                        </Badge>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 group-hover:text-[#708C3E] dark:group-hover:text-[#A5D6A7] transition-colors duration-300 break-words">
                            {category.name ?? "Sin nombre"}
                        </h3>
                        <Badge
                            className={`mt-1 text-[0.625rem] font-semibold border-0 ${
                                isActive
                                    ? "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#A5D6A7]"
                                    : "bg-[#5D4037]/10 text-[#5D4037]/60 dark:bg-zinc-700 dark:text-zinc-400"
                            }`}
                        >
                            {isActive ? "Disponible" : "No disponible"}
                        </Badge>
                    </div>

                    {(onEdit || onShare) && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="min-w-8 min-h-8 shrink-0 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                                    >
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onClick?.(category)}>
                                        <ArrowRight className="mr-2 size-4" />
                                        <span>Ver productos</span>
                                    </DropdownMenuItem>
                                    {onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(category)}>
                                            <Pencil className="mr-2 size-4" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                    )}
                                    {onShare && (
                                        <DropdownMenuItem onClick={() => onShare(category)}>
                                            <Share2 className="mr-2 size-4" />
                                            <span>Compartir</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </CardContent>
        </div>
    )
}
