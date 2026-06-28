import { Badge } from "@/shared/components/ui/badge"
import type { PedidoEstado } from "@/features/pedidos/types/pedido.types"

const estadoConfig: Record<PedidoEstado, { label: string; className: string }> = {
    pendiente:  { label: "Pendiente",  className: "bg-[#E9A03B]/15 text-[#E9A03B] dark:bg-[#F0A94A]/15 dark:text-[#F0A94A]" },
    en_proceso: { label: "En proceso", className: "bg-[#CF7534]/15 text-[#CF7534] dark:bg-[#D47A3A]/15 dark:text-[#D47A3A]" },
    terminado:  { label: "Terminado",  className: "bg-[#6FA36A]/15 text-[#6FA36A] dark:bg-[#8FBF8C]/15 dark:text-[#8FBF8C]" },
    entregado:  { label: "Entregado",  className: "bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#A7D878]" },
    cancelado:  { label: "Cancelado",  className: "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500" },
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
