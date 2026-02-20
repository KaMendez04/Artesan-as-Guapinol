import * as React from "react"
import { Sidebar, SidebarContent, SidebarHeader } from "@/shared/components/ui/sidebar"

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <div>Guapinol</div>
            </SidebarHeader>
            <SidebarContent>
                <div>Menu</div>
            </SidebarContent>
        </Sidebar>
    )
}
