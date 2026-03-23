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
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 bg-card p-4 rounded-lg border shadow-sm">
      <div className="flex items-center space-x-2">
        <Button 
          variant={filters.mode === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, mode: "month" })}
          className="rounded-full px-6"
        >
          Mes
        </Button>
        <Button 
          variant={filters.mode === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, mode: "week" })}
          className="rounded-full px-6"
        >
          Semana
        </Button>
      </div>

      <div className="flex items-center justify-between md:justify-end space-x-4">
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2 font-semibold text-lg min-w-[150px] justify-center capitalize">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span>
            {filters.mode === "month" 
              ? format(filters.date, "MMMM yyyy", { locale: es })
              : `Semana ${format(filters.date, "w", { locale: es })} - ${format(filters.date, "MMM", { locale: es })}`
            }
          </span>
        </div>

        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
