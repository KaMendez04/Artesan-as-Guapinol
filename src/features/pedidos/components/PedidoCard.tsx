import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import {
    MoreVertical, Pencil, Trash2, Calendar, User,
    ChevronDown, Check, Loader2,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { estadoConfig } from "./PedidoStatusBadge"
import { isCloudinaryUrl } from "@/shared/lib/cloudinary"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useUpdatePedido } from "@/features/pedidos/hooks/usePedido"
import {
    schedulePedidoNotifications,
    cancelPedidoNotifications,
} from "@/features/pedidos/services/pedido-notifications"
import { sileo } from "sileo"
import type { Pedido, PedidoEstado } from "@/features/pedidos/types/pedido.types"

const estadoBtnStyle: Record<PedidoEstado, { idle: string; active: string }> = {
    pendiente:  { idle: "border-[#E9A03B]/30 text-[#E9A03B] dark:text-[#F0A94A] hover:bg-[#E9A03B]/10 dark:hover:bg-[#F0A94A]/10",   active: "bg-[#E9A03B]/15 border-[#E9A03B] text-[#E9A03B] dark:bg-[#F0A94A]/15 dark:text-[#F0A94A] dark:border-[#F0A94A]/50" },
    en_proceso: { idle: "border-[#CF7534]/30 text-[#CF7534] dark:text-[#D47A3A] hover:bg-[#CF7534]/10 dark:hover:bg-[#D47A3A]/10",   active: "bg-[#CF7534]/15 border-[#CF7534] text-[#CF7534] dark:bg-[#D47A3A]/15 dark:text-[#D47A3A] dark:border-[#D47A3A]/50" },
    terminado:  { idle: "border-[#6FA36A]/30 text-[#6FA36A] dark:text-[#8FBF8C] hover:bg-[#6FA36A]/10 dark:hover:bg-[#8FBF8C]/10",   active: "bg-[#6FA36A]/15 border-[#6FA36A] text-[#6FA36A] dark:bg-[#8FBF8C]/15 dark:text-[#8FBF8C] dark:border-[#8FBF8C]/50" },
    entregado:  { idle: "border-[#708C3E]/30 text-[#708C3E] dark:text-[#A7D878] hover:bg-[#708C3E]/10 dark:hover:bg-[#708C3E]/20",   active: "bg-[#708C3E]/15 border-[#708C3E] text-[#708C3E] dark:bg-[#708C3E]/25 dark:text-[#A7D878]" },
    cancelado:  { idle: "border-gray-200    text-gray-500   dark:text-zinc-400   hover:bg-gray-50   dark:hover:bg-zinc-800",          active: "bg-gray-100   border-gray-400   text-gray-500   dark:bg-zinc-800      dark:text-zinc-300   dark:border-zinc-500" },
}

interface PedidoCardProps {
    pedido: Pedido
    onView?: (pedido: Pedido) => void
    onEdit?: (pedido: Pedido) => void
    onDelete?: (pedido: Pedido) => void
}

