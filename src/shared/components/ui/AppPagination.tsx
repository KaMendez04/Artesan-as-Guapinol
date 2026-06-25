import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/shared/components/ui/button"

interface AppPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Paginación reutilizable con el estilo visual de la app.
 * Muestra: [Anterior] [Primera página] ... [Última página] [Siguiente]
 * Optimizada para mobile: botones grandes y táctiles.
 */
export function AppPagination({ currentPage, totalPages, onPageChange, className }: AppPaginationProps) {
  if (totalPages <= 1) return null

  const btnBase =
    "size-10 rounded-full text-sm font-bold transition-all"
  const btnActive =
    "bg-[#708C3E] text-white shadow-lg shadow-[#708C3E]/20"
  const btnInactive =
    "bg-transparent dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:bg-white/10 dark:hover:text-white border border-gray-100 dark:border-white/10"

  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      {/* Botón anterior */}
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] disabled:opacity-30 transition-all"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {/* Primera página */}
      <button
        onClick={() => onPageChange(1)}
        className={cn(btnBase, currentPage === 1 ? btnActive : btnInactive)}
        aria-label="Ir a página 1"
        aria-current={currentPage === 1 ? "page" : undefined}
      >
        1
      </button>

      {/* Separador — solo si hay más de 2 páginas */}
      {totalPages > 2 && (
        <span className="text-sm text-gray-400 dark:text-white/30 w-6 text-center">
          …
        </span>
      )}

      {/* Última página — solo si hay más de 1 */}
      {totalPages > 1 && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={cn(btnBase, currentPage === totalPages ? btnActive : btnInactive)}
          aria-label={`Ir a página ${totalPages}`}
          aria-current={currentPage === totalPages ? "page" : undefined}
        >
          {totalPages}
        </button>
      )}

      {/* Botón siguiente */}
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-[#708C3E]/10 hover:text-[#708C3E] dark:hover:text-[#A5D6A7] disabled:opacity-30 transition-all"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
