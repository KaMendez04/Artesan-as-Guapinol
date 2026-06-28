import { useMemo, useState } from "react"
import { ArrowLeft, Calendar, Pencil, Plus, Search, ShoppingCart, Store, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { sileo } from "sileo"
import { usePurchases, useDeletePurchase } from "../hooks/usePurchase"
import { PurchaseFormDialog } from "../components/PurchaseFormDialog"
import { ConfirmModal } from "@/shared/components/ui/confirm-modal"
import { AppPagination } from "@/shared/components/ui/AppPagination"
import type { Purchase } from "../types/purchase.types"

const ITEMS_PER_PAGE = 8

function formatCRC(amount: number) {
  return amount.toLocaleString("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 })
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export default function PurchasesPage() {
  const navigate = useNavigate()
  const { data: purchases = [], isLoading, error } = usePurchases()
  const { mutateAsync: deletePurchase } = useDeletePurchase()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Purchase | null>(null)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return purchases
    return purchases.filter(
      (p) =>
        p.tienda.toLowerCase().includes(q) ||
        formatDate(p.fecha).includes(q) ||
        String(p.monto).includes(q),
    )
  }, [purchases, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)

  const paginated = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, safePage])

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (purchase: Purchase) => {
    setEditing(purchase)
    setDialogOpen(true)
  }

  const handleDeleteClick = (purchase: Purchase) => {
    setPurchaseToDelete(purchase)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!purchaseToDelete) return
    setIsDeleting(true)
    try {
      await deletePurchase(purchaseToDelete.id)
      sileo.success({ title: "Compra eliminada" })
      setConfirmOpen(false)
      setPurchaseToDelete(null)
    } catch {
      sileo.error({ title: "Error al eliminar" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
      <div className="mx-auto max-w-3xl px-3 py-4 sm:p-4 md:p-8">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 py-2 text-gray-700 dark:text-white transition hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm"
              aria-label="Regresar"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h1 className="truncate text-2xl font-bold tracking-tight">Compras</h1>
          </div>
        </div>

        {/* Search + New */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-gray-400 dark:text-white/40"
              size={16}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Buscar por tienda, fecha o monto..."
              className="w-full rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#708C3E]/30 placeholder:text-gray-400 dark:placeholder:text-white/20"
            />
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="shrink-0 rounded-2xl bg-[#708C3E] p-2.5 text-white transition hover:bg-[#5f7634]"
            aria-label="Nueva compra"
            title="Nueva compra"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading && purchases.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-white/70">Cargando compras…</div>
          ) : filtered.length === 0 ? (
            <div className="space-y-2">
              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 opacity-60">
                  No se pudo conectar al servidor.
                </div>
              )}
              <div className="flex flex-col items-center gap-3 py-12 text-gray-400 dark:text-white/30">
                <ShoppingCart className="size-10 opacity-40" />
                <p className="text-sm">No hay compras registradas.</p>
              </div>
            </div>
          ) : (
            <>
              {paginated.map((purchase) => (
                <div
                  key={purchase.id}
                  className="w-full rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md p-4 transition hover:bg-white/80 dark:hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                        <Store className="size-4 shrink-0 opacity-70" />
                        <span className="truncate">{purchase.tienda}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
                        <Calendar className="size-4 shrink-0 opacity-70" />
                        <span>{formatDate(purchase.fecha)}</span>
                      </div>
                      <div className="text-lg font-bold text-[#708C3E] dark:text-[#A7D878]">
                        {formatCRC(purchase.monto)}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(purchase)}
                        className="rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 p-2 text-gray-600 dark:text-white/60 transition hover:bg-white/80 dark:hover:bg-white/10"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(purchase)}
                        className="rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 p-2 text-red-500 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <AppPagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="pt-4"
              />
            </>
          )}
        </div>
      </div>

      <PurchaseFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        purchase={editing}
      />

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Eliminar compra"
        description={`¿Eliminar la compra en "${purchaseToDelete?.tienda}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}
