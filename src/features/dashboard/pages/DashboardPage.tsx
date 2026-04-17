import { Suspense, lazy } from "react"
import { useDashboardStats } from "../hooks/useDashboardStats"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ShoppingBag, Store } from "lucide-react"

const DashboardSalesChart = lazy(() => import("../components/DashboardSalesChart").then(m => ({ default: m.DashboardSalesChart })))
const DashboardTopProductsChart = lazy(() => import("../components/DashboardTopProductsChart").then(m => ({ default: m.DashboardTopProductsChart })))

export default function DashboardPage() {
    const { data, isLoading } = useDashboardStats()

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            {/* Quick Actions — estilo original simplificado */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/app/ventas">
                    <Card className="group hover:bg-accent/10 transition duration-300 hover:shadow-md cursor-pointer border-none bg-white/50 dark:bg-black/20 backdrop-blur-md">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-5 sm:py-8">
                            <div className="text-gray-400 dark:text-white/40 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="size-8" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Ventas</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/app/catalogo">
                    <Card className="group hover:bg-accent/10 transition duration-300 hover:shadow-md cursor-pointer border-none bg-white/50 dark:bg-black/20 backdrop-blur-md">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-5 sm:py-8">
                            <div className="text-gray-400 dark:text-white/40 group-hover:scale-110 transition-transform">
                                <Store className="size-8" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Catálogo</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Suspense fallback={<div className="col-span-1 lg:col-span-4 h-[420px] bg-white/50 dark:bg-black/20 animate-pulse rounded-3xl" />}>
                    <DashboardSalesChart 
                        data={data?.monthlySales || []} 
                        isLoading={isLoading} 
                    />
                </Suspense>
                <Suspense fallback={<div className="col-span-1 lg:col-span-3 h-[420px] bg-white/50 dark:bg-black/20 animate-pulse rounded-3xl" />}>
                    <DashboardTopProductsChart 
                        data={data?.topProducts || []} 
                        isLoading={isLoading} 
                    />
                </Suspense>
            </div>
        </div>
    )
}
