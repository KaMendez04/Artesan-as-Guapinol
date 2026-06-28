import { LayoutDashboard, ReceiptText, Layers, TrendingUp, ShoppingCart, SlidersVertical, MoonStar, SunMedium, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
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
  { title: "Inicio",    url: "/app",          icon: LayoutDashboard, exact: true },
  { title: "Ventas",    url: "/app/ventas",   icon: ReceiptText },
  { title: "Catálogo",  url: "/app/catalogo", icon: Layers },
  { title: "Reportes",  url: "/app/reportes", icon: TrendingUp },
  { title: "Compras",   url: "/app/compras",  icon: ShoppingCart },
]

export function AppSidebar() {
  const { theme, setTheme } = useTheme()
  const { setOpenMobile } = useSidebar()
  const { pathname } = useLocation()

  const toggleTheme = () => {
    const resolved =
      theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme
    setTheme(resolved === "dark" ? "light" : "dark")
  }

  const isDark =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark"

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-5 flex flex-row items-center justify-between h-[calc(3.5rem+var(--safe-area-inset-top))] pt-(--safe-area-inset-top) lg:h-[60px] lg:pt-0">
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
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.url
              : pathname === item.url || pathname.startsWith(item.url + "/")

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={active}
                  className={[
                    "gap-3 text-base transition-colors",
                    active
                      ? "bg-[#708C3E]/15 text-[#708C3E] dark:bg-[#A7D878]/15 dark:text-[#A7D878] font-semibold"
                      : "text-gray-700 dark:text-white/70 hover:bg-white/60 dark:hover:bg-white/5",
                  ].join(" ")}
                >
                  <Link to={item.url} onClick={() => setOpenMobile(false)}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-2 pb-[calc(0.5rem+var(--safe-area-inset-bottom))] lg:pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-3 text-base font-normal text-gray-700 dark:text-white/70 hover:bg-white/60 dark:hover:bg-white/5"
              onClick={toggleTheme}
            >
              {isDark ? <SunMedium className="size-5" /> : <MoonStar className="size-5" />}
              <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              isActive={pathname === "/app/ajustes"}
              className={[
                "gap-3 text-base transition-colors",
                pathname === "/app/ajustes"
                  ? "bg-[#708C3E]/15 text-[#708C3E] dark:bg-[#A7D878]/15 dark:text-[#A7D878] font-semibold"
                  : "text-gray-700 dark:text-white/70 hover:bg-white/60 dark:hover:bg-white/5",
              ].join(" ")}
            >
              <Link to="/app/ajustes" onClick={() => setOpenMobile(false)}>
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
