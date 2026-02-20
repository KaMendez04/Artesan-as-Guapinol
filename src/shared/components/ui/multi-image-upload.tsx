import React, { useState, useRef } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { Button } from './button';
import { uploadImage } from '@/shared/lib/cloudinary';
import { sileo } from 'sileo';
import { cn } from '@/shared/utils';

interface MultiImageUploadProps {
    value?: string[] | null;
    onChange: (urls: string[]) => void;
    maxImages?: number;
}

export function MultiImageUpload({ value = [], onChange, maxImages = 5 }: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Asegurarnos de que urls siempre sea un array
    const urls = Array.isArray(value) ? value : (typeof value === 'string' ? [value] : []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = maxImages - urls.length;
        if (remainingSlots <= 0) {
            sileo.error({ title: 'Límite alcanzado', description: `Máximo ${maxImages} imágenes.` });
            return;
        }

        const filesToUpload = files.slice(0, remainingSlots);

        try {
            setIsUploading(true);
            const uploadPromises = filesToUpload.map(file => {
                if (!file.type.startsWith('image/')) {
                    throw new Error('Archivo no válido');
                }
                return uploadImage(file);
            });

            const results = await Promise.all(uploadPromises);
            const newUrls = [...urls, ...results.map(r => r.url)];
            onChange(newUrls);
            sileo.success({ title: 'Imágenes subidas' });
        } catch (error) {
            sileo.error({ title: 'Error de subida', description: 'Ocurrió un problema al subir las imágenes.' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        const newUrls = [...urls];
        newUrls.splice(index, 1);
        onChange(newUrls);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {urls.map((url, index) => (
                    <div key={url} className="relative aspect-square rounded-lg border overflow-hidden group">
                        <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemove(index)}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {urls.length < maxImages && (
                    <div
                        className={cn(
                            "relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/50",
                            isUploading && "pointer-events-none opacity-50"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                            <>
                                <Plus className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">Añadir</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
            />

            <p className="text-[10px] text-muted-foreground italic text-center">
                Puedes subir hasta {maxImages} imágenes.
            </p>
        </div>
    );
}
