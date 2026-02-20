import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Outlet } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"

export default function AppLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                {/* Mobile Header */}
                <header className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <h1 className="text-lg font-semibold md:hidden">Inicio</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Avatar className="size-8">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    )
}
