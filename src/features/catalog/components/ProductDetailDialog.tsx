import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types/product.types";
import { cn } from "@/shared/utils";

interface ProductDetailDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalogToken?: string;
}

export function ProductDetailDialog({ product, open, onOpenChange, catalogToken }: ProductDetailDialogProps) {
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

        const shareUrl = `${window.location.origin}/v/${catalogToken || ''}?pid=${product.idProduct}`;

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-white rounded-2xl shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>Detalles del producto y galería de imágenes</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[600px]">
                    {/* ── Image Gallery ── */}
                    <div className="relative w-full md:w-3/5 bg-[#F5F3EB] flex items-center justify-center overflow-hidden h-[300px] md:h-auto">
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
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 shadow-md hover:bg-white text-[#5D4037] transition-all"
                                            onClick={prevImage}
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/80 shadow-md hover:bg-white text-[#5D4037] transition-all"
                                            onClick={nextImage}
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                        {/* Dot indicators */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-full bg-[#5D4037]/20 backdrop-blur-sm">
                                            {images.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(i);
                                                    }}
                                                    className={cn(
                                                        "h-2 rounded-full transition-all duration-300",
                                                        i === currentImageIndex
                                                            ? "w-5 bg-[#708C3E]"
                                                            : "w-2 bg-white/50 hover:bg-white/80"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                                {/* Image counter */}
                                {hasMultipleImages && (
                                    <div className="absolute top-3 left-3 rounded-full bg-[#5D4037]/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
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

                    {/* ── Product Info ── */}
                    <div className="w-full md:w-2/5 p-6 flex flex-col justify-between bg-white">
                        <div className="space-y-5">
                            {/* Name & Price */}
                            <div>
                                <h3 className="text-2xl font-extrabold tracking-tight text-[#5D4037]">
                                    {product.name}
                                </h3>
                                <div className="mt-3 flex items-baseline gap-1">
                                    <span className="text-sm text-[#5D4037]/40">₡</span>
                                    <span className="text-3xl font-extrabold text-[#2E7D32]">
                                        {product.price?.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#708C3E]/30 to-transparent" />
                                <div className="h-1.5 w-1.5 rounded-full bg-[#708C3E]" />
                                <div className="h-px flex-1 bg-gradient-to-l from-[#708C3E]/30 to-transparent" />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <p className="text-sm leading-relaxed text-[#5D4037]/60">
                                    Esta pieza es una artesanía de Guapinol, hecha a mano con dedicación y arte costarricense. Cada producto es único e irrepetible.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-full bg-[#708C3E]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2E7D32]">
                                        🌿 Hecho a mano
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 space-y-3">
                            <Button
                                onClick={handleWhatsAppOrder}
                                className="w-full h-13 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold gap-2.5 text-base shadow-lg shadow-[#25D366]/25 active:scale-[0.98] transition-all duration-200 rounded-xl"
                            >
                                <MessageCircle className="h-5 w-5 fill-current" />
                                Comprar por WhatsApp
                            </Button>
                            <p className="text-[10px] text-center text-[#5D4037]/30 uppercase tracking-[0.15em] font-semibold">
                                Respuesta rápida · Pago contra entrega
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
