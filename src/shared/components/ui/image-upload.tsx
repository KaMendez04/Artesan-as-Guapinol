import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './button';
import { uploadImage } from '@/shared/lib/cloudinary';
import { sileo } from 'sileo';
import { ImageCropper } from './image-cropper';

interface ImageUploadProps {
    id?: string;
    value?: string | null;
    onChange: (url: string | null) => void;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
}

export function ImageUpload({ id, value, onChange, onUploadStart, onUploadEnd }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [croppingFile, setCroppingFile] = useState<{ file: File; url: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            sileo.error({ title: 'Archivo no válido' });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCroppingFile({ file, url: reader.result as string });
        };
        reader.readAsDataURL(file);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const fileToUpload = new File([croppedBlob], croppingFile?.file.name || 'image.jpg', { type: 'image/jpeg' });
        
        setCroppingFile(null);
        setIsUploading(true);
        onUploadStart?.();

        try {
            const result = await uploadImage(fileToUpload);
            onChange(result.url);
            sileo.success({ title: 'Imagen subida' });
        } catch (error) {
            sileo.error({ title: 'Error de subida' });
        } finally {
            setIsUploading(false);
            onUploadEnd?.();
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div className="flex flex-col gap-4">
            <div
                className={`relative w-full rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50 ${value ? 'max-h-[200px] bg-background' : 'aspect-video bg-muted/50'
                    }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                {value ? (
                    <div className="relative h-full w-full max-h-[200px] overflow-hidden rounded-lg">
                        <img
                            src={value}
                            alt="Upload preview"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer">
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8" />
                                <span className="text-sm font-medium">Click para subir imagen</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    id={id}
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>

            {value && !isUploading && (
                <p className="text-[10px] text-muted-foreground text-center italic">
                    Click en la imagen para cambiarla
                </p>
            )}

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
