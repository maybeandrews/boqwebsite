import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Users, FileText, Download } from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Client Portal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/client/dashboard">
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Client Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                           { /*<SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/client/upload">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Upload</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>*/ }
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/client/upload">
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>Perfoma Upload</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            { /*<SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/admin/quotes">
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Quotes</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem> */ }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
