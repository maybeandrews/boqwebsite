import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BOQ Website",
    description: "Bill of Quantities Management System",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
            </Head>
            <body className={inter.className}>
                <div className="flex h-screen">
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
