export type PedidoEstado = "en_proceso" | "terminado" | "entregado" | "cancelado"

export interface Pedido {
    id_pedido: string
    created_at: string
    descripcion: string
    imagen_referencia: string | null
    fecha_entrega: string | null
    estado: PedidoEstado
    nombre_cliente: string | null
    precio_estimado: number | null
}

export interface CreatePedidoDto {
    descripcion: string
    imagen_referencia?: string | null
    fecha_entrega?: string | null
    estado?: PedidoEstado
    nombre_cliente?: string | null
    precio_estimado?: number | null
}

export interface UpdatePedidoDto {
    descripcion?: string
    imagen_referencia?: string | null
    fecha_entrega?: string | null
    estado?: PedidoEstado
    nombre_cliente?: string | null
    precio_estimado?: number | null
}

export interface PedidoFilters {
    estado?: PedidoEstado
    search?: string
}
