import { useState } from "react"
import { sileo } from "sileo"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/shared/components/ui/dialog"
import { ImageUpload } from "@/shared/components/ui/image-upload"
import { useCreatePedido, useUpdatePedido } from "@/features/pedidos/hooks/usePedido"
import {
    schedulePedidoNotifications,
    cancelPedidoNotifications,
} from "@/features/pedidos/services/pedido-notifications"
import type { Pedido, PedidoEstado } from "@/features/pedidos/types/pedido.types"

interface PedidoFormDialogProps {
    open: boolean
    onClose: () => void
    pedido?: Pedido | null
}

export function PedidoFormDialog({ open, onClose, pedido }: PedidoFormDialogProps) {
    const isEditing = !!pedido

    const [descripcion, setDescripcion] = useState(pedido?.descripcion ?? "")
    const [nombreCliente, setNombreCliente] = useState(pedido?.nombre_cliente ?? "")
    const [imagenReferencia, setImagenReferencia] = useState<string | null>(pedido?.imagen_referencia ?? null)
    const [fechaEntrega, setFechaEntrega] = useState(pedido?.fecha_entrega ?? "")
    const [precioEstimado, setPrecioEstimado] = useState<string>(
        pedido?.precio_estimado != null ? String(pedido.precio_estimado) : ""
    )
    const [estado, setEstado] = useState<PedidoEstado>(pedido?.estado ?? "en_proceso")

    const { mutate: create, isPending: creating } = useCreatePedido()
    const { mutate: update, isPending: updating } = useUpdatePedido()

    const isPending = creating || updating

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!descripcion.trim()) return

        const dto = {
            descripcion: descripcion.trim(),
            nombre_cliente: nombreCliente.trim() || null,
            imagen_referencia: imagenReferencia || null,
            fecha_entrega: fechaEntrega || null,
            precio_estimado: precioEstimado ? Number(precioEstimado) : null,
            estado,
        }

        if (isEditing && pedido) {
            update(
                { id: pedido.id_pedido, dto },
                {
                    onSuccess: (updated) => {
                        sileo.success({ title: "Pedido actualizado" })
                        cancelPedidoNotifications(updated.id_pedido)
                            .then(() => schedulePedidoNotifications(updated))
                            .catch(() => {})
                        onClose()
                    },
                    onError: (error) => {
                        sileo.error({
                            title: "Error al actualizar",
                            description: error instanceof Error ? error.message : "Intenta de nuevo.",
                        })
                    },
                }
            )
        } else {
            create(dto, {
                onSuccess: (created) => {
                    sileo.success({ title: "Pedido agregado" })
                    schedulePedidoNotifications(created).catch(() => {})
                    onClose()
                },
                onError: (error) => {
                    sileo.error({
                        title: "Error al agregar",
                        description: error instanceof Error ? error.message : "Intenta de nuevo.",
                    })
                },
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm border-0 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? "Editar pedido" : "Nuevo pedido"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEditing ? "Modifica los detalles del pedido" : "Registra un nuevo encargo"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Descripción */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="ped-descripcion" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            ¿Qué le pidieron? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="ped-descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Pulsera azul con nombre, 20 cm…"
                            required
                            rows={3}
                            className="w-full resize-none rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all"
                        />
                    </div>

                    {/* Cliente */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between">
                            <label htmlFor="ped-cliente" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cliente</label>
                            <span className="text-xs text-gray-400">opcional</span>
                        </div>
                        <Input
                            id="ped-cliente"
                            value={nombreCliente}
                            onChange={(e) => setNombreCliente(e.target.value)}
                            placeholder="María González"
                            className="h-auto py-2.5 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all"
                        />
                    </div>

                    {/* Imagen de referencia */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between">
                            <label htmlFor="ped-imagen" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Foto de referencia</label>
                            <span className="text-xs text-gray-400">opcional</span>
                        </div>
                        <ImageUpload
                            id="ped-imagen"
                            value={imagenReferencia}
                            onChange={setImagenReferencia}
                            onUploadStart={() => {}}
                            onUploadEnd={() => {}}
                        />
                    </div>

                    {/* Fecha de entrega */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between">
                            <label htmlFor="ped-fecha" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha de entrega</label>
                            <span className="text-xs text-gray-400">opcional</span>
                        </div>
                        <input
                            id="ped-fecha"
                            type="date"
                            value={fechaEntrega}
                            onChange={(e) => setFechaEntrega(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all scheme-light dark:scheme-dark"
                        />
                    </div>

                    {/* Precio estimado */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between">
                            <label htmlFor="ped-precio" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio estimado</label>
                            <span className="text-xs text-gray-400">opcional</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-white/30 pointer-events-none">₡</span>
                            <Input
                                id="ped-precio"
                                type="number"
                                min="0"
                                step="50"
                                value={precioEstimado}
                                onChange={(e) => setPrecioEstimado(e.target.value)}
                                placeholder="0"
                                className="h-auto py-2.5 rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 pl-7 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !descripcion.trim()}
                            className="rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-md shadow-[#708C3E]/20 disabled:opacity-40 py-2.5 px-8 font-semibold"
                        >
                            {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
