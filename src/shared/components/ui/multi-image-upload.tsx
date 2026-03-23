import React, { useState, useRef } from 'react';
import { Loader2, Plus, Eye, Trash2, MoreVertical } from 'lucide-react';
import { Button } from './button';
import { uploadImage } from '@/shared/lib/cloudinary';
import { sileo } from 'sileo';
import { cn } from '@/shared/utils';
import { ImageCropper } from './image-cropper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { ConfirmModal } from './confirm-modal';
import { Dialog, DialogContent } from './dialog';

interface MultiImageUploadProps {
    id?: string;
    value?: string[] | null;
    onChange: (urls: string[]) => void;
    maxImages?: number;
}

export function MultiImageUpload({ id, value = [], onChange, maxImages = 30 }: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [croppingFile, setCroppingFile] = useState<{ file: File; url: string } | null>(null);
    const [filesQueue, setFilesQueue] = useState<File[]>([]);
    const [imageToDeleteIndex, setImageToDeleteIndex] = useState<number | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
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
                    <div key={url} className="relative aspect-square rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden group bg-gray-50 dark:bg-zinc-800">
                        <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                        />
                        
                        <div className="absolute right-1 top-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="h-7 w-7 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm border-0 shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => setPreviewImageUrl(url)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>Ver imagen</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                        onClick={() => setImageToDeleteIndex(index)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Eliminar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                id={id}
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

            <ConfirmModal
                open={imageToDeleteIndex !== null}
                onOpenChange={(open) => !open && setImageToDeleteIndex(null)}
                title="Eliminar imagen"
                description="¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer."
                onConfirm={() => {
                    if (imageToDeleteIndex !== null) {
                        handleRemove(imageToDeleteIndex);
                        setImageToDeleteIndex(null);
                        sileo.success({ title: 'Imagen eliminada' });
                    }
                }}
            />

            <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
                <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-0 bg-transparent flex items-center justify-center">
                    {previewImageUrl && (
                        <img 
                            src={previewImageUrl} 
                            alt="Preview" 
                            className="max-h-[90vh] w-auto object-contain rounded-lg shadow-2xl" 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
