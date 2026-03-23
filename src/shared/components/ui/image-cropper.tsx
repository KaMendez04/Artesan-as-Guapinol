import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/ui/dialog'
import { Dialog as DialogPrimitive } from "radix-ui"
import { Button } from '@/shared/components/ui/button'
import { getCroppedImg } from '@/shared/utils/image'
import { RotateCw, X } from 'lucide-react'

interface ImageCropperProps {
    image: string
    aspect?: number
    onCropComplete: (croppedImage: Blob) => void
    onCancel: () => void
}

export function ImageCropper({ image, aspect = 1, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const onCropChange = useCallback((crop: { x: number; y: number }) => {
        setCrop(crop)
    }, [])

    const onZoomChange = useCallback((zoom: number) => {
        setZoom(zoom)
    }, [])

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCrop = async () => {
        try {
            setIsProcessing(true)
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
            if (croppedImage) {
                onCropComplete(croppedImage)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent showCloseButton={false} className="sm:max-w-[500px] p-0 border-0 overflow-hidden rounded-3xl bg-white dark:bg-[#0b0b0b] shadow-2xl">
                <DialogHeader className="p-6 pb-2 relative">
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Ajustar foto</DialogTitle>
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                        <X className="h-4 w-4" />
                    </DialogPrimitive.Close>
                </DialogHeader>
                
                <div className="relative h-[350px] w-full bg-[#121212]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onRotationChange={setRotation}
                        onCropComplete={onCropCompleteInternal}
                        style={{
                           containerStyle: { background: '#121212' }
                        }}
                    />
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex flex-col gap-6">
                        {/* Zoom Control */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Zoom</label>
                                <span className="text-xs font-mono text-[#708C3E]">{zoom.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#708C3E]"
                            />
                        </div>

                        {/* Rotation Control */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Rotación</label>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Girar 90° hacia la derecha</span>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                className="size-10 rounded-xl border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
                            >
                                <RotateCw className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="flex-1 rounded-2xl h-12 text-gray-500 dark:text-gray-400 font-medium transition-all hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCrop}
                            disabled={isProcessing}
                            className="flex-1 rounded-2xl h-12 bg-[#708C3E] hover:bg-[#5E7634] text-white font-bold transition-all px-8 shadow-lg shadow-[#708C3E]/20 active:scale-[0.98]"
                        >
                            {isProcessing ? "Procesando..." : "Listo"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
