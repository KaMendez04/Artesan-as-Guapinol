import { supabase } from "@/lib/supabase"
import type {
    Pedido,
    CreatePedidoDto,
    UpdatePedidoDto,
    PedidoFilters,
} from "@/features/pedidos/types/pedido.types"

const TABLE = "Pedidos" as const
const SELECT = "id_pedido, created_at, descripcion, imagen_referencia, fecha_entrega, estado, nombre_cliente, precio_estimado"

export async function getPedidos(filters?: PedidoFilters): Promise<Pedido[]> {
    let query = supabase
        .from(TABLE)
        .select(SELECT)
        .order("created_at", { ascending: false })

    if (filters?.estado) {
        query = query.eq("estado", filters.estado)
    }

    if (filters?.search) {
        query = query.or(
            `descripcion.ilike.%${filters.search}%,nombre_cliente.ilike.%${filters.search}%`
        )
    }

    const { data, error } = await query
    if (error) throw new Error(`Error al obtener pedidos: ${error.message}`)
    return data
}

export async function getPedidoById(id: string): Promise<Pedido> {
    const { data, error } = await supabase
        .from(TABLE)
        .select(SELECT)
        .eq("id_pedido", id)
        .single()

    if (error) throw new Error(`Pedido ${id} no encontrado: ${error.message}`)
    return data
}

export async function createPedido(dto: CreatePedidoDto): Promise<Pedido> {
    const { data, error } = await supabase
        .from(TABLE)
        .insert([{
            descripcion: dto.descripcion,
            imagen_referencia: dto.imagen_referencia ?? null,
            fecha_entrega: dto.fecha_entrega ?? null,
            estado: dto.estado ?? "en_proceso",
            nombre_cliente: dto.nombre_cliente ?? null,
            precio_estimado: dto.precio_estimado ?? null,
        }])
        .select(SELECT)
        .single()

    if (error) throw new Error(`Error al crear pedido: ${error.message}`)
    return data
}

export async function updatePedido(id: string, dto: UpdatePedidoDto): Promise<Pedido> {
    const { data, error } = await supabase
        .from(TABLE)
        .update(dto)
        .eq("id_pedido", id)
        .select(SELECT)
        .maybeSingle()

    if (error) throw new Error(`Error al actualizar pedido ${id}: ${error.message}`)
    if (!data) throw new Error(`No se pudo actualizar el pedido ${id}. Verifica tus permisos.`)
    return data
}

export async function deletePedido(id: string): Promise<void> {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id_pedido", id)

    if (error) throw new Error(`Error al eliminar pedido ${id}: ${error.message}`)
}
