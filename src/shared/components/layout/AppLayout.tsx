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
                <header className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger/>
                    </div>

                    <div className="flex items-center gap-4">
                        <Avatar className="size-10">
                            <AvatarImage src="https://res.cloudinary.com/dkwvaxxdw/image/upload/v1771647969/WhatsApp_Image_2026-02-20_at_10.25.08_PM_tunvuh.jpg" alt="@user" />
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
