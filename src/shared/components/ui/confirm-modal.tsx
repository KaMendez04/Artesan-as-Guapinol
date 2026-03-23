import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    isLoading?: boolean
}

export function ConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title = "Confirmar acción",
    description = "¿Estás seguro de que deseas realizar esta acción? Esta acción no se puede deshacer.",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "destructive",
    isLoading = false
}: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] border-0 rounded-3xl shadow-2xl bg-white dark:bg-[#0b0b0b] p-6">
                <DialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className={`flex size-14 items-center justify-center rounded-2xl ${variant === 'destructive' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-[#708C3E]/10 text-[#708C3E]'}`}>
                        <AlertTriangle className="size-7" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="flex flex-row gap-3 sm:justify-center mt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 rounded-2xl h-11 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-all"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 rounded-2xl h-11 font-semibold transition-all ${
                            variant !== "destructive" 
                                ? "bg-[#708C3E] hover:bg-[#5E7634] text-white" 
                                : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                        {isLoading ? "Procesando..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
