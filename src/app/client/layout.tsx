import React from "react";
import "../globals.css";
import type { Metadata } from "next";
import Head from "next/head";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/clentBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BOQ Admin Portal",
    description: "Admin portal for BOQ service",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
                <SidebarProvider>
                    <div className="flex h-screen">
                        <AppSidebar />
                        <main className="flex-1 overflow-y-auto p-6">
                            {children}
                        </main>
                    </div>
                </SidebarProvider>
    );
}
