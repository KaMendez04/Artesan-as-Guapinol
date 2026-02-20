import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ShoppingBag, Store } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"

const salesData = [
    { name: "Ene", sales: 4000, target: 2400 },
    { name: "Feb", sales: 3000, target: 1398 },
    { name: "Mar", sales: 2000, target: 9800 },
    { name: "Abr", sales: 2780, target: 3908 },
    { name: "May", sales: 1890, target: 4800 },
    { name: "Jun", sales: 2390, target: 3800 },
]

const topProductsData = [
    { name: "Producto A", value: 400 },
    { name: "Producto B", value: 300 },
    { name: "Producto C", value: 300 },
    { name: "Producto D", value: 200 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            {/* Quick Actions — estilo igual al sidebar */}
            <div className="grid grid-cols-2 gap-4">
                <a href="/ventas">
                    <Card className="hover:bg-accent/10 transition-all hover:shadow-md cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-8">
                            <ShoppingBag className="size-8 text-muted-foreground" />
                            <span className="text-xl font-semibold">Ventas</span>
                        </CardContent>
                    </Card>
                </a>
                <a href="/catalogo">
                    <Card className="hover:bg-accent/10 transition-all hover:shadow-md cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-8">
                            <Store className="size-8 text-muted-foreground" />
                            <span className="text-xl font-semibold">Catálogo</span>
                        </CardContent>
                    </Card>
                </a>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Sales Bar Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Ventas Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: number) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="sales" fill="#adfa1d" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="target" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Products Pie Chart */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Más Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={topProductsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {topProductsData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
