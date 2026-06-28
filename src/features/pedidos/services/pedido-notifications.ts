import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"
import type { Pedido, PedidoEstado } from "@/features/pedidos/types/pedido.types"

const ACTIVE_STATES: PedidoEstado[] = ["pendiente", "en_proceso", "terminado"]

// Notifs por pedido: d0=día entrega, d1=1 día antes, d2=2 días antes, d3=3 días antes, pend=recordatorio pendiente
const SLOTS = ["d0", "d1", "d2", "d3", "pend"] as const

function hashStr(str: string): number {
    let h = 0
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
    }
    return Math.abs(h) % 999_999
}

function notifId(pedidoId: string, slot: typeof SLOTS[number]): number {
    return hashStr(pedidoId + slot) + 1
}

function allIds(pedidoId: string): { id: number }[] {
    return SLOTS.map((s) => ({ id: notifId(pedidoId, s) }))
}

export async function setupNotificationChannel() {
    if (!Capacitor.isNativePlatform()) return
    await LocalNotifications.createChannel({
        id: "pedidos",
        name: "Pedidos",
        description: "Recordatorios de pedidos y entregas",
        importance: 4,
        vibration: true,
        sound: "default",
        lightColor: "#708C3E",
    })
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false
    const { display } = await LocalNotifications.requestPermissions()
    return display === "granted"
}

export async function schedulePedidoNotifications(pedido: Pedido): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    if (!ACTIVE_STATES.includes(pedido.estado)) return

    await cancelPedidoNotifications(pedido.id_pedido)

    const clienteStr = pedido.nombre_cliente ? ` · ${pedido.nombre_cliente}` : ""
    const desc = pedido.descripcion.length > 70
        ? pedido.descripcion.slice(0, 70) + "…"
        : pedido.descripcion

    const now = new Date()
    const toSchedule: Parameters<typeof LocalNotifications.schedule>[0]["notifications"] = []

    // ── Recordatorios por fecha de entrega (días -3, -2, -1, 0) ──────────
    if (pedido.fecha_entrega) {
        const [y, m, d] = pedido.fecha_entrega.split("-").map(Number)
        const deliveryDate = new Date(y, m - 1, d)

        const deliveryDays: { slot: typeof SLOTS[number]; daysOffset: number; title: string }[] = [
            { slot: "d3", daysOffset: -3, title: `Entrega en 3 días${clienteStr}` },
            { slot: "d2", daysOffset: -2, title: `Entrega en 2 días${clienteStr}` },
            { slot: "d1", daysOffset: -1, title: `Entrega mañana${clienteStr}` },
            { slot: "d0", daysOffset:  0, title: `¡Entrega hoy!${clienteStr}` },
        ]

        for (const { slot, daysOffset, title } of deliveryDays) {
            const at = new Date(deliveryDate)
            at.setDate(at.getDate() + daysOffset)
            at.setHours(8, 0, 0, 0)
            if (at > now) {
                toSchedule.push({
                    id: notifId(pedido.id_pedido, slot),
                    title,
                    body: desc,
                    channelId: "pedidos",
                    smallIcon: "ic_stat_notify",
                    iconColor: "#708C3E",
                    extra: { id_pedido: pedido.id_pedido },
                    schedule: { at, allowWhileIdle: true },
                })
            }
        }
    }

    // ── Recordatorio de pendiente (4 días después de created_at) ─────────
    if (pedido.estado === "pendiente") {
        const createdAt = new Date(pedido.created_at)
        const remindAt = new Date(createdAt)
        remindAt.setDate(remindAt.getDate() + 4)
        remindAt.setHours(8, 0, 0, 0)
        if (remindAt > now) {
            toSchedule.push({
                id: notifId(pedido.id_pedido, "pend"),
                title: `Pedido pendiente sin comenzar${clienteStr}`,
                body: desc,
                channelId: "pedidos",
                smallIcon: "ic_stat_notify",
                iconColor: "#708C3E",
                extra: { id_pedido: pedido.id_pedido },
                schedule: { at: remindAt, allowWhileIdle: true },
            })
        }
    }

    if (toSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: toSchedule })
    }
}

export async function cancelPedidoNotifications(pedidoId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    await LocalNotifications.cancel({ notifications: allIds(pedidoId) })
}

export async function rescheduleAllNotifications(pedidos: Pedido[]): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
            notifications: pending.notifications.map((n) => ({ id: n.id })),
        })
    }
    for (const p of pedidos) {
        if (ACTIVE_STATES.includes(p.estado)) {
            await schedulePedidoNotifications(p).catch(() => {})
        }
    }
}
