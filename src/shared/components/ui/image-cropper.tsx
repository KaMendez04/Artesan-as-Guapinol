import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { getCroppedImg } from '@/shared/utils/image'

interface ImageCropperProps {
    image: string
    aspect?: number
    onCropComplete: (croppedImage: Blob) => void
    onCancel: () => void
}

export function ImageCropper({ image, aspect = 1, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
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
            const croppedImage = await getCroppedImg(image, croppedAreaPixels)
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
            <DialogContent className="sm:max-w-[500px] p-0 border-0 overflow-hidden rounded-3xl bg-white dark:bg-[#0b0b0b]">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Ajustar foto</DialogTitle>
                </DialogHeader>
                
                <div className="relative h-[350px] w-full bg-black">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteInternal}
                        style={{
                           containerStyle: { background: '#000' }
                        }}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#708C3E]"
                        />
                    </div>

                    <DialogFooter className="flex flex-row gap-3 sm:justify-end">
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none rounded-2xl h-11 text-gray-600 dark:text-gray-400 font-medium transition-all"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCrop}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none rounded-2xl h-11 bg-[#708C3E] hover:bg-[#5E7634] text-white font-semibold transition-all px-8 shadow-md shadow-[#708C3E]/20"
                        >
                            {isProcessing ? "Procesando..." : "Listo"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
