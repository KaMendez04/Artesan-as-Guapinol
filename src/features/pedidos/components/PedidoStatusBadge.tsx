import { Badge } from "@/shared/components/ui/badge"
import type { PedidoEstado } from "@/features/pedidos/types/pedido.types"

const estadoConfig: Record<PedidoEstado, { label: string; className: string }> = {
    pendiente:  { label: "Pendiente",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    en_proceso: { label: "En proceso",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    terminado:  { label: "Terminado",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    entregado:  { label: "Entregado",   className: "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#A7D878]" },
    cancelado:  { label: "Cancelado",   className: "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500" },
}

interface PedidoStatusBadgeProps {
    estado: PedidoEstado
    className?: string
}

export function PedidoStatusBadge({ estado, className }: PedidoStatusBadgeProps) {
    const config = estadoConfig[estado]
    return (
        <Badge className={`border-0 text-[0.625rem] font-semibold ${config.className} ${className ?? ""}`}>
            {config.label}
        </Badge>
    )
}

export { estadoConfig }
