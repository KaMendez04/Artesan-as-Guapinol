import { Card, CardContent } from "@/shared/components/ui/card"
import { Banknote, ShoppingBasket, TrendingUp } from "lucide-react"

interface SummaryCardsProps {
  totalSales: number
  averageSale: number
  maxSale: number
  isLoading?: boolean
}

export function SummaryCards({ totalSales, averageSale, maxSale, isLoading }: SummaryCardsProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(value)

  const stats = [
    {
      title: "Vendido",
      value: formatCurrency(totalSales),
      note: "Total del periodo",
      icon: Banknote,
      color: "text-[#708C3E] dark:text-[#9FE870]",
      bg: "bg-[#708C3E]/10 dark:bg-[#708C3E]/20"
    },
    {
      title: "Promedio",
      value: formatCurrency(averageSale),
      note: "Por venta",
      icon: TrendingUp,
      color: "text-[#D99045] dark:text-[#F0A94A]",
      bg: "bg-[#D99045]/10 dark:bg-[#F0A94A]/15"
    },
    {
      title: "Venta mayor",
      value: formatCurrency(maxSale),
      note: "Mejor venta",
      icon: ShoppingBasket,
      color: "text-[#9C543F] dark:text-[#D47A3A]",
      bg: "bg-[#9C543F]/10 dark:bg-[#D47A3A]/15"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse rounded-2xl border-gray-100 dark:border-white/5 bg-background">
            <CardContent className="flex items-center justify-center gap-4 p-4">
              <div className="h-10 w-10 shrink-0 bg-gray-200 dark:bg-white/10 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-6 w-28 bg-gray-200 dark:bg-white/10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="rounded-2xl border-gray-100 bg-background shadow-sm dark:border-white/10 overflow-hidden"
        >
          <CardContent className="flex items-center justify-center gap-4 p-4">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-white/45">
                {stat.title}
              </p>
              <p className="mt-1 truncate text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-white/35">{stat.note}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
