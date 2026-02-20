import { useState } from 'react';
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

        // URL directa de Vercel (evitamos la Edge Function para simplicidad)
        const BASE_URL = "https://artesan-as-guapinol.vercel.app";
        const shareUrl = `${BASE_URL}/v/${catalogToken || ''}?pid=${product.idProduct}`;

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
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none bg-background/95 backdrop-blur-md">
                <DialogHeader className="sr-only">
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>Detalles del producto y galería de imágenes</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[600px]">
                    {/* Galería de Imágenes */}
                    <div className="relative w-full md:w-3/5 bg-muted flex items-center justify-center overflow-hidden h-[300px] md:h-auto">
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
                                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm text-foreground transition-all"
                                            onClick={prevImage}
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm text-foreground transition-all"
                                            onClick={nextImage}
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </Button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">
                                            {images.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-1.5 w-1.5 rounded-full transition-all",
                                                        i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <span className="text-4xl">🎨</span>
                                <p className="text-sm font-medium">Sin imagen disponible</p>
                            </div>
                        )}
                    </div>

                    {/* Información del Producto */}
                    <div className="w-full md:w-2/5 p-6 flex flex-col justify-between bg-card text-card-foreground">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-foreground">{product.name}</h3>
                                <p className="text-3xl font-bold text-primary mt-2">₡ {product.price?.toFixed(2)}</p>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Esta pieza es una artesanía de Guapinol, hecha a mano con dedicación y arte costarricense.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <Button
                                onClick={handleWhatsAppOrder}
                                className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold gap-2 text-base shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                            >
                                <MessageCircle className="h-5 w-5 fill-current" />
                                Comprar por WhatsApp
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-semibold">
                                Pago seguro y contra entrega
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
