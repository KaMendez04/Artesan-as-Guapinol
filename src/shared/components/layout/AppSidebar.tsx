import { LayoutDashboard, ReceiptText, Layers, TrendingUp, SlidersVertical, MoonStar, SunMedium, X, ClipboardList } from "lucide-react"
import { Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar"
import { useTheme } from "@/shared/components/theme-provider"
import { Button } from "@/shared/components/ui/button"


const navItems = [
  { title: "Inicio", url: "/app", icon: LayoutDashboard },
  { title: "Ventas", url: "/app/ventas", icon: ReceiptText },
  { title: "Catálogo", url: "/app/catalogo", icon: Layers },
  { title: "Pedidos", url: "/app/pedidos", icon: ClipboardList },
  { title: "Reportes", url: "/app/reportes", icon: TrendingUp },
]

export function AppSidebar() {
  const { theme, setTheme } = useTheme()
  const { setOpenMobile } = useSidebar()

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
      ? <SunMedium className="size-4" />
      : <MoonStar className="size-4" />

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-5 flex flex-row items-center justify-between pt-[calc(1rem+var(--safe-area-inset-top))] pb-4 lg:pt-4">
        <h2 className="text-lg font-bold leading-tight">Artesanías Guapinol</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg md:hidden"
          onClick={() => setOpenMobile(false)}
          aria-label="Cerrar menú"
        >
          <X className="size-5" />
        </Button>
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

      <SidebarFooter className="border-t p-2 pb-[calc(0.5rem+var(--safe-area-inset-bottom))] lg:pb-2">
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
              <Link to="/app/ajustes">
                <SlidersVertical className="size-5" />
                <span>Ajustes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
