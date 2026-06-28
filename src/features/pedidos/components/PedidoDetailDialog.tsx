import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/shared/components/ui/dialog"
import { ConfirmModal } from "@/shared/components/ui/confirm-modal"
import { Banknote, Calendar, Pencil, Trash2, User, X } from "lucide-react"
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
            <DialogContent
                className="sm:max-w-md border-0 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto p-0"
                showCloseButton={false}
            >
                <DialogDescription className="sr-only">
                    Detalles del pedido: {pedido.descripcion}
                </DialogDescription>

                {/* Image + top-right actions */}
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

                    {/* Top-right: trash + close */}
                    <div className="absolute right-3 top-3 flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isDeleting}
                            className="flex size-8 items-center justify-center rounded-xl bg-black/30 text-white backdrop-blur-sm transition hover:bg-red-500/80 disabled:opacity-40"
                            aria-label="Eliminar pedido"
                        >
                            <Trash2 className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-8 items-center justify-center rounded-xl bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                            aria-label="Cerrar"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 p-5">
                    {/* Status + date */}
                    <div className="flex items-center justify-between gap-2">
                        <PedidoStatusBadge estado={pedido.estado} className="text-xs px-3 py-1" />
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                            {format(new Date(pedido.created_at), "dd MMM", { locale: es })}
                        </span>
                    </div>

                    {/* Titulo */}
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white leading-snug -mt-1">
                        {pedido.descripcion}
                    </DialogTitle>

                    {/* Meta info */}
                    {(pedido.nombre_cliente || pedido.fecha_entrega || pedido.precio_estimado != null) && (
                        <div className="flex flex-col gap-2.5 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-4 py-3">
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
                                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Entrega</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {format(new Date(pedido.fecha_entrega + "T00:00:00"), "EEEE dd 'de' MMMM", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {pedido.precio_estimado != null && (
                                <div className="flex items-center gap-2.5">
                                    <Banknote className="size-4 text-gray-400 shrink-0" />
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

                    {/* Botones: primaria izquierda, secundaria derecha */}
                    <div className="flex gap-2 pt-1">
                        {onEdit && (
                            <button
                                type="button"
                                onClick={() => { onClose(); onEdit(pedido) }}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] px-4 py-2.5 text-sm font-semibold text-white transition"
                            >
                                <Pencil className="size-4" />
                                Editar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition hover:bg-white/80 dark:hover:bg-white/10"
                        >
                            Cerrar
                        </button>
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
