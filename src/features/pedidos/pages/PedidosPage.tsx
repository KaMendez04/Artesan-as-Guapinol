import { useState, useEffect } from "react"
import { ArrowLeft, ClipboardList, Plus, Search, SlidersHorizontal } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { sileo } from "sileo"
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

const estadoKeys = Object.keys(estadoConfig) as PedidoEstado[]

export default function PedidosPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [search, setSearch] = useState("")
    const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("todos")
    const [showFilters, setShowFilters] = useState(false)
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

    const activeFilterLabel =
        estadoFilter === "todos"
            ? "Todos"
            : estadoConfig[estadoFilter as PedidoEstado]?.label ?? "Filtro"

    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full px-3 py-4 sm:px-4 sm:py-4 md:px-0 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">

            {/* Header + filtro */}
            <div className="mb-0">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/app")}
                            className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm transition"
                            aria-label="Regresar"
                        >
                            <ArrowLeft className="size-5" />
                        </button>
                        <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Pedidos
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowFilters((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-white transition hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm"
                        aria-expanded={showFilters}
                    >
                        <SlidersHorizontal size={15} />
                        <span className="hidden sm:inline">{activeFilterLabel}</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-3 rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md p-3 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleFilterChange("todos")}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                    estadoFilter === "todos"
                                        ? "border-[#708C3E] bg-[#708C3E] text-white"
                                        : "border-border/50 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10"
                                }`}
                            >
                                Todos
                            </button>
                            {estadoKeys.map((s) => {
                                const count = pedidos.filter((p) => p.estado === s).length
                                const isActive = estadoFilter === s
                                const colors =
                                    s === "en_proceso" ? { idle: "border-[#CF7534]/40 bg-[#CF7534]/15 text-[#CF7534]",        active: "border-[#CF7534] bg-[#CF7534] text-white" } :
                                    s === "terminado"  ? { idle: "border-[#6FA36A]/40 bg-[#6FA36A]/15 text-[#6FA36A]",        active: "border-[#6FA36A] bg-[#6FA36A] text-white" } :
                                    s === "entregado"  ? { idle: "border-[#708C3E]/40 bg-[#708C3E]/15 text-[#708C3E]",        active: "border-[#708C3E] bg-[#708C3E] text-white" } :
                                                         { idle: "border-gray-300 bg-gray-100 text-gray-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", active: "border-gray-400 bg-gray-400 text-white" }
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleFilterChange(s)}
                                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${isActive ? colors.active : colors.idle}`}
                                    >
                                        {estadoConfig[s].label}
                                        {count > 0 && (
                                            <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold ${
                                                isActive ? "bg-white/25 text-white" : "bg-white/60 dark:bg-black/20"
                                            }`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => { handleFilterChange("todos"); setShowFilters(false) }}
                                className="text-xs text-[#708C3E] hover:underline"
                            >
                                Limpiar filtros
                            </button>
                            {Capacitor.isNativePlatform() && (
                                <button
                                    type="button"
                                    onClick={handleTestNotification}
                                    className="text-xs text-gray-400 dark:text-white/30 hover:text-[#708C3E] transition"
                                >
                                    Probar notificación
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Búsqueda + nuevo */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-gray-400 dark:text-white/40"
                        size={16}
                    />
                    <input
                        className="w-full rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#708C3E]/30 placeholder:text-gray-400 dark:placeholder:text-white/20"
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
                    className="shrink-0 rounded-2xl bg-[#708C3E] p-2.5 text-white transition hover:bg-[#5f7634]"
                    aria-label="Agregar pedido"
                    title="Agregar pedido"
                >
                    <Plus className="size-5" />
                </button>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={`skeleton-ped-${i}`}
                            className="animate-pulse rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden"
                        >
                            <div className="aspect-4/3 w-full bg-gray-200 dark:bg-white/10" />
                            <div className="p-3 space-y-2">
                                <div className="h-4 w-3/4 rounded-full bg-gray-200 dark:bg-white/10" />
                                <div className="h-3 w-1/2 rounded-full bg-gray-200 dark:bg-white/10" />
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
                        {search || estadoFilter !== "todos" ? "Sin resultados" : "Aún no hay pedidos"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {search || estadoFilter !== "todos"
                            ? "Intentá con otra palabra o cambiá el filtro"
                            : "Registrá el primer encargo"}
                    </p>
                    {!search && estadoFilter === "todos" && (
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-2xl bg-[#708C3E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7634]"
                        >
                            <Plus className="size-4" />
                            Agregar primer pedido
                        </button>
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

            {totalPages > 1 && (
                <AppPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    className="pt-4"
                />
            )}

            {!isLoading && pedidos.length > 0 && (
                <p className="text-center text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/25">
                    {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} en total
                </p>
            )}

            <PedidoDetailDialog
                open={!!viewingPedido}
                onClose={() => setViewingPedido(null)}
                pedido={viewingPedido}
                onEdit={(p) => {
                    setViewingPedido(null)
                    handleEdit(p)
                }}
            />

            <PedidoFormDialog
                key={editingPedido ? `edit-${editingPedido.id_pedido}` : `add-${dialogOpen}`}
                open={dialogOpen}
                onClose={handleCloseDialog}
                pedido={editingPedido}
            />

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
