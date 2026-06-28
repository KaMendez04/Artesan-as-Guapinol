import { useState, useEffect } from "react"
import { ArrowLeft, ClipboardList, Plus, Search } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { sileo } from "sileo"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ConfirmModal } from "@/shared/components/ui/confirm-modal"
import { AppPagination } from "@/shared/components/ui/AppPagination"
import { PedidoCard } from "@/features/pedidos/components/PedidoCard"
import { PedidoDetailDialog } from "@/features/pedidos/components/PedidoDetailDialog"
import { PedidoFormDialog } from "@/features/pedidos/components/PedidoFormDialog"
import { estadoConfig } from "@/features/pedidos/components/PedidoStatusBadge"
import { usePedidos, useDeletePedido } from "@/features/pedidos/hooks/usePedido"
import {
    setupNotificationChannel,
    requestNotificationPermission,
    rescheduleAllNotifications,
    cancelPedidoNotifications,
} from "@/features/pedidos/services/pedido-notifications"
import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"
import type { Pedido, PedidoEstado } from "@/features/pedidos/types/pedido.types"

const EMPTY_PEDIDOS: Pedido[] = []
const ITEMS_PER_PAGE = 12

type EstadoFilter = PedidoEstado | "todos"

export default function PedidosPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [search, setSearch] = useState("")
    const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("todos")
    const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingPedido, setEditingPedido] = useState<Pedido | null>(null)
    const [deletingPedido, setDeletingPedido] = useState<Pedido | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const { data: pedidos = EMPTY_PEDIDOS, isLoading } = usePedidos()
    const { mutate: deletePedido, isPending: isDeleting } = useDeletePedido()

    useEffect(() => {
        setupNotificationChannel()
            .then(() => requestNotificationPermission())
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (!isLoading && pedidos.length > 0) {
            rescheduleAllNotifications(pedidos).catch(() => {})
        }
    }, [isLoading, pedidos])

    useEffect(() => {
        const openId = searchParams.get("open")
        if (!openId || isLoading) return
        const target = pedidos.find((p) => p.id_pedido === openId)
        if (target) {
            setViewingPedido(target)
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, pedidos, isLoading])

    const filtered = pedidos.filter((p) => {
        const matchEstado = estadoFilter === "todos" || p.estado === estadoFilter
        const term = search.toLowerCase()
        const matchSearch =
            !term ||
            p.descripcion.toLowerCase().includes(term) ||
            (p.nombre_cliente?.toLowerCase().includes(term) ?? false)
        return matchEstado && matchSearch
    })

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    async function handleTestNotification() {
        if (!Capacitor.isNativePlatform()) { sileo.error({ title: "Solo funciona en Android" }); return }
        const at = new Date(Date.now() + 10_000)
        await LocalNotifications.schedule({
            notifications: [{
                id: 9999999,
                title: "Artesanías Guapinol",
                body: "Las notificaciones funcionan correctamente",
                channelId: "pedidos",
                smallIcon: "ic_stat_notify",
                iconColor: "#708C3E",
                schedule: { at, allowWhileIdle: true },
            }]
        })
        sileo.success({ title: "Notificación en 10 seg", description: "Minimizá la app ahora" })
    }

    function handleAdd() {
        setEditingPedido(null)
        setDialogOpen(true)
    }

    function handleEdit(pedido: Pedido) {
        setEditingPedido(pedido)
        setDialogOpen(true)
    }

    function handleCloseDialog() {
        setDialogOpen(false)
        setEditingPedido(null)
    }

    function handleDeleteRequest(pedido: Pedido) {
        setDeletingPedido(pedido)
    }

    function handleConfirmDelete() {
        if (!deletingPedido) return
        const id = deletingPedido.id_pedido
        deletePedido(id, {
            onSuccess: () => {
                sileo.success({ title: "Pedido eliminado" })
                cancelPedidoNotifications(id).catch(() => {})
                setDeletingPedido(null)
            },
            onError: (error) => {
                sileo.error({
                    title: "Error al eliminar",
                    description: error instanceof Error ? error.message : "Intenta de nuevo.",
                })
            },
        })
    }

    function handleFilterChange(f: EstadoFilter) {
        setEstadoFilter(f)
        setCurrentPage(1)
    }

    const estadoKeys = Object.keys(estadoConfig) as PedidoEstado[]

    return (
        <div className="flex flex-col gap-4 sm:gap-6 max-w-3xl mx-auto w-full px-3 sm:px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/app")}
                        className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm transition"
                        aria-label="Regresar"
                        title="Regresar"
                    >
                        <ArrowLeft className="size-5" />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pedidos</h1>
                </div>
                <button
                    type="button"
                    onClick={handleTestNotification}
                    className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:border-[#708C3E] hover:text-[#708C3E] transition-colors"
                >
                    Probar notif
                </button>
            </div>

            {/* Search + Add */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-gray-400 dark:text-white/40"
                        size={16}
                    />
                    <Input
                        id="pedidos-search"
                        className="h-10 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 pl-9 pr-3 text-sm text-gray-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-[#708C3E]/30 focus-visible:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                        placeholder="Buscar pedido o cliente…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="rounded-2xl bg-[#708C3E] hover:bg-[#5E7634] text-white p-2.5 transition shrink-0 shadow-sm"
                    aria-label="Agregar pedido"
                    title="Agregar pedido"
                >
                    <Plus className="size-5" />
                </button>
            </div>

            {/* Estado filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                    type="button"
                    onClick={() => handleFilterChange("todos")}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        estadoFilter === "todos"
                            ? "border-[#708C3E] bg-[#708C3E] text-white"
                            : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10"
                    }`}
                >
                    Todos
                </button>
                {estadoKeys.map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => handleFilterChange(s)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                            estadoFilter === s
                                ? s === "pendiente"  ? "border-amber-500 bg-amber-500 text-white"
                                : s === "en_proceso" ? "border-blue-500 bg-blue-500 text-white"
                                : s === "terminado"  ? "border-emerald-600 bg-emerald-600 text-white"
                                : s === "entregado"  ? "border-[#708C3E] bg-[#708C3E] text-white"
                                : "border-gray-400 bg-gray-400 text-white"
                                : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10"
                        }`}
                    >
                        {estadoConfig[s].label}
                        {pedidos.filter((p) => p.estado === s).length > 0 && (
                            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold ${
                                estadoFilter === s ? "bg-white/20" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                            }`}>
                                {pedidos.filter((p) => p.estado === s).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={`skeleton-ped-${i}`}
                            className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 p-4 shadow-sm"
                        >
                            <Skeleton className="aspect-4/3 w-full bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4 bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                                <Skeleton className="h-3 w-1/2 bg-[#E8E5D8]/40 dark:bg-zinc-700/40" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#708C3E]/10">
                        <ClipboardList className="size-7 text-[#708C3E]" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {search || estadoFilter !== "todos"
                            ? "Sin resultados para tu búsqueda"
                            : "Aún no hay pedidos"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {search || estadoFilter !== "todos"
                            ? "Intentá con otra palabra o cambiá el filtro"
                            : "Registrá el primer encargo que te hicieron"}
                    </p>
                    {!search && estadoFilter === "todos" && (
                        <Button
                            onClick={handleAdd}
                            className="mt-2 gap-1.5 rounded-full bg-[#708C3E] hover:bg-[#5E7634] text-white shadow-sm"
                        >
                            <Plus className="size-4" />
                            Agregar primer pedido
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {paginated.map((pedido) => (
                        <PedidoCard
                            key={pedido.id_pedido}
                            pedido={pedido}
                            onView={setViewingPedido}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRequest}
                        />
                    ))}
                </div>
            )}

            <AppPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-8"
            />

            {!isLoading && pedidos.length > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} en total
                    </p>
                </div>
            )}

            {/* Detail view */}
            <PedidoDetailDialog
                open={!!viewingPedido}
                onClose={() => setViewingPedido(null)}
                pedido={viewingPedido}
                onEdit={(p) => {
                    setViewingPedido(null)
                    handleEdit(p)
                }}
            />

            {/* Form dialog */}
            <PedidoFormDialog
                key={editingPedido ? `edit-${editingPedido.id_pedido}` : `add-${dialogOpen}`}
                open={dialogOpen}
                onClose={handleCloseDialog}
                pedido={editingPedido}
            />

            {/* Delete confirm */}
            <ConfirmModal
                open={!!deletingPedido}
                onOpenChange={(v) => !v && setDeletingPedido(null)}
                onConfirm={handleConfirmDelete}
                title="Eliminar pedido"
                description={`¿Eliminar "${deletingPedido?.descripcion.slice(0, 60)}${(deletingPedido?.descripcion.length ?? 0) > 60 ? "…" : ""}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isLoading={isDeleting}
            />
        </div>
    )
}
