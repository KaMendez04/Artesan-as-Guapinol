import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { ConfirmModal } from "@/shared/components/ui/confirm-modal"
import { Calendar, User, DollarSign, Pencil, FileText, Trash2 } from "lucide-react"
import { PedidoStatusBadge } from "./PedidoStatusBadge"
import { isCloudinaryUrl } from "@/shared/lib/cloudinary"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { sileo } from "sileo"
import { useDeletePedido } from "@/features/pedidos/hooks/usePedido"
import { cancelPedidoNotifications } from "@/features/pedidos/services/pedido-notifications"
import type { Pedido } from "@/features/pedidos/types/pedido.types"

interface PedidoDetailDialogProps {
    open: boolean
    onClose: () => void
    pedido: Pedido | null
    onEdit?: (pedido: Pedido) => void
}

export function PedidoDetailDialog({ open, onClose, pedido, onEdit }: PedidoDetailDialogProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const { mutate: deletePedido, isPending: isDeleting } = useDeletePedido()

    if (!pedido) return null

    function handleDelete() {
        if (!pedido) return
        deletePedido(pedido.id_pedido, {
            onSuccess: () => {
                cancelPedidoNotifications(pedido.id_pedido).catch(() => {})
                sileo.success({ title: "Pedido eliminado" })
                setShowDeleteConfirm(false)
                onClose()
            },
            onError: (err) => {
                sileo.error({
                    title: "Error al eliminar",
                    description: err instanceof Error ? err.message : "Intenta de nuevo.",
                })
            },
        })
    }

    const imageUrl = pedido.imagen_referencia
        ? isCloudinaryUrl(pedido.imagen_referencia)
            ? pedido.imagen_referencia.replace("/upload/", "/upload/c_fill,w_800,h_500,q_auto,f_auto/")
            : pedido.imagen_referencia
        : null

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md border-0 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto p-0">
                <DialogDescription className="sr-only">
                    Detalles del pedido: {pedido.descripcion}
                </DialogDescription>

                {/* Image */}
                <div className="relative w-full aspect-video bg-[#F5F3EB] dark:bg-zinc-800 overflow-hidden rounded-t-2xl">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Referencia del pedido"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-7xl font-extrabold text-[#708C3E]/15 dark:text-[#708C3E]/25 select-none">
                                {pedido.descripcion[0]?.toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 p-5">
                    <DialogHeader className="gap-2 text-left">
                        {/* Status + date */}
                        <div className="flex items-center justify-between gap-2">
                            <PedidoStatusBadge estado={pedido.estado} className="text-xs px-3 py-1" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                {format(new Date(pedido.created_at), "dd MMM", { locale: es })}
                            </span>
                        </div>

                        {/* Descripcion */}
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white text-left leading-snug">
                            {pedido.descripcion}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Meta info */}
                    {(pedido.nombre_cliente || pedido.fecha_entrega || pedido.precio_estimado != null) && (
                        <div className="flex flex-col gap-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-4 py-3">
                            {pedido.nombre_cliente && (
                                <div className="flex items-center gap-2.5">
                                    <User className="size-4 text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Cliente</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{pedido.nombre_cliente}</p>
                                    </div>
                                </div>
                            )}
                            {pedido.fecha_entrega && (
                                <div className="flex items-center gap-2.5">
                                    <Calendar className="size-4 text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Fecha de entrega</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {format(new Date(pedido.fecha_entrega + "T00:00:00"), "EEEE dd 'de' MMMM", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {pedido.precio_estimado != null && (
                                <div className="flex items-center gap-2.5">
                                    <DollarSign className="size-4 text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Precio estimado</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            ₡{pedido.precio_estimado.toLocaleString("es-CR")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notas */}
                    {pedido.notas && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <FileText className="size-3.5 text-gray-400" />
                                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Notas</p>
                            </div>
                            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-4 py-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {pedido.notas}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <Button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isDeleting}
                            className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/25 gap-1.5 font-semibold"
                            variant="ghost"
                        >
                            <Trash2 className="size-4" />
                            Eliminar
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                                Cerrar
                            </Button>
                            {onEdit && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        onClose()
                                        onEdit(pedido)
                                    }}
                                    className="rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-md shadow-[#708C3E]/20 gap-2"
                                >
                                    <Pencil className="size-4" />
                                    Editar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>

            <ConfirmModal
                open={showDeleteConfirm}
                onOpenChange={(v) => !v && setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Eliminar pedido"
                description={`¿Eliminar "${pedido.descripcion.slice(0, 60)}${pedido.descripcion.length > 60 ? "…" : ""}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isLoading={isDeleting}
            />
        </Dialog>
    )
}
