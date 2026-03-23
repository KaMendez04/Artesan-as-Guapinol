import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { TrendingUp, DollarSign, BarChart3, ShoppingBag } from "lucide-react"

interface SummaryCardsProps {
  totalSales: number
  averageSale: number
  maxSale: number
  saleCount: number
  isLoading?: boolean
}

export function SummaryCards({ totalSales, averageSale, maxSale, saleCount, isLoading }: SummaryCardsProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(value)

  const stats = [
    {
      title: "Total Vendido",
      value: formatCurrency(totalSales),
      icon: DollarSign,
      description: "Ventas totales del periodo",
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Promedio por Venta",
      value: formatCurrency(averageSale),
      icon: TrendingUp,
      description: "Monto promedio de tickets",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Venta Máxima",
      value: formatCurrency(maxSale),
      icon: BarChart3,
      description: "Mayor monto en un día",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Total Transacciones",
      value: saleCount.toString(),
      icon: ShoppingBag,
      description: "Número de ventas realizadas",
      color: "text-orange-600 dark:text-orange-400"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded mb-1" />
              <div className="h-3 w-40 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
