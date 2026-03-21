import { Home, ShoppingBag, Store, Settings, Moon, Sun, BarChart3 } from "lucide-react"
import { Link } from "react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { useTheme } from "@/shared/components/theme-provider"

const navItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Ventas", url: "/ventas", icon: ShoppingBag },
  { title: "Catálogo", url: "/catalogo", icon: Store },
  { title: "Reportes", url: "/reportes", icon: BarChart3 },
]

export function AppSidebar() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    // ✅ alterna entre light y dark (sin romper system)
    const resolved =
      theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme

    setTheme(resolved === "dark" ? "light" : "dark")
  }

  const icon =
    (theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark")
      ? <Sun className="size-4" />
      : <Moon className="size-4" />

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-5 py-4">
        <h2 className="text-lg font-bold leading-tight">Artesanías Guapinol</h2>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="lg" className="gap-3 text-base">
                <Link to={item.url}>
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
         <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-3 text-base font-normal"
              onClick={toggleTheme}
            >
              {icon}
              <span>Cambiar tema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="gap-3 text-base">
              <Link to="/ajustes">
                <Settings className="size-5" />
                <span>Ajustes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}