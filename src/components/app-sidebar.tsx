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
import Image from "next/image";

export function AppSidebar() {
    return (
        <Sidebar>
        <div className="p-4">
            <div className="relative h-12 w-12">
                <Image
                    src="/logo_site.png" // Make sure to add your logo image to the public folder
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Admin Portal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/admin/dashboard">
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/admin/vendors">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Vendor Management</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/admin/boq">
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>BOQ Upload</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/admin/quotes">
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Quotes</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
