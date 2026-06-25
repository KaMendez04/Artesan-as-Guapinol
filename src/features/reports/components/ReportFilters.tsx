import { Button } from "@/shared/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, addWeeks, subWeeks, isAfter, startOfMonth, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import type { ReportFilters as IReportFilters } from "../types/reports.types"

interface ReportFiltersProps {
  filters: IReportFilters
  onFiltersChange: (filters: IReportFilters) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const now = new Date()

  const handlePrevious = () => {
    onFiltersChange({
      ...filters,
      date: filters.mode === "month" ? subMonths(filters.date, 1) : subWeeks(filters.date, 1)
    })
  }

  const handleNext = () => {
    const nextDate = filters.mode === "month" ? addMonths(filters.date, 1) : addWeeks(filters.date, 1)
    
    // Si la fecha siguiente empieza después de ahora, no permitir
    const nextStart = filters.mode === "month" ? startOfMonth(nextDate) : startOfWeek(nextDate, { weekStartsOn: 1 })
    if (isAfter(nextStart, now)) return

    onFiltersChange({
      ...filters,
      date: nextDate
    })
  }

  const isNextDisabled = () => {
    const nextDate = filters.mode === "month" ? addMonths(filters.date, 1) : addWeeks(filters.date, 1)
    const nextStart = filters.mode === "month" ? startOfMonth(nextDate) : startOfWeek(nextDate, { weekStartsOn: 1 })
    return isAfter(nextStart, now)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-background p-3 shadow-sm dark:border-white/10">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-white/35">
            Periodo
          </p>
          <div className="mt-1 flex items-center justify-center gap-2 text-base font-bold capitalize text-gray-900 dark:text-white sm:justify-start">
            <CalendarIcon className="size-4 shrink-0 text-[#708C3E] dark:text-[#A7D878]" />
            <span className="truncate">
              {filters.mode === "month"
                ? format(filters.date, "MMMM yyyy", { locale: es })
                : `Semana ${format(filters.date, "w", { locale: es })} de ${format(filters.date, "MMMM", { locale: es })}`}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Periodo anterior"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="flex items-center justify-center rounded-2xl bg-gray-100/70 p-1 dark:bg-white/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, mode: "month" })}
              className={`rounded-xl px-4 transition-all duration-300 ${
                filters.mode === "month"
                  ? "bg-background text-[#708C3E] shadow-sm dark:text-[#A7D878]"
                  : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60"
              }`}
            >
              Mes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, mode: "week" })}
              className={`rounded-xl px-4 transition-all duration-300 ${
                filters.mode === "week"
                  ? "bg-background text-[#708C3E] shadow-sm dark:text-[#A7D878]"
                  : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60"
              }`}
            >
              Semana
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={`rounded-xl transition-opacity ${
              isNextDisabled()
                ? "cursor-not-allowed opacity-30"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
            aria-label="Periodo siguiente"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

