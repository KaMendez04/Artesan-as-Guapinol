import { Home, ShoppingBag, Store, Settings, Moon } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { Button } from "@/shared/components/ui/button"

const navItems = [
    { title: "Inicio", url: "/", icon: Home },
    { title: "Ventas", url: "/ventas", icon: ShoppingBag },
    { title: "Catálogo", url: "/catalogo", icon: Store },
]

export function AppSidebar() {
    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark")
    }

    return (
        <Sidebar>
            {/* Nombre de la tienda */}
            <SidebarHeader className="border-b px-5 py-4">
                <h2 className="text-lg font-bold leading-tight">Artesanías Guapinol</h2>
            </SidebarHeader>

            {/* Navegación principal */}
            <SidebarContent className="p-2">
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild size="lg" className="gap-3 text-base">
                                <a href={item.url}>
                                    <item.icon className="!size-5" />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer: Cambiar tema y Ajustes */}
            <SidebarFooter className="border-t p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-base font-normal"
                            onClick={toggleTheme}
                        >
                            <Moon className="size-5" />
                            <span>Cambiar tema</span>
                        </Button>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" className="gap-3 text-base">
                            <a href="/ajustes">
                                <Settings className="!size-5" />
                                <span>Ajustes</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
