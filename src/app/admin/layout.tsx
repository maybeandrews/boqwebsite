import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BOQ Admin Portal",
    description: "Admin portal for BOQ service",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className={`flex h-screen ${inter.className}`}>
                <AppSidebar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </SidebarProvider>
    );
}
