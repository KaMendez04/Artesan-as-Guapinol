import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Product } from "@/features/catalog/types/product.types";
import { cn } from "@/shared/utils";
import { Dialog as DialogPrimitive } from "radix-ui";
import { APP_CONFIG } from "@/shared/constants/config";

interface ProductDetailDialogProps {
    product: Product | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    catalogToken?: string;
    forceLight?: boolean;
}

export function ProductDetailDialog({ product, isOpen, onOpenChange, catalogToken, forceLight }: ProductDetailDialogProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset image index when a different product is opened
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [product?.idProduct]);

    if (!product) return null;

    const images = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : []);
    const hasMultipleImages = images.length > 1;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleWhatsAppOrder = () => {
        const phone = "+50683862234";
        const currentImageUrl = images[currentImageIndex];

        const shareUrl = `${APP_CONFIG.PROD_URL}/v/${catalogToken || ''}?pid=${product.idProduct}`;

        const message = `¡Hola! 👋 Me interesa este producto de Artesanías Guapinol:

*${product.name}*
Precio: ₡${product.price?.toFixed(2)}

Ver detalle aquí:
${shareUrl}

Foto: ${currentImageUrl}`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className={cn(
                "sm:max-w-2xl p-0 overflow-hidden border-0 bg-white rounded-2xl shadow-2xl",
                !forceLight && "dark:bg-zinc-950",
                forceLight && "light"
            )}>
                <DialogHeader className="sr-only">
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>Detalles del producto y galería de imágenes</DialogDescription>
                </DialogHeader>

                {/* Custom close button with visible styling */}
                <DialogPrimitive.Close
                    className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#5D4037]/80 text-white backdrop-blur-sm transition-all hover:bg-[#5D4037] focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                </DialogPrimitive.Close>

                <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[600px] overflow-y-auto md:overflow-hidden">
                    {/* ── Image Gallery ── */}
                    <div className={cn(
                        "relative w-full md:w-3/5 bg-[#F5F3EB] flex flex-col h-fit md:h-auto min-h-[300px] md:min-h-0",
                        !forceLight && "dark:bg-zinc-900"
                    )}>
                        <div className="relative flex-1 flex items-center justify-center overflow-hidden h-[300px] md:h-auto">
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={product.name || ""}
                                        className="h-full w-full object-contain transition-all duration-500 ease-in-out"
                                    />
                                    {hasMultipleImages && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 shadow-md transition-all z-10 text-[#5D4037]",
                                                    !forceLight && "dark:bg-black/40 dark:hover:bg-black/60 dark:text-zinc-200"
                                                )}
                                                onClick={prevImage}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 shadow-md transition-all z-10 text-[#5D4037]",
                                                    !forceLight && "dark:bg-black/40 dark:hover:bg-black/60 dark:text-zinc-200"
                                                )}
                                                onClick={nextImage}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </>
                                    )}
                                    {/* Image counter */}
                                    {hasMultipleImages && (
                                        <div className={cn(
                                            "absolute top-3 left-3 rounded-full bg-[#5D4037]/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm",
                                            !forceLight && "dark:bg-black/80"
                                        )}>
                                            {currentImageIndex + 1}/{images.length}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-[#708C3E]/40 flex flex-col items-center gap-3">
                                    <span className="text-6xl">🎨</span>
                                    <p className="text-sm font-medium text-[#5D4037]/40">Sin imagen disponible</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Indicators Bar (Below image container) */}
                        {hasMultipleImages && (
                            <div className={cn(
                                "flex justify-center gap-1.5 px-3 py-3 bg-[#F5F3EB] border-t border-gray-100",
                                !forceLight && "dark:bg-zinc-900 dark:border-white/5"
                            )}>
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(i);
                                        }}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            i === currentImageIndex
                                                ? "w-4 bg-[#708C3E]"
                                                : cn("w-1.5 bg-[#5D4037]/20 hover:bg-[#5D4037]/40", !forceLight && "dark:bg-white/10 dark:hover:bg-white/30")
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Product Info ── */}
                    <div className={cn(
                        "w-full md:w-2/5 p-6 flex flex-col justify-between bg-white",
                        !forceLight && "dark:bg-zinc-950"
                    )}>
                        <div className="space-y-5">
                            {/* Name & Price */}
                            <div>
                                <h3 className={cn("text-2xl font-extrabold tracking-tight text-[#5D4037]", !forceLight && "dark:text-zinc-100")}>
                                    {product.name}
                                </h3>
                                <div className="mt-3 flex items-baseline gap-1">
                                    <span className={cn("text-sm font-medium text-[#5D4037]/60", !forceLight && "dark:text-zinc-400")}>₡</span>
                                    <span className={cn("text-3xl font-extrabold text-[#2E7D32]", !forceLight && "dark:text-[#708C3E]")}>
                                        {product.price?.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className={cn("h-px flex-1 bg-gradient-to-r from-[#708C3E]/30 to-transparent", !forceLight && "dark:from-[#708C3E]/20")} />
                                <div className="h-1.5 w-1.5 rounded-full bg-[#708C3E]" />
                                <div className={cn("h-px flex-1 bg-gradient-to-l from-[#708C3E]/30 to-transparent", !forceLight && "dark:from-[#708C3E]/20")} />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <p className={cn("text-sm leading-relaxed text-[#5D4037]/60", !forceLight && "dark:text-zinc-400")}>
                                    Esta pieza es una artesanía de Guapinol, hecha a mano con dedicación y arte costarricense. Cada producto es único e irrepetible.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className={cn(
                                        "inline-flex items-center rounded-full bg-[#708C3E]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2E7D32]",
                                        !forceLight && "dark:bg-[#708C3E]/20 dark:text-[#A5D6A7]"
                                    )}>
                                        🌿 Hecho a mano
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 space-y-3">
                            <Button
                                onClick={handleWhatsAppOrder}
                                className={cn(
                                    "w-full h-13 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold gap-2.5 text-base shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all duration-200 rounded-xl",
                                    !forceLight && "dark:bg-[#708C3E] dark:hover:bg-[#5E7634] dark:shadow-black/20"
                                )}
                            >
                                <MessageCircle className="h-5 w-5 fill-current" />
                                Comprar por WhatsApp
                            </Button>
                            <p className={cn("text-[10px] text-center text-[#5D4037]/50 uppercase tracking-[0.15em] font-bold", !forceLight && "dark:text-zinc-500")}>
                                Respuesta rápida · Pago contra entrega
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
