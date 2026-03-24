import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Outlet } from "react-router"
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar"

export default function AppLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                {/* Mobile Header */}
                <header className="flex items-center justify-between border-b px-4 lg:px-6 
                                  pt-[var(--safe-area-inset-top)] 
                                  h-[calc(3.5rem+var(--safe-area-inset-top))] 
                                  lg:h-[60px] lg:pt-0">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger/>
                    </div>

                    <div className="flex items-center gap-4">
                        <Avatar className="size-10 border border-border/50 shadow-sm bg-white hover:opacity-90 cursor-pointer transition-opacity">
                            <AvatarImage 
                                src="https://res.cloudinary.com/dkwvaxxdw/image/upload/v1771647969/WhatsApp_Image_2026-02-20_at_10.25.08_PM_tunvuh.jpg" 
                                alt="Arte Guapinol" 
                                className="object-contain p-1"
                            />
                            <div className="flex size-full items-center justify-center bg-muted text-xs font-bold text-muted-foreground uppercase">
                                AG
                            </div>
                        </Avatar>
                    </div>
                </header>

                {/* Page Content */}
                <div className="px-3 py-4 md:p-6 lg:p-8 pb-[calc(1rem+var(--safe-area-inset-bottom))]">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    )
}
