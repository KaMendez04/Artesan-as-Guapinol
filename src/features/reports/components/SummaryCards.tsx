import { Card, CardContent } from "@/shared/components/ui/card"
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react"

interface SummaryCardsProps {
  totalSales: number
  averageSale: number
  maxSale: number
  isLoading?: boolean
}

export function SummaryCards({ totalSales, averageSale, maxSale, isLoading }: SummaryCardsProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(value)

  const stats = [
    {
      title: "Total Vendido",
      value: formatCurrency(totalSales),
      icon: DollarSign,
      color: "text-[#708C3E] dark:text-[#9FE870]",
      bg: "bg-[#708C3E]/10 dark:bg-[#708C3E]/20"
    },
    {
      title: "Promedio por Venta",
      value: formatCurrency(averageSale),
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-600/10 dark:bg-blue-600/20"
    },
    {
      title: "Venta Máxima",
      value: formatCurrency(maxSale),
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-600/10 dark:bg-purple-600/20"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse rounded-2xl border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-white/10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-5 w-24 bg-gray-200 dark:bg-white/10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="rounded-2xl border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md
                     dark:border-white/10 dark:bg-black/30 backdrop-blur-sm overflow-hidden"
        >
          <CardContent className="p-4 flex items-center space-x-4">
            <div className={`p-2.5 rounded-xl ${stat.bg} shrink-0`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 mb-0.5">
                {stat.title}
              </p>
              <p className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
