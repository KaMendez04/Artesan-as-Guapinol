import { useState } from "react"
import { Bell, ClipboardList, ArrowRight, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { differenceInCalendarDays } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { PedidoStatusBadge } from "@/features/pedidos/components/PedidoStatusBadge"
import { usePedidos } from "@/features/pedidos/hooks/usePedido"
import { cancelPedidoNotifications } from "@/features/pedidos/services/pedido-notifications"
import type { Pedido, PedidoEstado } from "@/features/pedidos/types/pedido.types"

const INACTIVE: PedidoEstado[] = ["entregado", "cancelado"]

type Urgency = "high" | "medium"

function getUrgency(p: Pedido): Urgency | null {
    if (INACTIVE.includes(p.estado)) return null
    if (p.fecha_entrega) {
        const days = differenceInCalendarDays(
            new Date(p.fecha_entrega + "T00:00:00"),
            new Date()
        )
        if (days <= 1) return "high"
        if (days <= 5) return "medium"
    }
    if (p.estado === "pendiente") return "medium"
    return null
}

export function NotificationBell() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [dismissed, setDismissed] = useState<Set<string>>(new Set())
    const { data: pedidos = [] } = usePedidos()

    const alerts = pedidos
        .map((p) => ({ pedido: p, urgency: getUrgency(p) }))
        .filter((x): x is { pedido: Pedido; urgency: Urgency } => x.urgency !== null && !dismissed.has(x.pedido.id_pedido))
        .sort((a, b) => (a.urgency === "high" ? -1 : 1) - (b.urgency === "high" ? -1 : 1))

    function handleDismiss(pedidoId: string) {
        cancelPedidoNotifications(pedidoId).catch(() => {})
        setDismissed((prev) => new Set(prev).add(pedidoId))
    }

    function handleDismissAll() {
        alerts.forEach(({ pedido }) => cancelPedidoNotifications(pedido.id_pedido).catch(() => {}))
        setDismissed((prev) => {
            const next = new Set(prev)
            alerts.forEach(({ pedido }) => next.add(pedido.id_pedido))
            return next
        })
    }

    const highCount = alerts.filter((x) => x.urgency === "high").length
    const totalCount = alerts.length

    const badgeColor = highCount > 0
        ? "bg-[#CF7534]"
        : totalCount > 0
        ? "bg-[#E9A03B]"
        : null

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Notificaciones de pedidos"
                    className="relative flex size-10 items-center justify-center rounded-full border border-border/50 bg-white/70 dark:bg-white/5 shadow-sm hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                    <Bell className="size-[1.1rem] text-gray-600 dark:text-gray-300" />
                    {badgeColor && (
                        <span
                            className={`absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[0.55rem] font-bold text-white ${badgeColor} ring-2 ring-white dark:ring-zinc-900`}
                        >
                            {totalCount > 9 ? "9+" : totalCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-72 p-0 rounded-2xl border border-border/60 shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <Bell className="size-4 text-[#708C3E]" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            Pedidos pendientes
                        </span>
                    </div>
                    {alerts.length > 0 && (
                        <button
                            type="button"
                            onClick={handleDismissAll}
                            className="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            Limpiar todo
                        </button>
                    )}
                </div>

                {/* List */}
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#708C3E]/10">
                            <ClipboardList className="size-5 text-[#708C3E]" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            ¡Todo al día!
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            No hay pedidos urgentes
                        </p>
                    </div>
                ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                        {alerts.slice(0, 6).map(({ pedido, urgency }) => {
                            const daysLeft = pedido.fecha_entrega
                                ? differenceInCalendarDays(
                                    new Date(pedido.fecha_entrega + "T00:00:00"),
                                    new Date()
                                )
                                : null

                            const dueLine =
                                daysLeft === null ? null
                                : daysLeft < 0   ? "Venció"
                                : daysLeft === 0 ? "Vence hoy"
                                : daysLeft === 1 ? "Vence mañana"
                                : `Vence en ${daysLeft} días`

                            return (
                                <li
                                    key={pedido.id_pedido}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/item"
                                >
                                    {/* Urgency dot */}
                                    <span className={`mt-1.5 size-2 rounded-full shrink-0 ${urgency === "high" ? "bg-[#CF7534]" : "bg-[#E9A03B]"}`} />

                                    <div
                                        className="min-w-0 flex-1 cursor-pointer"
                                        onClick={() => {
                                            setOpen(false)
                                            navigate(`/app/pedidos?open=${pedido.id_pedido}`)
                                        }}
                                    >
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                                            {pedido.descripcion}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <PedidoStatusBadge estado={pedido.estado} />
                                            {dueLine && (
                                                <span className={`text-[0.65rem] font-semibold ${urgency === "high" ? "text-[#CF7534]" : "text-[#E9A03B]"}`}>
                                                    {dueLine}
                                                </span>
                                            )}
                                        </div>
                                        {pedido.nombre_cliente && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                                {pedido.nombre_cliente}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDismiss(pedido.id_pedido)}
                                        aria-label="Eliminar notificación"
                                        className="mt-0.5 shrink-0 rounded-full p-1.5 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 active:bg-red-50 active:text-red-500 transition-all"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}

                {/* Footer */}
                <div className="border-t border-gray-100 dark:border-white/5 px-4 py-2.5">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false)
                            navigate("/app/pedidos")
                        }}
                        className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-[#708C3E] hover:text-[#5E7634] transition-colors py-1"
                    >
                        Ver todos los pedidos
                        <ArrowRight className="size-4" />
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
