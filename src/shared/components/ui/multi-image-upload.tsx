import React, { useState, useRef } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { Button } from './button';
import { uploadImage } from '@/shared/lib/cloudinary';
import { sileo } from 'sileo';
import { cn } from '@/shared/utils';
import { ImageCropper } from './image-cropper';

interface MultiImageUploadProps {
    value?: string[] | null;
    onChange: (urls: string[]) => void;
    maxImages?: number;
}

export function MultiImageUpload({ value = [], onChange, maxImages = 30 }: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [croppingFile, setCroppingFile] = useState<{ file: File; url: string } | null>(null);
    const [filesQueue, setFilesQueue] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Asegurarnos de que urls siempre sea un array
    const urls = Array.isArray(value) ? value : (typeof value === 'string' ? [value] : []);

    const processNextFile = (queue: File[]) => {
        if (queue.length === 0) return;

        const [next, ...rest] = queue;
        setFilesQueue(rest);

        const reader = new FileReader();
        reader.onload = () => {
            setCroppingFile({ file: next, url: reader.result as string });
        };
        reader.readAsDataURL(next);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = maxImages - urls.length;
        if (remainingSlots <= 0) {
            sileo.error({ title: 'Límite alcanzado', description: `Máximo ${maxImages} imágenes.` });
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);
        processNextFile(filesToProcess);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const fileToUpload = new File([croppedBlob], croppingFile?.file.name || 'image.jpg', { type: 'image/jpeg' });
        
        setCroppingFile(null);
        setIsUploading(true);

        try {
            const result = await uploadImage(fileToUpload);
            onChange([...urls, result.url]);
            sileo.success({ title: 'Imagen subida' });
        } catch (error) {
            sileo.error({ title: 'Error de subida', description: 'Ocurrió un problema al subir la imagen.' });
        } finally {
            setIsUploading(false);
            if (filesQueue.length > 0) {
                processNextFile(filesQueue);
            }
        }
    };

    const handleRemove = (index: number) => {
        const newUrls = [...urls];
        newUrls.splice(index, 1);
        onChange(newUrls);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {urls.map((url, index) => (
                    <div key={url} className="relative aspect-square rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden group">
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
                                className="h-7 w-7 p-0 rounded-full"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {urls.length < maxImages && (
                    <div
                        className={cn(
                            "relative aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 transition-all hover:border-[#708C3E]/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50/50 dark:bg-white/5",
                            isUploading && "pointer-events-none opacity-50"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-[#708C3E]" />
                        ) : (
                            <>
                                <Plus className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Añadir</span>
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

            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic text-center">
                Puedes subir hasta {maxImages} imágenes.
            </p>

            {croppingFile && (
                <ImageCropper
                    image={croppingFile.url}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCroppingFile(null)}
                />
            )}
        </div>
    );
}
