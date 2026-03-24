import { useMemo, useState } from "react"
import {
  Calendar,
  ChevronLeft,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAllSales } from "../hooks/useSale"
import { usePlaces } from "../hooks/usePlace"
import { CreateSaleDialog } from "../components/CreateSaleDialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const ITEMS_PER_PAGE = 6

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "end"] as const
  }

  if (currentPage >= totalPages - 2) {
    return ["start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
  }

  return ["start", currentPage - 1, currentPage, currentPage + 1, "end"] as const
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date: Date) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 7)
  return d
}

export default function SalesPage() {
  const navigate = useNavigate()

  const [openCreate, setOpenCreate] = useState(false)
  const [createKey, setCreateKey] = useState(0)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [showFilters, setShowFilters] = useState(false)
  const [placeFilter, setPlaceFilter] = useState<string>("all")
  const [periodMode, setPeriodMode] = useState<"all" | "year" | "month" | "week">("all")

  const { data: sales = [], isLoading, error } = useAllSales()
  const { data: places = [] } = usePlaces()

  const placeNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const p of places) m.set(p.idPlace, p.name)
    return m
  }, [places])

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = new Date()

    return sales.filter((s) => {
      const placeName = placeNameById.get(s.idPlace) ?? ""
      const placeNameLower = placeName.toLowerCase()
      const dateLabel = new Date(s.dateSale).toLocaleDateString("es-CR").toLowerCase()
      const id = String(s.idSale ?? "").toLowerCase()
      const saleDate = new Date(s.dateSale)

      const matchesSearch =
        !q ||
        placeNameLower.includes(q) ||
        dateLabel.includes(q) ||
        id.includes(q)

      const matchesPlace =
        placeFilter === "all" || String(s.idPlace) === placeFilter

      let matchesPeriod = true

      if (periodMode === "year") {
        matchesPeriod = saleDate.getFullYear() === now.getFullYear()
      }

      if (periodMode === "month") {
        matchesPeriod =
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth()
      }

      if (periodMode === "week") {
        const start = startOfWeek(now)
        const end = endOfWeek(now)
        matchesPeriod = saleDate >= start && saleDate < end
      }

      return matchesSearch && matchesPlace && matchesPeriod
    })
  }, [sales, search, placeNameById, placeFilter, periodMode])

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedSales = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredSales.slice(start, end)
  }, [filteredSales, safePage])

  const visiblePages = getVisiblePages(currentPage, totalPages)

  const activeFilterLabel = useMemo(() => {
    const placeLabel =
      placeFilter === "all"
        ? "Todos"
        : places.find((p) => String(p.idPlace) === placeFilter)?.name ?? "Lugar"

    const periodLabel =
      periodMode === "all"
        ? "Todo"
        : periodMode === "year"
          ? "Este año"
          : periodMode === "month"
            ? "Este mes"
            : "Esta semana"

    return `${placeLabel} · ${periodLabel}`
  }, [placeFilter, periodMode, places])

  return (
    <div className="min-h-screen text-gray-900 dark:bg-[#0b0b0b] dark:text-white">
      <div className="mx-auto max-w-3xl px-3 py-4 sm:p-4 md:p-8">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-700 transition hover:bg-gray-50
                           dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                aria-label="Regresar"
                title="Regresar"
              >
                <ChevronLeft />
              </button>

              <h1 className="truncate text-2xl font-bold tracking-tight">Ventas</h1>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50
                         dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
              aria-expanded={showFilters}
              title="Mostrar filtros"
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">{activeFilterLabel}</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-black/30">
              <div className="grid grid-cols-2 gap-2">
                <Select value={placeFilter} onValueChange={(v) => { setPlaceFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger
                    className="w-full min-w-0 rounded-xl border border-gray-200 bg-white text-sm text-gray-900
                              focus:ring-2 focus:ring-[#708C3E]/30
                              dark:border-white/10 dark:bg-black/40 dark:text-white"
                  >
                    <SelectValue placeholder="Lugar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Lugares</SelectItem>
                    {places.map((p) => (
                      <SelectItem key={p.idPlace} value={String(p.idPlace)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={periodMode}
                  onValueChange={(value) => {
                    setPeriodMode(value as "all" | "year" | "month" | "week")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger
                    className="w-full min-w-0 rounded-xl border border-gray-200 bg-white text-sm text-gray-900
                              focus:ring-2 focus:ring-[#708C3E]/30
                              dark:border-white/10 dark:bg-black/40 dark:text-white"
                  >
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Período</SelectItem>
                    <SelectItem value="year">Este año</SelectItem>
                    <SelectItem value="month">Este mes</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setPlaceFilter("all")
                    setPeriodMode("all")
                    setCurrentPage(1)
                  }}
                  className="text-xs text-[#708C3E] hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              size={16}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Buscar..."
              className="
                w-full rounded-2xl border border-gray-200 bg-white
                py-2 pl-9 pr-3 text-sm text-gray-900 outline-none
                focus:ring-2 focus:ring-[#708C3E]/30
                dark:border-white/10 dark:bg-black/40 dark:text-white
              "
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateKey((prev) => prev + 1)
              setOpenCreate(true)
            }}
            className="
              shrink-0 rounded-2xl bg-[#708C3E] p-2.5 text-white transition
              hover:bg-[#5f7634]
            "
            aria-label="Nueva venta"
            title="Nueva venta"
          >
            <Plus size={18} />
          </button>
        </div>

        <div
          className="rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-6
                     dark:border-white/10 dark:bg-black/40 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="mt-5 space-y-3">
            {isLoading && sales.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-white/70">Cargando ventas…</div>
            ) : filteredSales.length === 0 ? (
              <div className="space-y-4">
                {error && (
                  <div className="text-xs text-red-600 dark:text-red-400 opacity-60">
                    Nota: No se pudo conectar al servidor. Mostrando solo datos locales.
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-white/70">No hay ventas registradas.</div>
              </div>
            ) : (
              <>

                {paginatedSales.map((s) => {
                  const placeName = placeNameById.get(s.idPlace) ?? `Lugar #${s.idPlace}`
                  const dateLabel = new Date(s.dateSale).toLocaleString("es-CR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <button
                      key={s.idSale}
                      type="button"
                      onClick={() => navigate(`/ventas/${s.idSale}`)}
                      className="
                        w-full rounded-2xl border border-gray-200 bg-white p-4 text-left
                        shadow-sm transition hover:bg-gray-50 hover:shadow-md
                        dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40
                      "
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
                          <Calendar className="size-4 opacity-70" />
                          <span>{dateLabel}</span>
                        </div>

                        <div className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                          <MapPin className="size-4 opacity-70" />
                          <span>{placeName}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {totalPages > 1 && (
                  <div className="pt-2">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage > 1) setCurrentPage((p) => p - 1)
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {visiblePages.map((page, index) => {
                          if (page === "start" || page === "end") {
                            return (
                              <PaginationItem key={`${page}-${index}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }

                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(page)
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage < totalPages) setCurrentPage((p) => p + 1)
                            }}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <CreateSaleDialog
          key={createKey}
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={(idSale) => navigate(`/ventas/${idSale}`)}
        />
      </div>
    </div>
  )
}