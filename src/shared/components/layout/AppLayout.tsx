import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { LogOut } from "lucide-react"
import { Preferences } from "@capacitor/preferences"
import { Capacitor } from "@capacitor/core"
import { DEFAULT_AVATAR_URL } from "@/shared/constants/brand"
import { useProfileStore } from "@/shared/store/useProfileStore"
import { cn } from "@/shared/utils"

export default function AppLayout() {
  const navigate = useNavigate()
  const [showGoodbye, setShowGoodbye] = useState(false)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const resolvedAvatarUrl = avatarUrl ?? DEFAULT_AVATAR_URL

  useEffect(() => {
    if (showGoodbye) {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true })
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [showGoodbye, navigate])

  const handleLogout = async () => {
    // Limpiar preferencias de "Recordarme" (mobile y web)
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: 'rememberMe' })
      await Preferences.remove({ key: 'savedEmail' })
    } else {
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('savedEmail')
    }
    await supabase.auth.signOut()
    setShowGoodbye(true)
  }

  if (showGoodbye) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/LoginPhoto.webp')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="relative">
            <div className="size-28 rounded-full border-4 border-white/30 bg-white shadow-2xl overflow-hidden animate-in zoom-in-50 duration-1000 delay-200 relative z-10">
              <img
                src={resolvedAvatarUrl}
                alt="Arte Guapinol"
                className={cn("size-full", avatarUrl ? "object-cover" : "object-contain p-2")}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <style>{`
                @keyframes expandRing {
                  0% { transform: scale(0.9); opacity: 0; }
                  15% { opacity: 0.5; }
                  100% { transform: scale(2.5); opacity: 0; }
                }
                .expand-ring {
                  animation: expandRing 4s ease-out infinite;
                }
              `}</style>
              <div className="expand-ring absolute size-28 rounded-full border border-white/40" style={{ animationDelay: '0ms' }} />
              <div className="expand-ring absolute size-28 rounded-full border border-white/30" style={{ animationDelay: '1300ms' }} />
              <div className="expand-ring absolute size-28 rounded-full border border-white/20" style={{ animationDelay: '2600ms' }} />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white animate-in slide-in-from-bottom-4 duration-700 delay-500">
            ¡Hasta pronto!
          </h2>
          <p className="mt-2 text-lg text-white/80 animate-in slide-in-from-bottom-4 duration-700 delay-700 text-center">
            Sistema de Gestión
            <br />
            Artesanías Guapinol
          </p>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-white/50">
            by Katheryn Méndez and Brandon Carrillo
          </p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <header
          className="sticky top-0 z-40 flex items-center justify-between border-b border-border/50 bg-white/70 dark:bg-background/70 backdrop-blur-md px-4 lg:px-6
          pt-[var(--safe-area-inset-top)]
          h-[calc(3.5rem+var(--safe-area-inset-top))]
          lg:h-[60px] lg:pt-0 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="size-10 border border-border/50 shadow-sm bg-white hover:opacity-90 cursor-pointer transition-opacity">
                  <AvatarImage
                    src={resolvedAvatarUrl}
                    alt="Arte Guapinol"
                    className={cn(avatarUrl ? "object-cover" : "object-contain p-1")}
                  />
                  <div className="flex size-full items-center justify-center bg-muted text-xs font-bold text-muted-foreground uppercase">
                    AG
                  </div>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="px-3 py-4 md:p-6 lg:p-8 pb-[calc(1rem+var(--safe-area-inset-bottom))]">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
