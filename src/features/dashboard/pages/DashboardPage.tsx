import { Suspense, lazy } from "react"
import { useDashboardStats } from "../hooks/useDashboardStats"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ReceiptText, Layers } from "lucide-react"

const DashboardSalesChart = lazy(() => import("../components/DashboardSalesChart").then(m => ({ default: m.DashboardSalesChart })))
const DashboardTopProductsChart = lazy(() => import("../components/DashboardTopProductsChart").then(m => ({ default: m.DashboardTopProductsChart })))

export default function DashboardPage() {
    const { data, isLoading } = useDashboardStats()

    return (
        <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
            {/* Quick Actions */}
            <div 
                className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
                style={{ animationDelay: "100ms" }}
            >
                <Link to="/app/ventas">
                    <Card className="group transition-all duration-300 hover:shadow-lg cursor-pointer border border-border/50 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-5 sm:py-8">
                            <div className="text-gray-400 dark:text-white/50 group-hover:scale-110 transition-transform">
                            <ReceiptText className="size-8" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Ventas</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/app/catalogo">
                    <Card className="group transition-all duration-300 hover:shadow-lg cursor-pointer border border-border/50 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-5 sm:py-8">
                            <div className="text-gray-400 dark:text-white/50 group-hover:scale-110 transition-transform">
                            <Layers className="size-8" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Catálogo</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Charts Section */}
            <div 
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
                style={{ animationDelay: "300ms" }}
            >
                <Suspense fallback={<div className="col-span-1 lg:col-span-4 h-[420px] bg-white/60 dark:bg-white/5 animate-pulse rounded-2xl border border-border/50 backdrop-blur-md" />}>
                    <DashboardSalesChart 
                        data={data?.monthlySales || []} 
                        isLoading={isLoading} 
                    />
                </Suspense>
                <Suspense fallback={<div className="col-span-1 lg:col-span-3 h-[420px] bg-white/60 dark:bg-white/5 animate-pulse rounded-2xl border border-border/50 backdrop-blur-md" />}>
                    <DashboardTopProductsChart 
                        data={data?.topProducts || []} 
                        isLoading={isLoading} 
                    />
                </Suspense>
            </div>
        </div>
    )
}
