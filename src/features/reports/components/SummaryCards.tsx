import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"

interface SummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  balance: number
  isLoading?: boolean
}

const fmt = (v: number) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(v)

export function SummaryCards({ totalIncome, totalExpenses, balance, isLoading }: SummaryCardsProps) {
  const isPositive = balance >= 0

  if (isLoading) {
    return (
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map(i => (
            <Card key={i} className="animate-pulse rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md">
              <CardContent className="p-4 space-y-2">
                <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-7 w-24 bg-gray-200 dark:bg-white/10 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="h-4 w-14 bg-gray-200 dark:bg-white/10 rounded-full" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Ingresos */}
        <Card className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp className="size-4 shrink-0 text-[#6FA36A] dark:text-[#A7D878]" />
              <p className="text-xs font-semibold text-gray-500 dark:text-white/45">Ingresos</p>
            </div>
            <p className="truncate text-lg font-bold tracking-tight text-[#6FA36A] dark:text-[#A7D878]">
              {fmt(totalIncome)}
            </p>
          </CardContent>
        </Card>

        {/* Egresos */}
        <Card className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingDown className="size-4 shrink-0 text-[#E9A03B] dark:text-[#F0A94A]" />
              <p className="text-xs font-semibold text-gray-500 dark:text-white/45">Egresos</p>
            </div>
            <p className="truncate text-lg font-bold tracking-tight text-[#E9A03B] dark:text-[#F0A94A]">
              {fmt(totalExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saldo */}
      <Card className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Wallet className="size-5 text-gray-400 dark:text-white/30" />
            <p className="text-sm font-semibold text-gray-500 dark:text-white/45">Saldo restante</p>
          </div>
          <p className={[
            "text-2xl font-bold tracking-tight",
            isPositive
              ? "text-[#6FA36A] dark:text-[#A7D878]"
              : "text-[#CF7534] dark:text-[#D47A3A]"
          ].join(" ")}>
            {fmt(balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
