import { Button } from "@/shared/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, addWeeks, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import type { ReportFilters as IReportFilters } from "../types/reports.types"

interface ReportFiltersProps {
  filters: IReportFilters
  onFiltersChange: (filters: IReportFilters) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  /* const handleToggleMode = () => {
    onFiltersChange({
      ...filters,
      mode: filters.mode === "month" ? "week" : "month"
    })
  } */

  const handlePrevious = () => {
    onFiltersChange({
      ...filters,
      date: filters.mode === "month" ? subMonths(filters.date, 1) : subWeeks(filters.date, 1)
    })
  }

  const handleNext = () => {
    onFiltersChange({
      ...filters,
      date: filters.mode === "month" ? addMonths(filters.date, 1) : addWeeks(filters.date, 1)
    })
  }

  return (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 
                    bg-white dark:bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-center p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl w-fit self-center md:self-auto">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({ ...filters, mode: "month" })}
          className={`rounded-xl px-6 transition-all duration-300 ${
            filters.mode === "month" 
              ? "bg-white dark:bg-white/10 text-[#708C3E] dark:text-[#9FE870] shadow-sm" 
              : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60"
          }`}
        >
          Mes
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({ ...filters, mode: "week" })}
          className={`rounded-xl px-6 transition-all duration-300 ${
            filters.mode === "week" 
              ? "bg-white dark:bg-white/10 text-[#708C3E] dark:text-[#9FE870] shadow-sm" 
              : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60"
          }`}
        >
          Semana
        </Button>
      </div>

      <div className="flex items-center justify-between md:justify-end space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevious}
          className="rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2 font-bold text-sm sm:text-base min-w-[140px] sm:min-w-[160px] justify-center capitalize text-gray-900 dark:text-white">
          <CalendarIcon className="h-4 w-4 text-[#708C3E] dark:text-[#9FE870] shrink-0" />
          <span className="truncate">
            {filters.mode === "month" 
              ? format(filters.date, "MMMM yyyy", { locale: es })
              : `Semana ${format(filters.date, "w", { locale: es })} - ${format(filters.date, "MMM", { locale: es })}`
            }
          </span>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNext}
          className="rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