export function PedidoCard({ pedido, onView, onEdit, onDelete }: PedidoCardProps) {
    const [pickerOpen, setPickerOpen] = useState(false)
    const { mutate: updatePedido, isPending: isSavingEstado } = useUpdatePedido()

    function handleEstadoChange(nuevoEstado: PedidoEstado) {
        if (nuevoEstado === pedido.estado) {
            setPickerOpen(false)
            return
        }
        updatePedido(
            { id: pedido.id_pedido, dto: { estado: nuevoEstado } },
            {
                onSuccess: (updated) => {
                    sileo.success({ title: `Estado: ${estadoConfig[nuevoEstado].label}` })
                    setPickerOpen(false)
                    const inactive = nuevoEstado === "entregado" || nuevoEstado === "cancelado"
                    if (inactive) {
                        cancelPedidoNotifications(updated.id_pedido).catch(() => {})
                    } else {
                        cancelPedidoNotifications(updated.id_pedido)
                            .then(() => schedulePedidoNotifications(updated))
                            .catch(() => {})
                    }
                },
                onError: (err) => {
                    sileo.error({
                        title: "No se pudo cambiar el estado",
                        description: err instanceof Error ? err.message : "Intenta de nuevo.",
                    })
                },
            }
        )
    }

    const estadoKeys = Object.keys(estadoConfig) as PedidoEstado[]
    const cfg = estadoConfig[pedido.estado]

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5 border border-border/50 backdrop-blur-sm transition duration-300 hover:shadow-lg hover:bg-white/80 dark:hover:bg-white/10">
            {/* Clickable image area → opens detail */}
            <div
                className="relative aspect-4/3 w-full overflow-hidden bg-[#F5F3EB] dark:bg-zinc-800/50 cursor-pointer"
                onClick={() => onView?.(pedido)}
                role={onView ? "button" : undefined}
                aria-label={onView ? "Ver detalles del pedido" : undefined}
            >
                {pedido.imagen_referencia ? (
                    <img
                        src={
                            isCloudinaryUrl(pedido.imagen_referencia)
                                ? pedido.imagen_referencia.replace("/upload/", "/upload/c_fill,w_400,h_300,q_auto,f_auto/")
                                : pedido.imagen_referencia
                        }
                        alt="Referencia del pedido"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-extrabold text-[#708C3E]/15 dark:text-[#708C3E]/25">
                            {pedido.descripcion[0]?.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col gap-2.5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p
                            className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word leading-snug group-hover:text-[#708C3E] dark:group-hover:text-[#A7D878] transition-colors duration-300 cursor-pointer"
                            onClick={() => onView?.(pedido)}
                        >
                            {pedido.descripcion}
                        </p>

                        {pedido.nombre_cliente && (
                            <div className="flex items-center gap-1 mt-1">
                                <User className="size-3 text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {pedido.nombre_cliente}
                                </span>
                            </div>
                        )}
                    </div>

                    {(onEdit || onDelete) && (
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="min-w-8 min-h-8 shrink-0 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                                    >
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(pedido)}>
                                            <Pencil className="mr-2 size-4" />
                                            <span>Editar pedido</span>
                                        </DropdownMenuItem>
                                    )}
                                    {onEdit && onDelete && <DropdownMenuSeparator />}
                                    {onDelete && (
                                        <DropdownMenuItem
                                            onClick={() => onDelete(pedido)}
                                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            <span>Eliminar</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Status picker — tappable badge */}
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            disabled={isSavingEstado}
                            className={`
                                flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-xs font-semibold
                                transition-all duration-200 active:scale-95
                                ${cfg.className}
                                hover:opacity-80
                            `}
                            aria-label="Cambiar estado del pedido"
                        >
                            {isSavingEstado && <Loader2 className="size-3 animate-spin" />}
                            <span>{cfg.label}</span>
                            <ChevronDown className="size-3 opacity-60" />
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        align="start"
                        sideOffset={6}
                        className="w-52 p-2 rounded-2xl border border-border/60 shadow-xl bg-white dark:bg-zinc-900"
                    >
                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 pb-2">
                            Cambiar estado
                        </p>
                        <div className="flex flex-col gap-1">
                            {estadoKeys.map((s) => {
                                const isActive = s === pedido.estado
                                const style = estadoBtnStyle[s]
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        disabled={isSavingEstado}
                                        onClick={() => handleEstadoChange(s)}
                                        className={`
                                            flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-semibold
                                            transition-all duration-150 active:scale-95 text-left w-full
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isActive ? style.active : `bg-transparent ${style.idle}`}
                                        `}
                                    >
                                        <span className="flex-1">{estadoConfig[s].label}</span>
                                        {isActive && <Check className="size-4 shrink-0 opacity-70" />}
                                    </button>
                                )
                            })}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Fecha de entrega */}
                {pedido.fecha_entrega && (
                    <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(pedido.fecha_entrega + "T00:00:00"), "dd MMM yyyy", { locale: es })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
